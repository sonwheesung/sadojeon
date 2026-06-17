// 업적 데이터 — docs/32. 그레이박스 v1: **상태 스캔으로 잡히는 "첫 X"** 위주(시스템 안 건드림).
// check(ctx) = 현재 게임 상태에서 조건 충족 여부. achievementSystem 이 정산 때 스캔 → 신규 달성 기록.
// unlockArtId = 달성 시 영구 해금되는 무공서(다회차 자산). 보상(reward)은 표시용 — 파워 영구증가 X(docs/32).

import { realmIndex } from '@/data/realm';
import type { Disciple } from '@/types';
import type { GraduateRecord } from '@/stores/graduateStore';

export type AchCategory = 'martial' | 'mind' | 'activity' | 'career' | 'ganghos';

export const ACH_CATEGORY_LABEL: Record<AchCategory, string> = {
  martial: '무도',
  mind: '마음',
  activity: '활동',
  career: '직업·졸업',
  ganghos: '강호',
};

// 스캔 컨텍스트 — achievementSystem 이 스토어에서 만들어 넘긴다(데이터는 스토어 무관).
export interface AchCtx {
  disciples: Disciple[]; // 현재 사문 제자(졸업 제자 포함 — status='graduated' 로 남음, graduatedJob 보유)
  graduates: GraduateRecord[]; // 졸업 궤적 레코드
  divineHerbs: number; // 신품 영초(herb-divine) 보유 수
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  category: AchCategory;
  reward?: string; // 표시용(다이아·칭호 등)
  unlockArtId?: string; // 달성 시 영구 해금 무공서
  hidden?: boolean; // 달성 전 조건 가림(다크 업적 등)
  check: (c: AchCtx) => boolean;
}

const anyRealmAtLeast = (c: AchCtx, realm: string) =>
  c.disciples.some((d) => realmIndex(d.realm) >= realmIndex(realm as Disciple['realm']));
const anyGraduatedAs = (c: AchCtx, jobId: string) =>
  c.disciples.some((d) => d.graduatedJob === jobId);

export const ACHIEVEMENTS: readonly Achievement[] = [
  // ── 무도 ──────────────────────────────────────────────────────────
  { id: 'ach-jeoljeong', name: '절정 고수', desc: '제자가 절정에 오르다', category: 'martial', reward: '다이아 · 칭호', check: (c) => anyRealmAtLeast(c, 'jeoljeong') },
  { id: 'ach-chojeoljeong', name: '초절정', desc: '제자가 초절정에 오르다', category: 'martial', reward: '칭호 · 다이아 다량', check: (c) => anyRealmAtLeast(c, 'chojeoljeong') },
  {
    id: 'ach-hwagyeong', name: '환골탈태(換骨奪胎)', desc: '제자가 화경에 들어 몸이 다시 태어나다',
    category: 'martial', reward: '최고 칭호 · 다이아 다량 · **역근경 해금**', unlockArtId: 'yeokgeun-gyeong',
    check: (c) => anyRealmAtLeast(c, 'hwagyeong'),
  },
  {
    id: 'ach-sword-saint', name: '검성(劍聖)', desc: '한 자루 검의 정점 — 검성으로 졸업시키다',
    category: 'martial', reward: '최고 칭호 · **독고구검 해금**', unlockArtId: 'dokgo-gugeom',
    check: (c) => anyGraduatedAs(c, 'sword-saint'),
  },

  // ── 마음 ──────────────────────────────────────────────────────────
  { id: 'ach-first-dark', name: '첫 그늘', desc: '제자가 처음 흑화하다', category: 'mind', reward: '다이아 · 도감', check: (c) => c.disciples.some((d) => (d.darknessLevel ?? 0) >= 1) },
  { id: 'ach-blackened', name: '어둠에 삼켜지다', desc: '제자 흑화 최대 단계', category: 'mind', reward: '어두운 칭호 · 다이아', hidden: true, check: (c) => c.disciples.some((d) => (d.darknessLevel ?? 0) >= 4) },
  { id: 'ach-sworn', name: '강호의 의형제', desc: '두 제자가 의형제(sworn)로 맺어지다', category: 'mind', reward: '다이아 · 도감', check: (c) => c.disciples.some((d) => Object.values(d.relationships ?? {}).includes('sworn' as never)) },

  // ── 활동 ──────────────────────────────────────────────────────────
  { id: 'ach-divine-herb', name: '신품을 캐다', desc: '신품 영초를 처음 손에 넣다', category: 'activity', reward: '칭호 · 다이아 다량', check: (c) => c.divineHerbs > 0 },

  // ── 직업·졸업 ─────────────────────────────────────────────────────
  { id: 'ach-graduate', name: '강호로', desc: '제자를 처음 하산시키다', category: 'career', reward: '다이아 소량 · 도감', check: (c) => c.graduates.length > 0 },
  { id: 'ach-murim-lord', name: '무림맹주', desc: '제자를 무림맹주로 졸업시키다', category: 'career', reward: '최고 칭호 · 다이아 다량', check: (c) => anyGraduatedAs(c, 'murim-lord') },
  { id: 'ach-divine-healer', name: '신의(神醫)', desc: '제자를 신의로 졸업시키다', category: 'career', reward: '최고 칭호 · 다이아 다량', check: (c) => anyGraduatedAs(c, 'divine-healer') },
  { id: 'ach-ganghos-shadow', name: '강호의 그림자', desc: '제자를 정탐의 정점으로 졸업시키다', category: 'career', reward: '칭호 · 다이아', check: (c) => anyGraduatedAs(c, 'ganghos-shadow') },
  { id: 'ach-demon-protector', name: '마교 호법(魔敎護法)', desc: '흑화한 제자를 마교 호법으로 졸업시키다', category: 'career', reward: '어두운 칭호 · 다이아', hidden: true, check: (c) => anyGraduatedAs(c, 'demon-protector') },
  {
    id: 'ach-demon-god', name: '천마(天魔)', desc: '제자를 마(魔)의 정점, 천마로 졸업시키다',
    category: 'career', reward: '어두운 전설 칭호 · **천마신공 해금**', unlockArtId: 'cheonma-singong', hidden: true,
    check: (c) => anyGraduatedAs(c, 'demon-god'),
  },

  // ── 강호 ──────────────────────────────────────────────────────────
  { id: 'ach-graduate-peak', name: '강호를 평정한 동문', desc: '졸업 제자가 노선의 정점에 오르다', category: 'ganghos', reward: '최고 칭호 · 다이아 다량', check: (c) => c.graduates.some((g) => g.level >= (g.route === 'demonic' ? 4 : 3)) },
];

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
