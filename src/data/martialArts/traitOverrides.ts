// 무공 트레이트 전수(全數) 오버라이드 — docs/35 §3-B. 기본값(defaultArtTraits)이 그 무공의 캔온·성질을
// 못 잡는 경우만 여기서 id로 바로잡는다(전수 검토 결과). 적혀 있지 않은 무공 = 기본값이 정확함.
//   해석 순서: ART_TRAIT_OVERRIDE[id] ?? 카탈로그 inline art.traits ?? defaultArtTraits.
// 검토 원칙(설명·이름 기준):
//   광역(sweep)  = 검막·도강·장강·폭우처럼 "면(面)"으로 터지는 것. 절품+ 타격이라도 쾌검·점혈은 단일.
//   흡공(drain)  = 내공을 빨거나 녹이는 마공.            중독(poison) = 독·약독.
//   쾌(swift)    = 쾌검·쾌속·연격.                       파공(pierce) = 지력·관통·파초·점혈.
//   호신(guard)  = 외공·내공(기본값으로 대개 충족).
import type { MartialTrait } from '@/types';

export const ART_TRAIT_OVERRIDE: Record<string, MartialTrait[]> = {
  // ═══ 사천당가(dangga) — 독의 본산. 암기·장법·심법이 거의 다 독. 기본값(권·암기 jung=무독) 보정 ═══
  // 암기(독침·독표) — 폭우/화우 결만 광역, 나머지는 단일 독.
  'bipyo-sul': ['poison'],
  'dangga-bichim-sul': ['poison'],
  'dangga-chuhon-pyo': ['poison'],
  'cheonnyeo-sanhwa': ['sweep', 'poison'], // 천녀산화 — 흩뿌리는 독침(광역)
  'dangga-yeonhwan-pyo': ['poison'],
  'dangga-dokjillyeo-sul': ['poison'],
  'dangga-chwiu-chim': ['poison'],
  'dangga-nakhwa-pyo': ['poison'],
  'dangga-bihwangseok': ['poison'],
  // mancheon-hwawu(만천화우)는 카탈로그 inline(sweep·poison) — 유지
  'dangga-dokryong-pyo': ['poison'],
  'dangga-bihwa-sinchim': ['poison'],
  'pokwu-ihwa-chim': ['sweep', 'poison'], // 폭우이화침 — 폭우처럼 쏟아지는 독침(광역)
  'dangga-cheondok-hwawu': ['sweep', 'poison'], // 천독화우 — 꽃비 독(광역)
  'dangga-muhyeong-chim': ['poison', 'pierce'], // 무형침 — 보이지 않는 독침(단일·관통)
  // 독장(권) — 전부 독, 단일(만독수는 정점이나 광역 아닌 독장 → sweep 제거)
  'dangga-cheongdok-su': ['poison'],
  'doksa-jang': ['poison'],
  'dangga-chwidok-jang': ['poison'],
  'dangga-odok-jang': ['poison'],
  'dangga-bugol-jang': ['poison'],
  'dangga-mandok-su': ['poison'], // 만독수 — 절품 독장이나 광역 아님(독·단일)
  // 어독심결·호심기공·백독불침공·천독신공(내공)·암영보·무성보(보법)·용독술·해독비결(의가) = 기본값 정확(생략)
};
