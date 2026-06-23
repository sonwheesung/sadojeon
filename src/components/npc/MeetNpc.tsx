import { useEffect } from 'react';

import { meetNpcs } from '@/systems/npcEncounter';

// 네임드를 화면에 보여주는 곳에 끼우면 마운트 시 자동으로 도감 만남 처리(set-and-forget). docs/24.
//   <MeetNpc ids="cheonma" />            // 한 명
//   <MeetNpc ids={['sapa-geodu', ...]} /> // 여럿
// 렌더 출력은 없다(null) — "이 화면에 이 인물이 나온다 = 만났다"를 선언만 한다.

function toList(ids: string | readonly string[]): string[] {
  return typeof ids === 'string' ? [ids] : [...ids];
}

export function MeetNpc({ ids }: { ids: string | readonly string[] }): null {
  const key = toList(ids).join(',');
  useEffect(() => {
    meetNpcs(toList(ids));
    // key 로 멱등 — 같은 집합이면 재실행 X.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

// 컴포넌트 대신 훅으로 쓰고 싶을 때.
export function useMeetNpc(ids: string | readonly string[]): void {
  const key = toList(ids).join(',');
  useEffect(() => {
    meetNpcs(toList(ids));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
