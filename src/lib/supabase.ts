import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 — 앱 전역 단일 인스턴스.
// 세션은 AsyncStorage 에 저장 + 자동 갱신 → 한 번 로그인하면 다음 실행부터 자동 로그인 유지.
// URL/anon key 는 .env 의 EXPO_PUBLIC_* 로 주입 (anon key 는 공개 키 — RLS 로 데이터 보호).

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 미설정 — .env 확인 후 앱 재시작',
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true, // 세션 영속 — 자동 로그인 유지
    detectSessionInUrl: false, // 네이티브 앱은 URL 세션 감지 불필요
  },
});

// 설정 여부 — 게이트/디버그에서 사용.
export const isSupabaseConfigured = Boolean(url && anonKey);
