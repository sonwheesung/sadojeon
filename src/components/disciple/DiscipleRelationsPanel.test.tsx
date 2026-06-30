// 화면 단위 — 제자 상세 「인연」 패널(DiscipleRelationsPanel). docs/33 §7 · docs/40 §2-1.
// 핵심: 무관(neutral) 숨김 · 비무관은 단계 라벨로 노출 · 이름 조회 안 되는 상대 제외 · 인연 없으면 안내.
// 갭: 관계는 이벤트·면담으로 쌓이기만 하고 볼 화면이 없던 것(테스터가 검증 불가) → 패널로 노출.
// ⚠️ RNTL v14: render async.
import { render } from '@testing-library/react-native';

import { DiscipleRelationsPanel } from './DiscipleRelationsPanel';
import { useDiscipleStore } from '@/stores/discipleStore';
import type { Disciple, RelationLevel } from '@/types';

function mk(id: string, name: string, relationships: Record<string, RelationLevel> = {}): Disciple {
  return { id, name, relationships } as unknown as Disciple;
}

beforeEach(() => {
  useDiscipleStore.setState({
    disciples: {
      a: mk('a', '장철'),
      b: mk('b', '윤소소'),
      c: mk('c', '진소화'),
      d: mk('d', '이청하'),
      e: mk('e', '백연'),
    },
  } as never);
});

describe('DiscipleRelationsPanel — 인연 노출', () => {
  it('비무관 관계는 단계 라벨로 노출, 무관(neutral)은 숨김', async () => {
    const subject = mk('a', '장철', { b: 'sworn', c: 'enemy', d: 'neutral', e: 'friend' });
    const { getByText, queryByText } = await render(<DiscipleRelationsPanel disciple={subject} />);
    expect(getByText('의형제')).toBeTruthy(); // 윤소소
    expect(getByText('친밀')).toBeTruthy(); // 백연
    expect(getByText('원수')).toBeTruthy(); // 진소화
    expect(getByText('윤소소')).toBeTruthy();
    // 무관(이청하)은 노출 안 함 + '무관' 라벨 자체 없음
    expect(queryByText('이청하')).toBeNull();
    expect(queryByText('무관')).toBeNull();
  });

  it('비무관 인연이 없으면 안내 문구', async () => {
    const subject = mk('a', '장철', { d: 'neutral' });
    const { getByText, queryByText } = await render(<DiscipleRelationsPanel disciple={subject} />);
    expect(getByText('아직 특별한 인연이 없다.')).toBeTruthy();
    expect(queryByText('이청하')).toBeNull();
  });

  it('이름이 조회 안 되는 상대(없는 id)는 제외', async () => {
    const subject = mk('a', '장철', { unknown: 'friend' });
    const { getByText } = await render(<DiscipleRelationsPanel disciple={subject} />);
    expect(getByText('아직 특별한 인연이 없다.')).toBeTruthy();
  });
});
