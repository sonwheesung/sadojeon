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

  // ═══ 살수(salsu) — 암살 = 정밀 단일·은밀. 독은 약·침만, 검은 그림자 쾌검, 절품검도 광역 아님 ═══
  'salsu-monghan-yakbeop': ['poison'], // 몽한약법 — 잠드는 약
  'salsu-yau-bichim': ['poison'], //      야우비침 — 맞은 줄 모르는 독침
  'salsu-janyeong-sword': ['swift'], //   잔영검 — 쾌검
  'muyeong-geom': ['swift'], //           무영검 — 보였을 때 늦은 쾌검
  'salsu-danhon-sword': ['swift'], //     단혼검 — 한 호흡의 쾌검
  'salsu-muheun-sword': ['pierce', 'swift'], // 무흔검 — 절품 살수검(광역 아닌 정밀 단일·관통)
  'jeolmyeong-13-chim': ['pierce'], //    절명십삼침 — 절명혈 점혈(관통)
  // 비수·수전·표창·검(야행/무성)·보법(전부 swift 기본값)·도·심법 = 기본값 정확(생략)

  // ═══ 절품 검 중 "정밀 단일" — 검강 광역이 아니라 일격·섬광·찌르기. 기본값(절품 검=광역) 보정 ═══
  'hwasan-seoak-ilgeom': ['pierce'], //          서악일검 — 천 초식이 한 획으로(단 한 번의 관통 일격)
  'jeomchang-gwanil-sword': ['pierce', 'swift'], // 관일검 — 해를 꿰뚫는 점창 쾌검
  'sail-sword': ['pierce', 'swift'], //          사일검법 — 천하에서 가장 빠른 찌르기(관통·쾌)
  'namgung-cheonroe-ilseom-sword': ['pierce', 'swift'], // 천뢰일섬검 — 한 섬광으로 모이는 뇌전
  'moyong-hoecheon-seomyeong-sword': ['swift'], // 회천섬영검 — 빠름과 되돌림(섬영·쾌)
  'doga-muwi-sword': ['pierce'], //              무위검 — 막을 길 없다(관통, 광역 아닌 흐름)
  // 매화검·적하장천·만리청풍·만불조종·운룡승천·곤오신검·복마신검·현천무극·태극검·무극검·
  // 천하무극·삼락검·제왕검형·대천강검·혈하검법 = 검강·만방 광역(기본값 sweep 정확, 유지)

  // ═══ 쾌검 명가(점창·종남·모용) — 빠름이 곧 검. 단일·쾌속(상승은 관통 겸함) ═══
  'jeomchang-yuseong-sword': ['swift'], //  유성검 — 한 번 떨어지는 쾌검
  'jeomchang-ilseom-sword': ['pierce', 'swift'], // 일섬검 — 보면 이미 꿰뚫린 쾌검
  'jongnam-yuseong-sword': ['swift'], //    낙성검 — 별똥 쾌검
  'jongnam-cheonseong-sword': ['swift'], // 천성검 — 연달아 떨어지는 쾌검
  'moyong-chupung-sword': ['swift'], //     추풍검 — 바람 뒤쫓는 기초 쾌검
  'cheongseong-jukyeop-sword': ['swift'], // 죽엽검 — 잘고 빠른 검

  // ═══ 속성·광폭 — 무공 속성이 상처를 남긴다(화염→화상·빙한→동상). 광폭은 아군 오사 ═══
  // 곤륜(빙·설) — 빙공 검·권이 동상을 입힌다.
  'gollyun-bingha-sword': ['frost'], //   빙하검 — 만년 빙하의 검
  'gollyun-seolsan-geombeop': ['frost'], // 설산검법 — 설산의 한기
  'gollyun-seolsan-gwon': ['frost'], //   설산권 — 빙한 권
  // 마교 혈마공 — 피로 기를 기르는 막무가내 마공(광역+아군오사+흡공).
  'hyeolma-gong': ['sweep', 'wild', 'drain'],
};
