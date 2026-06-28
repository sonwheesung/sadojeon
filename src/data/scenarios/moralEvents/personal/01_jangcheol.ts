// 도덕 이벤트 — 장철 개인 풀. docs/disciples/01 · docs/48
//
// 장철은 선천 매우 순함 — 흑화 창 없음(우직·순박 안전판).
// darknessLevelBump 절대 X · darknessRiskBump 는 0 또는 +1 미세값만.
// 갈등은 흑화가 아니라 그 캐릭터다운 결로:
//   ① 약한 자를 그냥 못 지나치는 과보호(규율과 충돌)
//   ② 고향·식구 향수로 규율보다 먼저 움직이는 발
//   ③ 정직 위에 둔 우직한 고집
// 사부의 4선택은 그 따뜻한 결을 다듬거나, 굳히거나, 방치한다.

import type { MoralEventTemplate } from '@/types';

export const JANGCHEOL_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 약한 아이를 감싸다 떡판 싸움 — 과보호 × 규율충돌
  {
    id: 'p-jang-shield',
    tier: 'personal',
    category: 'violence',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'jang-cheol',
      minYearInSect: 2,
    },
    scenario:
      '마을 어귀에서 한바탕 소동이 났다는 말에 나가보니, 철이가 흙바닥에 주저앉아 입술이 터진 채 씩씩대고 있다.\n' +
      '"덩치 큰 놈들이 떡 팔러 온 아이를 둘러싸고 떡판을 엎었어요. 그 아이… 저보다도 어렸단 말이에요.\n' +
      ' 참을 수가 없었어요. 사부님, 제가… 제가 잘못한 건가요?"',
    insightHints: {
      3: '철이는 약한 사람을 보면 제 일처럼 나선다.',
      4: '매를 맞더라도 그 아이를 두고 물러서진 않았을 아이다.',
      5: '고향에 두고 온 어린 자신과 형의 그림자가 그 아이에게 겹쳐 보였는지도 모른다.',
    },
    choices: [
      {
        tone: 'punish',
        label:
          '"네 주먹이 옳았대도, 사문의 무를 길에서 함부로 쓴 건 다른 일이다." 사흘간 마당 물지게를 지운다.',
        perpetrator: {
          trustDelta: -3,
          noteAppend: '주먹이 앞선 일로 벌을 받았다 — 그래도 그 아이를 두고 물러서진 않았다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"끓는 피부터 식혀라. 사흘간 말없이 운기하며 그 주먹을 돌아보거라."',
        perpetrator: {
          trustDelta: -2,
          noteAppend: '폐관에 들어 제 손속을 돌아보았다.',
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label:
          '"약한 것을 그냥 지나치지 못하는 그 마음이 무인의 뿌리다. 다만 지키는 데도 법이 있으니, 그 법을 같이 익히자."',
        perpetrator: {
          trustDelta: 6,
          personalityShift: { integrity: 6, warmth: 6, mercy: 4 },
          noteAppend: '사부가 그 마음을 옳다 해주었다 — 지키는 법까지 함께 배우기로 했다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 2 },
      },
      {
        tone: 'overlook',
        label: '(터진 입술만 말없이 닦아주고, 굳이 묻지 않는다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '"옳다 싶으면 주먹이 먼저여도 된다." 철이가 그렇게 새겼다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -1 },
      },
    ],
  },

  // 2. 가뭄 든 고향에 제 몫을 부치고 무단 외출 — 향수 × 규율
  {
    id: 'p-jang-homesick',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'jang-cheol',
      minYearInSect: 4,
    },
    scenario:
      '새벽같이 자리를 비웠던 철이가 해질녘에야 흙투성이로 돌아왔다.\n' +
      '"… 고향에 가뭄이 들었다는 말을 듣고, 모아둔 제 몫을 어머니께 부치고 왔습니다. 산문 밖을 말없이 나선 점, 벌은 달게 받겠습니다.\n' +
      ' 그치만… 어머니가 굶고 계실 거란 생각에, 도무지 수련이 손에 잡히질 않았어요."',
    insightHints: {
      3: '철이의 마음은 늘 사문 담장 너머 고향에 한 발 걸쳐 있다.',
      4: '식구가 걸리면 철이는 규율보다 먼저 발이 움직인다.',
      5: '말리면 따르겠지만, 마음 깊은 곳은 고향을 한 번도 떠난 적이 없다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"마음은 알겠다만 사문의 담을 말없이 넘은 건 넘은 거다. 보름간 산문 출입을 금한다."',
        perpetrator: {
          trustDelta: -3,
          noteAppend: '담을 넘은 값을 치렀다 — 그래도 부치고 온 것만은 후회하지 않는 얼굴이다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"흔들리는 마음으로는 담장도 못 지킨다. 열흘간 폐관하며 그 마음부터 추슬러라."',
        perpetrator: {
          trustDelta: -2,
          noteAppend: '폐관에 들어 고향으로 향하던 발을 잠시 묶었다.',
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label:
          '"다음엔 내게 먼저 말하거라. 식구를 굶기지 않는 것도 무인의 일이니, 부치는 길은 사문이 함께 터주마."',
        perpetrator: {
          trustDelta: 6,
          personalityShift: { warmth: 8, prudence: 4, freedom: -4 },
          noteAppend: '사부가 부치는 길을 함께 터주기로 했다 — 발보다 말이 먼저 가게 되었다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(돌아온 것만 확인하고, 다음 날도 그저 모른 척 넘어간다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '"급하면 말없이 넘어도 된다." 철이의 발이 점점 가벼워진다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
      },
    ],
  },

  // 3. 속임수로 이기느니 정직하게 진다 — 우직한 고집
  {
    id: 'p-jang-stubborn',
    tier: 'personal',
    category: 'pride',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'jang-cheol',
      minYearInSect: 5,
    },
    scenario:
      '대련에서 철이가 또 졌다. 한 수만 속임수를 섞었으면 이겼을 자리에서, 그는 끝내 정직하게 밀고 들어가다 나가떨어졌다.\n' +
      '"속여서 이기느니, 정정당당히 지는 게 나아요. 헛수를 쓰는 법은… 배우고 싶지 않습니다."\n' +
      '몇 번을 일러줘도 철이는 같은 자리에서 같은 고집을 부린다.',
    insightHints: {
      3: '철이는 이기는 것보다 떳떳한 것을 윗자리에 둔다.',
      4: '한번 옳다 믿으면 매를 맞아도 굽히지 않는 아이다.',
      5: '그 곧음이 그를 지키기도 하고, 외곬으로 가두기도 한다.',
    },
    choices: [
      {
        tone: 'punish',
        label:
          '"무는 이겨야 사람을 지킨다. 네 고집이 누굴 못 지키게 만들면 그땐 누가 책임지느냐." 같은 초식을 백 번 더 치게 한다.',
        perpetrator: {
          trustDelta: -3,
          noteAppend: '벌초식을 묵묵히 채웠다 — 그래도 헛수만은 끝내 손에 담지 않았다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"네 고집의 뿌리가 무언지 혼자 가려보아라. 사흘간 폐관이다."',
        perpetrator: {
          trustDelta: -2,
          noteAppend: '폐관에 들어 제 외곬을 들여다보았다.',
        },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label:
          '"정직하게 지겠다는 그 결을 누가 탓하랴. 다만 헛수도 사람을 살리려 쓰는 법이 있으니, 그 쓰임만 알아두자. 쓰고 안 쓰고는 네 몫이다."',
        perpetrator: {
          trustDelta: 6,
          personalityShift: { integrity: 6, prudence: 6, warmth: 2 },
          noteAppend: '곧음은 그대로 두되, 헛수의 쓰임 하나를 마음에 새겼다.',
        },
        master: { insightDelta: 1 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 1 },
      },
      {
        tone: 'overlook',
        label: '(굳이 고치려 들지 않고, 지든 말든 그의 방식대로 두기로 한다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 1,
          noteAppend: '"내 방식이 늘 옳다." 철이의 고집이 한 뼘 더 굳어간다.',
        },
        atmosphere: { unityDelta: -1 },
      },
    ],
  },
];
