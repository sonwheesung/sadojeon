// 게임 API — 앱↔서버 계약(포트/어댑터). docs/31.
// 앱은 이 **인터페이스에만** 의존한다. 구현 둘:
//   · LocalGameApi  — 엔진을 앱 안에서 직접 실행(로컬 테스트·오프라인). 서버와 동일 흐름.
//   · RemoteGameApi — Vercel 함수 HTTP 호출(배포). 응답 state/events 로 화면 갱신.
// 전환은 EXPO_PUBLIC_GAME_SERVER_URL 유무로 자동 — 앱 코드는 안 바뀐다(어댑터만 교체).
//
// 흐름은 양쪽 동일: newRun/advance → { state, events }. 클라는 state 로 스토어 갱신, events 로 휘발 UI.
// 시드상태(rngState)는 **로컬에서만** 보유(원격은 서버 비공개) → 세이브 스커밍은 서버 권위에서 봉쇄.

import { advance as engineAdvance, newRun as engineNewRun, type TurnEvents, type TurnResult } from './serverEngine';
import { captureGameState, commitGameState, type GameState } from './gameState';
import { freshSeed } from '@/systems/rng';
import { usePendingStore } from '@/stores/pendingStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { useCutsceneStore } from '@/stores/cutsceneStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { supabase } from '@/lib/supabase';

export interface GameApi {
  /** 새 회차 시작 — 2~4명 선택. */
  newRun(party: string[], slot?: number): Promise<TurnResult>;
  /** 하루 진행(정산 포함). */
  advance(slot?: number): Promise<TurnResult>;
  /** 이 어댑터가 서버(원격) 권위인가 — UI 가 쓰기 가능 여부 등 판단용. */
  readonly authoritative: boolean;
}

// 서버 응답 events 를 휘발 스토어에 반영 — UI(정산 모달·현장 급보·컷씬)가 읽어 렌더.
function applyEvents(events: TurnEvents): void {
  if (events.pending) usePendingStore.setState(events.pending as never);
  if (events.field) useFieldEventStore.setState(events.field as never);
  if (events.cutscene) useCutsceneStore.setState(events.cutscene as never);
  if (events.moral) useMoralEventStore.setState(events.moral as never);
}

// ─── 로컬 어댑터 — 엔진 인프로세스(로컬 테스트·오프라인) ──────────────────────
// 엔진이 스토어를 곧장 새 상태로 갱신(부수효과) + 휘발 스토어에 events → UI 즉시 반영.
// rngState 는 메모리 보유(앱 재시작 시 리셋 — 로컬 테스트용. 실제 비공개·영속은 서버 몫).
class LocalGameApi implements GameApi {
  readonly authoritative = false; // 로컬은 클라가 곧 권위(테스트 전용)
  private rngState = 0;

  async newRun(party: string[]): Promise<TurnResult> {
    // 로컬 초기 시드 — 엔트로피 1점(rng.freshSeed). 서버는 자체 crypto 시드.
    const result = engineNewRun(party, freshSeed());
    this.rngState = result.rngState;
    return result;
  }

  async advance(): Promise<TurnResult> {
    const result = engineAdvance(captureGameState(), this.rngState);
    this.rngState = result.rngState;
    return result; // 스토어·휘발은 엔진이 이미 갱신함(서버와 동일 흐름)
  }
}

// ─── 원격 어댑터 — Vercel 함수 HTTP(배포) ───────────────────────────────────
class RemoteGameApi implements GameApi {
  readonly authoritative = true; // 서버 권위 — 쓰기 경로 없음, 응답만 반영
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
  advance(slot = 1): Promise<TurnResult> {
    return this.post('/api/advance', { slot });
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
