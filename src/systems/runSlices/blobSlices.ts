// 범용 회차 도메인 블롭 슬라이스 — 전용 컬럼이 필요 없는(서버 조회 불요) 회차 상태를
// run_state(domain별 1행 jsonb)에 통째 저장/복원한다. codex·quest·graduate·activity·평판·
// 분위기·강호이력·사부출행 등 "스토어 데이터를 그대로 직렬화" 도메인용.
//
// reset 은 **no-op** — 새 회차 초기화는 newRun(seedNewRun)이 정확한 순서로 직접 소유한다
// (특히 codex 는 resetForNewRun→sectScrolls→seedUnlockedArts 순서가 load-bearing). 여기서
// 또 리셋하면 그 순서를 깨므로(예: 해금 무공서 재시드 뒤 codex 비움) 손대지 않는다. docs/31.

import { runs } from '@/data/repositories';
import {
  useActivityStore,
  useCodexStore,
  useEventHistoryStore,
  useGraduateStore,
  useOutreachStore,
  useQuestStore,
  useReputationStore,
  useSectAtmosphereStore,
} from '@/stores';
import type { RunChildSlice } from './types';

type Blob = Record<string, unknown>;

// get: 스토어 → 직렬화 데이터(영속 키만). set: 데이터 → 스토어(setState 병합 — 액션 메서드 보존).
function makeBlobSlice(key: string, get: () => Blob, set: (data: Blob) => void): RunChildSlice {
  return {
    key,
    async save(runId) {
      await runs.saveRunState(runId, key, get());
    },
    async load(runId) {
      const data = await runs.getRunState(runId, key);
      if (data && typeof data === 'object') set(data as Blob);
    },
    reset() {
      /* no-op — newRun 이 회차 초기화를 순서대로 소유(상단 주석). */
    },
  };
}

export const codexSlice = makeBlobSlice(
  'codex',
  () => {
    const s = useCodexStore.getState();
    return { scrolls: s.scrolls, elixirs: s.elixirs };
  },
  (d) => useCodexStore.setState(d as never),
);

export const questSlice = makeBlobSlice(
  'quest',
  () => {
    const s = useQuestStore.getState();
    return { board: s.board, active: s.active };
  },
  (d) => useQuestStore.setState(d as never),
);

export const graduateSlice = makeBlobSlice(
  'graduate',
  () => ({ records: useGraduateStore.getState().records }),
  (d) => useGraduateStore.setState(d as never),
);

export const activitySlice = makeBlobSlice(
  'activity',
  () => ({ active: useActivityStore.getState().active }),
  (d) => useActivityStore.setState(d as never),
);

export const reputationSlice = makeBlobSlice(
  'reputation',
  () => {
    const s = useReputationStore.getState();
    return { sect: s.sect, disciple: s.disciple };
  },
  (d) => useReputationStore.setState(d as never),
);

export const sectAtmosphereSlice = makeBlobSlice(
  'sectAtmosphere',
  () => ({ atmosphere: useSectAtmosphereStore.getState().atmosphere }),
  (d) => useSectAtmosphereStore.setState(d as never),
);

export const eventHistorySlice = makeBlobSlice(
  'eventHistory',
  () => ({ records: useEventHistoryStore.getState().records }),
  (d) => useEventHistoryStore.setState(d as never),
);

export const outreachSlice = makeBlobSlice(
  'outreach',
  () => ({ pending: useOutreachStore.getState().pending }),
  (d) => useOutreachStore.setState(d as never),
);

// 등록 묶음 — index.ts 가 RUN_CHILD_SLICES 에 펼친다.
export const BLOB_SLICES: readonly RunChildSlice[] = [
  codexSlice,
  questSlice,
  graduateSlice,
  activitySlice,
  reputationSlice,
  sectAtmosphereSlice,
  eventHistorySlice,
  outreachSlice,
];
