import type {
  ArtPrerequisite,
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
    lineage: 'sect',
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
    lineage: 'sect',
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
    lineage: 'sect',
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
    lineage: 'sect',
  },
  // ── 화산파 검 계보 (분기·합류 스킬트리 예시). docs/26 §5-4 ──
  {
    id: 'hwasan-gicho-sword',
    name: '화산기초검',
    hanjaName: '華山基礎劍',
    description: '화산 입문제자가 처음 잡는 검. 모든 화산 검의 뿌리.',
    school: 'sword',
    grade: 'novice',
    path: 'jeong',
    requirements: [{ axis: 'body', minimum: 1 }],
    preferredTalents: ['body', 'agility'],
    isSectArt: false,
    lineage: 'hwasan',
  },
  {
    id: 'yukhap-sword',
    name: '육합검',
    hanjaName: '六合劍',
    description: '천지사방을 하나로 베는 화산 중급 검. 여러 절기의 갈림목.',
    school: 'sword',
    grade: 'apprentice',
    path: 'jeong',
    requirements: [{ axis: 'body', minimum: 2 }],
    preferredTalents: ['body', 'agility'],
    isSectArt: false,
    lineage: 'hwasan',
    prerequisites: [{ artId: 'hwasan-gicho-sword', minSeong: 3 }],
  },
  {
    id: 'maehwa-sword',
    name: '매화검법',
    hanjaName: '梅花劍法',
    description: '매화가 흩날리듯 현란한 화산 검. 육합검에서 갈라진 한 길.',
    school: 'sword',
    grade: 'master',
    path: 'jeong',
    requirements: [{ axis: 'agility', minimum: 3 }],
    preferredTalents: ['agility', 'mind'],
    isSectArt: false,
    lineage: 'hwasan',
    prerequisites: [{ artId: 'yukhap-sword', minSeong: 5 }],
  },
  {
    id: 'jaha-sword',
    name: '자하검법',
    hanjaName: '紫霞劍法',
    description: '보랏빛 노을의 기운을 두른 화산 검. 육합검에서 갈라진 또 한 길.',
    school: 'sword',
    grade: 'master',
    path: 'jeong',
    requirements: [{ axis: 'qi', minimum: 3 }],
    preferredTalents: ['qi', 'mind'],
    isSectArt: false,
    lineage: 'hwasan',
    prerequisites: [{ artId: 'yukhap-sword', minSeong: 5 }],
  },
  {
    id: 'isipsa-maehwa-sword',
    name: '이십사수매화검',
    hanjaName: '二十四手梅花劍',
    description: '매화와 자하의 묘리를 한데 모은 화산 비전. 두 길이 다시 만나는 정점.',
    school: 'sword',
    grade: 'grandmaster',
    path: 'jeong',
    requirements: [{ axis: 'agility', minimum: 4 }],
    preferredTalents: ['agility', 'mind'],
    isSectArt: false,
    lineage: 'hwasan',
    prerequisites: [
      { artId: 'maehwa-sword', minSeong: 6 },
      { artId: 'jaha-sword', minSeong: 4 },
    ],
  },
  // ── 사파·마교 (사문 기본 외 — 의뢰·발견으로 입수). docs/04 §무공 색깔 ──
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
    lineage: 'sapa',
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
    lineage: 'magyo',
    // 스킬트리 — 사파 무공을 깊이(흑풍권 5성) 익힌 자라야 마공을 감당. docs/28 §5-2 천마신공류 게이트 예시.
    prerequisites: [{ artId: 'heukpung-fist', minSeong: 5 }],
  },
];

// 문파·계보 라벨 + 표시 순서. lineage 미지정 무공은 '기타'.
export const LINEAGE_LABEL: Record<string, string> = {
  sect: '본문(무명산문)',
  hwasan: '화산파',
  sapa: '사파',
  magyo: '마교',
};

