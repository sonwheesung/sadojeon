// 의뢰 데이터 — docs/28 §4 경로 B. 그레이박스 수치(밸런싱 전 임시).

import type { Quest, QuestDomain, QuestGrade } from '@/types';
import type { StatId } from '@/types/training';

export const QUEST_DOMAIN_LABEL: Record<QuestDomain, string> = {
  guard: '호위',
  scout: '정탐',
  duel: '결투',
  medicine: '의술',
  grand: '큰의뢰',
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
export const QUEST_POOL: readonly Quest[] = [
  // ── 잡일 ──
  { id: 'q-market', domain: 'guard', grade: 'menial', title: '시장 짐 운반', client: '마을 노점', preview: '사흘간 짐 옮길 일손이 필요합니다.', weeks: 1, reward: { money: 5, fame: 1 }, recommended: 1, minStat: 0 },
  { id: 'q-herb', domain: 'medicine', grade: 'menial', title: '약초 채집 동행', client: '마을 의원', preview: '약초꾼을 따라 산을 돈다.', weeks: 1, reward: { money: 5, fame: 1 }, recommended: 1, minStat: 0 },
  // ── 소무 ──
  { id: 'q-patrol', domain: 'guard', grade: 'minor', title: '마을 야경', client: '촌장', preview: '밤마다 마을을 지킨다.', weeks: 1, reward: { money: 9, fame: 2 }, recommended: 1, minStat: 5 },
  { id: 'q-scout-village', domain: 'scout', grade: 'minor', title: '인근 마을 정탐', client: '행상', preview: '옆 마을 사정을 살펴봐 주오.', weeks: 1, reward: { money: 9, fame: 2 }, recommended: 1, minStat: 5 },
  // ── 보통 ──
  { id: 'q-escort-merchant', domain: 'guard', grade: 'normal', title: '표국 호위', client: '황보 표국', preview: '보름간 표물을 강북까지 지킨다.', weeks: 2, reward: { money: 18, fame: 4 }, recommended: 1, minStat: 20 },
  { id: 'q-find-missing', domain: 'scout', grade: 'normal', title: '실종자 수색', client: '황화촌 촌장', preview: '사흘 전 행상이 돌아오지 않았다.', weeks: 2, reward: { money: 16, fame: 4 }, recommended: 1, minStat: 20 },
  { id: 'q-clinic', domain: 'medicine', grade: 'normal', title: '마을 역병 진료', client: '관아', preview: '역병이 도는 마을에 의원이 필요하다.', weeks: 2, reward: { money: 17, fame: 5 }, recommended: 1, minStat: 25 },
  { id: 'q-duel-challenge', domain: 'duel', grade: 'normal', title: '비무 도전', client: '지방 무관', preview: '문파 간 비무에 나설 무인을 청한다.', weeks: 1, reward: { money: 15, fame: 6 }, recommended: 1, minStat: 25 },
  // ── 위험 ──
  { id: 'q-bandit', domain: 'duel', grade: 'dangerous', title: '산적 토벌', client: '강북 마을 연합', preview: '산길을 막은 산적 무리를 친다.', weeks: 3, reward: { money: 35, fame: 8 }, recommended: 2, minStat: 40 },
  { id: 'q-heuksa-scout', domain: 'scout', grade: 'dangerous', title: '흑사파 거점 정찰', client: '익명', preview: '강남 봉기 정보. 정탐만 가능.', weeks: 3, reward: { money: 30, fame: 9 }, recommended: 2, minStat: 40 },
  { id: 'q-protect-caravan', domain: 'guard', grade: 'dangerous', title: '대상단 호행', client: '대상단주', preview: '먼 길, 노리는 자가 많다.', weeks: 3, reward: { money: 38, fame: 8 }, recommended: 2, minStat: 40 },
  { id: 'q-secret', domain: 'scout', grade: 'dangerous', title: '은밀한 처리', client: '도시 권력자', preview: '조용히 처리해 주시면 후사하겠소.', weeks: 2, reward: { money: 45, fame: 6 }, recommended: 1, minStat: 35, gray: true },
  // ── 극험 ──
  { id: 'q-grand-meng', domain: 'grand', grade: 'extreme', title: '무림맹 밀명', client: '무림맹', preview: '강호의 명운이 걸린 일이오.', weeks: 4, reward: { money: 70, fame: 15 }, recommended: 3, minStat: 65 },
  { id: 'q-hyeolsu', domain: 'duel', grade: 'extreme', title: "사파 거물 '혈수' 추적", client: '무림맹', preview: '악명 자객의 행적을 끝까지 쫓는다.', weeks: 4, reward: { money: 80, fame: 16 }, recommended: 3, minStat: 65 },
] as const;
