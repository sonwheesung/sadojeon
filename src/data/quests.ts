// 의뢰 데이터 — docs/28 §4 경로 B. 그레이박스 수치(밸런싱 전 임시).

import type { Quest, QuestDomain, QuestGrade } from '@/types';
import type { StatId } from '@/types/training';

export const QUEST_DOMAIN_LABEL: Record<QuestDomain, string> = {
  guard: '호위',
  scout: '정탐',
  duel: '결투',
  medicine: '의술',
  assassin: '살수',
  grand: '큰의뢰',
};

// 의뢰 사상색 → 사문 분위기(도의 ↔ 무도) 영향. docs/28 §7 "사문 분위기 영향".
// + = 정파(도의), − = 사파(무도). 살수·회색 의뢰가 사문을 어둡게 한다.
export const QUEST_DOMAIN_RIGHTEOUSNESS: Record<QuestDomain, number> = {
  guard: 2,
  medicine: 2,
  grand: 2,
  duel: 0,
  scout: 0,
  assassin: -3,
};

export const QUEST_GRADE_LABEL: Record<QuestGrade, string> = {
  menial: '잡일',
  minor: '소무',
  normal: '보통',
  dangerous: '위험',
  extreme: '극험',
};

export const QUEST_GRADE_ORDER: readonly QuestGrade[] = [
  'menial',
  'minor',
  'normal',
  'dangerous',
  'extreme',
];

// 도메인 → 성장 능력치. duel·grand 은 무공 성으로(능력치 X) → null.
export const QUEST_DOMAIN_STAT: Record<QuestDomain, StatId | null> = {
  guard: 'guarding',
  scout: 'scouting',
  duel: null,
  medicine: 'medicine',
  assassin: 'scouting', // 살수 = 정탐·은신 기반
  grand: null,
};

// 등급별 위험 — 부상/사망 가능 여부 + 라벨.
export const QUEST_GRADE_RISK: Record<
  QuestGrade,
  { label: string; injury: boolean; death: boolean }
> = {
  menial: { label: '위험 없음', injury: false, death: false },
  minor: { label: '경상 드묾', injury: true, death: false },
  normal: { label: '부상 가능', injury: true, death: false },
  dangerous: { label: '중상 가능', injury: true, death: false },
  extreme: { label: '사망 가능', injury: true, death: true },
};

// 사문 명성(reputation) 구간 → 게시판에 뜨는 최고 등급. (그레이박스)
export function maxGradeForReputation(rep: number): QuestGrade {
  if (rep >= 80) return 'extreme';
  if (rep >= 50) return 'dangerous';
  if (rep >= 25) return 'normal';
  if (rep >= 10) return 'minor';
  return 'menial';
}

