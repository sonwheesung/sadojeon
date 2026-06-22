// 맥락형 튜토리얼 — 기능을 **처음 마주쳤을 때 그 자리에서** 한 주제씩 일러준다.
// (앞에 모든 설명을 몰아주지 않는다.) 예: 연단실을 처음 지으면 그때 연단 안내가 뜬다.
// 데이터 주도: 주제·문구 추가는 이 TUTORIALS 맵만 손대면 됨(트리거는 각 화면/행동에서 한 줄).
// 톤: 정통 무협 + 쉬운 말(코드 용어·영문 금지). 숨은 게임 변수는 라벨로 직접 노출 X.
// 정본 사양: docs/44_튜토리얼_온보딩.md

export interface TutorialCard {
  seal: string; // 인장 한자(장식)
  title: string;
  body: string; // 2~3문장, 일상어
}

export interface TutorialTopic {
  key: string; // 본 여부 기록·트리거 식별자(고유)
  cards: TutorialCard[];
}

// 주제별 안내. key 는 계정에 "본 것"으로 기록되는 식별자.
export const TUTORIALS: Record<string, TutorialTopic> = {
  // 첫 사문 개창 직후 — 게임의 뼈대(당신=사부, 하루 진행).
  intro: {
    key: 'intro',
    cards: [
      {
        seal: '師',
        title: '사부가 되다',
        body: '당신은 한 사문을 이끄는 사부입니다. 거둔 제자를 가르쳐 무인으로 길러내고, 강호로 내보내는 것이 당신의 길입니다.',
      },
      {
        seal: '日',
        title: '하루를 보내다',
        body: '화면 아래 [진행]을 누르면 하루가 흐릅니다. 누르지 않으면 시간은 멈춰 있으니, 서두르지 말고 한 수씩 두십시오.',
      },
    ],
  },

  // 연단실을 처음 지었을 때 — 영약 제조의 흐름.
  alchemy: {
    key: 'alchemy',
    cards: [
      {
        seal: '丹',
        title: '연단실을 열다',
        body: '연단실에서 영약을 만듭니다. 영약은 제자의 내공을 끌어올리고, 다친 몸을 치료하며, 마을에 팔아 자금이 되기도 합니다.',
      },
      {
        seal: '方',
        title: '비급을 익히고 연단하다',
        body: '먼저 연단 비급을 \'학습\'해야 그 영약을 만들 수 있습니다. 제조에는 약초가 들고, 연단하는 며칠 동안 그 제자는 다른 일을 못 합니다.',
      },
      {
        seal: '草',
        title: '약초를 모으다',
        body: '약초는 약초채집·의술 의뢰 중에 얻거나 마을에서 삽니다. 귀한 영약일수록 구하기 어려운 재료가 필요하니, 미리 모아두십시오.',
      },
    ],
  },
};

export function findTutorial(key: string): TutorialTopic | undefined {
  return TUTORIALS[key];
}
