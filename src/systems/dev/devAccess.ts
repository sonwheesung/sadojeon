// 개발/테스트 환경 게이트 — 개발·테스트 빌드에선 시뮬 실험실(app/simlab) 등 개발 화면을 보여주고,
// 프로덕션 빌드에선 일반 사용자 화면만 보여준다. 로그인 계정과 무관 — **빌드 환경**으로 결정.
// (2026-06-16: 종전 '특정 계정(simbot·dev 등) 게이트' → '환경 게이트'로 전환.)
//
// 판정 우선순위:
//  1) EXPO_PUBLIC_APP_ENV 가 명시돼 있으면 최우선 — 'production' 이면 숨김, 그 외(test·staging·development)는 노출.
//     Expo 는 EXPO_PUBLIC_* 를 빌드 시 번들에 인라인하므로, release/preview 빌드에서도 개발 화면을 켜고 싶을 때(테스트 환경) 사용.
//  2) 미설정이면 __DEV__ — Metro/dev client 구동 = 노출, 프로덕션 export/빌드 = 숨김.
//     (Expo 권고: NODE_ENV 로 환경 분기 금지 — `expo export` 가 NODE_ENV 를 항상 production 으로 강제. 그래서 안 쓴다.)

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV?.toLowerCase();

// 개발/테스트 환경인가 — 순수 함수(훅 아님). 화면 외 로직에서도 사용 가능.
export function isDevEnv(): boolean {
  if (APP_ENV) return APP_ENV !== 'production';
  return __DEV__;
}

// 화면 게이트용 — 개발/테스트 환경이면 개발 화면(시뮬 허브 등) 노출.
// 이름은 소비처 호환을 위해 유지(의미는 '계정'이 아니라 '환경'). 환경값은 빌드 시 고정이라 훅이지만 상수 반환.
export function useDevAccess(): boolean {
  return isDevEnv();
}
