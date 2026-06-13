import type {
  ArtPrerequisite,
  Disciple,
  MartialArt,
  MartialArtGrade,
  MartialPath,
  MartialStage,
  MartialTrait,
  WoundType,
} from '@/types';
import {
  REALM_LEARN_FLOOR,
  REALM_SEONG_CAP,
  artGradeLearnRealm,
  realmIndex,
} from '@/data/realm';
import { MARTIAL_ARTS } from './catalog';
import { ART_TRAIT_OVERRIDE } from './traitOverrides';

export { MARTIAL_ARTS };



// 문파·계보 라벨 + 표시 순서. lineage 미지정 무공은 '기타'. (22계보 — catalog.ts)
export const LINEAGE_LABEL: Record<string, string> = {
  common: '공용·기초',
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
  'common',
  'hwasan', 'mudang', 'sorim', 'gaebang', 'ami', 'jeomchang', 'gollyun', 'jongnam', 'cheongseong', 'gongdong',
  'namgung', 'dangga', 'paengga', 'moyong',
  'pyoguk', 'doga', 'uiga',
  'salsu', 'sapa', 'magyo',
  'legend',
];

export function artsByLineage(lineage: string): MartialArt[] {
  return MARTIAL_ARTS.filter((m) => (m.lineage ?? 'common') === lineage);
}

export function allLineageIds(): string[] {
  const seen = new Set<string>();
  for (const m of MARTIAL_ARTS) seen.add(m.lineage ?? 'common');
  return LINEAGE_ORDER.filter((l) => seen.has(l)).concat(
    [...seen].filter((l) => !LINEAGE_ORDER.includes(l)),
  );
}

export function findMartialArt(id: string): MartialArt | undefined {
  return MARTIAL_ARTS.find((m) => m.id === id);
}

// 무공 특성 기본값 — 무공서에 traits 가 명시 안 됐을 때 갈래·등급·노선으로 추정. docs/35 §3-B.
// 간판·캔온(네임드) 무공은 카탈로그에 traits 직접 지정(이 기본값을 덮는다). 창작 사다리 비급은 이 규칙으로.
//  · 광역(sweep): **단일이 기본**. 광역(검강·도강·장강이 면으로 터짐)은 고수의 경지 —
//    **절품+(grandmaster·legendary) 타격 무공(검·도·권·마)만**. 하품~상품은 단일(점). 네임드 광역은 직접 지정.
//  · 호신(guard): 외공(금강불괴류)·내공(호신강기) — 등급 무관 방어 받침.
//  · 쾌(swift): 보법.
//  · 중독(poison)은 기본값 없음 — 독은 갈래·노선이 아니라 **계보 특성**(당가·오독문)이라 오버라이드로만.
//    (사도=살수는 정밀 암살이지 독이 아니다. 옛 'hidden+사도=독' 규칙은 살수를 잘못 독칠 → 폐기.)
export function defaultArtTraits(art: Pick<MartialArt, 'school' | 'grade' | 'path'>): MartialTrait[] {
  const t: MartialTrait[] = [];
  const highGrade = art.grade === 'grandmaster' || art.grade === 'legendary';
  const striker = art.school === 'sword' || art.school === 'saber' || art.school === 'fist' || art.school === 'darkArts';
  if (highGrade && striker) t.push('sweep'); // 절품+ 검·도·권·마 = 검강/도강/장강 광역. 그 외(하품~상품)는 단일.
  if (art.school === 'external' || art.school === 'qigong') t.push('guard');
  if (art.school === 'lightness') t.push('swift');
  return t;
}

// 무공의 실효 특성 — 전수 오버라이드 맵 > 카탈로그 inline > 갈래·등급 기본값. 엔진 어댑터(fromDisciple)가 쓴다.
export function artTraits(art: MartialArt): MartialTrait[] {
  return ART_TRAIT_OVERRIDE[art.id] ?? art.traits ?? defaultArtTraits(art);
}

// ─── 체질(불침) — 한 속성 상처에 면역이 되는 몸. docs/35 §6-1c · 업적/칭호 docs/32 ──────
// 무협 캔온(웹검증 2026-06-13): 특정 무공을 *깊이*(대성 7성+) 닦으면 몸이 변해 그 속성이 안 통한다.
//   금강불괴=외공 극의로 도검불침 / 한서불침=양강 내공이 추위를 막음 / 화염불침=열양 내공 / 만독불침=독공의 정점.
// 막는 상처는 종류마다 하나뿐 — 금강불괴라도 독·불엔 당한다(5속성 균형). level 0 없음 / 1 부분 / 2 완전.
//   · 완전(2): 시그니처 무공 대성(7성)+ → 그 속성 완전 면역.
//   · 부분(1, 당가 천독불침 전용): 백독불침공 보유 또는 독공 소성(4성)+ → 일반 독 면역, 치명 극독(sev1)만 통함.
// 업적 발화 판정 지점: woundResistOf 가 0→1/2 로 오르는 순간(천독불침·금강불괴·한서불침·화염불침·만독불침).
//   업적 런타임 미구현 — UI 칭호(DiscipleStatusPanel "체질")로 노출, 보상 인프라는 후속.
const CONSTITUTION_SEONG = 7; // 대성 — 체질은 장기 수련으로 몸이 변하는 것(캔온)

