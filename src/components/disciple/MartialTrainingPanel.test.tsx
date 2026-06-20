// 화면 단위 — 제자 상세 무공 수련 패널(MartialTrainingPanel)의 액션 버튼·요청·확인창 게이트 (docs/40 §2-1).
// 핵심: "무공서 고르기" 토글 → 사문 비급 목록, 전수 가능 행 선택 → 확인창 → 확정 시 assignMainMartialArt(id, artId) 1회,
//       취소 시 미호출. 마공/상극은 danger 톤 경고, 미연구/재능부족/주력 행은 비활성(요청 미발생). "계보 ▶" → /martial-codex 라우팅.
// 격리: @/data/martialArts(게이트 로직)·@/data/realm·@/data/labels·codexStore·discipleStore·useConfirm·expo-router 는 mock.
//   타입 라벨 맵(MARTIAL_*_LABEL·REALM_LABEL)은 순수 상수라 실제 유지.
// ⚠️ RNTL v14: render·userEvent 모두 async. fireEvent 는 React19서 상태 flush 안 함 → userEvent 사용.
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { MartialTrainingPanel } from './MartialTrainingPanel';
import {
  canLearnArt,
  evaluateArtConflict,
  findMartialArt,
  talentMet,
  unmetPrerequisites,
} from '@/data/martialArts';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple } from '@/types';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/components/common/SectionLabel', () => {
  const { Text } = require('react-native');
  return { SectionLabel: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text> };
});

// useConfirm — 전수 확인창 확정/취소 제어.
const mockConfirm = jest.fn();
jest.mock('@/components/common/ConfirmDialog', () => ({
  useConfirm: () => mockConfirm,
}));

// 게이트 로직 함수는 mock — 패널의 행 활성/사유 분기를 테스트별로 제어(데이터 풀에 비의존).
jest.mock('@/data/martialArts', () => ({
  canLearnArt: jest.fn(),
  evaluateArtConflict: jest.fn(),
  findMartialArt: jest.fn(),
  seongCap: jest.fn(() => 10),
  seongToStage: jest.fn(() => 'introduction'),
  talentMet: jest.fn(() => true),
  unmetPrerequisites: jest.fn(() => []),
}));
jest.mock('@/data/realm', () => ({
  artGradeLearnRealm: jest.fn(() => 'samryu'),
  artGradeRealmCeiling: jest.fn(() => 'hwagyeong'),
  realmIndex: jest.fn(() => 5),
}));
jest.mock('@/data/labels', () => ({ starText: jest.fn(() => '★') }));

// 스토어 — assignMainMartialArt 호출 인자/횟수 단언, scrolls 주입.
jest.mock('@/stores/codexStore', () => ({ useCodexStore: jest.fn() }));
jest.mock('@/stores/discipleStore', () => ({ useDiscipleStore: jest.fn() }));

const push = router.push as jest.Mock;
const findMartialArtMock = findMartialArt as jest.Mock;
const canLearnArtMock = canLearnArt as jest.Mock;
const conflictMock = evaluateArtConflict as jest.Mock;
const talentMock = talentMet as jest.Mock;
const unmetMock = unmetPrerequisites as jest.Mock;

const assignMain = jest.fn();

// ── 픽스처 ──
const baseDisciple = (over: Partial<Disciple> = {}): Disciple =>
  ({
    id: 'd1',
    name: '유운',
    realm: 'ilryu',
    martialArts: [],
    mainMartialArtId: undefined,
    darknessLevel: 0,
    stats: {},
    relationships: {},
    efficiency: {},
    ...over,
  }) as unknown as Disciple;

const ART = {
  id: 'art-geom',
  name: '청운검법',
  path: 'sword',
  grade: 'master',
  school: 'sword',
};

let codexState: { scrolls: Array<{ artId: string; status: string }> };

function applyStores() {
  (useCodexStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: typeof codexState) => unknown) => sel(codexState),
  );
  (useDiscipleStore as unknown as jest.Mock).mockImplementation(
    (sel: (s: { assignMainMartialArt: jest.Mock }) => unknown) => sel({ assignMainMartialArt: assignMain }),
  );
}

beforeEach(() => {
  [mockConfirm, push, findMartialArtMock, canLearnArtMock, conflictMock, talentMock, unmetMock, assignMain].forEach(
    (m) => m.mockReset(),
  );
  // 기본: 비급은 연구 완료·전수 가능·충돌 없음·재능 있음·선행 충족.
  findMartialArtMock.mockReturnValue(ART);
  canLearnArtMock.mockReturnValue(true);
  conflictMock.mockReturnValue('none');
  talentMock.mockReturnValue(true);
  unmetMock.mockReturnValue([]);
  codexState = { scrolls: [{ artId: 'art-geom', status: 'complete' }] };
  applyStores();
});

