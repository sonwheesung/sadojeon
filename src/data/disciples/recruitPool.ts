// 시작 선택 풀 — docs/15.
// 회차 시작 시 사용자가 이 풀에서 2~4명을 골라 거둔다. 회차 도중 영입 X.
// 무료 풀 6명. 결제 2명(진백호·사천화)은 IAP 해금(Phase 3, 미구현). 시작 8명 = 6 무료 + 결제 2.
// 강무열·독고연은 출시 후 무료 추가 — POST_LAUNCH_RECRUITS 에 보존(별등급 폐기로 "10명" 근거 소멸, docs/15).
// 거두지 않은 후보는 강호로 흩어져 [docs/08 졸업후_강호] NPC 로 재등장 가능.
//
// 파일 이름은 과거 영입 시스템 잔존. 다음 정리 시 startingSeedPool 로 개칭 예정.

import type { EfficiencyMap, PersonalityTraits } from '@/types';

// 시작 선택 화면 "유년 신상" — 전부 어릴 때 관찰 가능한 사실로만. docs/15.
// 숫자·효율 등급어(특화/상극)·노선명 직접 노출 금지(숨은 변수 룰). 대신:
//   likes = 잘하는 것(특화) 신호 / dislikes = 못하는 것 신호 / tell = 잘 열리는 길(정·사)을 어린 행실로 흘림.
// efficiency(로직 진실)와 모순 없게 손글씨. 각 캐릭터 docs/disciples/NN_*.md 캔온 기반.
export interface ChildhoodProfile {
  house: string; // 집안·출신
  family: string; // 가족 구성
  nature: string; // 어릴 적 성품
  upbringing: string; // 어떻게 자라왔나(어릴 때)
  likes: string; // 좋아하는 것 → 특화 신호
  dislikes: string; // 싫어하는/어려워하는 것 → 못하는 것 신호
  tell: string; // 어릴 적 행실 한 줄 → 노선 leaning
}

export interface RecruitCandidate {
  poolId: string;
  artId: string;
  // 영역 학습 효율 — docs/28 §7. 무공 갈래 + 비무공 영역별 특화~상극. 안 적은 키 = 보통.
  efficiency: EfficiencyMap;
  insight: number; // 오성 1~5 — 깨달음 확률
  personality: PersonalityTraits;
  // 시작 선택 화면 인물 카드의 한 줄 — 첫인상 풍경.
  storyLine: string;
  // 시작 선택 화면 펼침 — 유년 신상.
  childhood: ChildhoodProfile;
}

