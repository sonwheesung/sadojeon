// 강호 정세 엔진 ⇄ 게임 배선 — 순수 코어(worldSystem)를 스토어에 물리고, 리포트(풍문·평판·의뢰)를
// 부수효과로 적용. advanceTurn 이 계절 경계마다 tickWorld() 호출. docs/08.
// 코어는 부수효과를 모른다(SOLID) — 여기서만 서신함·평판·의뢰에 닿는다.

import { BLOC_FACTIONS } from '@/data/worldPowers';
import { useInboxStore } from '@/stores/inboxStore';
import { useJianghuStore } from '@/stores/jianghuStore';
import { useTimeStore } from '@/stores/timeStore';
import { seedWorldState, tickWorldState, type WorldTickReport } from '@/systems/worldSystem';
import { adjustSectRep } from './reputationSystem';
import { seedWorldQuests } from './questSystem';

function pushRumor(title: string, body: string, priority: 'normal' | 'high'): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `world-${day}-${Math.floor(Math.random() * 1e6)}`,
    kind: 'rumor',
    title,
    preview: body,
    body,
    priority,
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// 강호 주도권 이동 → 사문 평판 미세 연동. 한 세력이 부상하면 그 진영 대표 문파와의 인연이 살짝 움직인다.
// 작게(±3) — 정세는 배경, 사문 평판의 주역은 의뢰·행동이다. docs/30.
function applyRepSwing(up?: string, down?: string): void {
  const bump = (bloc: string | undefined, delta: number) => {
    if (!bloc) return;
    for (const fid of BLOC_FACTIONS[bloc as keyof typeof BLOC_FACTIONS] ?? []) {
      adjustSectRep(fid, delta);
    }
  };
  bump(up, 3);
  bump(down, -3);
}

function applyReport(report: WorldTickReport): void {
  for (const r of report.rumors) pushRumor(r.title, r.body, r.priority);
  for (const sw of report.repSwings) applyRepSwing(sw.up, sw.down);
  // 큰 사건(봉기·토벌·전쟁) → 관련 의뢰를 게시판에 띄운다. docs/29·30.
  // 단, 전쟁은 정파가 낀 전쟁만 의뢰화(무림맹 정예 차출) — 사마대전·관사 토벌은 사문과 무관한 배경.
  const seeds = report.questSeeds.filter((q) => q.kind !== 'war' || q.blocs.includes('orthodox'));
  if (seeds.length > 0) {
    seedWorldQuests(seeds.map((q) => ({ kind: q.kind, headline: q.headline })));
  }
}

// 회차 시작 정세 시드(필요 시).
export function seedWorld(): void {
  useJianghuStore.getState().seedDefaults();
}

// 한 계절 진행 — advanceTurn 의 계절 경계에서 호출.
export function tickWorld(): void {
  const st = useJianghuStore.getState();
  const world = st.world ?? seedWorldState();
  const report = tickWorldState(world, Math.random);
  st.setWorld(world);
  applyReport(report);
}