describe('MartialTrainingPanel — 보유 무공·피커 토글', () => {
  it('익힌 무공 없음 → "아직 익힌 무공이 없다." + 피커는 닫힘', async () => {
    const { getByText, queryByText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    expect(getByText('아직 익힌 무공이 없다.')).toBeTruthy();
    expect(queryByText('사문 무공서 — 골라 주력으로 전수')).toBeNull();
  });

  it('"무공서 고르기" → 피커 열림(사문 비급 표시), 다시 누르면 닫힘', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText, queryByText } = await render(
      <MartialTrainingPanel disciple={baseDisciple()} />,
    );
    await user.press(getByLabelText('무공서 고르기'));
    expect(getByText('사문 무공서 — 골라 주력으로 전수')).toBeTruthy();
    expect(getByText('청운검법')).toBeTruthy();
    await user.press(getByLabelText('무공서 고르기'));
    await waitFor(() => expect(queryByText('사문 무공서 — 골라 주력으로 전수')).toBeNull());
  });

  it('사문 비급 없음 → "사문에 무공서가 없다."', async () => {
    codexState.scrolls = [];
    const user = userEvent.setup();
    const { getByLabelText, getByText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    await user.press(getByLabelText('무공서 고르기'));
    expect(getByText('사문에 무공서가 없다.')).toBeTruthy();
  });
});

describe('MartialTrainingPanel — 전수 요청(assignMainMartialArt)·확인창 게이트', () => {
  it('전수 가능 행 선택 → 확인창 확정 → assignMainMartialArt(discipleId, artId) 1회', async () => {
    mockConfirm.mockResolvedValue(true);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<MartialTrainingPanel disciple={baseDisciple({ id: 'd1' })} />);
    await user.press(getByLabelText('무공서 고르기'));
    await user.press(getByLabelText('청운검법 전수'));
    await waitFor(() => expect(assignMain).toHaveBeenCalledTimes(1));
    expect(assignMain).toHaveBeenCalledWith('d1', 'art-geom');
  });

  it('확인창 취소 → assignMainMartialArt 미호출(영구 변경 차단)', async () => {
    mockConfirm.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    await user.press(getByLabelText('무공서 고르기'));
    await user.press(getByLabelText('청운검법 전수'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(assignMain).not.toHaveBeenCalled();
  });

  it('마공(ma) → danger 톤 경고 메시지로 확인창 호출', async () => {
    conflictMock.mockReturnValue('ma');
    mockConfirm.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    await user.press(getByLabelText('무공서 고르기'));
    await user.press(getByLabelText('청운검법 전수'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(mockConfirm.mock.calls[0][0]).toMatchObject({ tone: 'danger' });
    expect(mockConfirm.mock.calls[0][0].message).toMatch(/마공/);
    expect(assignMain).not.toHaveBeenCalled();
  });

  it('상극(opposing) → danger 톤 + 주화입마 경고', async () => {
    conflictMock.mockReturnValue('opposing');
    mockConfirm.mockResolvedValue(false);
    const user = userEvent.setup();
    const { getByLabelText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    await user.press(getByLabelText('무공서 고르기'));
    await user.press(getByLabelText('청운검법 전수'));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(mockConfirm.mock.calls[0][0]).toMatchObject({ tone: 'danger' });
    expect(mockConfirm.mock.calls[0][0].message).toMatch(/주화입마/);
  });
});

describe('MartialTrainingPanel — 비활성 행(요청 미발생)', () => {
  it('미연구(status≠complete) → "연구 필요" 라벨 + 비활성 → 눌러도 확인창·요청 없음', async () => {
    codexState.scrolls = [{ artId: 'art-geom', status: 'identified' }];
    const user = userEvent.setup();
    const { getByLabelText, getByText } = await render(<MartialTrainingPanel disciple={baseDisciple()} />);
    await user.press(getByLabelText('무공서 고르기'));
    expect(getByText('연구 필요')).toBeTruthy();
    await user.press(getByLabelText('청운검법 전수'));
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(assignMain).not.toHaveBeenCalled();
  });

  it('이미 주력(mainMartialArtId == artId) → "주력" 라벨 + 비활성 → 요청 없음', async () => {
    const user = userEvent.setup();
    const d = baseDisciple({
      mainMartialArtId: 'art-geom',
      martialArts: [{ artId: 'art-geom', seong: 5 }] as Disciple['martialArts'],
    });
    const { getByLabelText, getAllByText } = await render(<MartialTrainingPanel disciple={d} />);
    await user.press(getByLabelText('무공서 고르기'));
    // "주력" 칩은 보유 목록 + 피커 행 양쪽 — 적어도 1곳 노출.
    expect(getAllByText('주력').length).toBeGreaterThanOrEqual(1);
    await user.press(getByLabelText('청운검법 전수'));
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(assignMain).not.toHaveBeenCalled();
  });
});

describe('MartialTrainingPanel — 라우팅', () => {
  it('"계보 ▶" → router.push("/martial-codex?discipleId=:id")', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = await render(<MartialTrainingPanel disciple={baseDisciple({ id: 'd1' })} />);
    await user.press(getByLabelText('무공 계보'));
    expect(push).toHaveBeenCalledWith('/martial-codex?discipleId=d1');
  });
});
