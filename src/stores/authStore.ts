import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

// 아이디/비밀번호 인증 — Supabase 기본 인증은 이메일 기반이라
// 아이디를 내부적으로 합성 이메일(`아이디@shidao.app`)로 매핑한다.
// 사용자에겐 아이디·비밀번호만 노출. (확인 메일 없음 — Supabase 대시보드에서
// Auth → Email → "Confirm email" 끄기 필요. 안 끄면 가입 직후 세션이 안 생김.)
// 도메인은 정상 TLD 여야 함 — `.local` 등 예약 TLD 는 GoTrue 가 invalid 로 거부.
const EMAIL_DOMAIN = 'shidao.app';

export function idToEmail(id: string): string {
  return `${id.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

// 가입 진행 중 플래그 — 가입 직후 Supabase 가 자동 생성하는 세션을 즉시 해제하므로,
// 그 사이 onAuthStateChange 이벤트(SIGNED_IN→SIGNED_OUT)로 화면이 깜빡이지 않게 무시한다.
let signingUp = false;

export type AuthStatus = 'loading' | 'authed' | 'guest';

interface AuthStore {
  status: AuthStatus;
  session: Session | null;
  busy: boolean;
  error: string | null;

  init: () => Promise<void>;
  signIn: (id: string, password: string) => Promise<boolean>;
  signUp: (id: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  // 아이디 사용 가능 여부 — true=사용 가능, false=이미 사용 중, null=조회 실패.
  checkUsername: (id: string) => Promise<boolean | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'loading',
  session: null,
  busy: false,
  error: null,

  // 앱 시작 시 1회 — 저장된 세션 복원 + 이후 변화 구독 (자동 로그인 유지).
  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, status: data.session ? 'authed' : 'guest' });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (signingUp) return; // 가입 흐름 중 세션 변동 무시
      set({ session, status: session ? 'authed' : 'guest' });
    });
  },

  signIn: async (id, password) => {
    if (get().busy) return false;
    set({ busy: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({
      email: idToEmail(id),
      password,
    });
    if (error) {
      set({ busy: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      return false;
    }
    set({ busy: false });
    return true;
  },

  signUp: async (id, password) => {
    if (get().busy) return false;
    set({ busy: true, error: null });
    signingUp = true;
    const { error } = await supabase.auth.signUp({
      email: idToEmail(id),
      password,
    });
    if (error) {
      signingUp = false;
      const msg = error.message.includes('already registered')
        ? '이미 사용 중인 아이디입니다.'
        : '가입에 실패했습니다. 다시 시도해 주세요.';
      set({ busy: false, error: msg });
      return false;
    }
    // 가입 직후 자동 로그인 방지 — 자동 생성된 세션을 해제하고 로그인 화면 유지.
    await supabase.auth.signOut();
    signingUp = false;
    set({ busy: false, session: null, status: 'guest' });
    return true;
  },

  checkUsername: async (id) => {
    const { data, error } = await supabase.rpc('is_username_available', {
      p_username: id,
    });
    if (error) return null;
    return Boolean(data);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, status: 'guest' });
  },

  clearError: () => set({ error: null }),
}));
