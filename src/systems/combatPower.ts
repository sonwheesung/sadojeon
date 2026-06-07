// 전투력(강함) — docs/27. 의뢰·대회·비무·졸업후 강호의 종합 판정 수치.
// 공식: 경지가중(realm) × Σ_k [ rankWeight_k × 등급계수(grade) × (성_k−1) ] × (1 − 상극패널티)
// 핵심: 깊이 > 넓이. 1성은 기여 ≈ 0, 익힌 무공 전체가 순위 감쇠로 합산(키트 빌딩, 수집 무효).

import { findMartialArt } from '@/data/martialArts';
import type { Disciple, MartialArtGrade, MartialPath } from '@/types';
import { type Realm, REALM_ORDER } from '@/types/realm';

// 경지가 모든 무공 위력의 받침(주 배수). 삼류~화경 단계별. (그레이박스)
const REALM_WEIGHT: Record<Realm, number> = {
  none: 0.4,
  samryu: 1.0,
  iryu: 1.5,
  ilryu: 2.2,
  jeoljeong: 3.2,
  chojeoljeong: 4.5,
  hwagyeong: 6.5,
};

// 무공서 등급계수 — 같은 성이라도 상승 비급이 묵직하다. (그레이박스)
const GRADE_COEF: Record<MartialArtGrade, number> = {
  novice: 1.0,
  apprentice: 1.4,
  master: 2.0,
  grandmaster: 2.8,
  legendary: 3.6,
};

// 기여 큰 순 정렬 후 감쇠 — 소수 정예(키트) 보상, 수집 무의미. docs/27 §2.
const RANK_WEIGHT = [1.0, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.07];

function pathsOppose(a: MartialPath, b: MartialPath): boolean {
  return (
    (a === 'jeong' && (b === 'sa' || b === 'ma')) ||
    ((a === 'sa' || a === 'ma') && b === 'jeong')
  );
}

// 정 ↔ 사·마 동시 보유 — 주화입마 리스크로 위력 감점. 0(없음)~0.2(심함).
function conflictPenalty(d: Disciple): number {
  const paths = d.martialArts
    .map((inst) => findMartialArt(inst.artId)?.path)
    .filter((p): p is MartialPath => p != null);
  const hasJeong = paths.includes('jeong');
  const dark = paths.filter((p) => p === 'sa' || p === 'ma').length;
  if (!hasJeong || dark === 0) return 0;
  void pathsOppose; // 의미 명세용(정↔사·마)
  return Math.min(0.2, 0.08 + dark * 0.04);
}

// 종합 전투력(0~ ). 무차원 점수 — 같은 또래·강호 상대와 *비교*용. docs/27 §5.
export function combatPower(d: Disciple): number {
  const contribs = d.martialArts
    .map((inst) => {
      const art = findMartialArt(inst.artId);
      if (!art) return 0;
      // (성−1) → 1성은 기여 ≈ 0, 깊이 익힐수록 묵직.
      return GRADE_COEF[art.grade] * Math.max(0, inst.seong - 1);
    })
    .filter((c) => c > 0)
    .sort((a, b) => b - a);

  let sum = 0;
  for (let i = 0; i < contribs.length; i += 1) {
    sum += contribs[i] * (RANK_WEIGHT[i] ?? 0.05);
  }
  const realm = REALM_WEIGHT[d.realm] ?? 1.0;
  const power = realm * sum * (1 - conflictPenalty(d));
  return Math.round(power * 10);
}

// 거친 강함 풍문 — 정밀 수치 대신 등급·강호 결로 노출(docs/27 §6).
// 경지를 받침으로 두고 전투력으로 한 단계 가감(같은 일류라도 손꼽히는지/평범한지).
const REALM_RUMOR: Record<Realm, string> = {
  none: '아직 무를 익히지 못한',
  samryu: '삼류',
  iryu: '이류',
  ilryu: '일류',
  jeoljeong: '절정',
  chojeoljeong: '초절정',
  hwagyeong: '화경',
};

export function combatRumor(d: Disciple): string {
  const base = REALM_RUMOR[d.realm] ?? '';
  if (d.realm === 'none' || d.martialArts.length === 0) return '아직 무위를 논할 수 없다';
  const p = combatPower(d);
  const ri = REALM_ORDER.indexOf(d.realm);
  // 같은 경지대 기대치 대비(거칠게) — 경지 인덱스가 받쳐주는 대략적 기대 전투력.
  const expected = Math.max(20, ri * ri * 18);
  if (p >= expected * 1.6) return `${base} 중에서도 손꼽힌다`;
  if (p >= expected * 1.1) return `${base}의 윗자리에 든다`;
  if (p >= expected * 0.6) return `여느 ${base}만 하다`;
  return `${base}이라 하나 아직 영글지 않았다`;
}
