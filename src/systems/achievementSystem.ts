// 업적 시스템 — docs/32. 상태 스캔 방식(시스템마다 emit 안 박고, 정산 때 현재 상태를 훑어 "첫 X"를 잡음).
// 계정 단위 영속(achievementStore·metaStorage). 달성 시 무공서 영구 해금 + 풍문 서신 알림.
// 회차 시작엔 리셋 X — 해금 무공서를 새 회차 codex 로 시드(seedUnlockedArts).

import { ACHIEVEMENTS, type AchCtx, type Achievement } from '@/data/achievements';
import { findMartialArt } from '@/data/martialArts';
import { useAchievementStore } from '@/stores/achievementStore';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGraduateStore } from '@/stores/graduateStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useItemStore } from '@/stores/itemStore';
import { useMetNpcStore } from '@/stores/metNpcStore';
import { useTallyStore } from '@/stores/tallyStore';
import { useTimeStore } from '@/stores/timeStore';
import { NAMED_NPCS } from '@/data/npcs';
import type { Disciple } from '@/types';

function buildCtx(): AchCtx {
  const disciples = Object.values(useDiscipleStore.getState().disciples) as Disciple[];
  const graduates = useGraduateStore.getState().records;
  const divineHerbs = useItemStore.getState().items.find((i) => i.id === 'herb-divine')?.count ?? 0;
  const tally = useTallyStore.getState();
  const metNpc = useMetNpcStore.getState().met.length;
  return { disciples, graduates, divineHerbs, metNpc, namedNpcTotal: NAMED_NPCS.length, n: tally.n, streak: tally.streak };
}

// 업적 해금 무공서를 현 회차 codex 에 (이미 있으면 무시). 보상은 즉시 연구 완료 상태.
function grantArtToCodex(artId: string): boolean {
  const codex = useCodexStore.getState();
  if (codex.hasScroll(artId)) return false;
  const art = findMartialArt(artId);
  if (!art) return false;
  codex.addScroll({
    artId,
    acquiredAtRun: 1,
    acquiredAtDay: useTimeStore.getState().totalDay,
    status: 'complete', // 업적 보상 — 연구 불필요(업적 자체가 해금)
    researchProgress: 100,
    isTrap: false,
    isIncomplete: false,
  });
  return true;
}

function announce(a: Achievement, unlockedArt?: string): void {
  const day = useTimeStore.getState().totalDay;
  const artName = unlockedArt ? findMartialArt(unlockedArt)?.name : undefined;
  const body = artName
    ? `업적 「${a.name}」 달성. ${a.desc}.\n전설 무공서 **${artName}**이 영구히 해금되었다 — 다음 회차부터 사문에 전해진다.`
    : `업적 「${a.name}」 달성. ${a.desc}.`;
  useInboxStore.getState().add({
    id: `ach-${a.id}-${day}`,
    kind: 'report',
    title: `업적 달성 — ${a.name}`,
    preview: body,
    body,
    priority: artName ? 'high' : 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'achievement' },
  });
}

// 정산 훅 — 현재 상태로 미달성 업적을 스캔, 신규 달성 기록 + 해금 + 알림.
export function checkAchievements(): void {
  const store = useAchievementStore.getState();
  const ctx = buildCtx();
  for (const a of ACHIEVEMENTS) {
    if (store.has(a.id)) continue;
    if (!a.check(ctx)) continue;
    store.unlock(a.id);
    let granted: string | undefined;
    if (a.unlockArtId) {
      store.addArt(a.unlockArtId);
      if (grantArtToCodex(a.unlockArtId)) granted = a.unlockArtId;
      else granted = a.unlockArtId; // 이미 보유여도 해금 사실은 알린다
    }
    announce(a, granted);
  }
}

// 회차 시작 — 계정에 해금된 무공서를 새 회차 codex 로 시드(다회차 자산). seedNewRun 에서 호출.
export function seedUnlockedArts(): void {
  for (const artId of useAchievementStore.getState().unlockedArts) grantArtToCodex(artId);
}
