// 화면 단위 테스트 — 장비 후보 목록. 행 렌더 + 등급 별 + 장착 액션. docs/40 §2.
import { fireEvent, render } from '@testing-library/react-native';

import { EquipmentList, type EquipmentCandidate } from './EquipmentList';

const CANDIDATES: EquipmentCandidate[] = [
  { id: 'a', name: '청강검', grade: 2, effects: '공격 +5' },
  { id: 'b', name: '백옥부', grade: 4, effects: '방어 +8', equipped: true },
];

describe('EquipmentList (화면 단위)', () => {
  it('후보 행들을 이름·효과·등급별과 함께 렌더', async () => {
    const { getByText } = await render(<EquipmentList candidates={CANDIDATES} onEquip={() => {}} />);
    expect(getByText('청강검')).toBeTruthy();
    expect(getByText('공격 +5')).toBeTruthy();
    expect(getByText('★★☆☆☆')).toBeTruthy();
    expect(getByText('백옥부')).toBeTruthy();
    expect(getByText('★★★★☆')).toBeTruthy();
  });

  it('빈 후보면 행을 렌더하지 않는다(조건부 렌더)', async () => {
    const { queryByText } = await render(<EquipmentList candidates={[]} onEquip={() => {}} />);
    expect(queryByText('장착')).toBeNull();
  });

  it('장착 버튼을 누르면 onEquip 이 해당 id 로 호출된다', async () => {
    const onEquip = jest.fn();
    const { getByLabelText } = await render(
      <EquipmentList candidates={CANDIDATES} onEquip={onEquip} />,
    );
    fireEvent.press(getByLabelText('청강검 장착'));
    expect(onEquip).toHaveBeenCalledWith('a');
  });
});
