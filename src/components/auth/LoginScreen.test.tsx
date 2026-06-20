// 화면 단위 — 로그인/가입 화면의 **상호작용·입력 검증** 본보기(docs/40 §2).
// "버튼 하나하나·입력 하나하나" 테스트: 빈/짧은/규칙위반 입력 → 제출 차단, 유효 → 요청 호출,
// 비번 불일치·중복확인·busy·서버 에러 분기. 스토어/supabase는 mock(화면 단위 격리).
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 됨 → userEvent 사용.
import { render, userEvent, waitFor } from '@testing-library/react-native';

import { LoginScreen } from './LoginScreen';
import { useAuthStore } from '@/stores/authStore';

jest.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true }));
jest.mock('@/stores/authStore');

const signIn = jest.fn();
const signUp = jest.fn();
const checkUsername = jest.fn();
const clearError = jest.fn();
let state: {
  busy: boolean;
  error: string | null;
  signIn: jest.Mock;
  signUp: jest.Mock;
  checkUsername: jest.Mock;
  clearError: jest.Mock;
};

beforeEach(() => {
  [signIn, signUp, checkUsername, clearError].forEach((m) => m.mockReset());
  state = { busy: false, error: null, signIn, signUp, checkUsername, clearError };
  (useAuthStore as unknown as jest.Mock).mockImplementation((sel: (s: typeof state) => unknown) => sel(state));
});

describe('LoginScreen — 입력 검증 (로그인)', () => {
  it('빈 입력 → 누르면 signIn 미호출(제출 차단)', async () => {
    const user = userEvent.setup();
    const { getByText } = await render(<LoginScreen />);
    await user.press(getByText('로그인 ▶'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('아이디 1자(2자 미만) → 제출 차단', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.type(getByPlaceholderText('아이디'), 'a');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.press(getByText('로그인 ▶'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('비밀번호 5자(6자 미만) → 제출 차단', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.type(getByPlaceholderText('6자 이상'), '12345');
    await user.press(getByText('로그인 ▶'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('공백뿐인 아이디(trim 후 2자 미만) → 제출 차단', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.type(getByPlaceholderText('아이디'), '   ');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.press(getByText('로그인 ▶'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('유효 입력(아이디 2자↑·비번 6자↑) → signIn(id, pw) 호출', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.press(getByText('로그인 ▶'));
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith('kim', 'secret6');
  });

  it('busy=true → 버튼 "처리 중…" + 제출 차단', async () => {
    state.busy = true;
    const user = userEvent.setup();
    const { getByText } = await render(<LoginScreen />);
    expect(getByText('처리 중…')).toBeTruthy();
    await user.press(getByText('처리 중…'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('서버 에러(authStore.error) → 에러 문구 표시', async () => {
    state.error = '아이디 또는 비밀번호가 틀렸습니다.';
    const { getByText } = await render(<LoginScreen />);
    expect(getByText('아이디 또는 비밀번호가 틀렸습니다.')).toBeTruthy();
  });
});

describe('LoginScreen — 가입 모드', () => {
  it('가입 탭 전환 → 비밀번호 재확인 필드 등장', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    expect(getByPlaceholderText('비밀번호 다시 입력')).toBeTruthy();
  });

  it('비밀번호 불일치 → 경고 표시 + 가입 차단', async () => {
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.type(getByPlaceholderText('비밀번호 다시 입력'), 'secret7');
    expect(getByText('비밀번호가 일치하지 않습니다.')).toBeTruthy();
    await user.press(getByText('가입하기 ▶'));
    expect(signUp).not.toHaveBeenCalled();
  });

  it('일치하는 유효 입력 → signUp(id, pw) 호출', async () => {
    signUp.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.type(getByPlaceholderText('비밀번호 다시 입력'), 'secret6');
    await user.press(getByText('가입하기 ▶'));
    expect(signUp).toHaveBeenCalledWith('kim', 'secret6');
  });

  it('가입 성공 → 로그인 모드 전환 + 안내 문구', async () => {
    signUp.mockResolvedValue(true);
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.type(getByPlaceholderText('6자 이상'), 'secret6');
    await user.type(getByPlaceholderText('비밀번호 다시 입력'), 'secret6');
    await user.press(getByText('가입하기 ▶'));
    await waitFor(() => expect(getByText('가입이 완료됐습니다. 로그인해 주세요.')).toBeTruthy());
    expect(queryByPlaceholderText('비밀번호 다시 입력')).toBeNull();
  });
});

describe('LoginScreen — 중복확인(checkUsername)', () => {
  it('사용 가능 → "사용 가능한 아이디입니다."', async () => {
    checkUsername.mockResolvedValue(true);
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.press(getByText('중복확인'));
    await waitFor(() => expect(getByText('사용 가능한 아이디입니다.')).toBeTruthy());
    expect(checkUsername).toHaveBeenCalledWith('kim');
  });

  it('이미 사용 중 → "이미 사용 중인 아이디입니다."', async () => {
    checkUsername.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.press(getByText('중복확인'));
    await waitFor(() => expect(getByText('이미 사용 중인 아이디입니다.')).toBeTruthy());
  });

  it('조회 오류(null) → "확인 중 오류가 발생했습니다."', async () => {
    checkUsername.mockResolvedValue(null);
    const user = userEvent.setup();
    const { getByText, getByPlaceholderText } = await render(<LoginScreen />);
    await user.press(getByText('가입'));
    await user.type(getByPlaceholderText('아이디'), 'kim');
    await user.press(getByText('중복확인'));
    await waitFor(() => expect(getByText('확인 중 오류가 발생했습니다.')).toBeTruthy());
  });
});