export const LINEAGE_ORDER: readonly string[] = ['sect', 'hwasan', 'sapa', 'magyo'];

export function artsByLineage(lineage: string): MartialArt[] {
  return MARTIAL_ARTS.filter((m) => (m.lineage ?? 'sect') === lineage);
}

export function allLineageIds(): string[] {
  const seen = new Set<string>();
  for (const m of MARTIAL_ARTS) seen.add(m.lineage ?? 'sect');
  return LINEAGE_ORDER.filter((l) => seen.has(l)).concat(
    [...seen].filter((l) => !LINEAGE_ORDER.includes(l)),
  );
}

export function findMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find((m) => m.id === id);
}

// 미충족 선행 무공서 목록 — 스킬트리 게이트. 충족이면 빈 배열. docs/28 §5-2.
export function unmetPrerequisites(disciple: Disciple, art: MartialArt): ArtPrerequisite[] {
  if (!art.prerequisites?.length) return [];
  return art.prerequisites.filter((p) => {
    const inst = disciple.martialArts.find((a) => a.artId === p.artId);
    return !inst || inst.seong < p.minSeong;
  });
}

// 무공 학습 자격 — 경지 게이트 + 무공서 선행조건(스킬트리). docs/26 §5-1 · docs/28 §5-2.
// 재능 게이트 폐기: 효율(상극이면 ×0.04)은 성장 속도로만 차등(학습은 막지 않음).
export function canLearnArt(disciple: Disciple, art: MartialArt): boolean {
  if (realmIndex(disciple.realm) < realmIndex(artGradeLearnRealm(art.grade))) return false;
  return unmetPrerequisites(disciple, art).length === 0;
}

// 그 갈래에 재능(효율)이 있나 — 상극이면 false('어색함' 힌트용, 학습 자체는 막지 않음).
export function talentMet(disciple: Disciple, art: MartialArt): boolean {
  return disciple.efficiency?.[art.school] !== '상극';
}

const GRADE_RANK: Record<MartialArtGrade, number> = {
  novice: 0,
  apprentice: 1,
  master: 2,
  grandmaster: 3,
  legendary: 4,
};

// 제자가 **계보 트리에서 도달 가능한 최고 무공 등급** — 졸업 천장 판정용. docs/26 §5-4 · docs/28 §5-2.
// 보유 무공에서 선행조건(prerequisites) 그래프를 위로 따라가, 선행을 모두 갖출 수 있는 상위 무공까지
// 닿는다(경지·성은 성장으로 채워지므로 잠재 도달성만 본다). 졸업은 이 정점 천장에서만 허용 → 중간
// 무공 천장에서 하산해 정점 무공(예: 혈마공·이십사수매화검)에 못 닿는 일을 막는다.
export function reachableApexGrade(disciple: Disciple): MartialArtGrade {
  const reachable = new Set(disciple.martialArts.map((a) => a.artId));
  let changed = true;
  while (changed) {
    changed = false;
    for (const art of MARTIAL_ARTS) {
      if (reachable.has(art.id)) continue;
      const prereqs = art.prerequisites ?? [];
      if (prereqs.length > 0 && prereqs.every((p) => reachable.has(p.artId))) {
        reachable.add(art.id);
        changed = true;
      }
    }
  }
  let best: MartialArtGrade = 'novice';
  for (const id of reachable) {
    const g = findMartialArt(id)?.grade;
    if (g && GRADE_RANK[g] > GRADE_RANK[best]) best = g;
  }
  return best;
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

// 밴드별 하루 base EXP. 고밴드도 적립이 너무 작으면 신품 무공서 7성(화경 게이트)에 평생 못 닿아
// 완화(docs/28 §5·project_realm_balance 화경 경로): 순수수련으로도 신품 무공서 대성(7성) 도달 가능.
export const EXP_BASE_BY_STAGE: Record<MartialStage, number> = {
  introduction: 10,
  small_completion: 9,
  great_completion: 8,
  ultimate: 6,
};
