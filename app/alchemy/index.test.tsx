// 화면 단위 — 연단실(app/alchemy) 의 **상호작용·이벤트** 본보기(docs/40 §2-1).
// 버튼 하나하나(건설·학습·연단·복용·판매·치료·안신단) → 확인창 확정 시 올바른 시스템 함수가
// 올바른 인자로 1회 호출 / 게이트(자금 부족·미가동·미학습·점유·재료부족·대상없음)면 호출 안 됨·비활성.
// 음수/0 수량 가드는 시스템 단위(scripts/sim/alchemy)에서 검증 — 화면엔 수량 입력이 없다(전부 1과 고정).
// ⚠️ RNTL v14 + React19: render·userEvent 모두 async. fireEvent 는 상태 flush 안 함 → userEvent 사용.
// 화면이 직접 부르는 시스템(@/systems/*)·스토어(@/stores/*)는 jest.mock 으로 격리(호출 인자·횟수만 단언).
import { render, userEvent, waitFor } from '@testing-library/react-native';

import { ConfirmProvider } from '@/components/common/ConfirmDialog';
import AlchemyScreen from './index';

import * as alchemy from '@/systems/alchemySystem';
import * as wounds from '@/systems/woundSystem';
import * as simma from '@/systems/simmaSystem';
import { useSectStore } from '@/stores/sectStore';
import { useItemStore } from '@/stores/itemStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useTimeStore } from '@/stores/timeStore';

// ── 무거운/네이티브 래퍼는 패스스루로 격리(화면 로직만 본다) ──
jest.mock('@/components/common/SafetyZone', () => ({ SafetyZone: ({ children }: any) => children }));
jest.mock('@/components/common/PaperCard', () => ({ PaperCard: ({ children }: any) => children }));
jest.mock('@/components/common/SectionLabel', () => {
  const { Text } = require('react-native');
  return { SectionLabel: ({ children }: any) => <Text>{children}</Text> };
});
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

// ── 화면이 직접 부르는 시스템 모듈(상수는 유지, 함수만 mock) ──
jest.mock('@/systems/alchemySystem', () => ({
  ALCHEMY_LAB_BUILD_COST: 3000,
  buildAlchemyLab: jest.fn(),
  canCraft: jest.fn(),
  consumeInternalElixir: jest.fn(),
  hasAlchemyLab: jest.fn(),
  hasLearned: jest.fn(),
  isLabOperational: jest.fn(),
  learnRecipe: jest.fn(),
  listActiveCrafts: jest.fn(),
  listMaterials: jest.fn(),
  sellElixir: jest.fn(),
  startCraft: jest.fn(),
}));
jest.mock('@/systems/woundSystem', () => ({
  healWound: jest.fn(),
  listWounded: jest.fn(),
  treatableElixirsFor: jest.fn(),
  woundLabel: jest.fn(),
  woundsOf: jest.fn(),
}));
jest.mock('@/systems/simmaSystem', () => ({
  consumeAnsinElixir: jest.fn(),
  hasAnsinElixir: jest.fn(),
  listUnstable: jest.fn(),
}));
// 스토어는 factory mock(실제 모듈 로드 차단 — persistStorage→AsyncStorage 네이티브 의존 회피).
jest.mock('@/stores/sectStore', () => ({ useSectStore: jest.fn() }));
jest.mock('@/stores/itemStore', () => ({ useItemStore: jest.fn() }));
jest.mock('@/stores/discipleStore', () => ({ useDiscipleStore: jest.fn() }));
jest.mock('@/stores/timeStore', () => ({ useTimeStore: jest.fn() }));

// 데이터는 실제(ELIXIR_RECIPES) 사용 — 레시피 이름/카테고리로 버튼을 찾는다.

const A = alchemy as jest.Mocked<typeof alchemy>;
const W = wounds as jest.Mocked<typeof wounds>;
const S = simma as jest.Mocked<typeof simma>;