// 시그니처 무공(대성 7성+) → 완전 면역 속성. 한 속성에 여럿이면 하나만 충족해도 된다.
const FULL_RESIST_ARTS: { artId: string; type: WoundType }[] = [
  { artId: 'dangga-cheondok-singong', type: 'poison' }, //  천독신공 → 만독불침
  { artId: 'geumgang-bulgoe', type: 'wound' }, //           금강불괴 → 금강불괴(외상)
  { artId: 'sunyang-mugeuk-gong', type: 'frost' }, //       순양무극공 → 한서불침(동상)
  { artId: 'paengga-yanggang-singong', type: 'frost' }, //  양강신공 → 한서불침(동상)
  { artId: 'jeomchang-yeolyang-singong', type: 'burn' }, // 열양신공 → 화염불침(화상)
];

// 제자가 익힌 무공으로부터 속성별 저항 단계(0/1/2). 만전·일반 NPC는 빈 맵(저항 0).
export function woundResistOf(insts: { artId: string; seong: number }[]): Partial<Record<WoundType, number>> {
  const seongOf = (id: string) => insts.find((i) => i.artId === id)?.seong ?? 0;
  const r: Partial<Record<WoundType, number>> = {};
  for (const { artId, type } of FULL_RESIST_ARTS) {
    if (seongOf(artId) >= CONSTITUTION_SEONG) r[type] = 2;
  }
  if ((r.poison ?? 0) < 2) {
    let bestPoisonSeong = 0;
    for (const inst of insts) {
      const art = findMartialArt(inst.artId);
      if (art && artTraits(art).includes('poison')) bestPoisonSeong = Math.max(bestPoisonSeong, inst.seong);
    }
    if (seongOf('dangga-baekdok-bulchim-gong') >= 1 || bestPoisonSeong >= 4) r.poison = 1;
  }
  return r;
}

// 이 저항 단계가 이 심도의 상처를 막는가. 완전(2)=전부, 부분(1)=일반(치명 sev1은 통함).
export function resistsWound(level: number | undefined, severity: number): boolean {
  if (!level) return false;
  if (level >= 2) return true;
  return severity >= 2;
}

// 칭호(체질) — 관찰 가능한 무공 성취. 완전 면역 우선, 중독만 부분(천독불침) 표기. UI·docs/32.
const CONSTITUTION_TITLE: Record<string, { full: string; partial?: string }> = {
  poison: { full: '만독불침', partial: '천독불침' },
  wound: { full: '금강불괴' },
  frost: { full: '한서불침' },
  burn: { full: '화염불침' },
};

export function constitutionTitles(insts: { artId: string; seong: number }[]): string[] {
  const r = woundResistOf(insts);
  const out: string[] = [];
  for (const [type, lv] of Object.entries(r)) {
    const t = CONSTITUTION_TITLE[type];
    if (!t || !lv) continue;
    out.push(lv >= 2 ? t.full : t.partial ?? t.full);
  }
  return out;
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

// 등급별 학습 속도 — "하품 비급은 금방 뗀다". 디딤돌(하·중품)은 빨리 익히고 다음 권으로,
// 상품 이상은 그대로(화경 경로 밸런스 불변). 카탈로그 640권 확장으로 "15년에 5~8권"이던
// 학습 권수를 끌어올리는 레버 (2026-06-11, docs/26 §학습 속도). 세 적립 경로(기초 수련·
// 의뢰 실전·대련)가 모두 이 배율을 곱한다 — 단일 출처. 🔧
export const GRADE_LEARN_MULT: Record<MartialArtGrade, number> = {
  novice: 2.2,
  apprentice: 1.6,
  master: 1.0,
  grandmaster: 1.0,
  legendary: 1.0,
};

// 밴드별 하루 base EXP. 고밴드도 적립이 너무 작으면 신품 무공서 7성(화경 게이트)에 평생 못 닿아
// 완화(docs/28 §5·project_realm_balance 화경 경로): 순수수련으로도 신품 무공서 대성(7성) 도달 가능.
export const EXP_BASE_BY_STAGE: Record<MartialStage, number> = {
  introduction: 10,
  small_completion: 9,
  great_completion: 8,
  ultimate: 6,
};
