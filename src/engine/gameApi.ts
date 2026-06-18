// 게임 API — 앱↔서버 계약(포트/어댑터). docs/31.
// 앱은 이 **인터페이스에만** 의존한다(advanceTurn·triggerPostSettlement 직접 호출 X). 구현 둘:
//   · LocalGameApi  — 라이브 스토어에 직접 위임(로컬 테스트·오프라인). 기존 동작 그대로(무위험).
//   · RemoteGameApi — Vercel 함수 HTTP(배포). 서버가 하루를 원자적으로 처리, 응답 state/events 반영.
// 전환은 EXPO_PUBLIC_GAME_SERVER_URL 유무로 자동 — 앱 코드 불변(어댑터만 교체).
//
// 하루는 2단계(현 UX 보존): advance()=진행(정산 표시 단계) → settle()=정산 닫은 뒤 후속.
//   · 로컬: advance=advanceTurn / settle=triggerPostSettlement (라이브 스토어, 기존과 동일).
//   · 원격: advance=/api/advance(서버가 advanceTurn+post 원자 처리, events 로 정산+후속 반환) / settle=no-op.
// 시드상태(rngState)는 로컬에서만 보유(원격은 서버 비공개) → 세이브 스커밍은 서버 권위에서 봉쇄.

import { advanceTurn, triggerPostSettlement } from '@/systems/timeSystem';
import { seedNewRun } from '@/systems/newRun';
import { captureEvents, resetEphemeral, type TurnEvents, type TurnResult } from './serverEngine';
import { captureGameState, commitGameState, type GameState } from './gameState';
import { seedAmbient, ambientCursor, freshSeed } from '@/systems/rng';
import { supabase } from '@/lib/supabase';
import { usePendingStore } from '@/stores/pendingStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { useCutsceneStore } from '@/stores/cutsceneStore';
import { useMoralEventStore } from '@/stores/moralEventStore';

export interface GameApi {
  /** 새 회차 시작 — 2~4명 선택. */
  newRun(party: string[], slot?: number): Promise<TurnResult>;
  /** 하루 진행 — 정산 표시 단계까지(로컬: advanceTurn). */
  advance(slot?: number): Promise<TurnResult>;
  /** 정산 모달 닫은 뒤 후속(로컬: triggerPostSettlement / 원격: no-op, 서버가 이미 처리). */
  settle(slot?: number): Promise<TurnResult>;
  /** 서버(원격) 권위인가 — UI 쓰기 가능 여부 판단용. */
  readonly authoritative: boolean;
}

// 서버 응답 events 를 휘발 스토어에 반영 — UI(정산·현장 급보·컷씬)가 읽어 렌더.
function applyEvents(events: TurnEvents): void {
  if (events.pending) usePendingStore.setState(events.pending as never);
  if (events.field) useFieldEventStore.setState(events.field as never);
  if (events.cutscene) useCutsceneStore.setState(events.cutscene as never);
  if (events.moral) useMoralEventStore.setState(events.moral as never);
}

// ─── 로컬 어댑터 — 라이브 스토어 직접(로컬 테스트·오프라인) ───────────────────
// 기존 advanceTurn/triggerPostSettlement 를 그대로 호출 → 현 동작과 100% 동일(무위험).
class LocalGameApi implements GameApi {
  readonly authoritative = false;

  private snapshot(): TurnResult {
    return { state: captureGameState(), events: captureEvents(), rngState: ambientCursor() };
  }

  async newRun(party: string[]): Promise<TurnResult> {
    seedAmbient(freshSeed());
    resetEphemeral();
    seedNewRun(party);
    return this.snapshot();
  }

  async advance(): Promise<TurnResult> {
    advanceTurn(); // 정산 데이터를 pending 에 set(현 UX: 이어서 정산 모달 표시)
    return this.snapshot();
  }

  async settle(): Promise<TurnResult> {
    triggerPostSettlement(); // 졸업 체크·일일 이벤트·저장
    return this.snapshot();
  }
}

// ─── 원격 어댑터 — Vercel 함수 HTTP(배포) ───────────────────────────────────
class RemoteGameApi implements GameApi {
  readonly authoritative = true;
  constructor(private baseUrl: string) {}

  private async post(path: string, body: unknown): Promise<TurnResult> {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`서버 오류 ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { state: GameState; events: TurnEvents };
    commitGameState(data.state); // 서버 권위 상태로 스토어 갱신
    applyEvents(data.events);
    return { state: data.state, events: data.events, rngState: 0 }; // rngState 비공개
  }

  newRun(party: string[], slot = 1): Promise<TurnResult> {
    return this.post('/api/newRun', { party, slot });
  }
  // 서버가 하루를 원자적으로 처리(advanceTurn+post). 정산·후속 events 가 함께 온다.
  advance(slot = 1): Promise<TurnResult> {
    return this.post('/api/advance', { slot });
  }
  // 원격은 advance 에서 후속까지 끝남 → settle 은 현재 상태만 돌려준다(no-op).
  async settle(): Promise<TurnResult> {
    return { state: captureGameState(), events: captureEvents(), rngState: 0 };
  }
}

// ─── 선택자 — 서버 URL 있으면 원격, 없으면 로컬(로컬 테스트 기본) ────────────
let instance: GameApi | null = null;
export function getGameApi(): GameApi {
  if (instance) return instance;
  const url = process.env.EXPO_PUBLIC_GAME_SERVER_URL;
  instance = url ? new RemoteGameApi(url) : new LocalGameApi();
  return instance;
}

// 테스트·전환용 — 명시 어댑터 주입(앱 외 검증).
export function __setGameApi(api: GameApi | null): void {
  instance = api;
}