// ── 스토어 셀렉터 상태 주입 ──
interface SectState { sect: { resources: number } | null }
interface ItemState { items: any[] }
interface DiscState { order: string[]; disciples: Record<string, any> }
interface TimeState { totalDay: number }

let sectState: SectState;
let itemState: ItemState;
let discState: DiscState;
let timeState: TimeState;

function makeDisciple(over: any = {}) {
  return {
    id: 'd1',
    name: '진소우',
    status: 'training',
    stats: { alchemy: { level: 40 } },
    realmProgress: { internal: 0 },
    ...over,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  // 기본: 연단실 없음·미가동·진행없음·재료없음·부상없음·불안정없음·미학습.
  A.hasAlchemyLab.mockReturnValue(false);
  A.isLabOperational.mockReturnValue(false);
  A.listActiveCrafts.mockReturnValue([]);
  A.listMaterials.mockReturnValue([]);
  A.hasLearned.mockReturnValue(false);
  A.canCraft.mockReturnValue(false);
  A.buildAlchemyLab.mockReturnValue(true);
  A.startCraft.mockReturnValue(true);
  A.consumeInternalElixir.mockReturnValue(true);
  W.listWounded.mockReturnValue([]);
  W.woundsOf.mockReturnValue([]);
  W.treatableElixirsFor.mockReturnValue([]);
  W.woundLabel.mockReturnValue('외상·치명상');
  W.healWound.mockReturnValue(true);
  S.listUnstable.mockReturnValue([]);
  S.hasAnsinElixir.mockReturnValue(false);
  S.consumeAnsinElixir.mockReturnValue(true);

  sectState = { sect: { resources: 5000 } };
  itemState = { items: [] };
  discState = { order: [], disciples: {} };
  timeState = { totalDay: 100 };

  (useSectStore as unknown as jest.Mock).mockImplementation((sel: any) => sel(sectState));
  (useItemStore as unknown as jest.Mock).mockImplementation((sel: any) => sel(itemState));
  (useDiscipleStore as unknown as jest.Mock).mockImplementation((sel: any) => sel(discState));
  (useTimeStore as unknown as jest.Mock).mockImplementation((sel: any) => sel(timeState));
});

function renderScreen() {
  return render(
    <ConfirmProvider>
      <AlchemyScreen />
    </ConfirmProvider>,
  );
}

// 확인창 확정(▶ 버튼)을 누른다 — useConfirm 의 Promise resolve(true).
async function confirmDialog(user: ReturnType<typeof userEvent.setup>, getByText: any, label: string) {
  await waitFor(() => expect(getByText(`${label} ▶`)).toBeTruthy());
  await user.press(getByText(`${label} ▶`));
}

