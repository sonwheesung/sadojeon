// 도덕 이벤트 — 진백호 개인 풀. docs/disciples/09 · docs/48
//
// 진백호는 떠돌이 천재 — 자유 정점(80)·야망(70)·다정(60).
// 흑화 창 = 자유 폭발: 가두거나 방관·강제할 때 어둠이 깃든다.
// 갈등의 결: 진도를 건너뛰고 동문을 앞질러 무시(재능 오만),
//            답답함에 무단 하산을 시도(자유), 사파 무공에 호기심(occult).
// 사부가 인정하고 들어주면 교화, 가두거나 방치하면 사문을 등진다.

import type { MoralEventTemplate } from '@/types';

export const JINBAEKHO_MORAL_EVENTS: MoralEventTemplate[] = [
  // 1. 진도 건너뛰기 + 동문 무시 — 재능 오만 (pride)
  {
    id: 'p-jin-skip',
    tier: 'personal',
    category: 'pride',
    trigger: {
      weight: 6,
      onlyForDiscipleId: 'jin-baekho',
      minYearInSect: 3,
    },
    scenario:
      '연무장에서 동문들이 같은 초식을 거듭 다지는 사이,\n' +
      '진백호는 진작에 다음 권보를 제 손으로 펼쳐 익히고 있었다.\n' +
      '"다 아는 걸 왜 또 해요? 동문들 느린 거 기다리느니 저 혼자 앞에 가는 게 낫잖아요.\n' +
      ' …같이 하라는 게 더 답답해요. 제가 빠른 게 잘못은 아니죠?"',
    insightHints: {
      3: '진백호가 동문을 한참 아래로 보기 시작했다.',
      4: '앞서간다는 자부가 외로움을 가리는 가면이 되어가고 있다.',
      5: '아무도 자기를 따라오지 못한다는 사실에, 정작 본인이 가장 쓸쓸해한다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"정해진 진도를 건너뛰고 동문을 업신여기는 것은 사문의 결을 깨는 짓이다." 모든 제자 앞에서 책망.',
        perpetrator: {
          trustDelta: -4,
          darknessRiskBump: -1,
          noteAppend: '여럿 앞에서 면박을 당했다 — 입은 다물었지만 속은 더 굳었다.',
        },
        atmosphere: { righteousnessDelta: 2, unityDelta: -2 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 혼자 빠른 것과 함께 가는 것이 무엇이 다른지 가려보아라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -2 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"앞서간 자만이 손 내밀 수 있다. 한 동문에게 네 깨달음을 가르쳐 보아라." 곁에서 지켜본다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -4,
          personalityShift: { warmth: 6, prudence: 5, integrity: 4 },
          noteAppend: '제 깨달음을 동문에게 풀어주며, 앞선다는 것의 무게를 처음 가늠했다.',
        },
        master: { insightDelta: 2 },
        atmosphere: { unityDelta: 3 },
        cascade: [
          {
            kind: 'admire',
            noteAppend: '천재가 손 내미는 모습을 보고 동문들의 경계가 한 결 풀렸다.',
          },
        ],
      },
      {
        tone: 'overlook',
        label: '(재능 차이는 어쩔 수 없다며 혼자 앞서 나가게 둔다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 4,
          personalityShift: { ambition: 4, warmth: -4 },
          noteAppend: '"사부도 내가 다르다는 걸 인정한다." 동문과의 사이가 한 뼘 더 벌어졌다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -3 },
        cascade: [
          {
            kind: 'distance',
            trustDelta: -2,
            noteAppend: '동문들이 진백호를 한 무리 바깥의 사람으로 여기기 시작했다.',
          },
        ],
      },
    ],
  },

  // 2. 무단 하산 시도 — 답답함에 산을 넘으려 함 (defiance)
  {
    id: 'p-jin-runaway',
    tier: 'personal',
    category: 'defiance',
    trigger: {
      weight: 5,
      onlyForDiscipleId: 'jin-baekho',
      minYearInSect: 5,
    },
    scenario:
      '동트기 전, 봇짐을 멘 진백호가 산문 담을 넘으려다 들켜 끌려왔다.\n' +
      '"잠깐 산 아래만 보고 오려던 거예요. 영영 가려던 거 아니라니까요.\n' +
      ' …이 산속에만 갇혀 있으니 숨이 막혀요. 묻고 나갔으면 막으셨을 거잖아요."\n' +
      '말끝은 당돌하지만, 담을 짚은 손끝이 가늘게 떨리고 있다.',
    insightHints: {
      3: '진백호가 사문의 울타리를 점점 답답한 새장으로 느끼고 있다.',
      4: '막을수록 떠나고 싶어진다 — 붙잡는 손길 자체가 이 아이에겐 가시다.',
      5: '실은 떠나려는 게 아니라, 떠나도 받아줄 곳인지를 시험하고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"사문 규율을 멋대로 어겼다. 한 달 외출 금지에 무공도 멈춘다."',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -2,
          noteAppend: '담장이 한 자 더 높아졌다 — 가두는 손길에 마음이 먼저 산문 밖으로 나갔다.',
        },
        atmosphere: { righteousnessDelta: 1, unityDelta: 1 },
      },
      {
        tone: 'seclusion',
        label: '"보름 폐관. 떠나고 싶은 마음이 정말 어디서 오는지 가만히 들여다보아라."',
        perpetrator: { trustDelta: -2, darknessRiskBump: -3 },
        atmosphere: { unityDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"다음엔 내게 와라. 그땐 내가 직접 데리고 나가마." 그 길로 함께 산을 내려가 견문을 시켜준다.',
        perpetrator: {
          trustDelta: 7,
          darknessRiskBump: -5,
          personalityShift: { warmth: 6, prudence: 5, freedom: 4 },
          noteAppend: '가두지 않고 함께 나서준 사부에게, 묶이지 않아도 머물 수 있음을 처음 배웠다.',
        },
        master: { insightDelta: 2, reputationDelta: 1 },
        atmosphere: { unityDelta: 3 },
      },
      {
        tone: 'overlook',
        label: '(못 본 척한다. 갈 테면 가고 올 테면 오라 둔다.)',
        perpetrator: {
          trustDelta: 2,
          darknessRiskBump: 5,
          noteAppend: '"막지도 않고 챙기지도 않는다." 발길이 점점 산문 밖으로 향한다.',
        },
        atmosphere: { righteousnessDelta: -1, unityDelta: -2 },
      },
    ],
  },

  // 3. 사파 무공에 대한 호기심 — 큰 사건 (occult)
  {
    id: 'p-jin-forbidden',
    tier: 'personal',
    category: 'occult',
    trigger: {
      weight: 4,
      onlyForDiscipleId: 'jin-baekho',
      minYearInSect: 6,
    },
    scenario:
      '동문이 사부에게 떨리는 목소리로 알려왔다.\n' +
      '"진백호가… 강호에서 흘러든 흑사파 무공서를 몰래 베껴 익히고 있습니다."\n' +
      '불려온 진백호는 태연하다.\n' +
      '"그냥 동작이 사납고 빨라 보여서 한 번 따라 해본 거예요.\n' +
      ' 어차피 제 손에 들어오면 다 같은 무공 아니에요? 강해지면 그만이잖아요."',
    insightHints: {
      3: '진백호가 빠르고 강한 길이라면 결을 가리지 않으려 한다.',
      4: '재능을 믿는 아이가, 어떤 무공이든 자기는 휘둘리지 않으리라 자만하고 있다.',
      5: '정점에 닿고픈 갈증이, 길을 가리던 마지막 빗장을 스스로 풀게 만들고 있다.',
    },
    choices: [
      {
        tone: 'punish',
        label: '"그 무공서를 당장 불사른다. 사파의 결은 한 줄도 사문에 들이지 않는다." 엄히 끊는다.',
        perpetrator: {
          trustDelta: -5,
          darknessRiskBump: -3,
          noteAppend: '눈앞에서 무공서가 타들어갔다 — 강제로 빼앗긴 길이 더 궁금해졌다.',
        },
        atmosphere: { righteousnessDelta: 3, unityDelta: -1 },
      },
      {
        tone: 'seclusion',
        label: '"한 계절 폐관. 강한 것과 옳은 것이 같은 것인지, 끝까지 가려내고 나오너라."',
        perpetrator: { trustDelta: -3, darknessRiskBump: -3 },
        atmosphere: { righteousnessDelta: 1 },
      },
      {
        tone: 'admonish',
        label: '"네 손이 무공을 고르는 게 아니라, 무공이 네 손을 물들인다." 사파 무공이 사람을 어떻게 갉는지를 밤새 들려준다.',
        perpetrator: {
          trustDelta: 6,
          darknessRiskBump: -5,
          personalityShift: { integrity: 6, prudence: 6, mercy: 4 },
          noteAppend: '강함에도 가려야 할 결이 있음을, 사부의 밤을 들으며 처음 새겼다.',
        },
        master: { insightDelta: 3 },
        atmosphere: { righteousnessDelta: 2, unityDelta: 2 },
        cascade: [
          {
            kind: 'admire',
            noteAppend: '천재가 빗장을 도로 거는 모습에 동문들이 마음을 놓았다.',
          },
        ],
      },
      {
        tone: 'overlook',
        label: '(천재가 알아서 가릴 거라며 그대로 둔다.)',
        perpetrator: {
          trustDelta: 1,
          darknessRiskBump: 6,
          darknessLevelBump: 1,
          personalityShift: { ambition: 5, mercy: -4 },
          noteAppend: '"사부도 막지 않았다." 사파 초식의 사나운 결이 손끝에 스며들기 시작했다.',
        },
        atmosphere: { righteousnessDelta: -3, unityDelta: -2 },
      },
    ],
  },
];
