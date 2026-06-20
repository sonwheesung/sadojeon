// 업적 데이터 — docs/32. 그레이박스 v1: **상태 스캔으로 잡히는 "첫 X"** 위주(시스템 안 건드림).
// check(ctx) = 현재 게임 상태에서 조건 충족 여부. achievementSystem 이 정산 때 스캔 → 신규 달성 기록.
// unlockArtId = 달성 시 영구 해금되는 무공서(다회차 자산). 보상(reward)은 표시용 — 파워 영구증가 X(docs/32).

import { realmIndex } from '@/data/realm';
import { DOMAIN_TALLY, STREAK, TALLY } from '@/data/tallyKeys';
import type { Disciple } from '@/types';
import type { GraduateRecord } from '@/stores/graduateStore';

export type AchCategory = 'martial' | 'mind' | 'activity' | 'career' | 'ganghos' | 'quest';

export const ACH_CATEGORY_LABEL: Record<AchCategory, string> = {
  martial: '무도',
  mind: '마음',
  activity: '활동',
  career: '직업·졸업',
  ganghos: '강호',
  quest: '의뢰',
};

// 스캔 컨텍스트 — achievementSystem 이 스토어에서 만들어 넘긴다(데이터는 스토어 무관).
export interface AchCtx {
  disciples: Disciple[]; // 현재 사문 제자(졸업 제자 포함 — status='graduated' 로 남음, graduatedJob 보유)
  graduates: GraduateRecord[]; // 졸업 궤적 레코드
  divineHerbs: number; // 신품 영초(herb-divine) 보유 수
  n: (key: string) => number; // 누적 카운터(의뢰 완수 수 등) — tallyStore
  streak: (key: string) => number; // 최고 연속(연속 무사고 등) — tallyStore
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
// 6도메인 의뢰를 모두 한 번 이상 완수했나(육예 통달).
const allDomainsDone = (c: AchCtx) =>
  Object.values(DOMAIN_TALLY).every((k) => c.n(k) >= 1);

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
  // 정점(peak) 직업 업적 — 정점 11종 전부 명명 업적 보유(2026-06-20 약왕·살수·도가·의적·상단 추가).
  { id: 'ach-medicine-king', name: '약왕(藥王)', desc: '제자를 영약 제조의 정점, 약왕으로 졸업시키다', category: 'career', reward: '최고 칭호 · 다이아 다량', check: (c) => anyGraduatedAs(c, 'medicine-king') },
  { id: 'ach-dark-blade', name: '어둠의 절세 살수', desc: '제자를 살수계의 정점으로 졸업시키다', category: 'career', reward: '어두운 칭호 · 다이아', hidden: true, check: (c) => anyGraduatedAs(c, 'dark-blade') },
  { id: 'ach-daoist-master', name: '도가 명사(道家名士)', desc: '제자를 도가 사상의 정수, 도가 명사로 졸업시키다', category: 'career', reward: '칭호 · 다이아', check: (c) => anyGraduatedAs(c, 'daoist-master') },
  { id: 'ach-chivalrous-chief', name: '의적 거두', desc: '제자를 천하 의적을 거느린 거두로 졸업시키다', category: 'career', reward: '최고 칭호 · 다이아 다량', check: (c) => anyGraduatedAs(c, 'chivalrous-chief') },
  { id: 'ach-caravan-master', name: '상단 총관', desc: '제자를 거대 상단의 총관으로 졸업시키다', category: 'career', reward: '칭호 · 다이아', check: (c) => anyGraduatedAs(c, 'caravan-master') },

  // ── 강호 ──────────────────────────────────────────────────────────
  // 노선 정점 — 마도는 마교 호법(level 3)도 정점 인정(천마 level 4 한정 아님, 사용자 2026-06-20). 전 노선 level≥3.
  { id: 'ach-graduate-peak', name: '강호를 평정한 동문', desc: '졸업 제자가 노선의 정점에 오르다', category: 'ganghos', reward: '최고 칭호 · 다이아 다량', check: (c) => c.graduates.some((g) => g.level >= 3) },

