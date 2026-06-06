import type {
  Disciple,
  MartialArt,
  MartialArtGrade,
  MartialPath,
  MartialStage,
} from '@/types';
import {
  REALM_LEARN_FLOOR,
  REALM_SEONG_CAP,
  artGradeLearnRealm,
  realmIndex,
} from '@/data/realm';

// 시작 사문이 보유한 디폴트 무공 카탈로그. docs/04_무공_도감.md 갈래 8종 중 일부.
// 그레이박스용 — 실제 풀(150~250)은 추후 데이터 작업.
export const MARTIAL_ARTS: MartialArt[] = [
  {
    id: 'cheongpung-swordplay',
    name: '청풍검법',
    hanjaName: '靑風劍法',
    description: '바람을 베듯 가볍고 정직한 검술. 초심자가 검의 결을 익히기 좋다.',
    school: 'sword',
    grade: 'apprentice',
    path: 'jeong',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'agility'],
    isSectArt: true,
  },
  {
    id: 'baekun-fist',
    name: '백운권법',
    hanjaName: '白雲拳法',
    description: '구름이 흩어지듯 흐르는 권법. 강하지 않으나 결이 끊기지 않는다.',
    school: 'fist',
    grade: 'apprentice',
    path: 'jeong',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'qi'],
    isSectArt: true,
  },
  {
    id: 'unbo',
    name: '운보',
    hanjaName: '雲步',
    description: '발끝이 땅을 거의 닿지 않는 기초 보법. 모든 무공의 받침.',
    school: 'lightness',
    grade: 'novice',
    path: 'jung',
    requirements: [{ axis: 'agility', minimum: 2 }],
    preferredTalents: ['agility', 'mind'],
    isSectArt: true,
  },
  {
    id: 'cheongsim-gigong',
    name: '청심기공',
    hanjaName: '淸心氣功',
    description: '마음을 맑게 다스리는 기초 내공. 잡념을 거두고 호흡을 고른다.',
    school: 'qigong',
    grade: 'novice',
    path: 'jeong',
    requirements: [{ axis: 'mind', minimum: 2 }],
    preferredTalents: ['mind', 'insight'],
    isSectArt: true,
  },
  // ── 충돌 테스트용 예시 (사문 기본 외 — 향후 의뢰·발견으로 입수). docs/04 §무공 색깔 ──
  {
    id: 'heukpung-fist',
    name: '흑풍권',
    hanjaName: '黑風拳',
    description: '거칠고 매서운 사파 권법. 빠른 살수에 능하나 결이 어둡다.',
    school: 'fist',
    grade: 'master',
    path: 'sa',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'agility'],
    isSectArt: false,
  },
  {
    id: 'hyeolma-gong',
    name: '혈마공',
    hanjaName: '血魔功',
    description: '피로 기를 기르는 마교 비전. 폭발적 성장의 대가로 인격을 갉는다.',
    school: 'darkArts',
    grade: 'grandmaster',
    path: 'ma',
    requirements: [{ axis: 'qi', minimum: 3 }],
    preferredTalents: ['qi', 'mind'],
    isSectArt: false,
  },
];

export function findMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find((m) => m.id === id);
}

// 무공 학습 자격 — 경지 게이트만(어려운 비급은 경지 올라야 입문). docs/26 §5-1.
// 재능 게이트 폐기: 누구든 학습 가능, 효율(상극이면 ×0.04)이 성장 속도로 차등. docs/28 §2·§5.
export function canLearnArt(disciple: Disciple, art: MartialArt): boolean {
  return realmIndex(disciple.realm) >= realmIndex(artGradeLearnRealm(art.grade));
}

// 그 갈래에 재능(효율)이 있나 — 상극이면 false('어색함' 힌트용, 학습 자체는 막지 않음).
export function talentMet(disciple: Disciple, art: MartialArt): boolean {
  return disciple.efficiency?.[art.school] !== '상극';
}

// 새 무공을 익힐 때 시작 성 — 경지가 받침이 되어 기초를 건너뛴다. docs/26 §5-2.
export function initialSeong(disciple: Disciple, art: MartialArt): number {
  const floor = REALM_LEARN_FLOOR[disciple.realm];
  const cap = Math.min(seongCap(art.grade), REALM_SEONG_CAP[disciple.realm]);
  return Math.max(1, Math.min(floor, cap));
}

// 무공 노선 충돌 — docs/04 §무공 충돌. 차단이 아니라 경고+대가의 기준. docs/26 §5-3.
//  'ma'       : 마공 학습 자체가 위험(인격 변질·흑화).
//  'opposing' : 이미 익힌 무공과 정 ↔ 사·마 로 결이 어긋남(심법 충돌·주화입마).
//  'none'     : 무난.
export type ArtConflictKind = 'none' | 'opposing' | 'ma';

function pathsOppose(a: MartialPath, b: MartialPath): boolean {
  return (
    (a === 'jeong' && (b === 'sa' || b === 'ma')) ||
    ((a === 'sa' || a === 'ma') && b === 'jeong')
  );
}

export function evaluateArtConflict(disciple: Disciple, newArt: MartialArt): ArtConflictKind {
  if (newArt.path === 'ma') return 'ma';
  const opposing = disciple.martialArts.some((inst) => {
    const a = findMartialArt(inst.artId);
    return a ? pathsOppose(a.path, newArt.path) : false;
  });
  return opposing ? 'opposing' : 'none';
}

// ─── 무공 숙련도 — 성(成) 1~10 · 경험치. docs/26_무공_숙련도.md ───────────────

// 성 → 명칭 밴드. 입문 1~3 / 소성 4~6 / 대성 7~9 / 극성 10.
export const STAGE_SEONG_BAND: Record<MartialStage, readonly [number, number]> = {
  introduction: [1, 3],
  small_completion: [4, 6],
  great_completion: [7, 9],
  ultimate: [10, 10],
};

export function seongToStage(seong: number): MartialStage {
  if (seong >= 10) return 'ultimate';
  if (seong >= 7) return 'great_completion';
  if (seong >= 4) return 'small_completion';
  return 'introduction';
}

// 별 등급별 도달 가능 최고 성 (숙련도 한계 — docs/04).
export function seongCap(grade: MartialArtGrade): number {
  switch (grade) {
    case 'novice':
      return 6;
    case 'apprentice':
      return 7;
    case 'master':
      return 9;
    case 'grandmaster':
    case 'legendary':
      return 10;
  }
}

// 현재 성 → 다음 성에 필요한 EXP. 성 높을수록 가팔라짐 ("보통" 페이스). docs/26.
// 1→2:140, 4→5:380, 9→10:780. 입문 base 10·하루 ~8.5 기준 1성 집중 ~2.3주.
export function expToNextSeong(seong: number): number {
  const s = Math.max(1, seong);
  return 140 + (s - 1) * 80;
}

// 밴드별 하루 base EXP (고밴드일수록 적립도 작음). docs/26.
export const EXP_BASE_BY_STAGE: Record<MartialStage, number> = {
  introduction: 10,
  small_completion: 7,
  great_completion: 4,
  ultimate: 2,
};
