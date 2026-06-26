// 캐릭터 필수 이벤트 아크 — 콘텐츠 풀 집결. docs/47·48.
// 연 1회/제자, 시기 5구간(입문 1~3·기초 4~6·무공 7~9·실전 10~12·정착 13~15). 캐릭터당 15개.
// 타입은 ./types, 캐릭터별 콘텐츠는 ./characters/<id>.ts. 발화·기록은 arcEventSystem·inboxResolve.
//
// 규약(작성 시 엄수): 경지 중립(§12)·동문 부재 안전(§10 E11)·숨은변수 직설 금지·delta 크게(±8~12).
// 흑화 창 없는 3인(jin-sohwa·baek-yeon·jang-cheol 본성)은 darkness 최소/미사용 — docs/48 교차 메모.

import type { ArcEvent } from './types';
import { JANG_CHEOL_ARC } from './characters/jang-cheol';
import { JIN_SOHWA_ARC } from './characters/jin-sohwa';
import { HAN_BARAM_ARC } from './characters/han-baram';
import { YUN_SOSO_ARC } from './characters/yun-soso';
import { GANG_MUYEOL_ARC } from './characters/gang-muyeol';
import { I_CHEONGHA_ARC } from './characters/i-cheongha';
import { DOKGO_YEON_ARC } from './characters/dokgo-yeon';
import { BAEK_YEON_ARC } from './characters/baek-yeon';
import { JIN_BAEKHO_ARC } from './characters/jin-baekho';
import { SA_CHEONHWA_ARC } from './characters/sa-cheonhwa';

export type { ArcEvent, ArcEventChoice } from './types';

export const ARC_EVENTS: readonly ArcEvent[] = [
  ...JANG_CHEOL_ARC,
  ...JIN_SOHWA_ARC,
  ...HAN_BARAM_ARC,
  ...YUN_SOSO_ARC,
  ...GANG_MUYEOL_ARC,
  ...I_CHEONGHA_ARC,
  ...DOKGO_YEON_ARC,
  ...BAEK_YEON_ARC,
  ...JIN_BAEKHO_ARC,
  ...SA_CHEONHWA_ARC,
];

const BY_KEY = new Map<string, ArcEvent>(
  ARC_EVENTS.map((e) => [`${e.discipleId}:${e.year}`, e]),
);

// 그 제자의 그 연차 필수 이벤트(없으면 undefined).
export function getArcEvent(discipleId: string, year: number): ArcEvent | undefined {
  return BY_KEY.get(`${discipleId}:${year}`);
}
