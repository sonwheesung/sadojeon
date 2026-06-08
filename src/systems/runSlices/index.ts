import { alchemySlice } from './alchemySlice';
import { inboxSlice } from './inboxSlice';
import { itemsSlice } from './itemsSlice';
import { jianghuSlice } from './jianghuSlice';
import { npcSlice } from './npcSlice';
import type { RunChildSlice } from './types';

// 회차별 자식 도메인 등록부.
// 새 도메인 추가 = 슬라이스 파일 1개 + 여기 배열에 한 줄. runSync 본문은 절대 안 건드림.
export const RUN_CHILD_SLICES: readonly RunChildSlice[] = [
  inboxSlice,
  jianghuSlice,
  alchemySlice,
  itemsSlice,
  npcSlice,
];

export type { RunChildSlice } from './types';
