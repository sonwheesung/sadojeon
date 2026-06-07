// 영약 데이터 — docs/04 영약 5등급 · docs/28 §5-1 화경 게이트.
// 현재 핵심 = 신품(神品) 영약 = 화경 깨달음 벽의 열쇠. 최고난도 의뢰 드랍(운) 또는 과금.
// (하품~절품은 후속 — 내공·외공 도약 보조용.)

import type { StoredItem } from '@/stores/itemStore';

// 화경의 열쇠 — 신품(5품) 영약. 보유 시에만 화경 깨달음 벽을 넘는다.
export const DIVINE_ELIXIR_ID = 'guzeon-daehwandan';

export function divineElixirItem(): StoredItem {
  return {
    id: DIVINE_ELIXIR_ID,
    category: 'elixir',
    name: '구전대환단',
    grade: 5, // 신품
    count: 1,
    effects: '화경의 벽을 넘게 하는 신품 영약. 깨달음의 마지막 열쇠 — 폐관 중 복용하면 화경에 든다.',
  };
}

// 신품 영약 의뢰 드랍 확률 — 극험(extreme) 의뢰 완수 시. <10%(운). 과금 시 가중(후속). docs/28 §5-1.
export const DIVINE_ELIXIR_DROP_RATE = 0.08;
