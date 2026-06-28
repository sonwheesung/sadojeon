// 스포트라이트 투어 단계 데이터 — 도입 회차 강제 코치마크. docs/44·46.
// 톤: 정통 무협 + 쉬운 말(코드 용어·영문 금지). 숨은 변수 비노출.

export interface SpotlightStep {
  targetId?: string; // 가리킬 요소 id(useSpotlightTarget). 없으면 화면 중앙 말풍선.
  seal: string; // 인장 한자(장식)
  title: string;
  body: string;
}

// 계정 1회 강제 — 본 것으로 기록되는 키(tutorialStore.seen).
export const INTRO_SPOTLIGHT_KEY = 'intro-spotlight';

// 도입 회차 첫 일과 진입 시 한 번 — 실제 버튼을 하나씩 짚는다.
export const INTRO_SPOTLIGHT: SpotlightStep[] = [
  {
    seal: '師',
    title: '사부가 되었습니다',
    body: '이제부터 화면을 하나씩 짚어 드리겠습니다. 짚어 드리는 곳을 누르면 다음으로 넘어갑니다.',
  },
  {
    targetId: 'roster',
    seal: '弟',
    title: '제자',
    body: '여기 당신의 제자가 있습니다. 카드를 누르면 그 제자의 자질과 무공을 살필 수 있습니다.',
  },
  {
    targetId: 'schedule',
    seal: '修',
    title: '일과 정하기',
    body: '여기서 제자가 요일마다 무엇을 닦을지 정합니다. 날마다 쌓인 수련이 무공과 경지가 됩니다.',
  },
  {
    targetId: 'progress',
    seal: '日',
    title: '하루 보내기',
    body: '이 [진행]을 누르면 하루가 흐릅니다. 누르지 않으면 시간은 멈춰 있으니, 서두르지 마십시오.',
  },
  {
    targetId: 'fastforward',
    seal: '疾',
    title: '빠른 진행',
    body: '별일 없는 날들은 [빠른 진행]으로 순식간에 흘려보낼 수 있습니다. 중요한 순간엔 저절로 멈춰 당신을 기다립니다.',
  },
  {
    targetId: 'inbox',
    seal: '書',
    title: '서신함',
    body: '제자의 고민과 강호의 소식이 이 봉투로 옵니다. 결정이 필요한 서신은 답하기 전엔 하루를 넘길 수 없습니다.',
  },
  {
    seal: '始',
    title: '이제 시작입니다',
    body: '장철을 길러 일류에 올리고 강호로 내보내 보십시오. 첫 길을 끝까지 걸으면 비급 한 권이 당신의 서고에 남습니다.',
  },
];
