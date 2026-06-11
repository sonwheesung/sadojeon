// 개발 계정 게이트 — 특정 아이디로 로그인하면 일반 게임(사문 선택) 대신
// 시뮬레이션 실험실(app/simlab)로 들어간다. 일반 유저에겐 보이지 않는다.
// 아이디 추가는 DEV_ACCOUNT_IDS 에 한 줄 — 합성 이메일(`아이디@shidao.app`)의 아이디 부분.

import { useAuthStore } from '@/stores/authStore';

export const DEV_ACCOUNT_IDS: readonly string[] = ['simlab', 'simbot', 'dev'];

export function isDevAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const id = email.split('@')[0]?.toLowerCase();
  return !!id && DEV_ACCOUNT_IDS.includes(id);
}

// 현재 로그인 세션이 개발 계정인가 — 화면 게이트용 훅.
export function useDevAccess(): boolean {
  const session = useAuthStore((s) => s.session);
  return isDevAccount(session?.user?.email);
}