// ─────────────────────────────────────────────────────────────────────────────
describe('연단실 건설 (onBuild → buildAlchemyLab)', () => {
  it('연단실 없음 + 자금 충분 → 건설 확정 시 buildAlchemyLab 1회 호출', async () => {
    sectState = { sect: { resources: 5000 } }; // ≥ 3000
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText(/건설 \(/));
    await confirmDialog(user, getByText, '건설');
    expect(A.buildAlchemyLab).toHaveBeenCalledTimes(1);
  });

  it('자금 부족(<3000) → 건설 버튼 비활성·확인창 안 뜸·buildAlchemyLab 미호출', async () => {
    sectState = { sect: { resources: 2999 } };
    const user = userEvent.setup();
    const { getByText, queryByText } = await renderScreen();
    await user.press(getByText(/건설 \(/));
    expect(queryByText('건설 ▶')).toBeNull(); // 확인창 자체가 안 뜬다(early return)
    expect(A.buildAlchemyLab).not.toHaveBeenCalled();
  });

  it('건설 확인창에서 취소 → buildAlchemyLab 미호출', async () => {
    sectState = { sect: { resources: 5000 } };
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText(/건설 \(/));
    await waitFor(() => expect(getByText('취소')).toBeTruthy());
    await user.press(getByText('취소'));
    expect(A.buildAlchemyLab).not.toHaveBeenCalled();
  });

  it('이미 연단실 있음 → 건설 버튼 없음, 가동 상태 문구 표시', async () => {
    A.hasAlchemyLab.mockReturnValue(true);
    A.isLabOperational.mockReturnValue(true);
    const { queryByText, getByText } = await renderScreen();
    expect(queryByText(/건설 \(/)).toBeNull();
    expect(getByText(/연단실 가동/)).toBeTruthy();
  });
});

describe('비급 학습 (onLearn → learnRecipe)', () => {
  it('미학습 레시피 → "학습" 버튼, 확정 시 learnRecipe(id) 1회 호출', async () => {
    A.hasLearned.mockReturnValue(false);
    const user = userEvent.setup();
    const { getAllByText, getByText } = await renderScreen();
    // 미학습이면 모든 레시피에 학습 버튼이 뜬다 — 첫 번째(벽곡단 byeokgokdan).
    await user.press(getAllByText('학습')[0]);
    await confirmDialog(user, getByText, '학습');
    expect(A.learnRecipe).toHaveBeenCalledTimes(1);
    expect(A.learnRecipe).toHaveBeenCalledWith('byeokgokdan');
  });

  it('학습 취소 → learnRecipe 미호출', async () => {
    A.hasLearned.mockReturnValue(false);
    const user = userEvent.setup();
    const { getAllByText, getByText } = await renderScreen();
    await user.press(getAllByText('학습')[0]);
    await waitFor(() => expect(getByText('취소')).toBeTruthy());
    await user.press(getByText('취소'));
    expect(A.learnRecipe).not.toHaveBeenCalled();
  });
});

describe('제조 (onCraft → startCraft)', () => {
  it('학습됨 + 제조 가능한 제자 있음 → "연단" 확정 시 startCraft(discipleId, recipeId)', async () => {
    A.hasAlchemyLab.mockReturnValue(true); // craftable = built && canCraft
    A.isLabOperational.mockReturnValue(true);
    A.hasLearned.mockReturnValue(true);
    A.canCraft.mockReturnValue(true); // 아무 레시피나 제조 가능으로
    discState = { order: ['d1'], disciples: { d1: makeDisciple() } };
    const user = userEvent.setup();
    const { getAllByText, getByText } = await renderScreen();
    await user.press(getAllByText('연단')[0]);
    await confirmDialog(user, getByText, '연단');
    expect(A.startCraft).toHaveBeenCalledTimes(1);
    expect(A.startCraft).toHaveBeenCalledWith('d1', 'byeokgokdan');
  });

  it('학습됐지만 제조 불가(canCraft=false) → 연단 버튼 비활성·startCraft 미호출', async () => {
    A.hasLearned.mockReturnValue(true);
    A.canCraft.mockReturnValue(false); // 재료부족·미가동·점유 등
    discState = { order: ['d1'], disciples: { d1: makeDisciple() } };
    const user = userEvent.setup();
    const { getAllByText } = await renderScreen();
    await user.press(getAllByText('연단')[0]); // 비활성 — onPress 막힘
    expect(A.startCraft).not.toHaveBeenCalled();
  });

  it('가용 제자 자체가 없음(idleAlchemists 빈) → 연단 눌러도 startCraft 미호출', async () => {
    A.hasLearned.mockReturnValue(true);
    A.canCraft.mockReturnValue(false);
    discState = { order: [], disciples: {} };
    const user = userEvent.setup();
    const { getAllByText } = await renderScreen();
    await user.press(getAllByText('연단')[0]);
    expect(A.startCraft).not.toHaveBeenCalled();
  });
});

describe('진행 중 연단 표시 (listActiveCrafts)', () => {
  it('진행 중 연단이 있으면 "연단 중" 섹션 + 제자·남은 일수 표시', async () => {
    A.listActiveCrafts.mockReturnValue([{ discipleId: 'd1', recipeId: 'ansin', until: 108 }]);
    discState = { order: ['d1'], disciples: { d1: makeDisciple() } };
    timeState = { totalDay: 100 };
    const { getByText } = await renderScreen();
    expect(getByText('연단 중')).toBeTruthy();
    expect(getByText(/진소우 — 안신단 \(남은 8일\)/)).toBeTruthy();
  });
});

describe('영단 판매 (onSell → sellElixir)', () => {
  it('보유 영단 → "판매" 확정 시 sellElixir(id, 1)', async () => {
    itemState = { items: [{ id: 'geumchang-5', category: 'elixir', name: '금창약', count: 3 }] };
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText('판매'));
    await confirmDialog(user, getByText, '판매');
    expect(A.sellElixir).toHaveBeenCalledTimes(1);
    expect(A.sellElixir).toHaveBeenCalledWith('geumchang-5', 1);
  });

  it('판매 취소 → sellElixir 미호출', async () => {
    itemState = { items: [{ id: 'geumchang-5', category: 'elixir', name: '금창약', count: 3 }] };
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText('판매'));
    await waitFor(() => expect(getByText('취소')).toBeTruthy());
    await user.press(getByText('취소'));
    expect(A.sellElixir).not.toHaveBeenCalled();
  });

  it('보유 영단 없음 → "만든 영단이 없습니다." + 판매 버튼 없음', async () => {
    itemState = { items: [] };
    const { getByText, queryByText } = await renderScreen();
    expect(getByText('만든 영단이 없습니다.')).toBeTruthy();
    expect(queryByText('판매')).toBeNull();
  });
});