  // ── 의뢰 ──────────────────────────────────────────────────────────
  // 누적 완수(성공=완수·성공·위기끝성공). 계정 단위 — 회차 넘어 합산. docs/32.
  { id: 'ach-quest-first', name: '강호초행(江湖初行)', desc: '제자를 처음 의뢰에 보내 성공시키다', category: 'quest', reward: '다이아 소량 · 도감', check: (c) => c.n(TALLY.questDone) >= 1 },
  { id: 'ach-quest-10', name: '강호의 일꾼', desc: '의뢰 10건을 성공시키다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.questDone) >= 10 },
  { id: 'ach-quest-25', name: '믿음직한 사문', desc: '의뢰 25건을 성공시키다', category: 'quest', reward: '다이아 · 칭호', check: (c) => c.n(TALLY.questDone) >= 25 },
  { id: 'ach-quest-50', name: '강호의 기둥', desc: '의뢰 50건을 성공시키다', category: 'quest', reward: '칭호 · 다이아 다량', check: (c) => c.n(TALLY.questDone) >= 50 },
  { id: 'ach-quest-100', name: '백 가지 강호사(百事)', desc: '의뢰 100건을 성공시키다', category: 'quest', reward: '최고 칭호 · 다이아 다량', check: (c) => c.n(TALLY.questDone) >= 100 },

  // 완벽 완수(흠 없는 full)·연속 무사고.
  { id: 'ach-quest-flawless', name: '흠 없이', desc: '의뢰를 단 한 점 흠 없이 완수하다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.questFull) >= 1 },
  { id: 'ach-quest-flawless-streak5', name: '무결의 행보', desc: '의뢰를 연속 5건 완벽 완수하다', category: 'quest', reward: '칭호 · 다이아', check: (c) => c.streak(STREAK.flawless) >= 5 },
  { id: 'ach-quest-flawless-streak10', name: '한 점 그늘 없는 길', desc: '의뢰를 연속 10건 완벽 완수하다', category: 'quest', reward: '최고 칭호 · 다이아 다량', check: (c) => c.streak(STREAK.flawless) >= 10 },

  // 등급 — 위험·극험.
  { id: 'ach-quest-dangerous', name: '위험을 무릅쓰고', desc: '위험 등급 의뢰를 처음 완수하다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.gradeDangerous) >= 1 },
  { id: 'ach-quest-extreme', name: '사지(死地)를 넘다', desc: '극험 의뢰를 처음 완수하다', category: 'quest', reward: '칭호 · 다이아 다량', check: (c) => c.n(TALLY.gradeExtreme) >= 1 },
  { id: 'ach-quest-extreme-10', name: '극험의 단골', desc: '극험 의뢰를 10건 완수하다', category: 'quest', reward: '최고 칭호 · 다이아 다량', check: (c) => c.n(TALLY.gradeExtreme) >= 10 },

  // 도메인 — 첫 완수 6종 + 통달.
  { id: 'ach-quest-guard', name: '첫 호행(護行)', desc: '호위 의뢰를 처음 완수하다', category: 'quest', reward: '도감', check: (c) => c.n(TALLY.domGuard) >= 1 },
  { id: 'ach-quest-scout', name: '첫 정탐', desc: '정탐 의뢰를 처음 완수하다', category: 'quest', reward: '도감', check: (c) => c.n(TALLY.domScout) >= 1 },
  { id: 'ach-quest-duel', name: '첫 비무행(比武行)', desc: '결투 의뢰를 처음 완수하다', category: 'quest', reward: '도감', check: (c) => c.n(TALLY.domDuel) >= 1 },
  { id: 'ach-quest-medicine', name: '첫 활인(活人)', desc: '의술 의뢰를 처음 완수하다', category: 'quest', reward: '도감', check: (c) => c.n(TALLY.domMedicine) >= 1 },
  { id: 'ach-quest-assassin', name: '첫 회행(灰行)', desc: '청부(회색) 의뢰를 처음 완수하다', category: 'quest', reward: '도감', hidden: true, check: (c) => c.n(TALLY.domAssassin) >= 1 },
  { id: 'ach-quest-grand', name: '첫 대전(大戰)', desc: '대전 의뢰를 처음 완수하다', category: 'quest', reward: '칭호 · 다이아', check: (c) => c.n(TALLY.domGrand) >= 1 },
  { id: 'ach-quest-all-domains', name: '육예(六藝) 통달', desc: '여섯 갈래 의뢰를 모두 완수하다', category: 'quest', reward: '최고 칭호 · 다이아 다량', check: (c) => allDomainsDone(c) },

  // 특수 결 — 청부·후원·강호 사건·단신·합공·귀인.
  { id: 'ach-quest-gray-10', name: '그림자 청부', desc: '회색 의뢰를 10건 완수하다', category: 'quest', reward: '어두운 칭호 · 다이아', hidden: true, check: (c) => c.n(TALLY.gray) >= 10 },
  { id: 'ach-quest-sponsored', name: '문파의 신임', desc: '우호 문파의 후원 의뢰를 처음 완수하다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.sponsored) >= 1 },
  { id: 'ach-quest-world', name: '시국(時局)을 떠받치다', desc: '강호 정세가 부른 의뢰를 처음 해결하다', category: 'quest', reward: '칭호 · 다이아', check: (c) => c.n(TALLY.worldEvent) >= 1 },
  { id: 'ach-quest-solo', name: '홀로 강호에', desc: '제자 혼자 의뢰를 완수하다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.solo) >= 1 },
  { id: 'ach-quest-party', name: '합공(合攻)', desc: '셋 이상이 함께 의뢰를 완수하다', category: 'quest', reward: '다이아', check: (c) => c.n(TALLY.party) >= 1 },
  { id: 'ach-quest-noble', name: '귀인을 구하다', desc: '의뢰 중 명문의 고인을 구해 인연을 맺다', category: 'quest', reward: '칭호 · 다이아', check: (c) => c.n(TALLY.noble) >= 1 },

  // 노획·생사.
  { id: 'ach-quest-scroll', name: '강호에서 얻은 비급', desc: '의뢰 끝에 비급을 처음 손에 넣다', category: 'quest', reward: '도감 · 다이아', check: (c) => c.n(TALLY.scrollFound) >= 1 },
  { id: 'ach-quest-scroll-10', name: '서고를 채우다', desc: '의뢰로 비급 10권을 모으다', category: 'quest', reward: '칭호 · 다이아', check: (c) => c.n(TALLY.scrollFound) >= 10 },
  { id: 'ach-quest-divine-elixir', name: '천운(天運)', desc: '극험의 끝에서 신품 영약을 얻다', category: 'quest', reward: '최고 칭호 · 다이아 다량', hidden: true, check: (c) => c.n(TALLY.divineElixir) >= 1 },
  { id: 'ach-quest-fatal-survived', name: '사지에서 돌아오다', desc: '치명상을 입고도 살아 돌아오다', category: 'quest', reward: '칭호 · 다이아', hidden: true, check: (c) => c.n(TALLY.disasterSurvived) >= 1 },
  { id: 'ach-quest-death', name: '잃어버린 동문', desc: '의뢰 중 제자를 잃다', category: 'quest', reward: '도감', hidden: true, check: (c) => c.n(TALLY.death) >= 1 },
];

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
