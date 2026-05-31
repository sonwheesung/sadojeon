import { LoginScreen } from '@/components/auth/LoginScreen';

// 로그인/회원가입 라우트 — 미인증 시 RootLayout 이 여기로 redirect.
export default function LoginRoute() {
  return <LoginScreen />;
}
