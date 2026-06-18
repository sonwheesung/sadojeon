// 엔진 번들용 supabase 스텁 — 순수 엔진은 DB 에 접근하지 않는다(영속은 Vercel 핸들러 몫).
// runSync 가 import 하지만 서버 모드에선 자동저장 off → 실제 호출 없음. 빈 객체로 대체해
// 번들이 DB 클라를 만들지 않게(로드 시 supabaseUrl 검증 throw 회피 + 엔진/영속 책임 분리).
export const supabase = {} as unknown as Record<string, never>;