describe('내공단 복용 (onConsume → consumeInternalElixir)', () => {
  it('내공단 보유 + 흡수 중 아닌 제자 있음 → "복용" 확정 시 consumeInternalElixir(targetId, id)', async () => {
    itemState = { items: [{ id: 'naegong-fire', category: 'elixir', name: '양화내단', count: 1 }] };
    discState = { order: ['d1'], disciples: { d1: makeDisciple({ elixirAbsorb: undefined }) } };
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText('복용'));
    await confirmDialog(user, getByText, '복용');
    expect(A.consumeInternalElixir).toHaveBeenCalledTimes(1);
    expect(A.consumeInternalElixir).toHaveBeenCalledWith('d1', 'naegong-fire');
  });

  it('치료(heal) 영단엔 복용 버튼 없음 — 내공단만 복용 가능', async () => {
    itemState = { items: [{ id: 'geumchang-5', category: 'elixir', name: '금창약', count: 1 }] };
    discState = { order: ['d1'], disciples: { d1: makeDisciple() } };
    const { getByText, queryByText } = await renderScreen();
    expect(getByText('판매')).toBeTruthy(); // 판매는 있고
    expect(queryByText('복용')).toBeNull(); // 복용은 없다(internal 아님)
  });

  it('복용할 제자가 없음(전원 흡수 중) → 복용 눌러도 consumeInternalElixir 미호출', async () => {
    itemState = { items: [{ id: 'naegong-fire', category: 'elixir', name: '양화내단', count: 1 }] };
    discState = {
      order: ['d1'],
      disciples: { d1: makeDisciple({ elixirAbsorb: { until: 200 } }) }, // 흡수 중
    };
    const user = userEvent.setup();
    const { getByText, queryByText } = await renderScreen();
    await user.press(getByText('복용'));
    expect(queryByText('복용 ▶')).toBeNull(); // 확인창 안 뜸(target 없어 early return)
    expect(A.consumeInternalElixir).not.toHaveBeenCalled();
  });
});

