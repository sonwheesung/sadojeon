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
import { MARTIAL_ARTS } from './catalog';

export { MARTIAL_ARTS };



// 문파·계보 라벨 + 표시 순서. lineage 미지정 무공은 '기타'. (22계보 — catalog.ts)
export const LINEAGE_LABEL: Record<string, string> = {
  sect: '본문(무명산문)',
  hwasan: '화산파',
  mudang: '무당파',
  sorim: '소림사',
  gaebang: '개방',
  ami: '아미파',
  jeomchang: '점창파',
  gollyun: '곤륜파',
  jongnam: '종남파',
  cheongseong: '청성파',
  gongdong: '공동파',
  namgung: '남궁세가',
  dangga: '사천당가',
  paengga: '하북팽가',
  moyong: '모용세가',
  pyoguk: '표국',
  doga: '도가',
  uiga: '의가',
  salsu: '살수',
  sapa: '사파',
  magyo: '마교',
  legend: '전설·기연',
};

export const LINEAGE_ORDER: readonly string[] = [
  'sect',
  'hwasan', 'mudang', 'sorim', 'gaebang', 'ami', 'jeomchang', 'gollyun', 'jongnam', 'cheongseong', 'gongdong',
  'namgung', 'dangga', 'paengga', 'moyong',
  'pyoguk', 'doga', 'uiga',
  'salsu', 'sapa', 'magyo',
  'legend',
];

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

// 무공 학습 자격 — 경지 게이트 + 무공서 선행조건(스킬트리) + 마공 흑화 게이트. docs/26 §5-1 · docs/28 §5-2 · docs/04 §카테고리 4단계.
// 재능 게이트 폐기: 효율(상극이면 ×0.04)은 성장 속도로만 차등(학습은 막지 않음).
// (비급 보유 여부는 데이터 밖 — discipleStore.assignMainMartialArt 의 코덱스 가드가 막는다.)
export function canLearnArt(disciple: Disciple, art: MartialArt): boolean {
  if (realmIndex(disciple.realm) < realmIndex(artGradeLearnRealm(art.grade))) return false;
  if (art.minDarkness != null && disciple.darknessLevel < art.minDarkness) return false;
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