export const RECRUIT_POOL: readonly RecruitCandidate[] = [
  {
    poolId: 'jang-cheol',
    artId: 'baekun-fist',
    efficiency: { fist: '상성', staff: '상성', medical: '상극', darkArts: '상극', strength: '특화', guarding: '특화', medicine: '미숙', scouting: '상극', alchemy: '상극' },
    insight: 1, // 오성 ★ — docs/disciples/01_장철.md (깨달음 낮음, 고경지 벽에서 더딤)
    personality: { integrity: 60, freedom: 30, warmth: 55, prudence: 60, mercy: 60, ambition: 20 },
    storyLine: '농촌에서 자란 우직한 아이. 평범하나 손이 묵직하다.',
    childhood: {
      house: '무명산 아래 작은 농촌 마을, 농가의 둘째 아들',
      family: '부모와 형 하나 — 형은 농사를 잇는다',
      nature: '우직하고 진중하다. 옳다 믿는 것은 좀처럼 굽히지 않는다.',
      upbringing: '걷기 시작할 때부터 형과 밭일을 거들며 몸으로 자랐다.',
      likes: '힘쓰는 일, 무거운 것 나르기, 몸으로 부딪는 수련 — 손마디가 굵고 끈기가 있다',
      dislikes: '잔손이 가는 약 짓는 일, 몰래 숨고 엿보는 일',
      tell: '제 것이 아니면 손대지 않고, 약한 이가 맞는 걸 보면 앞을 막아선다.',
    },
  },
  {
    poolId: 'jin-sohwa',
    artId: 'cheongsim-gigong',
    efficiency: { medical: '특화', fist: '미숙', sword: '상극', staff: '상극', darkArts: '상극', medicine: '특화', alchemy: '특화', scouting: '미숙', strength: '상극', guarding: '상극' },
    insight: 3,
    personality: { integrity: 50, freedom: 40, warmth: 70, prudence: 70, mercy: 80, ambition: 20 },
    storyLine: '마을 약방 집안의 다정한 아이. 약초를 능숙히 다룬다.',
    childhood: {
      house: '무명산 아래 농촌, 마을 약방 집안의 셋째 딸',
      family: '부모와 언니 둘 — 언니들은 시집갔거나 가게 일을 돕는다',
      nature: '여덟 살답지 않게 침착하고 어른스럽다. 누가 아파하면 그냥 지나치질 못한다.',
      upbringing: '걸음마 떼면서부터 약방 마당에서 약초를 다듬으며 컸다.',
      likes: '약초 다듬고 환 짓기, 아픈 이 돌보기, 의서 읽기 — 손이 야무지고 곧잘 익힌다',
      dislikes: '칼·주먹 쓰는 거친 수련, 누굴 해치는 일 자체를 못 견딘다',
      tell: '길에 쓰러진 이를 보면 제 밥을 덜어준다. 모진 짓엔 손도 못 댄다.',
    },
  },
  {
    poolId: 'han-baram',
    artId: 'cheongpung-swordplay',
    efficiency: { lightness: '특화', darkArts: '특화', sword: '상성', staff: '상성', medical: '상극', scouting: '특화', knowledge: '미숙', formation: '미숙', medicine: '미숙', alchemy: '상극' },
    insight: 3,
    personality: { integrity: 50, freedom: 80, warmth: 60, prudence: 40, mercy: 50, ambition: 40 },
    storyLine: '산문 앞에 떠돌이 아이가 주저앉아 있었다. 갈 곳을 잊은 눈빛이었다.',
    childhood: {
      house: '출신 불명. 부모와 살던 마을은 기억이 흐릿한 떠돌이',
      family: '없음 — 부모는 어린 시절 전쟁으로 잃었다',
      nature: '눈빛이 빠르고 늘 주변을 살핀다. 거칠어 보여도 속은 따뜻함을 갈망한다.',
      upbringing: '일고여덟 살부터 혼자 길에서 먹고 자며 살아남았다.',
      likes: '숨어서 뒤 밟기, 지붕·담 타넘기, 작은 칼 놀리기 — 몸이 가볍고 눈치가 빠르다',
      dislikes: '가만히 앉아 글 읽기, 약 달이는 잔손 일',
      tell: '배고프면 남의 것에 손이 먼저 간다. 규율로 묶으면 답답해 달아난다.',
    },
  },
  {
    poolId: 'yun-soso',
    artId: 'unbo',
    efficiency: { sword: '특화', lightness: '상성', qigong: '상성', darkArts: '상극', medical: '미숙', knowledge: '특화', formation: '특화', guarding: '상성', scouting: '미숙', medicine: '미숙' },
    insight: 4,
    personality: { integrity: 80, freedom: 30, warmth: 50, prudence: 60, mercy: 60, ambition: 60 },
    storyLine:
      '한 양반가 노인이 손녀를 데려와 머리를 숙였다. "예법은 가르쳤으나, 칼은 가르치지 못했습니다."',
    childhood: {
      house: '강남의 작은 양반가(윤씨 가문), 막내딸',
      family: '부모와 오빠 둘, 언니 하나 — 막내로 귀히 자랐다',
      nature: '아홉 살답지 않게 야무지고 고집스럽다. 한 번 옳다 정하면 굽히지 않는다.',
      upbringing: '비단옷 입고 글과 예법을 배우며 곱게 자랐으나, 바느질보다 목검을 들었다.',
      likes: '글 읽고 병서 익히기, 곧은 검 휘두르기 — 머리가 영민하고 자세가 반듯하다',
      dislikes: '몰래 암기 던지는 잔재주, 약 달이는 일',
      tell: '불의를 보면 어른 앞에서도 따지고 든다. 비뚤어진 일에는 곁을 주지 않는다.',
    },
  },
  {
    poolId: 'i-cheongha',
    artId: 'unbo',
    efficiency: { sword: '특화', lightness: '특화', darkArts: '특화', staff: '상성', qigong: '상성', medical: '상극', scouting: '특화', guarding: '미숙', knowledge: '미숙', formation: '미숙', medicine: '상극', alchemy: '상극' },
    insight: 4,
    personality: { integrity: 30, freedom: 60, warmth: 25, prudence: 70, mercy: 15, ambition: 45 },
    storyLine:
      '산기슭에서 한 소녀가 쓰러져 있었다. 깨어났을 때, 자신의 이름조차 흐릿하다 했다.',
    childhood: {
      house: '출신 불명. 살수조직에서 빠져나온 아이',
      family: '없음 — 부모도 제 본명도 기억하지 못한다',
      nature: '말이 적고 늘 경계한다. 차가운 눈빛 안에 두려움이 어린다.',
      upbringing: '철들기 전부터 어둠 속에서 단검과 은신을 훈련받으며 자랐다.',
      likes: '소리 없이 숨고 뒤 밟기, 단검·암기 다루기 — 몸놀림이 빠르고 망설임이 없다',
      dislikes: '사람 가까이서 돌보는 일, 약 짓는 일',
      tell: '인기척에 손이 먼저 칼자루로 간다. 시키면 모진 일도 망설임 없이 해낸다.',
    },
  },
  {
    poolId: 'baek-yeon',
    artId: 'cheongsim-gigong',
    efficiency: { qigong: '특화', medical: '상성', staff: '미숙', fist: '미숙', darkArts: '상극', knowledge: '특화', formation: '특화', scouting: '상극', guarding: '상극' },
    insight: 4, // 오성 ★★★★ — docs/disciples/08_백연.md (깨달음 좋아 경지 잠재력 최상위권)
    personality: { integrity: 45, freedom: 55, warmth: 55, prudence: 80, mercy: 70, ambition: 10 },
    storyLine:
      '한 도인이 어린 딸을 산문 앞에 두고 떠났다. "저는 도를 가르쳤으나, 인간을 가르치지 못했습니다."',
    childhood: {
      house: '무명산 가까운 도사 마을의 선문(仙門) 출신',
      family: '도사인 아버지(생존)와 일찍 여읜 어머니 — 시작 제자 중 유일하게 가족이 있다',
      nature: '일곱 살답지 않게 고요하고 깊다. 욕심이 없고 평정하다.',
      upbringing: '산속 도관에서 아버지에게 도가 사상과 호흡을 배우며 자랐다.',
      likes: '가만히 앉아 호흡 고르기, 도가 경문 읽기 — 단전 자질이 비범하고 깨달음이 빠르다',
      dislikes: '거칠게 몸 부딪는 외공, 몰래 다니는 정탐 일',
      tell: '다툼을 보면 끼어들기보다 가만히 지켜본다. 욕심을 내지 않는다.',
    },
  },
] as const;

