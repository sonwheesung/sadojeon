// 서버 엔진 API — docs/31 §1·Phase 1. Vercel 함수가 호출하는 정본 진입점.
// reduce(state, action, seed) → { state, events } 의 실체. 기존 턴 엔진(advanceTurn)을
// GameState 경계로 감싼다 — 전면 순수화 없이도 "상태 로드→진행→캡처"가 결정적(serverturn 실증).
//
// 흐름(Vercel 함수): JWT 검증 → DB에서 run 로드 → 이 모듈의 advance/newRun 호출 →
//   { state, rngState } 를 DB 저장 + { events } 를 응답으로. (영속은 호출측 = 함수가 담당)
//
// ⚠️ 동시성: commit→엔진→capture 는 **동기 블록**(await 없음)이어야 전역 싱글톤 스토어가
//   요청 간 안 섞인다. 이 모듈 함수들은 전부 동기. DB I/O 는 함수 바깥(앞뒤)에서.
// ⚠️ RN 비순수: 내부적으로 스토어/시스템(advanceTurn)을 쓰므로 RN 의존 — Vercel 빌드는
//   RN 스텁 번들(헤드리스와 동일 esbuild alias)로 패키징한다.

import { advanceTurn, triggerPostSettlement } from '@/systems/timeSystem';
import { seedNewRun } from '@/systems/newRun';
import { setAutoSaveEnabled } from '@/systems/runSync';
import { seedAmbient, ambientCursor } from '@/systems/rng';
import { captureGameState, commitGameState, cloneGameState, type GameState } from './gameState';

// 모듈 로드 시점(어떤 유저 데이터도 닿기 전)의 회차 스토어 **초기 상태** 스냅샷.
// 서버 advance 의 클린 슬레이트 기준 — 들어온 상태에 없는 스토어 키는 이 기본값으로 되돌려야
// 직전 요청(유저) 데이터가 새지 않는다(전방호환 누락-스킵이 웜 인스턴스선 잔류=누수이므로).
const PRISTINE_RUN_STATE: GameState = cloneGameState(captureGameState());
import { captureAccountState, commitAccountState, resetAccountState, type AccountState } from './accountState';
import { usePendingStore } from '@/stores/pendingStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { useCutsceneStore } from '@/stores/cutsceneStore';
import { useMoralEventStore } from '@/stores/moralEventStore';

// 클라가 이번 턴 결과로 렌더할 휘발 출력(영속 상태 아님 — GameState 밖). docs/31 reduce 의 events.
//  pending=정산/마일스톤/한마디/희망/일지, field=현장 급보 큐, cutscene=컷씬 큐, moral=도덕 갈등.
export interface TurnEvents {
  pending: Record<string, unknown>;
  field: Record<string, unknown>;
  cutscene: Record<string, unknown>;
  moral: Record<string, unknown>;
}

export interface TurnResult {
  state: GameState; //     영속 — DB 저장(회차)
  account: AccountState; // 영속 — DB 저장(유저 단위: 업적·집계)
  rngState: number; //     전진된 시드 상태 — DB 저장(유저 비공개)
  events: TurnEvents; //   응답 — 클라 렌더(영속 X)
}

// 요청 클린 슬레이트 — 유저 account 를 로드(없으면 빈 상태). 서버 유저 간 누수 차단. docs/37 C10.
// 안 넘기면 현 계정 스토어 유지(로컬·테스트 호환).
function loadAccount(account?: AccountState): void {
  if (!account) return;
  resetAccountState();
  commitAccountState(account);
}

function pickData<T extends object>(state: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state)) if (typeof v !== 'function') out[k] = v;
  return out;
}

// 휘발 출력 스토어 초기화 — 서버 요청의 클린 슬레이트(이전 요청 잔여 차단).
export function resetEphemeral(): void {
  usePendingStore.setState({
    oneLiner: null, wish: null, dailyLog: null, dailyBadges: [], milestones: [],
    settlement: null, llmDebugBuffer: [], lastDebug: null, inflightResolutions: 0,
  } as never);
  useMoralEventStore.getState().clear();
  useFieldEventStore.getState().clear();
  useCutsceneStore.getState().clear();
}

// 이번 턴이 만든 휘발 출력 수집(응답용).
export function captureEvents(): TurnEvents {
  return {
    pending: pickData(usePendingStore.getState()),
    field: pickData(useFieldEventStore.getState()),
    cutscene: pickData(useCutsceneStore.getState()),
    moral: pickData(useMoralEventStore.getState()),
  };
}

// 서버 부팅 1회 — 자동저장(클라 경로) 비활성. 서버는 함수가 명시 저장.
let configured = false;
function ensureServerMode(): void {
  if (configured) return;
  setAutoSaveEnabled(false);
  configured = true;
}

// 새 회차 — 서버가 생성한 초기 시드로 시드 고정 후 시드. account 넘기면 그 유저로 격리.
export function newRun(party: string[], seed: number, account?: AccountState): TurnResult {
  ensureServerMode();
  resetEphemeral();
  loadAccount(account);
  seedAmbient(seed);
  seedNewRun(party);
  return {
    state: cloneGameState(captureGameState()),
    account: captureAccountState(),
    rngState: ambientCursor(),
    events: captureEvents(),
  };
}

// 하루 진행 — 로드된 상태 + 현재 시드상태로 한 턴(정산 포함). account 넘기면 그 유저로 격리(누수 차단).
// 같은 (state, account, rngState) → 항상 같은 결과(serverturn 실증) → 세이브 스커밍 봉쇄.
export function advance(state: GameState, rngState: number, account?: AccountState): TurnResult {
  ensureServerMode();
  resetEphemeral();
  loadAccount(account); // 유저 계정 격리(업적·집계) — docs/37 C10
  // 클린 슬레이트 2단 — ①초기 상태로 리셋(직전 유저 잔류 제거) ②들어온 상태 덮기.
  // 들어온 상태가 완전하면 결과는 그 상태 그대로. 키 누락(옛 세이브)이면 그 스토어는 ①의 기본값으로
  // 남아 직전 유저로 새지 않는다(전방호환 × 요청 간 격리 — docs/37 C10·R12).
  commitGameState(cloneGameState(PRISTINE_RUN_STATE));
  commitGameState(cloneGameState(state));
  seedAmbient(rngState);
  advanceTurn();
  triggerPostSettlement();
  return {
    state: cloneGameState(captureGameState()),
    account: captureAccountState(),
    rngState: ambientCursor(),
    events: captureEvents(),
  };
}
