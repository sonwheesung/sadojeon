// Vercel 함수 전용 Supabase 관리자 클라이언트 — **service-role 키**(RLS 우회).
// 절대 클라(앱 번들)로 나가면 안 되는 키. Vercel 환경변수로만 주입.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정 (Vercel env)');
}

export const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 요청의 Bearer JWT(앱이 보낸 유저 세션 토큰) → 유저. 위조 불가(service-role 이 검증).
export async function userFromRequest(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