// 출시 후 무료 추가 — docs/15. 멸문 적대(독고연→강무열)·관계그룹C·진백호↔독고연 야망의 시드.
// 라이브 선택 풀(RECRUIT_POOL)에는 미포함이라 현재 회차엔 안 뜨고, 적대/페어 시드도 휴면 상태.
// 추가 시점에 이 두 객체를 RECRUIT_POOL 로 옮기면 STARTING_RIVALRIES/관계가 그대로 활성화된다.
export const POST_LAUNCH_RECRUITS: readonly RecruitCandidate[] = [
  {
    poolId: 'gang-muyeol',
    artId: 'baekun-fist',
    efficiency: { staff: '특화', fist: '상성', guarding: '상성' },
    insight: 3, // 오성 ★★★ — docs/disciples/05_강무열.md (학문 익힘, 평범)
    personality: { integrity: 60, freedom: 30, warmth: 45, prudence: 55, mercy: 45, ambition: 55 },
    storyLine:
      '지방 무관에서 한 청년을 보냈다. 이력서에 적히지 않은 사연이 묻어 있었다.',
    childhood: {
      house: '강북의 작은 무관 집안(강씨 무관), 셋째 아들',
      family: '부모와 형 둘 — 형들은 무관 직을 잇기 위해 단련 중',
      nature: '책임감이 깊고 진지하다. 가문의 이름을 늘 의식한다.',
      upbringing: '무관 마당에서 형들 틈에 끼어 어려서부터 봉과 주먹을 익혔다.',
      likes: '봉 휘두르기, 맞붙어 겨루기, 동료 지키기 — 균형 잡히고 끈기가 있다',
      dislikes: '몰래 다니는 정탐 일, 약 짓는 잔손 일',
      tell: '규율을 잘 따르고 약속을 어기지 않는다. 그른 무리와는 어울리려 하지 않는다.',
    },
  },
  {
    poolId: 'dokgo-yeon',
    artId: 'cheongpung-swordplay',
    efficiency: { sword: '특화', qigong: '상성', knowledge: '상성' },
    insight: 5, // 오성 ★★★★★ — docs/disciples/07_독고연.md (천재형 통찰)
    personality: { integrity: 55, freedom: 40, warmth: 30, prudence: 55, mercy: 30, ambition: 75 },
    storyLine:
      '한 청년이 산문 앞에 서서 한참을 머뭇거렸다. 뒤를 자주 돌아보았다.',
    childhood: {
      house: '멸문한 명문 독고세가의 마지막 후예',
      family: '없음 — 일가 백여 명이 한날 몰살당했다',
      nature: '여덟 살답지 않게 차갑고 깊다. 자존심이 곧고, 좀처럼 웃지 않는다.',
      upbringing: '명문가 교육을 받다 모든 걸 잃고, 멸문 뒤 이태를 홀로 떠돌았다.',
      likes: '검을 쥐고 베기, 글과 무리(武理) 파고들기 — 통찰이 비범하고 손이 빠르다',
      dislikes: '몰래 던지는 암기, 약 짓는 잔손 일',
      tell: '곧고 예를 지키나, 무언가를 되갚으려는 듯 검을 놓지 않는다.',
    },
  },
] as const;

export function findRecruit(poolId: string): RecruitCandidate | undefined {
  return RECRUIT_POOL.find((c) => c.poolId === poolId);
}
