// 무공서 카탈로그 — docs/04. 22계보 ~660권, 계보별 파일(catalog/<lineage>.ts)을 조립한다.
// 정책(2026-06-11 확장): 간판·정점 = 정통 캔온(통용화 기준 — 1작품 전유 배제),
//   사다리 중간 = 다리 비급(문파 결 일반명 창작). 문파당 30권 스킬트리.
// 규칙: ① 학습 게이트 = 비급 보유 + 경지(등급별) + 선행 트리(prerequisites) (+ 마공은 흑화 단계)
//       ② 능력치 게이트 없음 — 갈래 효율(특화~상극)이 속도로만 차단 ③ 습득 경로 = acquisition.
// 🔧 등급 분포·선행 성 요구는 그레이박스(시뮬 튜닝 대상).

import type { MartialArt } from '@/types';
import { COMMON_ARTS } from './catalog/common';
import { HWASAN_ARTS } from './catalog/hwasan';
import { MUDANG_ARTS } from './catalog/mudang';
import { SORIM_ARTS } from './catalog/sorim';
import { GAEBANG_ARTS } from './catalog/gaebang';
import { AMI_ARTS } from './catalog/ami';
import { JEOMCHANG_ARTS } from './catalog/jeomchang';
import { GOLLYUN_ARTS } from './catalog/gollyun';
import { JONGNAM_ARTS } from './catalog/jongnam';
import { CHEONGSEONG_ARTS } from './catalog/cheongseong';
import { GONGDONG_ARTS } from './catalog/gongdong';
import { NAMGUNG_ARTS } from './catalog/namgung';
import { DANGGA_ARTS } from './catalog/dangga';
import { PAENGGA_ARTS } from './catalog/paengga';
import { MOYONG_ARTS } from './catalog/moyong';
import { PYOGUK_ARTS } from './catalog/pyoguk';
import { DOGA_ARTS } from './catalog/doga';
import { UIGA_ARTS } from './catalog/uiga';
import { SALSU_ARTS } from './catalog/salsu';
import { SAPA_ARTS } from './catalog/sapa';
import { MAGYO_ARTS } from './catalog/magyo';
import { LEGEND_ARTS } from './catalog/legend';

// LINEAGE_ORDER(data/martialArts/index.ts)와 같은 순서로 조립.
export const MARTIAL_ARTS: MartialArt[] = [
  ...COMMON_ARTS,
  ...HWASAN_ARTS,
  ...MUDANG_ARTS,
  ...SORIM_ARTS,
  ...GAEBANG_ARTS,
  ...AMI_ARTS,
  ...JEOMCHANG_ARTS,
  ...GOLLYUN_ARTS,
  ...JONGNAM_ARTS,
  ...CHEONGSEONG_ARTS,
  ...GONGDONG_ARTS,
  ...NAMGUNG_ARTS,
  ...DANGGA_ARTS,
  ...PAENGGA_ARTS,
  ...MOYONG_ARTS,
  ...PYOGUK_ARTS,
  ...DOGA_ARTS,
  ...UIGA_ARTS,
  ...SALSU_ARTS,
  ...SAPA_ARTS,
  ...MAGYO_ARTS,
  ...LEGEND_ARTS,
];
