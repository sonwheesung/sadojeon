// 회차 상태 ↔ Supabase 동기화 (오케스트레이터).
// 핵심(회차 행 + 제자)만 직접 다루고, 자식 도메인(서신함·강호·물품·NPC)은
// runSlices 레지스트리를 순회만 한다 → 도메인 추가 시 이 파일은 안 바뀜 (OCP).

import { runs } from '@/data/repositories';
import type { RunCore, RunDiscipleRecord, RunWrite } from '@/data/repositories';
import {
  useDiscipleStore,
  useGameStore,
  useMasterStore,
  useScheduleStore,
  useSectStore,
  useTimeStore,
} from '@/stores';
import type { Disciple, GameTime, Master, SectState } from '@/types';
import { RUN_CHILD_SLICES } from './runSlices';

// 현재 스토어 → 회차 핵심 스냅샷 (회차 행 payload + 제자).
function snapshot(): { payload: RunWrite; disciples: RunDiscipleRecord[] } {
  const time = useTimeStore.getState();
  const sched = useScheduleStore.getState();
  const sect = useSectStore.getState().sect;
  const master = useMasterStore.getState().master;
  const ds = useDiscipleStore.getState();
  const slot = useGameStore.getState().meta.saveSlot;

  const disciples: RunDiscipleRecord[] = ds.order
    .map((id) => ds.disciples[id])
    .filter((d): d is Disciple => Boolean(d))
    .map((d) => ({
      sourceId: d.id,
      name: d.name,
      status: d.status,
      state: d as unknown as Record<string, unknown>,
    }));

  return {
    payload: {
      slot,
      diamonds: 0, // 재화 도입 시 채움
      gameTime: { current: time.current, totalDay: time.totalDay },
      master,
      sect,
      schedule: {
        schedule: sched.schedule,
        individualPatterns: sched.individualPatterns,
        dailyChoice: sched.dailyChoice,
        overrides: sched.overrides,
        lastSnapshot: sched.lastSnapshot,
      },
    },
    disciples,
  };
}

// 현재 회차를 현재 슬롯에 저장 (upsert). 진행·시작 시 호출.
// saveSlot 은 SELECT→INSERT 라 원자적이지 않고, 자식 슬라이스 저장은 delete+insert 라
// 동시 호출이 겹치면 충돌(unique 위반·부분쓰기)이 난다. 빠른 진행(advanceTurn)과
// 서신함 해소가 autosave 를 연달아 부르므로, 모든 저장을 모듈 전역 큐로 직렬화한다.
let saveQueue: Promise<void> = Promise.resolve();

async function doSaveCurrentRun(): Promise<void> {
  if (!useMasterStore.getState().master) return; // 미시작
  const { payload, disciples } = snapshot();
  const runId = await runs.saveSlot(payload, disciples);
  for (const slice of RUN_CHILD_SLICES) {
    await slice.save(runId);
  }
}

export function saveCurrentRun(): Promise<void> {
  // 이전 저장의 성공·실패와 무관하게 이어 붙인다(체인이 끊기지 않게).
  const next = saveQueue.then(doSaveCurrentRun, doSaveCurrentRun);
  // 큐 자체는 다음 호출이 이어받도록 보관하되, 거부는 삼켜 unhandled rejection 을 막는다.
  saveQueue = next.catch(() => {});
  return next;
}

// 자동(silent) 저장 on/off — 헤드리스 고속 진행에서 매일 저장이 쌓이는 쓰기 증폭을
// 막기 위한 게이트. 앱 기본 ON. 명시적 saveCurrentRun() 에는 영향 없다.
let autoSaveEnabled = true;
export function setAutoSaveEnabled(enabled: boolean): void {
  autoSaveEnabled = enabled;
}

// 진행 중 fire-and-forget 저장 — 실패해도 게임 흐름 안 막음.
export function saveCurrentRunSilently(): void {
  if (!autoSaveEnabled) return;
  saveCurrentRun().catch((e) => {
    if (typeof console !== 'undefined') console.warn('[runSync] 저장 실패', e);
  });
}

// 회차 핵심 → 스토어 복원.
function hydrateCore(core: RunCore): void {
  const { run: record, disciples } = core;

  const current = (record.gameTime as { current?: GameTime }).current;
  if (current) useTimeStore.getState().setTime(current); // setTime 이 totalDay 재계산

  if (record.master) useMasterStore.getState().setMaster(record.master as unknown as Master);
  else useMasterStore.getState().reset();

  if (record.sect) useSectStore.getState().setSect(record.sect as unknown as SectState);
  else useSectStore.getState().reset();

  const sc = record.schedule as {
    schedule?: unknown;
    individualPatterns?: unknown;
    dailyChoice?: unknown;
    overrides?: unknown;
    lastSnapshot?: unknown;
  };
  useScheduleStore.setState({
    ...(sc.schedule ? { schedule: sc.schedule as never } : {}),
    individualPatterns: (sc.individualPatterns as never) ?? ({} as never),
    dailyChoice: (sc.dailyChoice as never) ?? ({} as never),
    overrides: (sc.overrides as never) ?? ({} as never),
    lastSnapshot: (sc.lastSnapshot as never) ?? null,
  });

  useDiscipleStore.getState().setAll(disciples.map((d) => d.state as unknown as Disciple));
}

// DB 회차 로드 → 스토어 복원 (핵심 + 모든 자식 슬라이스). 성공 여부 반환.
export async function loadRun(runId: string): Promise<boolean> {
  const core = await runs.getCore(runId);
  if (!core) return false;
  hydrateCore(core);
  for (const slice of RUN_CHILD_SLICES) {
    await slice.load(runId);
  }
  return true;
}
