// 정본 게임 상태(GameState) — 서버 권위 아키텍처(docs/31)의 척추.
// 한 회차(run)의 **전체 직렬화 가능 상태**를 한 객체로 모은다. 서버 흐름의 로드/세이브 계약:
//   DB → GameState → 순수 엔진 → GameState → DB.
// 클라는 그동안 Zustand 스토어를 화면 모델로 유지 — capture/commit 이 스토어 ↔ GameState 다리.
//
// 포함: **회차 상태(slotAware 19 스토어)** 만. 계정 상태(achievement·tally·llmSettings)는 별도 트랙,
// 휘발/출력(pending·fieldEvent·moral·cutscene)은 엔진의 events(응답)이지 영속 상태가 아니라 제외,
// 클라 세션(game·auth)도 제외. (docs/31 §컴포넌트·reduce(state,action)→{state,events})
//
// 드리프트 0 원칙: 필드를 손으로 나열하지 않는다. 스토어 상태에서 **함수(메서드)를 뺀 데이터**를
// 그대로 모은다 → 스토어에 데이터 필드가 늘어도 GameState 가 자동으로 따라온다.

// 배럴(@/stores)이 아니라 직접 경로로 — 배럴은 pendingStore(→온디바이스 LLM·RN)까지 끌어와
// 서버/헤드리스 환경에서 못 돈다. 회차 스토어만 직접 모은다.
import { useActivityStore } from '@/stores/activityStore';
import { useAlchemyStore } from '@/stores/alchemyStore';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useEventHistoryStore } from '@/stores/eventHistoryStore';
import { useGraduateStore } from '@/stores/graduateStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useItemStore } from '@/stores/itemStore';
import { useJianghuStore } from '@/stores/jianghuStore';
import { useMasterStore } from '@/stores/masterStore';
import { useNpcStore } from '@/stores/npcStore';
import { useOutreachStore } from '@/stores/outreachStore';
import { useQuestStore } from '@/stores/questStore';
import { useReputationStore } from '@/stores/reputationStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useRunMetaStore } from '@/stores/runMetaStore';
import { useSectAtmosphereStore } from '@/stores/sectAtmosphereStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';

// 회차 상태 스토어 레지스트리 — 키 = GameState 슬롯 이름. 새 회차 스토어는 여기 한 줄 추가.
const RUN_STORES = {
  time: useTimeStore,
  runMeta: useRunMetaStore,
  master: useMasterStore,
  sect: useSectStore,
  sectAtmosphere: useSectAtmosphereStore,
  disciple: useDiscipleStore,
  codex: useCodexStore,
  item: useItemStore,
  quest: useQuestStore,
  activity: useActivityStore,
  alchemy: useAlchemyStore,
  schedule: useScheduleStore,
  reputation: useReputationStore,
  jianghu: useJianghuStore,
  graduate: useGraduateStore,
  outreach: useOutreachStore,
  npc: useNpcStore,
  eventHistory: useEventHistoryStore,
  inbox: useInboxStore,
} as const;

type RunStores = typeof RUN_STORES;

// 함수(스토어 액션) 제외 — 데이터 필드만.
type DataOnly<T> = {
  [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K];
};

// GameState — 각 스토어의 데이터 슬라이스 집합(파생 타입, 수동 나열 없음).
export type GameState = {
  [K in keyof RunStores]: DataOnly<ReturnType<RunStores[K]['getState']>>;
};

// 런타임에서 함수 속성을 떨군 얕은 사본.
function dataOnly<T extends object>(state: T): DataOnly<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state)) {
    if (typeof v !== 'function') out[k] = v;
  }
  return out as DataOnly<T>;
}

// 현재 스토어들에서 회차 전체 상태를 한 객체로 수집(서버 전송·DB 영속·엔진 입력용).
export function captureGameState(): GameState {
  const gs = {} as Record<string, unknown>;
  for (const key of Object.keys(RUN_STORES) as (keyof RunStores)[]) {
    gs[key] = dataOnly(RUN_STORES[key].getState());
  }
  return gs as GameState;
}

// GameState 를 스토어들에 반영(서버 응답 적용·로드). setState 얕은 병합 → 데이터만 덮고 메서드는 보존.
export function commitGameState(state: GameState): void {
  for (const key of Object.keys(RUN_STORES) as (keyof RunStores)[]) {
    // 전방호환 — 옛 세이브엔 나중 추가된 스토어 키가 없다(undefined). 그때 건너뛰어 기본값을 지킨다.
    // (zustand setState 는 비-객체 인자를 replace 로 보아 undefined 전달 시 그 스토어를 통째 날린다 →
    //  출시 후 RUN_STORES 에 스토어를 추가하면 기존 플레이어 DB 세이브 로드가 그 스토어를 지워 크래시.)
    const slice = (state as Record<string, unknown> | null | undefined)?.[key];
    if (slice == null || typeof slice !== 'object') continue;
    // 각 스토어의 setState — 데이터 슬라이스로 덮어쓴다(객체 → 얕은 병합, 액션 메서드·미제공 필드 보존).
    // 19종 스토어의 setState 시그니처 유니온은 단일 호출로 안 잡혀 최소 형태로 캐스팅.
    const store = RUN_STORES[key] as unknown as { setState: (partial: unknown) => void };
    store.setState(slice);
  }
}

// GameState 의 깊은 복제(엔진이 원본을 안 건드리고 새 상태를 만들 때). JSON 직렬화 가능 전제.
export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}