// 의뢰 풀 — 게시판 생성 시 명성 구간으로 필터해 일부 픽.
// 보수 상향(2026-06-10, ×~2.3): 시작자금 30금→50은 하향에 맞춰 "지출 줄이기"가 아니라 "일해서 버는" 구조로.
// 환산 기준 1은=50만원(1동=5천원) — 잡일 일당 ~2만원, 위험 3주 2인 ~40만원, 극험은 목숨값 프리미엄.
export const QUEST_POOL: readonly Quest[] = [
  // ── 잡일 ──
  { id: 'q-market', domain: 'guard', grade: 'menial', title: '시장 짐 운반', client: '마을 노점', preview: '사흘간 짐 옮길 일손이 필요합니다.', weeks: 1, days: 3, reward: { money: 12, fame: 1 }, recommended: 1, minStat: 0 },
  // (약초 채집은 의뢰가 아니라 활동(activitySystem·app/activity)으로 이관 — 2026-06-16. docs/38)
  // ── 소무 ──
  { id: 'q-patrol', domain: 'guard', grade: 'minor', title: '마을 야경', client: '촌장', preview: '밤마다 마을을 지킨다.', weeks: 1, reward: { money: 20, fame: 2 }, recommended: 1, minStat: 5 },
  { id: 'q-scout-village', domain: 'scout', grade: 'minor', title: '인근 마을 정탐', client: '행상', preview: '옆 마을 사정을 살펴봐 주오.', weeks: 1, reward: { money: 20, fame: 2 }, recommended: 1, minStat: 5 },
  // ── 보통 ──
  { id: 'q-escort-merchant', domain: 'guard', grade: 'normal', title: '표국 호위', client: '황보 표국', preview: '보름간 표물을 강북까지 지킨다.', weeks: 2, reward: { money: 42, fame: 4 }, recommended: 1, minStat: 20 },
  { id: 'q-find-missing', domain: 'scout', grade: 'normal', title: '실종자 수색', client: '황화촌 촌장', preview: '사흘 전 행상이 돌아오지 않았다.', weeks: 2, reward: { money: 38, fame: 4 }, recommended: 1, minStat: 20 },
  { id: 'q-clinic', domain: 'medicine', grade: 'normal', title: '마을 역병 진료', client: '관아', preview: '역병이 도는 마을에 의원이 필요하다.', weeks: 2, reward: { money: 40, fame: 5 }, recommended: 1, minStat: 25 },
  { id: 'q-duel-challenge', domain: 'duel', grade: 'normal', title: '비무 도전', client: '지방 무관', preview: '문파 간 비무에 나설 무인을 청한다.', weeks: 1, reward: { money: 36, fame: 6 }, recommended: 1, minStat: 25 },
  // ── 위험 ──
  { id: 'q-bandit', domain: 'duel', grade: 'dangerous', title: '산적 토벌', client: '강북 마을 연합', preview: '산채를 불 지르고 친다. 불길에 데기 쉽다.', weeks: 3, reward: { money: 80, fame: 8 }, recommended: 2, minStat: 40, woundType: 'burn' },
  { id: 'q-heuksa-scout', domain: 'scout', grade: 'dangerous', title: '흑사파 거점 정찰', client: '익명', preview: '강남 봉기 정보. 정탐만 가능.', weeks: 3, reward: { money: 70, fame: 9 }, recommended: 2, minStat: 40 },
  { id: 'q-protect-caravan', domain: 'guard', grade: 'dangerous', title: '설산 대상단 호행', client: '대상단주', preview: '혹한의 설산 길, 노리는 자도 많다. 동상을 조심하라.', weeks: 3, reward: { money: 88, fame: 8 }, recommended: 2, minStat: 40, woundType: 'frost' },
  { id: 'q-secret', domain: 'scout', grade: 'dangerous', title: '은밀한 처리', client: '도시 권력자', preview: '조용히 처리해 주시면 후사하겠소.', weeks: 2, reward: { money: 105, fame: 6 }, recommended: 1, minStat: 35, gray: true },
  // ── 극험 ──
  { id: 'q-grand-meng', domain: 'grand', grade: 'extreme', title: '무림맹 밀명', client: '무림맹', preview: '강호의 명운이 걸린 일이오.', weeks: 4, reward: { money: 160, fame: 15 }, recommended: 3, minStat: 65 },
  { id: 'q-hyeolsu', domain: 'duel', grade: 'extreme', title: "사파 거물 '혈수' 추적", client: '무림맹', preview: '악명 자객의 행적을 끝까지 쫓는다.', weeks: 4, reward: { money: 185, fame: 16 }, recommended: 3, minStat: 65 },
  // ── 호위 보강 ──
  { id: 'q-defend-sect', domain: 'guard', grade: 'normal', title: '사문 보호', client: '사문', preview: '사문을 노리는 무리가 있다.', weeks: 2, reward: { money: 38, fame: 4 }, recommended: 1, minStat: 20 },
  // ── 의술 보강 ──
  { id: 'q-treat-wound', domain: 'medicine', grade: 'normal', title: '큰 부상 치료', client: '지방 부호', preview: '중상을 입은 자를 살려달라.', weeks: 2, reward: { money: 42, fame: 4 }, recommended: 1, minStat: 25 },
  { id: 'q-antidote', domain: 'medicine', grade: 'dangerous', title: '해독 의뢰', client: '중독된 가문', preview: '맹독에 당한 일가를 구하라. 독기에 함께 노출된다.', weeks: 3, reward: { money: 70, fame: 7 }, recommended: 1, minStat: 40, woundType: 'poison' },
  // ── 결투 보강 ──
  { id: 'q-duel-master', domain: 'duel', grade: 'dangerous', title: '정파 명사 도전', client: '지방 무관', preview: '이름난 무인과의 비무에 나선다.', weeks: 2, reward: { money: 75, fame: 9 }, recommended: 1, minStat: 45 },
  // ── 살수(청부·어둠) ──
  { id: 'q-assassin-small', domain: 'assassin', grade: 'normal', title: '작은 청부', client: '익명', preview: '소문 없이 한 사람을 처리한다.', weeks: 2, reward: { money: 55, fame: 3 }, recommended: 1, minStat: 25, gray: true },
  { id: 'q-assassin-contract', domain: 'assassin', grade: 'dangerous', title: '사파의 청부', client: '사파 중개', preview: '어둠의 일은 흔적을 남기지 않는다.', weeks: 3, reward: { money: 105, fame: 7 }, recommended: 2, minStat: 45, gray: true },
  { id: 'q-assassin-big', domain: 'assassin', grade: 'extreme', title: '거물 암살', client: '익명', preview: '돌아오지 못할 수도 있는 일.', weeks: 4, reward: { money: 195, fame: 14 }, recommended: 2, minStat: 65, gray: true },
  // ── 큰 의뢰 보강 ──
  { id: 'q-grand-crisis', domain: 'grand', grade: 'dangerous', title: '강호 위기 구원', client: '강호 연합', preview: '한 지방의 안위가 걸렸다.', weeks: 3, reward: { money: 92, fame: 10 }, recommended: 2, minStat: 45 },
  { id: 'q-grand-noble', domain: 'grand', grade: 'dangerous', title: '명문 가문 의뢰', client: '명문가', preview: '큰 가문이 사문에 손을 내밀었다.', weeks: 3, reward: { money: 96, fame: 9 }, recommended: 2, minStat: 45 },
  { id: 'q-grand-sapa', domain: 'grand', grade: 'extreme', title: '사파 거두 토벌', client: '무림맹', preview: '한 시대의 악을 끊는다.', weeks: 4, reward: { money: 172, fame: 16 }, recommended: 3, minStat: 65 },
  { id: 'q-grand-evil', domain: 'grand', grade: 'extreme', title: '극악 정벌', client: '무림맹', preview: '강호의 명운이 걸린 대전.', weeks: 4, reward: { money: 210, fame: 18 }, recommended: 3, minStat: 70 },
] as const;
