// 경지(境地) 시스템 — docs/23_경지_시스템.md.
// 제자 1명의 무(武) 격. 경지 = 내공 + 주력무공 성 + 깨달음 (docs/23 §4).
// 현경(玄境)은 양육 불가(강호 자율 성장 영역)라 경지 사다리에서 제외.

export type Realm =
  | 'none' // 미입문
  | 'samryu' // 삼류
  | 'iryu' // 이류
  | 'ilryu' // 일류
  | 'jeoljeong' // 절정
  | 'chojeoljeong' // 초절정
  | 'hwagyeong'; // 화경 (양육 천장)

export const REALM_ORDER: readonly Realm[] = [
  'none',
  'samryu',
  'iryu',
  'ilryu',
  'jeoljeong',
  'chojeoljeong',
  'hwagyeong',
] as const;

export const REALM_LABEL: Record<Realm, string> = {
  none: '미입문',
  samryu: '삼류',
  iryu: '이류',
  ilryu: '일류',
  jeoljeong: '절정',
  chojeoljeong: '초절정',
  hwagyeong: '화경',
};

export const REALM_HANJA: Record<Realm, string> = {
  none: '未',
  samryu: '三流',
  iryu: '二流',
  ilryu: '一流',
  jeoljeong: '絕頂',
  chojeoljeong: '超絕頂',
  hwagyeong: '化境',
};

// 경지 진척 — 내공(심법, 누적·이월·불감소) 막대 하나. docs/23 · docs/26.
// 무공 축은 별도 막대가 아니라 "주력 무공 성(seong)" 이 직접 게이트 (project_realm_seong_design).
export interface RealmProgress {
  internal: number; // 내공 막대 (누적 절대값)
  pity: number; // 현 벽에서 깨달음 실패 누적 (RNG 완충 — 쌓일수록 확률↑, 보장치 도달 시 성공)
  petitioned: boolean; // 현 벽 폐관 청원 이미 발행 (once per 벽)
}
