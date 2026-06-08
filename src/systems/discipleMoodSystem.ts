// 제자 낌새("문하") — 사부가 제자를 바라보며 읽는 짧은 관찰 한 줄.
// 숨김 변수(스트레스·신뢰·흑화)는 숫자 대신 간접 풍경으로만 드러낸다 (feedback_hidden_game_state).
// 실제 상태(스탯·상황)에서 우선순위로 버킷을 고르고, 그 안에서 제자×날짜로 한 문장을 뽑는다.
// 같은 날엔 고정, 날이 바뀌면 달라진다(seed=totalDay). 그레이박스: 문장 풀은 추후 LLM/시나리오로 확장.
//
// 임계값은 실제 게임 스케일에 맞춤:
//   신뢰 0~100 (시작 30, 졸업 60) → 낮음<20 / 높음≥60
//   스트레스 0~100 (시작 0, 무공 +5·휴식 −10/일로 완만) → 다소≥35 / 높음≥60
//   체력 비율 5단계 (staminaLevelIndex)
//   흑화 0~4 / risk low·medium·high — 후반 변화 신호 (간접)

import { PLATEAU } from '@/data/constants';
import { expToNextSeong, findMartialArt, seongCap } from '@/data/martialArts';
import { staminaLevelIndex } from './staminaSystem';
import type { Disciple } from '@/types';

// 무공 진척 낌새 — 주력 무공 EXP 비율로 문턱/정체 판정 (DiscipleStatusPanel 과 동일 기준).
function artProgress(d: Disciple): 'doorstep' | 'plateau' | null {
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  if (!main) return null;
  const art = findMartialArt(main.artId);
  if (art && main.seong >= seongCap(art.grade)) return 'doorstep'; // 그 무공의 끝물
  const need = expToNextSeong(main.seong);
  const frac = need > 0 ? (main.exp / need) * 100 : 0;
  if (frac >= PLATEAU.SECOND_START) return 'doorstep'; // 다음 성이 코앞
  if (frac >= PLATEAU.FIRST_START) return 'plateau'; // 더딘 정체 구간
  return null;
}