describe('상처 치료 (onTreat → healWound · onCalm → consumeAnsinElixir)', () => {
  it('속성 상처 + 매칭 영약 → 영약 버튼 확정 시 healWound(discipleId, recipeId)', async () => {
    const d = makeDisciple({ status: 'injured' });
    W.listWounded.mockReturnValue([d as any]);
    W.woundsOf.mockReturnValue([{ type: 'wound', severity: 1, daysRemaining: 10 } as any]);
    W.treatableElixirsFor.mockReturnValue([
      { id: 'saengsa-1', name: '생사인' } as any,
    ]);
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText('생사인')); // 치료 영약 버튼(= recipe.name)
    await confirmDialog(user, getByText, '치료');
    expect(W.healWound).toHaveBeenCalledTimes(1);
    expect(W.healWound).toHaveBeenCalledWith('d1', 'saengsa-1');
  });

  it('내상(inner) + 안신단 보유 → "안신단" 확정 시 consumeAnsinElixir(discipleId)', async () => {
    const d = makeDisciple({ status: 'injured' });
    W.listWounded.mockReturnValue([d as any]);
    W.woundsOf.mockReturnValue([{ type: 'inner', severity: 2, daysRemaining: 16 } as any]);
    S.hasAnsinElixir.mockReturnValue(true); // 안신단 있음
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    await user.press(getByText('안신단'));
    await confirmDialog(user, getByText, '복용');
    expect(S.consumeAnsinElixir).toHaveBeenCalledTimes(1);
    expect(S.consumeAnsinElixir).toHaveBeenCalledWith('d1');
  });

  it('내상인데 안신단 없음 → 치료 버튼 없음 + "맞는 영약 없음" 안내', async () => {
    const d = makeDisciple({ status: 'injured' });
    W.listWounded.mockReturnValue([d as any]);
    W.woundsOf.mockReturnValue([{ type: 'inner', severity: 2, daysRemaining: 16 } as any]);
    S.hasAnsinElixir.mockReturnValue(false);
    const { getByText, queryByText } = await renderScreen();
    expect(getByText(/맞는 영약 없음/)).toBeTruthy();
    expect(queryByText('안신단')).toBeNull();
    expect(S.consumeAnsinElixir).not.toHaveBeenCalled();
  });
});

describe('심신 안정(예방) — listUnstable (onCalm → consumeAnsinElixir)', () => {
  it('불안정 기색 + 안신단 보유 → "안신단" 확정 시 consumeAnsinElixir(discipleId)', async () => {
    S.listUnstable.mockReturnValue([makeDisciple() as any]);
    S.hasAnsinElixir.mockReturnValue(true);
    const user = userEvent.setup();
    const { getByText } = await renderScreen();
    expect(getByText('심신 안정 (예방)')).toBeTruthy();
    await user.press(getByText('안신단'));
    await confirmDialog(user, getByText, '복용');
    expect(S.consumeAnsinElixir).toHaveBeenCalledWith('d1');
  });

  it('불안정 기색 있으나 안신단 없음 → 진정 버튼 없음(제조 필요 안내)', async () => {
    S.listUnstable.mockReturnValue([makeDisciple() as any]);
    S.hasAnsinElixir.mockReturnValue(false);
    const { getByText, queryByText } = await renderScreen();
    expect(getByText(/안신단 없음/)).toBeTruthy();
    expect(queryByText('안신단')).toBeNull();
    expect(S.consumeAnsinElixir).not.toHaveBeenCalled();
  });
});

describe('숨은변수 비노출', () => {
  it('심마/내공 진척 등 내부 수치(%·게이지 숫자)를 라벨로 노출하지 않는다', async () => {
    S.listUnstable.mockReturnValue([makeDisciple() as any]);
    S.hasAnsinElixir.mockReturnValue(true);
    const { queryByText } = await renderScreen();
    // feedback_hidden_game_state: 불안정은 "기색"으로만, 심마 수치/퍼센트 직접 표시 금지.
    expect(queryByText(/\d+\s*%/)).toBeNull();
    expect(queryByText(/심마\s*\d/)).toBeNull();
  });
});