// 상황 버킷 — 위에서부터 먼저 맞는 것 하나. 각 버킷은 문장 풀.
function pickBucket(d: Disciple, activeCommand?: string | null): string[] {
  // 1. 자리에 없거나 특수 상태 ---------------------------------------------
  if (activeCommand === 'healing' || d.status === 'injured') {
    return [
      '몸져 누워 치료받는 듯하다',
      '아직 자리보전 중이라 기척이 약하다',
      '상처를 다스리느라 수련은 손을 놓았다',
    ];
  }
  if (activeCommand === 'meditation' || d.status === 'meditating') {
    return [
      '폐관에 들어 바깥일에 관심이 없다',
      '깊은 사색에 잠겨 말이 없다',
      '홀로 무언가를 곱씹는 중인 듯하다',
    ];
  }
  if (d.status === 'questing') {
    return [
      '강호에 나가 있어 모습이 보이지 않는다',
      '먼 길을 떠나 소식만 기다릴 뿐이다',
    ];
  }

  // 2. 흑화 깊음 (숨김 → 강한 간접 신호, 후반) ------------------------------
  if (d.darknessLevel >= 2) {
    return [
      '눈빛이 탁하게 가라앉아 어딘가 섬뜩하다',
      '사부를 보는 눈에 날 선 기운이 어린다',
      '기세가 어둡게 뒤틀려 가는 듯하다',
    ];
  }

  // 2-1. 심마 깊음 (숨김 → 불안정 신호. 주화입마 발작 직전 경고) -------------
  if ((d.simma ?? 0) >= 55) {
    return [
      '기혈이 들끓는지 안색이 자주 변한다',
      '운기 중 진기가 흔들리는 듯 호흡이 고르지 못하다',
      '무언가에 쫓기듯 마음을 가라앉히지 못한다',
    ];
  }

  const sIdx = staminaLevelIndex(d.stamina, d.maxStamina); // 0~4

  // 3. 체력 바닥 ------------------------------------------------------------
  if (sIdx <= 0) {
    return [
      '당장이라도 쓰러질 듯 위태롭다',
      '핏기 없는 얼굴로 간신히 버티고 있다',
      '한 걸음조차 무거워 보일 만큼 지쳤다',
    ];
  }
  // 4. 체력 낮음 ------------------------------------------------------------
  if (sIdx === 1) {
    return [
      '눈에 띄게 지쳐 기운이 없어 보인다',
      '어깨가 축 처져 피로가 짙다',
      '연신 하품을 삼키며 힘겨워한다',
    ];
  }

  // 5. 스트레스 높음 (숨김 → 간접) ------------------------------------------
  if (d.stress >= 60) {
    return [
      '표정이 굳어 마음이 무거워 보인다',
      '사소한 일에도 날이 서 있는 듯하다',
      '한숨이 잦고 어딘가 어지러워 보인다',
    ];
  }

  // 6. 흑화 기미 (숨김 → 옅은 간접) -----------------------------------------
  if (d.darknessLevel >= 1 || d.darknessRisk === 'high') {
    return [
      '눈빛에 서늘한 그늘이 얼핏 스친다',
      '부쩍 말수가 줄고 표정이 어둡다',
    ];
  }

  // 7. 신뢰 낮음 (숨김 → 간접) ----------------------------------------------
  if (d.trustToMaster < 20) {
    return [
      '사부를 향한 눈빛이 어딘가 식어 있다',
      '사부의 말에 시큰둥한 기색이다',
      '거리를 두려는 듯 데면데면하다',
    ];
  }

  // 8. 무공 문턱 — 곧 한 고비 ----------------------------------------------
  const art = artProgress(d);
  if (art === 'doorstep') {
    return [
      '무언가 잡힐 듯 수련에 골몰해 있다',
      '깨달음이 코앞인 듯 눈빛이 깊다',
      '한 고비를 넘기 직전인 기색이다',
    ];
  }
  // 9. 무공 정체 — 더디다 ---------------------------------------------------
  if (art === 'plateau') {
    return [
      '수련이 벽에 부딪힌 듯 답답해한다',
      '제자리걸음에 초조해 보인다',
      '진척이 더뎌 한숨을 쉰다',
    ];
  }

  // 10. 스트레스 다소 (숨김 → 간접) -----------------------------------------
  if (d.stress >= 35) {
    return [
      '어딘가 마음이 편치 않아 보인다',
      '생각이 많은 듯 표정이 복잡하다',
    ];
  }

  // 11. 신뢰 높음 (졸업급 유대) ---------------------------------------------
  if (d.trustToMaster >= 60) {
    return [
      '사부를 깊이 믿고 따르는 눈치다',
      '사부의 말 한마디에 눈을 반짝인다',
      '가르침을 더 받고 싶어 곁을 맴돈다',
    ];
  }

  // 12. 컨디션 좋고 스트레스 낮음 → 의욕 ------------------------------------
  if (d.stress <= 20 && sIdx >= 3) {
    return [
      '훈련에 의욕이 올라 있는 듯하다',
      '몸이 가벼운지 손이 근질거리는 기색이다',
      '오늘따라 눈에 생기가 돈다',
    ];
  }

  // 13. 기본 — 평온/무던 ----------------------------------------------------
  return [
    '딱히 별생각 없이 하루를 보낸다',
    '평온한 낯으로 일과를 따른다',
    '특별할 것 없이 묵묵하다',
  ];
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// activeCommand: 그 제자에게 걸린 임시 명령(치료·폐관 등). seed: 보통 totalDay (날마다 변주).
export function discipleMoodLine(d: Disciple, activeCommand?: string | null, seed = 0): string {
  const pool = pickBucket(d, activeCommand);
  const idx = (hashId(d.id) + seed) % pool.length;
  return pool[idx];
}
