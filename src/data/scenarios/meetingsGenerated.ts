// 자동 생성 — 면담 대량 풀(워크플로 meeting-pool-gen + meeting-personal-gen, 검수 통과분).
// 손으로 편집하지 말 것. 풀 확장은 워크플로 재실행 후 재생성. docs/12.
import type { MeetingTemplate } from './meetings';

export const GENERATED_MEETINGS: MeetingTemplate[] = [
  {
    "id": "m-child-11",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 어젯밤에 산에서 부엉이가 우는데 너무 무서웠어요. 도깨비가 진짜 있어요?",
    "options": [
      {
        "key": "soothe",
        "label": "도깨비는 없단다. 무서우면 내 방 앞에 와도 좋다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "truth",
        "label": "어둠 속엔 짐승이 있지. 무서운 건 당연하다, 그래서 검을 배우는 게다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "toughen",
        "label": "그만한 일에 떨어서야 쓰겠느냐. 무서워도 눈은 감지 마라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-child-12",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님! 오늘 처음으로 목검을 쥐었는데, 손에 딱 맞아서 너무 신나요! 더 휘둘러도 돼요?",
    "options": [
      {
        "key": "share",
        "label": "그 설렘, 평생 잊지 마라. 자, 한 번 같이 휘둘러 보자.",
        "effects": {
          "persona": {
            "warmth": 2,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "discipline",
        "label": "기쁜 건 좋다. 허나 검은 장난감이 아니다, 자세부터 잡거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          }
        }
      },
      {
        "key": "weight",
        "label": "신나느냐. 그 가벼운 나무가 언젠가 사람을 벨 무게가 된다.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-child-13",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 아무리 해도 검이 자꾸 떨어져요. 저는 바보인가 봐요. 그냥 안 할래요.",
    "options": [
      {
        "key": "encourage",
        "label": "나도 처음엔 백 번 떨어뜨렸단다. 너만 그런 게 아니야.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "again",
        "label": "그만두긴 이르다. 딱 열 번만 더 해보자, 내가 봐주마.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "dismiss",
        "label": "재능이 없으면 그만이지. 정 싫으면 마당이나 쓸거라.",
        "effects": {
          "persona": {
            "warmth": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-child-14",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 마당 항아리를 제가 깬 거 맞아요... 근데 너무 혼날까 봐 무서워서 말 못 했어요.",
    "options": [
      {
        "key": "praise",
        "label": "이렇게 와서 말해줘서 고맙다. 솔직한 게 깬 것보다 훨씬 크다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "warmth": 1
          },
          "trust": 4,
          "righteousness": 1
        }
      },
      {
        "key": "lesson",
        "label": "항아리는 다시 빚으면 된다. 허나 거짓말은 한번 새면 메우기 어렵다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          }
        }
      },
      {
        "key": "scold",
        "label": "깨놓고 입까지 다물었더냐. 오늘은 저녁 없이 무릎 꿇어라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-child-15",
    "band": "child",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님, {rival}랑 같이 개울에서 놀았어요! 제일 친한 친구가 생긴 것 같아요. 헤헤.",
    "options": [
      {
        "key": "bless",
        "label": "좋은 동무를 얻었구나. 그 인연, 평생 갈 수도 있단다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 2
        }
      },
      {
        "key": "balance",
        "label": "동무는 귀하다. 허나 검은 결국 혼자 휘두르는 것임도 잊지 마라.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      },
      {
        "key": "tease",
        "label": "허허, 그새 정이 들었느냐. 내일은 둘이 같이 물이나 길어오너라.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-child-16",
    "band": "child",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님, {rival}가 제 칭찬받은 거 보고 삐쳐서 저랑 안 논대요. 제가 잘못한 거예요?",
    "options": [
      {
        "key": "mediate",
        "label": "네 잘못이 아니다. 허나 먼저 손 내미는 자가 더 큰 사람이란다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3
        }
      },
      {
        "key": "stand",
        "label": "칭찬받은 게 죄는 아니다. 네가 굽힐 일이 아니야.",
        "effects": {
          "persona": {
            "integrity": 2,
            "freedom": 1
          }
        }
      },
      {
        "key": "shrug",
        "label": "동무 마음은 동무 일이다. 너는 네 검에나 마음을 쓰거라.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": -1
          }
        }
      }
    ]
  },
  {
    "id": "m-child-17",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님은 진짜 엄청 세요? 옛날엔 나쁜 사람들 막 무찌르고 그랬어요? 얘기해 주세요!",
    "options": [
      {
        "key": "humble",
        "label": "센 척했을 뿐, 도망친 날도 많았단다. 사람은 다 그런 게다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 2
          },
          "trust": 2
        }
      },
      {
        "key": "inspire",
        "label": "암, 한때는 산 하나를 울렸지. 너도 그리될 수 있다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 2
          }
        }
      },
      {
        "key": "deflect",
        "label": "지난 일이다. 옛 자랑보다 오늘 한 번 더 휘두르는 게 낫다.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-child-18",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님... 가끔 부모님이 사무치게 그립습니다. 절 잊지 않으셨을까요?",
    "options": [
      {
        "key": "reassure",
        "label": "널 잊을 리 있겠느냐. 멀리 있어도 마음은 늘 네 곁에 머물 게다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "honest",
        "label": "그 까닭은 나도 다 알지 못한다. 허나 지금 너를 아끼는 건 분명하다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 2
        }
      },
      {
        "key": "redirect",
        "label": "지난 일은 묻어두자. 여기서 강해지는 데나 마음을 쓰거라.",
        "effects": {
          "persona": {
            "warmth": -1,
            "prudence": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-child-19",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 저 거짓말 한 번만 해도 돼요? 검술 연습 다 했다고 하면 오늘은 좀 놀 수 있잖아요.",
    "options": [
      {
        "key": "no",
        "label": "안 된다. 한 번이 두 번 되고, 끝내 네 입을 아무도 안 믿게 된다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 1,
          "righteousness": 1
        }
      },
      {
        "key": "deal",
        "label": "놀고 싶으면 솔직히 말하거라. 그럼 반만 하고 놀게 해주마.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 3
        }
      },
      {
        "key": "allow",
        "label": "허허, 들키지만 않으면 되지 않겠느냐. (눈을 감는다)",
        "effects": {
          "persona": {
            "integrity": -2,
            "freedom": 2
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-child-20",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 비 오는 날 처마 밑에 강아지가 떨고 있었어요. 제 밥 좀 나눠줘도 돼요?",
    "options": [
      {
        "key": "bless",
        "label": "그럼, 나눠주거라. 약한 것을 살피는 그 마음이 곧 협이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "caution",
        "label": "마음은 갸륵하다. 허나 네 밥도 모자라다, 부엌에서 식은 것을 챙겨주마.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": 1
          },
          "trust": 1
        }
      },
      {
        "key": "refuse",
        "label": "들짐승을 일일이 거두자면 끝이 없다. 정을 함부로 주지 마라.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-child-21",
    "band": "child",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님, {rival}가 자꾸 저보다 빨리 외워요. 부럽고... 솔직히 좀 얄미워요.",
    "options": [
      {
        "key": "normalize",
        "label": "부러운 건 흉이 아니다. 그 마음을 시샘 대신 본받음으로 돌리거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "own",
        "label": "남보다 느린 게 무어 대수냐. 깊게 익힌 것이 오래 간다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          }
        }
      },
      {
        "key": "fuel",
        "label": "얄밉거든 이겨라. 그 분함을 검에 실으면 그만이다.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 3
          }
        }
      }
    ]
  },
  {
    "id": "m-child-22",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 잘 때 안 무섭게 자장가 불러주면 안 돼요? 어머니가 늘 불러주셨거든요.",
    "options": [
      {
        "key": "sing",
        "label": "음치라 흉볼 게다만... 그래, 한 곡 불러주마. 이리 오너라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 5
        }
      },
      {
        "key": "story",
        "label": "노래는 영 못한다. 대신 옛 협객 이야기를 하나 들려주마.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "decline",
        "label": "다 큰 아이가 자장가라니. 그만 눈 감고 자거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-child-23",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 왜 동문 애가 저 먹으라고 준 과자를 사부님이 다 뺏으셨어요? 그건 제 거였잖아요!",
    "options": [
      {
        "key": "explain",
        "label": "공짜 호의엔 까닭이 있을 때가 많다. 누가 줬는지 내가 먼저 봐야 했다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "apologize",
        "label": "그래, 네 것이었지. 미안하다. 다음엔 너와 먼저 의논하마.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "authority",
        "label": "이 산문에선 내 말이 곧 법이다. 따질 일이 아니야.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-child-24",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 동문 애가 저더러 '겁쟁이'래요. 그래서 제가 한 대 때렸어요. 잘못한 거예요?",
    "options": [
      {
        "key": "understand",
        "label": "그 말은 아팠겠다. 허나 주먹보다 먼저 내게 와줬다면 더 좋았겠지.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3
        }
      },
      {
        "key": "principle",
        "label": "모욕을 참는 것도 힘이다. 약한 자만이 먼저 주먹을 쥔다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          }
        }
      },
      {
        "key": "condone",
        "label": "잘했다. 함부로 입을 놀린 쪽이 잘못이지.",
        "effects": {
          "persona": {
            "freedom": 2,
            "mercy": -1,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-child-25",
    "band": "child",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 검 쥐는 거 너무 좋아요! 근데 이거 자꾸 휘두르면... 누구 아프게 하는 거 아니에요?",
    "options": [
      {
        "key": "guide",
        "label": "옳은 물음이다. 검은 베기 위함이 아니라 막기 위해 드는 게다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 2
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "reality",
        "label": "언젠가 누군가는 아프게 될 게다. 그래서 함부로 뽑지 말아야 한다.",
        "effects": {
          "persona": {
            "prudence": 3,
            "mercy": 1
          }
        }
      },
      {
        "key": "power",
        "label": "아프게 할 수 있으니 강한 게다. 그 힘을 두려워 말거라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-child-26",
    "band": "child",
    "when": {
      "ageMax": 10,
      "trustMax": 35
    },
    "body": "사부님은... 저 좋아하세요? 솔직히 가끔 무섭고, 진짜 제 편인지 잘 모르겠어요.",
    "options": [
      {
        "key": "warm",
        "label": "당연히 좋아하지. 무뚝뚝해 미안하구나. 나는 늘 네 편이다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 5
        }
      },
      {
        "key": "show",
        "label": "말은 서툴다. 허나 내가 너를 거두지 않았느냐. 그게 답이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 3
        }
      },
      {
        "key": "distant",
        "label": "사부가 제자를 좋아하고 말고가 어디 있느냐. 가르치면 그뿐이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-11",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 오늘 초식을 한 번 보고 그대로 따라 했어요. 다른 애들은 며칠 걸린다는데... 저 혹시 재능이 있는 거예요?",
    "options": [
      {
        "key": "ground",
        "label": "손이 빠른 것과 멀리 가는 것은 다르다. 그 빠름을 자만의 밑천으로 삼지 마라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "affirm",
        "label": "그래, 너는 타고난 그릇이 크다. 그 그릇, 무엇으로 채울지가 남았을 뿐이다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 2
          },
          "trust": 3
        }
      },
      {
        "key": "temper",
        "label": "재능을 믿는 검은 게으른 검이 된다. 둔재처럼 갈아라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-growth-12",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "isWeakest": true
    },
    "body": "사부님... 저만 자꾸 뒤처져요. 아무리 해도 다른 동문들을 못 따라가요. 저, 무공에 안 맞는 거 아니에요?",
    "options": [
      {
        "key": "encourage",
        "label": "늦게 핀 꽃이 가장 오래 향을 낸다. 나는 네 걸음을 믿는다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "honest",
        "label": "지금은 뒤에 있다. 허나 검의 길은 길어서, 누가 앞설지는 아직 모른다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "dismiss",
        "label": "못 따라가면 더 일찍 일어나 닦으면 될 일이다. 한탄할 시간에 한 번 더 휘둘러라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-13",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}랑 저랑 똑같이 시작했는데 왜 쟤만 칭찬받아요? 솔직히... 쟤가 잘하는 거 보면 배가 아파요.",
    "options": [
      {
        "key": "name_it",
        "label": "부럽다는 말을 입에 담을 줄 아는구나. 그 마음을 미워하지 말고, 발걸음으로 바꿔라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "compare_self",
        "label": "남의 등을 보며 걷는 자는 늘 뒤에 있다. 앞만 보거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          }
        }
      },
      {
        "key": "stoke",
        "label": "그 아픔이 곧 네 힘이다. 이겨라. 이기고 나서 다시 내게 오너라.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 3
          }
        }
      }
    ]
  },
  {
    "id": "m-growth-14",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님! 검을 쥐고 있으면 가슴이 막 뛰어요. 빨리 더 어려운 초식 배우고 싶어요. 다음 건 언제 가르쳐 주세요?",
    "options": [
      {
        "key": "foundation",
        "label": "급한 검은 뿌리 없는 나무다. 기초를 천 번 더 채우면, 그다음은 절로 열린다.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "reward",
        "label": "그 열기가 보기 좋구나. 오늘 하나 더 보여주마. 잘 보거라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "discipline",
        "label": "배움은 네가 정하는 것이 아니다. 때가 되면 내가 내준다.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-15",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님... 요즘 옆 마을 그 애를 보면 자꾸 얼굴이 빨개지고 가슴이 두근거려요. 이거... 제가 어디 아픈 거예요?",
    "options": [
      {
        "key": "tender",
        "label": "아픈 것이 아니라 자라는 것이다. 사람을 곱게 여기는 마음, 부끄러워 마라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 3
        }
      },
      {
        "key": "balance",
        "label": "마음이 가는 것은 막을 수 없다. 다만 검을 쥔 손까지 흔들리게 두지는 마라.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "deflect",
        "label": "그런 데 정신 팔 나이가 아니다. 검부터 익혀라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-16",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 오늘 장터에서 큰 애가 작은 애 밥을 뺏는 걸 봤어요. 너무 화가 나서... 막 끼어들고 싶었는데 무서워서 못 했어요. 저 비겁한 거죠?",
    "options": [
      {
        "key": "praise_seed",
        "label": "화가 났다는 것만으로 너는 이미 비겁하지 않다. 그 분(憤)을 잘 길러, 다음엔 손이 따르게 하거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "prudent",
        "label": "옳음에도 때와 힘이 필요하다. 무모히 끼어들어 함께 짓밟히면 누구를 구하겠느냐.",
        "effects": {
          "persona": {
            "prudence": 3
          }
        }
      },
      {
        "key": "cynic",
        "label": "강호엔 그런 일이 흔하다. 일일이 분개하다간 네 밥도 못 지킨다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -2
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-17",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님은 왜 이렇게 깊은 산속에만 살아요? 이렇게 센데 강호에 나가면 엄청 유명해질 수 있잖아요. 사부님... 혹시 무서워서 숨은 거예요?",
    "options": [
      {
        "key": "open",
        "label": "(잠시 침묵) ...강호에 한 번 크게 데인 적이 있다. 언젠가 그 이야기를 해주마.",
        "effects": {
          "persona": {
            "warmth": 1
          },
          "trust": 4
        }
      },
      {
        "key": "lesson",
        "label": "이름을 떨치는 것과 사람으로 사는 것은 다르더구나. 나는 후자를 골랐을 뿐이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "rebuff",
        "label": "어린것이 사부의 속을 함부로 재려 드는구나. 그 입부터 다스려라.",
        "effects": {
          "persona": {
            "integrity": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-18",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 어제 처음으로 동문이랑 진짜로 손을 맞대봤어요. 막대기로요! 무섭기도 했는데... 너무 짜릿했어요. 진짜 비무는 언제 해요?",
    "options": [
      {
        "key": "caution",
        "label": "검을 맞대는 짜릿함은 사람을 홀린다. 그 홀림에 먹히지 않게, 먼저 멈추는 법부터 배워라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "spar",
        "label": "좋다. 그 기개라면 보름 뒤 내 앞에서 한 합 겨뤄보자.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 2
          },
          "trust": 3
        }
      },
      {
        "key": "warn_hurt",
        "label": "막대기는 멍이 들지만 검은 목숨을 가른다. 손맛에 취하면 언젠가 동문을 다치게 한다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 2
          },
          "righteousness": 1
        }
      }
    ]
  },
  {
    "id": "m-growth-19",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}가 자기가 나중에 무림맹주 될 거래요. 근데... 저는 왜 그런 큰 꿈이 안 생길까요? 저는 그냥 사부님 곁에 있는 게 좋은데, 이러면 안 되는 거예요?",
    "options": [
      {
        "key": "accept",
        "label": "큰 꿈만이 꿈이더냐. 곁을 지키는 마음도 귀한 길이다. 네 마음을 함부로 깎지 마라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "nudge",
        "label": "꿈은 자라며 생긴다. 지금 없다고 조급해 마라. 허나 언젠가 네 발로 설 날은 온다.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "push",
        "label": "언제까지 곁에만 머물 셈이냐. 더 큰 그림을 품을 줄도 알아야 한다.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-20",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "darknessRiskMin": "medium"
    },
    "body": "사부님, 막대기로 동문을 눌러 이겼을 때요... 쟤가 저를 무서워하는 눈으로 봤어요. 근데 그 눈빛이 싫지가 않았어요. 오히려 좀 좋았어요. 이상한가요?",
    "options": [
      {
        "key": "redirect",
        "label": "남이 너를 두려워하는 데서 기쁨을 찾으면, 끝내 곁에 아무도 남지 않는다. 두려움 말고 믿음을 얻어라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "probe",
        "label": "(가만히 본다) ...이긴 기쁨과 누른 기쁨은 다른 것이다. 너는 어느 쪽이었느냐.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "indulge",
        "label": "강한 자가 약한 자 위에 서는 것이 무림의 이치다. 그 맛을 알았으면 됐다.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-21",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 동문 한 명이 자꾸 자기 혼자 어려운 초식 연습하다 다쳐요. 모른 척하랬는데... 저는 도와주고 싶어요. 근데 도와주면 걔보다 제가 더 늦어지잖아요. 어떻게 해요?",
    "options": [
      {
        "key": "help",
        "label": "함께 가는 길이 더디어 보여도, 끝내 더 멀리 간다. 손을 내밀어라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "weigh",
        "label": "정(情)도 좋으나 네 수련도 네 것이다. 다 내주지 말고, 줄 만큼만 주거라.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      },
      {
        "key": "self_first",
        "label": "강호에선 결국 제 검만이 저를 지킨다. 남보다 네 한 합을 먼저 챙겨라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-22",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "stressMin": 60
    },
    "body": "사부님... 요즘 수련이 너무 힘들어요. 손바닥은 다 까지고, 밤엔 어깨가 아파서 잠도 잘 못 자요. 저 잠깐만 쉬면 안 돼요?",
    "options": [
      {
        "key": "rest",
        "label": "활도 늘 당겨두면 부러진다. 사흘 쉬어라. 그것도 수련이다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "lighten",
        "label": "오늘은 검을 내려놓고 나와 산이나 걷자. 몸이 아니라 마음을 쉬게 해주마.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "endure",
        "label": "그 고비를 넘긴 손이 진짜 검을 쥔다. 까진 손, 한 번 더 감고 일어나라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-23",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 책에서 봤는데 부모를 해친 원수는 끝까지 쫓아가 갚는 게 협이래요. 저는... 아직 갚을 원한 같은 게 없는데, 그래도 협객이 될 수 있을까요?",
    "options": [
      {
        "key": "release",
        "label": "빚을 찾아 헤매기 전에, 지킬 것을 먼저 찾아라. 복수만을 검에 새긴 자는 끝내 빈손이 된다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 2
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "neutral",
        "label": "그건 책의 이야기다. 네 빚이 있다면 언젠가 네 발로 알게 될 것이니, 지금은 네 검부터 키워라.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      },
      {
        "key": "edge",
        "label": "원한 없는 검은 무디다. 갚을 빚이 없다면, 그 자리를 다른 분노로라도 채워라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 1
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-24",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 정파니 사파니 하는 게 뭐예요? 동문이 그러는데 사파 무공이 더 빨리 세진대요. 근데 왜 우리는 정파 거만 배워요? 빠른 게 좋은 거 아니에요?",
    "options": [
      {
        "key": "explain_right",
        "label": "빠른 길은 대개 남을 밟고 가는 길이다. 우리는 더디어도, 사람을 상하게 하지 않는 길을 걷는다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 2,
          "righteousness": 2
        }
      },
      {
        "key": "nuance",
        "label": "정과 사를 가르는 건 무공이 아니라 그것을 쥔 자의 마음이다. 그 마음부터 곧게 세워라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "tempt",
        "label": "빠른 게 좋다는 말도 영 틀린 건 아니다. ...허나 그 값을 무엇으로 치르는지는 아직 네가 알 때가 아니다.",
        "effects": {
          "persona": {
            "freedom": 2
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-growth-25",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "trustMax": 30
    },
    "body": "사부님은... 정말로 저를 제자로 여기시는 거 맞아요? 그냥 산에 일손이 필요해서 거둔 건 아니고요? 솔직히 말씀해 주세요.",
    "options": [
      {
        "key": "warm_vow",
        "label": "(눈을 똑바로 본다) ...너는 내 검을 물려줄 제자다. 그 한마디면 되겠느냐.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 5
        }
      },
      {
        "key": "show_not_tell",
        "label": "말로 답할 일이 아니다. 내가 너를 어찌 가르쳐 왔는지, 네 손바닥이 알 것이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "gruff",
        "label": "그런 걸 물어 무엇하느냐. 정 의심스럽거든, 네 검으로 증명받아라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-growth-26",
    "band": "growth",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 만약에요... 만약에 제가 나중에 사부님보다 훨씬 강해지면요, 그래도 사부님 말씀 들어야 해요? 강한 사람이 시키는 대로 하는 게 맞는 거 아니에요?",
    "options": [
      {
        "key": "humility",
        "label": "힘이 세진다고 어른이 되는 건 아니다. 강해질수록 더 깊이 고개 숙일 줄 알아야 한다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "earn",
        "label": "내 말을 듣는 건 내가 강해서가 아니라, 네가 나를 믿어서다. 그 믿음이 사라지면 따르지 않아도 좋다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "test_dark",
        "label": "강한 자가 약한 자를 부리는 게 옳다... 그리 묻고 싶은 게냐. 그 물음의 끝이 어디인지 아느냐.",
        "effects": {
          "persona": {
            "prudence": 1
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-11",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 50
    },
    "body": "사부님. 처음 제 손으로 사람을 벤 그 손이… 아직도 떨립니다. 제가 옳은 일을 한 게 맞는지, 잠이 오지 않습니다.",
    "options": [
      {
        "key": "human",
        "label": "그 떨림을 두려워 마라. 손이 떨릴 줄 아는 자만이 검을 함부로 쓰지 않는 법이다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "duty",
        "label": "네가 베지 않았다면 다른 이가 죽었을 게다. 무게는 받되, 짊어지고 가거라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "cold",
        "label": "한 번 베면 두 번째는 쉬워진다. 곧 떨리지도 않을 게다.",
        "effects": {
          "persona": {
            "mercy": -2
          },
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-13",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님께서 가르치신 길이… 정말 옳은 길입니까. 세상은 사부님 말씀대로 굴러가지 않는 듯합니다.",
    "options": [
      {
        "key": "doubt-ok",
        "label": "의심해도 좋다. 스승의 말을 의심해 본 적 없는 제자가 더 위태롭다.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "hold",
        "label": "옳음은 세상이 정하는 게 아니라 네가 지키는 게다. 흔들려도 발은 디뎌라.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "righteousness": 1
        }
      },
      {
        "key": "hurt",
        "label": "그 나이에 벌써 스승을 저울에 다는구나. … 더 일러줄 말이 없다.",
        "effects": {
          "persona": {
            "ambition": 1
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-turmoil-14",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "needsRival": true
    },
    "body": "사부님. {rival}만 보면 가슴이 뜨거워집니다. 이기고 싶다는 마음이… 가끔은 무섭도록 큽니다.",
    "options": [
      {
        "key": "fuel",
        "label": "그 불을 끄려 하지 마라. 다만 검을 향하게 두지, 사람을 향하게 두지 마라.",
        "effects": {
          "persona": {
            "prudence": 1,
            "ambition": 2
          }
        }
      },
      {
        "key": "self",
        "label": "이겨야 할 상대는 {rival}가 아니라 그자를 시기하는 네 마음이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 2
        }
      },
      {
        "key": "win",
        "label": "이기고 싶거든 이겨라. 강호는 결국 이긴 자의 것이다.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 3
          }
        }
      }
    ]
  },
  {
    "id": "m-turmoil-15",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "사부님. 그자가 자꾸 저를 건드립니다. 말로도, 손으로도. 이제는 참는 것이 비겁한 건지 모르겠습니다.",
    "options": [
      {
        "key": "stand",
        "label": "참는 것과 무너지는 것은 다르다. 한 번은 똑바로 마주 서거라. 단, 먼저 칼을 빼지는 마라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "ignore",
        "label": "건드리는 자는 흔들리는 자를 노린다. 흔들리지 않으면 곧 흥미를 잃을 게다.",
        "effects": {
          "persona": {
            "prudence": 3
          }
        }
      },
      {
        "key": "crush",
        "label": "한 번 본때를 보여 다시는 못 덤비게 만들어라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-16",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 55,
      "seongMin": 5
    },
    "body": "사부님. 요즘은 아무리 수련해도 제자리걸음입니다. 한 달을 갈아도 손에 잡히는 게 없습니다. 제가… 여기까지인 걸까요.",
    "options": [
      {
        "key": "wall",
        "label": "벽에 부딪힌 게다. 벽은 멈추라는 신호가 아니라, 다르게 디디라는 신호다.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "rest",
        "label": "활을 너무 당기면 부러진다. 사흘 검을 놓아라. 그것도 수련이다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "push",
        "label": "여기서 주저앉는 자는 평생 이 자리다. 한 번 더, 끝까지 짜내라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "ambition": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-turmoil-17",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님. … 한 동문이 자꾸 마음에 걸립니다. 곁에 있으면 검이 흐트러지고, 없으면 또 신경이 쓰입니다. 이런 게… 정상입니까.",
    "options": [
      {
        "key": "natural",
        "label": "사람이 사람에게 마음을 두는 건 흠이 아니다. 다만 검을 핑계로 마음을 외면하진 마라.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 3
        }
      },
      {
        "key": "balance",
        "label": "마음은 두되, 검은 검대로 세워라. 둘 다 잃는 자가 가장 어리석다.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      },
      {
        "key": "focus",
        "label": "지금은 그럴 때가 아니다. 검이 먼저고, 사람은 나중이다.",
        "effects": {
          "persona": {
            "warmth": -2,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-18",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 강한 자가 약한 자를 누르는 것이… 정녕 그른 일입니까. 약한 게 죄라면, 강해지는 것이 답 아닙니까.",
    "options": [
      {
        "key": "protect",
        "label": "강함은 누르라고 주어진 힘이 아니라, 약한 자 앞을 막아서라고 주어진 힘이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 3
          },
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "probe",
        "label": "누가 너에게 그런 말을 심었느냐. 그 말, 네 것이 아닌 듯하다.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "agree",
        "label": "틀린 말은 아니다. 강호는 본디 그런 곳이지.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 1
          },
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-turmoil-19",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "high"
    },
    "body": "사부님. … 부모님을 해친 그자를 찾아냈습니다. 살려둘 수가 없습니다. 막지 말아 주십시오.",
    "options": [
      {
        "key": "stay",
        "label": "그 칼을 그자에게 박는 순간, 너도 그자와 같은 자가 된다. 검을 내려놓고 내 앞에 앉거라.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": 2
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "law",
        "label": "원한은 네 손이 아니라 강호의 법도가 갚게 하거라. 함께 그 길을 찾자.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "righteousness": 1
        }
      },
      {
        "key": "let",
        "label": "막지 않으마. 다만 그 칼이 너를 어디로 끌고 갈지는, 나도 책임지지 못한다.",
        "effects": {
          "persona": {
            "freedom": 2
          },
          "trust": -1,
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-20",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "isWeakest": true,
      "needsRival": true
    },
    "body": "사부님. 솔직히 말씀드립니다. 사문에서 제가 제일 약합니다. {rival}는 한참 위입니다. … 저는 무얼 믿고 이 길을 가야 합니까.",
    "options": [
      {
        "key": "late",
        "label": "늦게 피는 매화가 가장 추위를 견딘다. 지금 약한 것이 끝까지 약하다는 뜻은 아니다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "own",
        "label": "재능이 없거든 시간을 부어라. 남이 한 번 휘두를 때 너는 열 번 휘두르면 된다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "ambition": 1
          },
          "trust": 1
        }
      },
      {
        "key": "honest",
        "label": "강함만이 길은 아니다. 검이 약하면 머리를 쓰고, 머리가 약하면 사람을 얻어라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-turmoil-21",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님. 정파니 사파니, 누가 정한 겁니까. 사파에도 의리 있는 자가 있고, 정파에도 위선자가 있다는데… 그 선이 어디 있는지 모르겠습니다.",
    "options": [
      {
        "key": "deed",
        "label": "문파의 이름이 아니라 그자의 손이 한 일을 보거라. 선은 깃발이 아니라 행(行)에 있다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 2
          },
          "righteousness": 1
        }
      },
      {
        "key": "inner",
        "label": "남의 선을 가리기 전에, 네 마음이 어디로 기우는지부터 살펴라. 그게 더 급하다.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 2
        }
      },
      {
        "key": "free",
        "label": "선 같은 건 약한 자들이 그어놓은 울타리다. 네 길은 네가 그어라.",
        "effects": {
          "persona": {
            "integrity": -1,
            "freedom": 3
          },
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-turmoil-22",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "trustMax": 40
    },
    "body": "사부님. … 묻고 싶은 게 있습니다. 사부님은 어째서 화경에 닿지 못하셨습니까. 가르치는 분이, 정작 끝을 못 보셨다면… 저는 사부님을 따라 어디까지 갈 수 있습니까.",
    "options": [
      {
        "key": "honest",
        "label": "닿지 못했다. 부끄럽지 않다. 다만 못 간 그 길을, 너에게는 일러줄 수 있다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 4
        }
      },
      {
        "key": "path",
        "label": "봉우리를 못 밟은 자가 길은 가장 잘 안다. 헛디딘 자리를 다 기억하니까.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "stern",
        "label": "스승의 한계로 제 한계를 재려는 게냐. 그 버릇부터 버려라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "ambition": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-turmoil-23",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "needsRival": true
    },
    "body": "사부님. {rival}가 오늘 의뢰에서 크게 다쳤습니다. … 솔직히, 잘됐다는 생각이 잠깐 들었습니다. 그런 제가… 무섭습니다.",
    "options": [
      {
        "key": "face",
        "label": "그 생각이 들었다고 네가 악한 게 아니다. 그것을 부끄러워할 줄 아는 것이 네가 사람인 까닭이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "act",
        "label": "마음은 어쩔 수 없다 치자. 그럼 지금 일어나 그자에게 약을 가져다주거라. 행으로 마음을 이겨라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "righteousness": 1
        }
      },
      {
        "key": "shrug",
        "label": "경쟁자가 줄었으니 너에겐 득이지. 그뿐이다.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-turmoil-24",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님. 처음으로 의뢰를 혼자 맡았다가… 사람들이 다치는 걸 막지 못했습니다. 제 힘이 모자라서 못 지킨 겁니다. 죄송합니다.",
    "options": [
      {
        "key": "alive",
        "label": "네가 살아 돌아온 것만으로 됐다. 못 지킨 것은 죄가 아니라, 더 강해질 까닭이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "ambition": 1
          },
          "trust": 4
        }
      },
      {
        "key": "learn",
        "label": "그 자책을 기억에 새겨라. 다음엔 무엇을 달리할지, 그것만 생각하거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "harden",
        "label": "못 지킬 자는 처음부터 끼어들지 말았어야지. 강호는 변명을 안 듣는다.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-turmoil-25",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMax": 45
    },
    "body": "사부님. 요즘 검을 쥐면 결이 또렷이 보입니다. 어쩌면 제게… 정말 재능이란 게 있는 걸지도 모르겠습니다. 들떠도 되겠습니까.",
    "options": [
      {
        "key": "ground",
        "label": "재능을 본 게다. 기뻐하되 발은 땅에 두어라. 재능은 자만의 다른 이름이 되기 쉽다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "joy",
        "label": "들떠도 좋다. 제 길을 사랑하는 마음이 결국 가장 멀리 데려간다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "warn",
        "label": "재능을 믿는 자는 노력하는 자에게 진다. 보이는 것에 취하지 마라.",
        "effects": {
          "persona": {
            "integrity": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-turmoil-26",
    "band": "turmoil",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 50
    },
    "body": "사부님. 가끔… 이 모든 걸 내려놓고 그냥 산을 내려가 버리고 싶습니다. 검도, 사문도, 다 무거워서. 이런 말씀 드려도 됩니까.",
    "options": [
      {
        "key": "listen",
        "label": "내려놓고 싶을 만큼 무거웠구나. 오늘은 검 얘기 말고, 그냥 네 얘기를 들으마.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "honest",
        "label": "내려가도 된다. 다만 도망쳐 내려간 산은, 평생 네 등 뒤에 남는다. 그것까지 알고 정하거라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          }
        }
      },
      {
        "key": "push",
        "label": "그만한 일로 산을 내려가겠다는 게냐. 무인의 각오가 그 정도였더냐.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-departure-11",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 강호에 나가면 큰 문파의 이름값에 짓눌리지 않을까 두렵습니다. 무명산문 제자라고 무시당하면... 견딜 수 있을지 모르겠습니다.",
    "options": [
      {
        "key": "name",
        "label": "문파의 이름이 아니라 네 검이 너를 증명한다. 그거면 족하다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "bow",
        "label": "무시당하거든 고개를 숙여라. 굽힐 줄 아는 자가 끝내 선다.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": 1
          }
        }
      },
      {
        "key": "prove",
        "label": "그 말을 한 자의 코를 납작하게 만들면 될 일 아니냐.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-departure-12",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 저는 강호에 나가 이름을 떨치고 큰 세력을 세우고 싶습니다. 한낱 떠돌이 협객으로 늙고 싶지는 않습니다.",
    "options": [
      {
        "key": "feed",
        "label": "큰 뜻이다. 다만 사람을 거느리려거든 먼저 사람을 아껴라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 3
          }
        }
      },
      {
        "key": "warn",
        "label": "세력은 칼과 같다. 손에 쥔 자를 가장 먼저 벤다는 걸 잊지 마라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "humble",
        "label": "이름도 세력도 다 헛것이다. 한 사람이라도 지키는 것이 무인의 도리다.",
        "effects": {
          "persona": {
            "mercy": 2,
            "ambition": -2
          },
          "trust": 1,
          "righteousness": 2
        }
      }
    ]
  },
  {
    "id": "m-departure-13",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "hasEnemy": true
    },
    "body": "사부님, 하산하면 가장 먼저 그자를 찾아갈 겁니다. 제 핏줄을 그리 만든 원한, 결코 잊지 않았습니다.",
    "options": [
      {
        "key": "justice",
        "label": "원한을 갚되 무고한 자는 베지 마라. 거기서 협과 살(殺)이 갈린다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "release",
        "label": "복수로 채운 가슴은 끝내 텅 빈다. 살아서 그를 잊는 것이 더 큰 이김이다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 3
          },
          "trust": 1
        }
      },
      {
        "key": "sanction",
        "label": "갚아라. 다만 그 칼끝이 너 자신을 향하지 않도록만 하거라.",
        "effects": {
          "persona": {
            "integrity": -1,
            "ambition": 1
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-departure-14",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "darknessRiskMin": "medium"
    },
    "body": "사부님, 정파의 규율이 위선처럼 보일 때가 있습니다. 강한 자가 약한 자를 다스리는 것이 그른 일입니까?",
    "options": [
      {
        "key": "ground",
        "label": "강함은 누르라고 있는 것이 아니라 받치라고 있는 것이다. 그걸 거꾸로 알면 짐승이 된다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "mercy": 1
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "listen",
        "label": "그런 생각이 든 데에는 까닭이 있겠지. ... 무엇이 너를 그리 만들었느냐.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "concede",
        "label": "세상이 본디 그러하다. 누를 힘이 있다면 누가 말리겠느냐.",
        "effects": {
          "persona": {
            "freedom": 1,
            "mercy": -2
          },
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-departure-15",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 저는 검보다 약초와 침이 더 손에 익습니다. 무인의 길을 가는 제가... 의술에 마음 쓰는 것이 부끄럽지 않을까요.",
    "options": [
      {
        "key": "honor",
        "label": "사람을 베는 손과 살리는 손이 한 몸에 있다면, 그것이야말로 드문 복이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "balance",
        "label": "약을 아는 자가 독도 안다. 그 둘을 함께 쥐고 가거라.",
        "effects": {
          "persona": {
            "prudence": 3
          }
        }
      },
      {
        "key": "sharpen",
        "label": "마음이 그리로 기운다면 따르거라. 부끄러운 길이란 없다.",
        "effects": {
          "persona": {
            "freedom": 2,
            "warmth": 1
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-departure-16",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "needsRival": true
    },
    "body": "사부님, {rival}와 함께 자란 세월이 벌써 이만큼입니다. 하산하면 다시 만나기 어렵겠지요. 작별 인사는... 어떻게 해야 할지 모르겠습니다.",
    "options": [
      {
        "key": "embrace",
        "label": "말로 다 못할 정은 술 한 잔이면 된다. 마주 앉아 비워라.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 2
        }
      },
      {
        "key": "vow",
        "label": "작별이 아니라 약속을 하거라. 강호에서 다시 만나자고.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 1
          },
          "trust": 1
        }
      },
      {
        "key": "quiet",
        "label": "정든 사이일수록 말은 짧은 법이다. 등을 두드려 주는 것으로 족하다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-departure-17",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 이 검을 평생의 길로 삼겠다고 이제야 마음을 정했습니다. 흔들리지 않을 자신은... 아직 없지만요.",
    "options": [
      {
        "key": "bless",
        "label": "한 가지에 평생을 거는 것, 그것이 무인의 첫걸음이다. 잘 정했다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 3
        }
      },
      {
        "key": "doubt",
        "label": "흔들려도 괜찮다. 흔들리면서도 놓지 않는 것이 진짜 다짐이다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "test",
        "label": "말은 쉽다. 십 년 뒤에도 그 말을 할 수 있거든 그때 다시 오너라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-departure-18",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 정파에 적을 둘지 떠돌이로 자유로이 살지 정해야 한다 들었습니다. 한 곳에 매이는 것이 저는 영 갑갑합니다.",
    "options": [
      {
        "key": "free",
        "label": "매이지 않는 검도 검이다. 다만 외로움은 네가 감당해야 한다.",
        "effects": {
          "persona": {
            "freedom": 3
          },
          "trust": 1
        }
      },
      {
        "key": "belong",
        "label": "사람은 결국 무리 속에서 산다. 등을 맡길 곳 하나는 두거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "righteousness": 1
        }
      },
      {
        "key": "later",
        "label": "지금 정하지 않아도 된다. 길은 걷다 보면 저절로 갈린다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "prudence": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-departure-19",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "trustMax": -1
    },
    "body": "사부님, 솔직히 말씀드리겠습니다. 사부님이 제게 가르치지 않고 숨긴 것이 있지 않습니까. 떠나기 전에 진실을 알고 싶습니다.",
    "options": [
      {
        "key": "confess",
        "label": "... 그래. 네 말이 옳다. 앉거라. 이제는 말해줄 때가 됐구나.",
        "effects": {
          "persona": {
            "integrity": 1
          },
          "trust": 4
        }
      },
      {
        "key": "deflect",
        "label": "스승에게도 끝내 못할 말은 있는 법이다. 더 묻지 마라.",
        "effects": {
          "persona": {
            "prudence": 1
          },
          "trust": -2
        }
      },
      {
        "key": "rebuke",
        "label": "은혜를 의심으로 갚느냐. 그 말, 두 번은 듣지 않겠다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-departure-20",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "needsRival": true
    },
    "body": "사부님, {rival}는 늘 저보다 한 수 위였습니다. 하산해서도 그 그림자를 못 벗어날 것 같아 잠이 안 옵니다.",
    "options": [
      {
        "key": "own",
        "label": "남의 그림자를 좇는 검은 끝내 그림자에 머문다. 네 검을 찾아라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "freedom": 1
          },
          "trust": 2
        }
      },
      {
        "key": "fuel",
        "label": "앞선 자가 있다는 건 복이다. 그 등을 보고 달려라.",
        "effects": {
          "persona": {
            "ambition": 3
          }
        }
      },
      {
        "key": "soothe",
        "label": "재주의 빠르고 늦음은 강호에서 다 부질없다. 멀리 가는 건 다른 것이다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-departure-21",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "darknessRiskMin": "medium"
    },
    "body": "사부님, 검을 쥐고 적을 마주하면 마음이 끓기는커녕 외려 차게 가라앉습니다. 베어야 할 순간에 손이 망설이지 않습니다. 이것이... 정상입니까.",
    "options": [
      {
        "key": "anchor",
        "label": "그 차가움 위에 사람을 살리는 따뜻함을 얹어라. 그래야 검이 사람을 지킨다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "watch",
        "label": "재능이다. 허나 그 차가움이 너를 끌고 가지 않도록 늘 살펴라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "praise",
        "label": "타고난 검수의 그릇이다. 망설임 없는 손, 강호에선 그게 살길이다.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 1
          },
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-departure-22",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 강호에 나가면 마음 둘 사람도 생기겠지요. 한데 무인이 정에 매이면 검이 무뎌진다 들었습니다. 저는 어찌해야 합니까.",
    "options": [
      {
        "key": "love",
        "label": "지킬 사람이 있는 검이 더 무섭다. 정을 두려워 마라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 2
        }
      },
      {
        "key": "discern",
        "label": "정은 두되 분별을 잃지 마라. 사람을 보는 눈부터 길러라.",
        "effects": {
          "persona": {
            "prudence": 3
          }
        }
      },
      {
        "key": "solitude",
        "label": "검의 길은 본디 외롭다. 그 외로움을 견딜 자만 끝까지 간다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "freedom": 1,
            "warmth": -1
          }
        }
      }
    ]
  },
  {
    "id": "m-departure-23",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "isWeakest": true
    },
    "body": "사부님, 동문 중 제가 가장 뒤처진다는 걸 압니다. 이런 제가 강호에 나가 살아남을 수 있을까요. 솔직히 자신이 없습니다.",
    "options": [
      {
        "key": "encourage",
        "label": "늦게 핀 꽃이 가장 오래 간다. 너는 아직 피지 않았을 뿐이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "survive",
        "label": "강호는 가장 센 자가 아니라 가장 끈질긴 자가 살아남는 곳이다. 너는 끈질기다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "honest",
        "label": "약하면 약한 대로 몸을 사려라. 무리하지 않는 것도 무공이다.",
        "effects": {
          "persona": {
            "prudence": 3,
            "mercy": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-departure-24",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 저는 끝내 사부님을 넘어서고 싶습니다. 한데 그것이 은혜를 저버리는 일 같아 마음이 무겁습니다.",
    "options": [
      {
        "key": "bless",
        "label": "제자가 스승을 넘는 것, 그것이 스승의 가장 큰 영광이다. 마음껏 넘어서라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "ambition": 2
          },
          "trust": 4
        }
      },
      {
        "key": "remind",
        "label": "넘어서되 발밑은 잊지 마라. 네가 딛고 선 땅이 곧 나다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "humble",
        "label": "넘고 못 넘고가 무어 그리 중하냐. 부끄럽지 않게만 살거라.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 1
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-departure-25",
    "band": "departure",
    "when": {
      "ageMin": 15,
      "darknessRiskMin": "high"
    },
    "body": "사부님, 정파의 더딘 길로는 평생 저들을 못 따라잡습니다. 더 빠른 무공이라도 강해질 수 있다면, 그게 그리 나쁜 일입니까.",
    "options": [
      {
        "key": "forbid",
        "label": "그 길은 빠른 만큼 너를 갉아먹는다. 끝에 남는 건 강한 짐승 한 마리뿐이다. 절대 안 된다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "probe",
        "label": "무엇이 그리도 급하냐. 그 조급함부터 다스리지 못하면 어느 무공이든 너를 망친다.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "abandon",
        "label": "강해지는 게 그리 중하다면, 말리지 않으마. 다만 그 뒤의 너는 내 제자가 아니다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "mercy": -1
          },
          "trust": -2,
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-departure-26",
    "band": "departure",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 내일이면 떠납니다. 이 산문에서 보낸 세월이... 제게 무엇이었는지, 떠나기 전에 꼭 여쭙고 싶었습니다.",
    "options": [
      {
        "key": "warm",
        "label": "내겐 자식이었다. 그거면 다 말한 것이다. 잘 가거라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "lesson",
        "label": "이 산문은 네 뿌리다. 강호에서 길을 잃거든 여기서 배운 첫 마음을 떠올려라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "gruff",
        "label": "다 큰 녀석이 무슨 그런 말을 하느냐. ... 어서 가서 짐이나 챙겨라.",
        "effects": {
          "persona": {
            "warmth": 1
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-01",
    "band": "child",
    "disciple": "jang-cheol",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 어머니가 보내신 편지요. 글자를 잘 못 읽어서요... 같이 읽어주실래요? 형이 올해 농사 잘됐는지 그것만 알면 돼요.",
    "options": [
      {
        "key": "read-together",
        "label": "이리 오너라. 한 자씩 같이 짚어보자.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "teach-letters",
        "label": "그참에 글도 배우자. 무인도 글은 알아야 한다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "later",
        "label": "수련부터 마치거라. 편지는 도망가지 않는다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-02",
    "band": "child",
    "disciple": "jang-cheol",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 저 커서 큰 무인 안 돼도 돼요. 그냥 우리 마을 지키는 무인 되면 안 돼요? 도적 오면 막고요, 그러면 어머니도 형도 안 무섭잖아요.",
    "options": [
      {
        "key": "honor",
        "label": "지킬 것을 정한 무인이 가장 강하다. 좋은 꿈이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 2
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "small",
        "label": "작아 보여도 그 길에 협(俠)이 다 들었다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "righteousness": 1
        }
      },
      {
        "key": "push",
        "label": "마을 하나로 만족하려느냐. 더 큰 것을 꿈꾸거라.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-03",
    "band": "child",
    "disciple": "jang-cheol",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님, {rival}가 저더러 손이 굼뜨대요. 근데요... 틀린 말 아니에요. 저 진짜 느려요. 그래도 더 하면 나아지죠? 거짓말은 하지 마시고요.",
    "options": [
      {
        "key": "truth",
        "label": "느린 게다. 허나 느린 검이 끝까지 부러지지 않더라.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 1
          },
          "trust": 4
        }
      },
      {
        "key": "effort",
        "label": "재주는 못 따라가도 땀은 거짓말을 안 한다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 2
        }
      },
      {
        "key": "flatter",
        "label": "느리긴. 곧 누구든 따라잡을 게다.",
        "effects": {
          "persona": {
            "integrity": -2,
            "warmth": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-04",
    "band": "growth",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 고향에 가뭄이 들었답니다. 형이 혼자 논을 다 보느라 허리가 휜다고요. 저는 여기서 검만 쥐고 있는데... 이래도 되는 겁니까.",
    "options": [
      {
        "key": "duty-here",
        "label": "지금 검을 쥔 것이, 훗날 형을 지키는 손이 된다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "send-help",
        "label": "산문 곳간을 좀 헐자. 사람 사는 게 먼저다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 3
          },
          "trust": 4,
          "righteousness": 2
        }
      },
      {
        "key": "endure",
        "label": "마음을 끊어라. 흔들리는 자는 둘 다 못 지킨다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2,
            "prudence": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-05",
    "band": "growth",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 저는 암기도 못 던지고 약도 못 짓습니다. 잘하는 게 그냥... 버티고 막는 것뿐이에요. 이런 무인도 강호에서 쓸모가 있습니까.",
    "options": [
      {
        "key": "shield",
        "label": "누군가의 앞을 막아서는 것, 그것이 가장 귀한 무공이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 2
          },
          "trust": 4,
          "righteousness": 1
        }
      },
      {
        "key": "one-thing",
        "label": "한 가지를 끝까지 파라. 잡다한 열보다 낫다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "lacking",
        "label": "그래, 모자란 건 사실이다. 그러니 더 갈아야지.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-06",
    "band": "growth",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 진소화랑은 같은 마을에서 자랐잖아요. 걔가 요즘 무리해서 수련하는 것 같은데... 제가 한마디 해도 될까요? 괜한 참견일까 싶어서요.",
    "options": [
      {
        "key": "speak",
        "label": "한마을에서 온 정이다. 곁을 지켜주는 게 도리다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 3
        }
      },
      {
        "key": "watch",
        "label": "말보다 곁에 있어주거라. 그게 더 닿는다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "mind-self",
        "label": "남 걱정할 틈에 네 검이나 챙기거라.",
        "effects": {
          "persona": {
            "warmth": -2,
            "ambition": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-07",
    "band": "turmoil",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 50,
      "hasEnemy": true,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 그자가... 제 고향 마을을 들먹였습니다. 어머니가 어쩌고 형이 어쩌고. 그 순간 손이 먼저 나갈 뻔했습니다. 저, 제가 무서웠습니다.",
    "options": [
      {
        "key": "anchor",
        "label": "그 분노는 정당하다. 허나 검에 싣지 마라. 검이 너를 삼킨다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 2
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "protect-cold",
        "label": "가족을 입에 담았다면, 그땐 막는 게 협이다. 허나 먼저 손대진 마라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": -1
          },
          "trust": 2
        }
      },
      {
        "key": "unleash",
        "label": "그런 자는 한번 본때를 보여주는 것도 방법이지.",
        "effects": {
          "persona": {
            "freedom": 1,
            "mercy": -2
          },
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-08",
    "band": "turmoil",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "trustMax": 45,
      "needsRival": true
    },
    "body": "사부님. {rival}는 재능이 다르니까 봐주시는 거 압니다. 저 같은 둔재는 아무리 해도 거기까지 못 가겠지요. ...아닙니다. 그냥 해본 소리입니다.",
    "options": [
      {
        "key": "fair",
        "label": "둔재라니. 나는 네 손에 남은 굳은살을 매일 본다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": 2
          },
          "trust": 4
        }
      },
      {
        "key": "different-path",
        "label": "그 아이의 길과 네 길은 애초에 다르다. 비길 것이 아니다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "confirm",
        "label": "재능이 다른 건 사실이다. 받아들일 건 받아들여라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-09",
    "band": "departure",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 하산하면 저는 강호 누비는 협객 같은 건 안 합니다. 고향으로 돌아가서 마을 지키는 무인이 되렵니다. ...이게 사부님 가르침을 헛되게 하는 건 아니지요?",
    "options": [
      {
        "key": "bless-home",
        "label": "헛될 리가. 검은 결국 사람 사는 땅으로 돌아가는 게다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 2,
            "mercy": 1
          },
          "trust": 5,
          "righteousness": 2
        }
      },
      {
        "key": "proud",
        "label": "처음부터 흔들림 없는 너였다. 그 길로 가거라.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": 3
        }
      },
      {
        "key": "regret",
        "label": "그 재주로 산골에 묻히겠다고? 아깝구나.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jang-cheol-10",
    "band": "departure",
    "disciple": "jang-cheol",
    "when": {
      "ageMin": 15,
      "trustMin": 50
    },
    "body": "사부님. 떠나기 전에 이것만은 여쭙고 싶었습니다. 저는 끝내 큰 무인은 못 됐습니다. 그래도... 사부님은 저를 거둔 걸 후회하지 않으십니까.",
    "options": [
      {
        "key": "no-regret",
        "label": "큰 무인을 들이려 너를 거둔 게 아니다. 바른 사람을 보았다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 2,
            "mercy": 1
          },
          "trust": 5
        }
      },
      {
        "key": "best-pupil",
        "label": "재주로 치면 으뜸은 아니나, 믿음으로 치면 네가 으뜸이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": 2
          },
          "trust": 4
        }
      },
      {
        "key": "gruff",
        "label": "다 큰 녀석이 별 소릴 다 한다. 어서 짐이나 챙기거라.",
        "effects": {
          "persona": {
            "warmth": -1,
            "prudence": 1
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-01",
    "band": "child",
    "disciple": "jin-sohwa",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 마당 구석에 약초밭 한 뙈기만 일궈도 돼요? 집 약방에서 하던 것처럼요. 손이 자꾸 흙을 찾아요.",
    "options": [
      {
        "key": "grant",
        "label": "그래. 저 양지바른 자리를 쓰거라. 물은 네가 길어오너라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "later",
        "label": "수련부터 자리를 잡거든 그때 보자꾸나.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": -1
        }
      },
      {
        "key": "purpose",
        "label": "약초를 길러 무얼 하려느냐. 먼저 그 마음을 들어보자.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 1
          },
          "trust": 2
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-02",
    "band": "child",
    "disciple": "jin-sohwa",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 오늘 검 쥐는 법을 배웠는데요... 이걸로 사람을 베는 거라 했어요. 저는... 손이 자꾸 떨려서 못 쥐겠어요.",
    "options": [
      {
        "key": "respect",
        "label": "베지 못하는 손도 귀하다. 그 손으로 살리는 길을 찾자꾸나.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 4
        }
      },
      {
        "key": "duty",
        "label": "무인이라면 검은 익혀두어야 한다. 쥐는 것과 베는 것은 다르단다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": -1
        }
      },
      {
        "key": "gentle",
        "label": "오늘은 검을 내려놓아라. 떨리는 손을 억지로 펴진 마라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 3
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-03",
    "band": "child",
    "disciple": "jin-sohwa",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님! {rival}가 수련하다 무릎이 까졌는데 아프다 소리도 안 해요. 제가 약 발라줘도 돼요? 그냥 두면 곪을 거예요.",
    "options": [
      {
        "key": "allow",
        "label": "가서 돌보아라. 동문을 아끼는 마음, 그게 사문의 시작이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "selfcare",
        "label": "제 상처는 제가 챙기는 법도 배워야 한다. 약만 건네주거라.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "ignore",
        "label": "그만한 상처에 호들갑이냐. 수련이나 마저 하거라.",
        "effects": {
          "persona": {
            "warmth": -2,
            "mercy": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-04",
    "band": "growth",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 저는 강해지는 것보다... 사람 살리는 의원이 되고 싶어요. 사문 무공은 꼭 끝까지 익혀야 하나요?",
    "options": [
      {
        "key": "bless",
        "label": "의술도 무(武)다. 살리는 길로 가거라. 내가 길을 열어주마.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 4,
          "righteousness": 1
        }
      },
      {
        "key": "balance",
        "label": "살리려면 먼저 살아남아야 한다. 몸을 지킬 만큼은 익혀두어라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 2
        }
      },
      {
        "key": "push",
        "label": "의원 노릇은 강호에서 한가한 소리다. 무공부터 세워라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 1
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-05",
    "band": "growth",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}가 의뢰에서 손에 독을 묻혀 사람을 상하게 했대요. 그게... 사문이 시킨 일이라던데, 정말이에요? 그런 거라면 저는 견디기 힘들 것 같아요.",
    "options": [
      {
        "key": "truth",
        "label": "강호엔 그런 의뢰도 있다. 허나 네게는 그 길을 강요하지 않으마.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 3
        }
      },
      {
        "key": "soothe",
        "label": "{rival}도 좋아서 한 일은 아닐 게다. 너무 모질게 보지 마라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 2
        }
      },
      {
        "key": "harden",
        "label": "강호란 본디 그런 곳이다. 너도 언젠가 손에 피를 묻히게 된다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -2
          },
          "trust": -2,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-06",
    "band": "growth",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "seongMin": 3
    },
    "body": "사부님, 제가 만든 환약을 다친 동문들이 먹고 나았어요. 손이 떨릴 만큼 기뻤어요. 영약을 더 깊이 파보고 싶어요. 도와주실 수 있나요?",
    "options": [
      {
        "key": "support",
        "label": "좋다. 내 서가의 의서를 풀어주마. 마음껏 파고들거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "caution",
        "label": "영약은 곧 독과 한 끗 차다. 신중히, 한 걸음씩 가거라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 2
        }
      },
      {
        "key": "redirect",
        "label": "그 재주, 강호에 내다 팔면 큰돈이 된다. 잊지 마라.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 2
          },
          "trust": -1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-07",
    "band": "turmoil",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님... 의뢰에서 적의 부상자가 길에 쓰러져 있었습니다. 적인데도, 저는 그냥 지나칠 수가 없어서 약을 발라주고 왔습니다. 제가... 어리석은 짓을 한 건가요?",
    "options": [
      {
        "key": "praise",
        "label": "어리석지 않다. 적의 피라도 멎게 하는 손, 그것이 의(醫)다.",
        "effects": {
          "persona": {
            "mercy": 3
          },
          "trust": 4,
          "righteousness": 1
        }
      },
      {
        "key": "worry",
        "label": "그 자가 다시 칼을 들면 어쩌려느냐. 마음은 알겠으나 분별하거라.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "scold",
        "label": "적을 살려 보내다니. 그 마음이 언젠가 동문을 죽일 게다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-08",
    "band": "turmoil",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "needsRival": true
    },
    "body": "사부님. {rival}가 며칠째 약을 거부합니다. 상처가 곪아가는데도요. 제 손길을 밀쳐냅니다. 어떻게 해야 그 아이를 살릴 수 있을지 모르겠습니다.",
    "options": [
      {
        "key": "patient",
        "label": "병보다 마음을 먼저 열어야 할 때가 있다. 곁에 머무는 것부터 하거라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3
        }
      },
      {
        "key": "speak",
        "label": "내가 한번 그 아이와 이야기해보마. 너 혼자 짊어지지 마라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "letgo",
        "label": "제 몸 제가 망치겠다는 자는 어쩔 수 없다. 너무 매달리지 마라.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-09",
    "band": "departure",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 곧 하산입니다. 저는 강호의 협객보다... 어느 산골에 작은 의막을 열고 아픈 이들을 돌보며 살고 싶습니다. 그래도 사부님의 제자라 할 수 있을까요?",
    "options": [
      {
        "key": "proud",
        "label": "검을 든 협객만 협이더냐. 사람을 살리는 너야말로 내 자랑이다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 5,
          "righteousness": 1
        }
      },
      {
        "key": "remind",
        "label": "의막엔 도적도, 환자를 빌미 삼은 자도 든다. 몸 지킬 무는 잊지 마라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 2
        }
      },
      {
        "key": "lament",
        "label": "그 재주로 한낱 의막이라니. 더 큰 곳에서 이름을 떨칠 수도 있을 텐데.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-jin-sohwa-10",
    "band": "departure",
    "disciple": "jin-sohwa",
    "when": {
      "ageMin": 15,
      "stressMin": 60
    },
    "body": "사부님... 지난 의뢰에서 동문이 제 눈앞에서 칼에 쓰러지는 걸 보았습니다. 제가 아무리 손을 써도... 살릴 수 없었습니다. 저는 이런 강호를, 더는 못 견디겠습니다.",
    "options": [
      {
        "key": "grieve",
        "label": "다 막을 수는 없다. 그 슬픔을 부끄러워 마라. 네 곁에 내가 있다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 4
        }
      },
      {
        "key": "release",
        "label": "정 견디기 힘들거든, 칼 없는 길로 가도 좋다. 누구도 너를 탓하지 않으마.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": 1,
            "mercy": 1
          },
          "trust": 3
        }
      },
      {
        "key": "steel",
        "label": "의원이 매번 눈물 흘려서야 어찌 더 많은 이를 살리겠느냐. 마음을 다잡아라.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-han-baram-01",
    "band": "child",
    "disciple": "han-baram",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 여기 밥은 매일 나와요? ...정말로요? 길에선 사흘에 한 번도 못 먹었는데. 그럼 저, 도망 안 갈게요. 진짜로.",
    "options": [
      {
        "key": "warm",
        "label": "그래. 매일 나온다. 이제 굶을 일은 없다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "settle",
        "label": "도망갈 생각부터 했더냐. ...여기가 네 집이 될 게다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "stash",
        "label": "남길 만큼 챙겨두고 싶거든, 그래도 된다. (아이의 버릇을 모른 척한다)",
        "effects": {
          "persona": {
            "integrity": -1,
            "freedom": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-han-baram-02",
    "band": "child",
    "disciple": "han-baram",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 이 담은 제가 한 번에 타넘었어요! 봤죠? 지붕까지 갈 수 있어요. 가만히 앉아 있는 건 답답해서 싫어요.",
    "options": [
      {
        "key": "channel",
        "label": "발이 빠르구나. 그 재주, 보법으로 갈고닦으면 큰 무기가 된다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "ambition": 1
          },
          "trust": 3
        }
      },
      {
        "key": "rein",
        "label": "재주는 좋다만, 담을 넘기 전에 앉는 법부터 익혀야 한다.",
        "effects": {
          "persona": {
            "freedom": -1,
            "prudence": 2
          },
          "trust": -1
        }
      },
      {
        "key": "play",
        "label": "허허, 그래. 오늘은 마음껏 뛰어보거라.",
        "effects": {
          "persona": {
            "freedom": 2,
            "warmth": 2
          },
          "trust": 2
        }
      }
    ]
  },
  {
    "id": "m-han-baram-03",
    "band": "child",
    "disciple": "han-baram",
    "when": {
      "ageMax": 10
    },
    "body": "사부님... 옛날에 제가 진짜 배고팠을 때요, 어떤 형이 빵을 반 갈라줬어요. 이름도 몰라요. 근데 그게 아직도 안 잊혀져요. 왜 그럴까요?",
    "options": [
      {
        "key": "kindness",
        "label": "받은 정은 그렇게 오래 남는 법이다. 너도 언젠가 그리 갚으면 된다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "remember",
        "label": "잊지 않는 건 좋은 마음이다. 그 마음, 검을 잡아도 버리지 마라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 1
          },
          "trust": 2
        }
      },
      {
        "key": "dismiss",
        "label": "빵 한 조각에 마음 쓸 것 없다. 강호엔 그런 정이 흔치 않다.",
        "effects": {
          "persona": {
            "warmth": -2,
            "prudence": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-han-baram-04",
    "band": "growth",
    "disciple": "han-baram",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 솔직히 말할게요. 어제 장에서... 떨어진 엽전 몇 닢, 제가 주머니에 넣었어요. 임자가 없는 것 같았는데, 그게 잘못이에요?",
    "options": [
      {
        "key": "teach",
        "label": "임자 없어 보여도 남의 것이다. 다음엔 내게 먼저 말하거라.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 1,
          "righteousness": 1
        }
      },
      {
        "key": "understand",
        "label": "굶던 손은 먼저 움직이는 법이지. ...허나 이젠 굶지 않잖느냐.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "ignore",
        "label": "임자 없는 것을 주웠을 뿐이다. 마음 쓸 것 없다.",
        "effects": {
          "persona": {
            "integrity": -2,
            "freedom": 2
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-han-baram-05",
    "band": "growth",
    "disciple": "han-baram",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}는 좋겠어요. 돌아갈 집도 있고, 데리러 올 사람도 있고. 저는... 사문이 없어지면 또 길바닥이잖아요. 그래서 더 빨리 강해지고 싶어요. 혼자서도 안 무섭게.",
    "options": [
      {
        "key": "belong",
        "label": "사문은 없어지지 않는다. 그리고 너는 이미 혼자가 아니다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "strength",
        "label": "강해지고 싶은 그 마음, 옳다. 허나 급하면 길을 잘못 든다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "ambition": 2
          },
          "trust": 1
        }
      },
      {
        "key": "harden",
        "label": "그래. 누구에게도 기대지 마라. 제 힘만이 너를 지킨다.",
        "effects": {
          "persona": {
            "freedom": 2,
            "warmth": -2,
            "ambition": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-han-baram-06",
    "band": "turmoil",
    "disciple": "han-baram",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 정직하게 묻겠습니다. 청풍검은... 너무 더디게 오릅니다. 한데 떠도는 말로는, 결을 비틀면 반년 갈 길을 한 달에 간다더군요. 그 비급, 한 번만 봐서는 안 됩니까.",
    "options": [
      {
        "key": "forbid",
        "label": "그 길은 빠른 만큼 너를 갉아먹는다. 절대 안 된다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 1,
          "darkness": -1
        }
      },
      {
        "key": "probe",
        "label": "무엇이 그리 급하냐. ...길에서 살던 그 두려움이, 아직 가시질 않은 게냐.",
        "effects": {
          "persona": {
            "prudence": 2,
            "mercy": 1
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "allow",
        "label": "...정 보고 싶거든, 말리지는 않으마.",
        "effects": {
          "persona": {
            "freedom": 2
          },
          "trust": -1,
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-han-baram-07",
    "band": "turmoil",
    "disciple": "han-baram",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "사부님. ...저 자가 사문에 든 뒤로, 등 뒤가 자꾸 서늘합니다. 길에서 익힌 감(感)은 틀린 적이 없습니다. 저자는 언젠가 제게 칼을 들 겁니다. ...먼저 손쓰는 게 낫지 않겠습니까.",
    "options": [
      {
        "key": "restrain",
        "label": "감이 칼보다 앞서면, 죄 없는 피를 부른다. 먼저 손대는 건 안 된다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "watch",
        "label": "그 감, 묻어두지 마라. 다만 칼이 아니라 눈으로 살펴라. 내가 함께 보마.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 3
        }
      },
      {
        "key": "permit",
        "label": "살아남는 게 먼저라면... 네 판단을 믿으마.",
        "effects": {
          "persona": {
            "freedom": 1,
            "mercy": -2
          },
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-han-baram-08",
    "band": "turmoil",
    "disciple": "han-baram",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 60
    },
    "body": "사부님. 규율이 자꾸... 목을 조르는 것 같습니다. 아침 종, 저녁 점호, 정해진 자리. 답답해서 어젯밤엔 그냥 산을 넘어 사라질까 했습니다. 한데 발이 안 떨어지더군요. ...왜 안 떨어졌을까요.",
    "options": [
      {
        "key": "loosen",
        "label": "묶기만 해선 너 같은 아이는 못 키운다. 숨 쉴 틈은 내어주마.",
        "effects": {
          "persona": {
            "freedom": 2,
            "warmth": 1
          },
          "trust": 4
        }
      },
      {
        "key": "reason",
        "label": "발이 안 떨어진 까닭은, 네가 알고 있을 게다. 여기가 처음으로 네 자리가 된 것이지.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "discipline",
        "label": "답답하다고 달아나는 자는 강호에서 가장 먼저 죽는다. 견뎌라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "freedom": -2
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-han-baram-09",
    "band": "departure",
    "disciple": "han-baram",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 곧 하산입니다. ...이상하지요. 평생 길 위에서 살았는데, 막상 다시 길로 나선다 생각하니 처음으로 두렵습니다. 떠나는 게 아니라, 떠나야 한다는 게.",
    "options": [
      {
        "key": "home",
        "label": "이번엔 다르다. 길이 끝나면 돌아올 곳이 있으니. 여기는 늘 열려 있다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 5
        }
      },
      {
        "key": "free",
        "label": "두려움도 길의 일부다. 너는 누구보다 길을 잘 아는 아이가 아니냐.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "stoic",
        "label": "두렵거든 그 마음을 검에 실어라. 떠도는 자에겐 가벼운 발이 곧 목숨이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "ambition": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-han-baram-10",
    "band": "departure",
    "disciple": "han-baram",
    "when": {
      "ageMin": 15,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 솔직히 말씀드립니다. 강호에 나가면, 빠른 힘을 마다하지 않을 겁니다. 정파니 사파니 하는 선, 길 위에서 굶어본 자에겐 사치였으니까요. ...그래도, 사부님 가르침은 잊지 않겠습니다. 그 두 개가 부딪히면, 저는 어느 쪽을 들어야 합니까.",
    "options": [
      {
        "key": "line",
        "label": "빠른 힘이 너를 살릴 순 있어도, 너를 너로 남게 하진 못한다. 그 선만은 넘지 마라.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 1
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "bread",
        "label": "어느 쪽이 옳은지 모르겠거든, 그 빵 반 조각을 떠올려라. 그날의 너를 살린 건 힘이 아니었다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 4,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "release",
        "label": "...선택은 네 몫이다. 길 위에선, 살아남는 자가 옳은 법이니.",
        "effects": {
          "persona": {
            "freedom": 2,
            "mercy": -1
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-01",
    "band": "child",
    "disciple": "yun-soso",
    "when": {
      "ageMax": 10
    },
    "body": "사부님. 양반가 막내딸로 곱게만 자랐는데, 정말로 제가 검을 든 검객이 될 수 있을까요? 어머니는 시집갈 자세나 익히라 하셨어요. 그래도 저는... 검이 좋아요.",
    "options": [
      {
        "key": "able",
        "label": "곧은 등이면 곧은 검을 든다. 너는 이미 자세가 검객이다.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": 3
        }
      },
      {
        "key": "ground",
        "label": "양반가 예법, 버리지 마라. 그 단정함이 네 검의 결이 될 게다.",
        "effects": {
          "persona": {
            "prudence": 2
          }
        }
      },
      {
        "key": "doubt",
        "label": "검은 곱게 자란 손엔 무겁다. 견딜 수 있겠느냐.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-02",
    "band": "child",
    "disciple": "yun-soso",
    "when": {
      "ageMax": 10
    },
    "body": "사부님! 저잣거리에서 큰 애가 작은 애 떡을 뺏는 걸 봤어요. 제가 따져서 도로 받아줬는데... 그 애가 저더러 양반가 계집애가 별일 다 한다고 비웃었어요. 제가 잘못한 거예요?",
    "options": [
      {
        "key": "right",
        "label": "잘못이라니. 불의를 보고 따진 것은 협의 첫걸음이다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "mercy": 1
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "careful",
        "label": "옳은 일이었다. 단 힘 없이 따지다 다칠 수도 있다. 다음엔 내게도 알리거라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "mind",
        "label": "남 일에 일일이 나서면 네 검만 무뎌진다. 한 발 물러서는 법도 배워라.",
        "effects": {
          "persona": {
            "integrity": -1,
            "freedom": 1
          },
          "trust": -2,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-03",
    "band": "child",
    "disciple": "yun-soso",
    "when": {
      "ageMax": 10
    },
    "body": "사부님... 이 비단 주머니요? 어, 어머니가 주신 거예요. 부적 같은 거예요. 안에 든 건... 그냥 제 거예요. 묻지 말아 주세요. 네?",
    "options": [
      {
        "key": "wait",
        "label": "그래. 말하고 싶을 때 말하거라. 사부는 기다리는 사람이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 4
        }
      },
      {
        "key": "gentle",
        "label": "소중한 것이로구나. 잘 간직하거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 1
          },
          "trust": 2
        }
      },
      {
        "key": "press",
        "label": "거짓을 입에 올릴 땐 손이 떨리는 법이다. 무엇을 숨기느냐.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-04",
    "band": "growth",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 가문에서 또 편지가 왔어요. 시집 자리가 정해졌으니 돌아오라고요. 저는 안 가요. 절대요. ...그런데 자꾸 어머니 글씨를 보면 마음이 흔들려요. 제가 불효하는 거예요?",
    "options": [
      {
        "key": "ownpath",
        "label": "제 길을 제 발로 정하는 것을 불효라 하지 않는다. 단 어머니께 답장은 올려라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "freedom": 2
          },
          "trust": 3
        }
      },
      {
        "key": "duty",
        "label": "가문의 뜻도 무게가 있다. 흔들리는 그 마음, 가벼이 여기지 마라.",
        "effects": {
          "persona": {
            "freedom": -1,
            "prudence": 2
          },
          "trust": 1
        }
      },
      {
        "key": "iwrite",
        "label": "내가 가문에 글을 보내마. 이 아이는 무명산이 거둔다고.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 4
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-05",
    "band": "growth",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 저는 언젠가 정파의 맹주가 될 거예요. 강호의 무인들이 다 우러러보는 사람이요. 웃지 마세요. 진심이에요. ...그러려면 무엇부터 갖춰야 해요?",
    "options": [
      {
        "key": "virtue",
        "label": "맹주는 검이 아니라 덕으로 선다. 사람부터 품을 줄 알아라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 2,
          "righteousness": 2
        }
      },
      {
        "key": "feed",
        "label": "좋다. 그 야망, 부끄러워 마라. 정점은 그것을 입에 올린 자의 것이다.",
        "effects": {
          "persona": {
            "ambition": 3
          }
        }
      },
      {
        "key": "sober",
        "label": "높은 자리는 외롭고, 그 길은 적이 많다. 각오부터 다져라.",
        "effects": {
          "persona": {
            "prudence": 2,
            "ambition": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-06",
    "band": "growth",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "hasEnemy": true
    },
    "body": "사부님. ...사문에 저랑 또래인 동문이요. 딱히 잘못한 건 없어요. 정말 없는데... 그 애만 보면 가슴이 차갑게 굳어요. 검은 단발, 가냘픈 어깨, 차가운 눈... 제가 이상한 거죠? 그냥 제가 이상한 거예요.",
    "options": [
      {
        "key": "look",
        "label": "사람을 까닭 없이 미워하진 않는 법이다. 그 아이를 보면 무엇이 떠오르느냐.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "fair",
        "label": "잘못이 없다면 미움도 거두어라. 그것이 양반가가 가르친 공정함이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 1,
          "righteousness": 1
        }
      },
      {
        "key": "leave",
        "label": "마음이 그러하면 멀리 두어라. 굳이 곁에 둘 것 없다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": -1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-07",
    "band": "turmoil",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님. 이제 말씀드릴게요. 제가 사문에 온 진짜 이유요. 다섯 해 전, 우리 집 노비 형이 살수의 칼에 죽었어요. 매일 제 머리를 묶어주던 형이었어요. 어린 살수였어요, 제 또래의. ...저는 그 살수를 잡으려고 검을 들었어요. 복수하려는 이 마음이, 잘못된 거예요?",
    "options": [
      {
        "key": "justice",
        "label": "잃은 자를 위한 마음은 옳다. 단 복수가 아니라 정의로 가거라. 그 둘은 끝이 다르다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 4,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "child",
        "label": "그 어린 살수도 누군가의 명을 받은 아이였을 게다. 칼 든 손만 보지 말고 그 등 뒤를 보아라.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": 3
          },
          "trust": 2,
          "darkness": -1
        }
      },
      {
        "key": "yourway",
        "label": "네 길은 네가 가라. 단 그 길 끝에 후회만 남거든, 그땐 검을 탓하지 마라.",
        "effects": {
          "persona": {
            "freedom": 2
          },
          "trust": 1
        }
      },
      {
        "key": "fuel",
        "label": "잊지 마라. 그 분노가 네 검을 가장 빨리 벼릴 게다.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 2
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-08",
    "band": "turmoil",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 솔직히 말씀드릴게요. 정통 검법으론 너무 느려요. 그 자를 베려면... 더 빠른 검이 필요해요. 암기든 살수의 보법이든, 그자를 잡는 데 쓸 수만 있다면요. 저, 그 길을 좀 봐도 될까요.",
    "options": [
      {
        "key": "forbid",
        "label": "안 된다. 살수의 검으로 살수를 잡으면, 베는 순간 네가 그자가 된다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 1
          },
          "trust": 1,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "probe",
        "label": "그리 급할 일이 무어냐. ...요즘 네 잠자리가 편치 않아 보이는구나. 말해보아라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "clean",
        "label": "정통 검이 느린 게 아니라, 네 조급함이 느린 게다. 곧은 검 하나면 족하다.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "allow",
        "label": "정 원한다면 막지 않으마. 쓸 만한 비급 하나 내어주랴.",
        "effects": {
          "persona": {
            "freedom": 2,
            "mercy": -1
          },
          "trust": -1,
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-09",
    "band": "departure",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 15
    },
    "body": "사부님. 하산하면 살수조직 토벌에 나설 거예요. 정파의 검녀로서요. ...그런데 두려운 게 있어요. 그자들을 베다 보면, 제가 정의로 베는 건지 복수로 베는 건지 저도 분간 못 하게 될까 봐요. 그 둘을 어떻게 가르죠?",
    "options": [
      {
        "key": "compass",
        "label": "검을 거두는 순간을 보아라. 멈출 줄 알면 정의요, 멈추지 못하면 복수다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 2,
            "mercy": 1
          },
          "trust": 4,
          "righteousness": 2
        }
      },
      {
        "key": "mercybar",
        "label": "살릴 수 있는 자를 살리거든, 그것이 네가 협의 길에 선 증거다.",
        "effects": {
          "persona": {
            "mercy": 3
          },
          "trust": 3,
          "righteousness": 2
        }
      },
      {
        "key": "trustself",
        "label": "네 강직함을 믿어라. 그 곧은 등이 너를 어둠으로 끌려가게 두진 않을 게다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 2
        }
      }
    ]
  },
  {
    "id": "m-yun-soso-10",
    "band": "departure",
    "disciple": "yun-soso",
    "when": {
      "ageMin": 15
    },
    "body": "사부님. ...이 비단 주머니, 이제 산에 묻으려고요. 다섯 해 넘게 허리에 매고 살았는데, 어느 날 문득 생각했어요. 죽은 사람은 돌아오지 않는데, 제 평생을 복수에 매다는 게 그 형이 바라던 일일까. ...제 결심이, 형을 저버리는 걸까요?",
    "options": [
      {
        "key": "release",
        "label": "잊는 것이 아니라 보내주는 것이다. 산 자가 살아가는 것이, 죽은 자에 대한 가장 깊은 예다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 4,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "grown",
        "label": "복수를 내려놓는 데엔 검을 드는 것보다 더 큰 용기가 든다. 너는 다 컸구나.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 1,
            "mercy": 1
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "yours",
        "label": "묻든 매든, 그건 네 마음이 정할 일이다. 사부는 어느 쪽이든 곁에 있으마.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": 2
          },
          "trust": 2
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-01",
    "band": "child",
    "disciple": "gang-muyeol",
    "when": {
      "ageMax": 10
    },
    "body": "사부님! 봉 잡는 법, 형아들이 가르쳐준 거랑 사부님 거랑 달라요. 누구 게 맞아요? 저 틀리게 배운 거예요?",
    "options": [
      {
        "key": "both",
        "label": "둘 다 맞다. 형의 봉은 형의 것, 내 봉은 내 것. 너는 네 봉을 찾아라.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "mine",
        "label": "이 산문에선 내 법을 따르거라. 어긋난 것은 내가 잡아주마.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": 1
        }
      },
      {
        "key": "scold",
        "label": "집에서 배운 버릇부터 버려라. 그래야 새로 채운다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-02",
    "band": "child",
    "disciple": "gang-muyeol",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 우리 강씨 무관은요, 강북에서 알아주는 집이래요! 저도 커서 부끄럽지 않은 무관이 될 거예요. 약속!",
    "options": [
      {
        "key": "deed",
        "label": "이름이 무관을 만드는 게 아니라, 무관이 이름을 만드는 게다. 거꾸로 알지 마라.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 1
          },
          "trust": 1,
          "righteousness": 1
        }
      },
      {
        "key": "warm",
        "label": "그래, 약속이다. 그 마음만 지키면 넌 벌써 부끄럽지 않다.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "ambition",
        "label": "강북에서 알아주는 정도로 되겠느냐. 강호 전체가 네 이름을 알게 하거라.",
        "effects": {
          "persona": {
            "ambition": 3
          }
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-03",
    "band": "child",
    "disciple": "gang-muyeol",
    "when": {
      "ageMax": 10,
      "hasEnemy": true
    },
    "body": "사부님... 저쪽 동문은 왜 저만 보면 눈을 그렇게 떠요? 저 아무 짓도 안 했는데요. 제가 뭘 잘못했어요?",
    "options": [
      {
        "key": "patient",
        "label": "사람의 마음엔 네가 모르는 사연이 있을 수 있다. 먼저 다가가 보거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 2
        }
      },
      {
        "key": "observe",
        "label": "잘못한 게 없다면 떳떳하면 된다. 다만 그 눈빛은 마음에 담아두어라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          }
        }
      },
      {
        "key": "dismiss",
        "label": "어린 일에 일일이 마음 쓰지 마라. 네 수련이나 챙겨라.",
        "effects": {
          "persona": {
            "warmth": -1,
            "ambition": 1
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-04",
    "band": "growth",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 봉은 검보다 한 수 아래라고들 합니다. 형들도 결국 검을 잡았고요. 저도 검으로 바꿔야 하는 건 아닐까요?",
    "options": [
      {
        "key": "depth",
        "label": "병기에 위아래는 없다. 끝까지 판 자만이 그 답을 안다. 네 봉을 끝까지 파라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "shield",
        "label": "봉은 지키는 병기다. 동료를 지키려는 자에게 그보다 맞는 게 없다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 1,
          "righteousness": 1
        }
      },
      {
        "key": "free",
        "label": "마음이 검에 가 있다면 검을 잡아라. 손이 가는 곳에 길이 있다.",
        "effects": {
          "persona": {
            "freedom": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-05",
    "band": "growth",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}가 규율을 또 어겼는데 아무도 말을 안 해요. 사문엔 법도가 있어야 하잖아요. 제가 따져도 될까요?",
    "options": [
      {
        "key": "lead",
        "label": "옳다. 허나 따지기 전에 네가 먼저 본을 보여라. 그래야 말에 힘이 선다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "soften",
        "label": "법도도 사람을 위한 것이다. 몰아세우기 전에 그 까닭부터 물어보거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          }
        }
      },
      {
        "key": "rigid",
        "label": "어긴 자는 어긴 만큼 대가를 치러야 한다. 네 말이 맞다, 가서 따져라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": -2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-06",
    "band": "turmoil",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님, 큰형에게서 서신이 왔습니다. 무관 사정이 어렵다고... 제게 어서 이름을 세워 가문을 도우라 적혀 있었습니다. 마음이 무겁습니다.",
    "options": [
      {
        "key": "ground",
        "label": "가문의 짐을 어린 어깨에 다 지지 마라. 너는 우선 너를 세워라.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "duty",
        "label": "형의 말이 무겁거든, 그 무게로 검을 갈아라. 책임은 무인을 키운다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          }
        }
      },
      {
        "key": "haste",
        "label": "가문이 그리 급하다면, 빠른 길을 마다할 것 없다. 이름은 빨리 세울수록 좋다.",
        "effects": {
          "persona": {
            "prudence": -2,
            "ambition": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-07",
    "band": "turmoil",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "사부님, 더는 못 참겠습니다. 그 동문이 자다 깨서 '네 가문이 무슨 짓을 했는지 아느냐'고 했습니다. 우리 강씨가 무슨 짓을 했단 말입니까? 저는 정말 모릅니다.",
    "options": [
      {
        "key": "hold",
        "label": "지금은 묻지 말고 기다려라. 진실은 캘 때가 따로 있는 법이다. 내가 살펴보마.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 3
        }
      },
      {
        "key": "calm",
        "label": "분을 칼끝에 싣지 마라. 모르는 죄로 동문을 베면 네가 진짜 죄인이 된다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "confront",
        "label": "당장 가서 사내답게 따져 물어라. 묵혀둘수록 화는 곪는다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "freedom": 1,
            "prudence": -2
          },
          "trust": -1
        }
      },
      {
        "key": "demand",
        "label": "그런 모욕을 듣고 가만히 있으란 말이냐. 가문의 이름은 네가 지켜라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-08",
    "band": "turmoil",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "isWeakest": true
    },
    "body": "사부님... 동문들은 다 저만치 가는데 저만 제자리입니다. 봉 하나에 매달린 게 미련했던 걸까요. 형들 얼굴 볼 면목이 없습니다.",
    "options": [
      {
        "key": "steady",
        "label": "느린 걸음이 끝까지 간다. 너는 무너지지 않는 자다. 그게 네 재능이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "embrace",
        "label": "면목 따위 잊어라. 네가 살아 봉을 쥐고 있으면 그것으로 충분하다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4
        }
      },
      {
        "key": "push",
        "label": "그 분함이 옳다. 자리에 머문 자는 분해야 한다. 더 갈아라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "ambition": 2
          }
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-09",
    "band": "departure",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 15,
      "hasEnemy": true
    },
    "body": "사부님, 하산하면 강씨 무관으로 돌아가 형들을 도울 생각이었습니다. 한데 그 동문의 눈빛이... 제 발목을 잡습니다. 가문에 제가 모르는 무엇이 있는 겁니까. 떠나기 전에 알아야겠습니다.",
    "options": [
      {
        "key": "truth",
        "label": "(오래 침묵한다) ...언젠가 마주할 일이다. 다만 진실을 알거든, 검보다 마음을 먼저 다스려라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 3
          },
          "trust": 3
        }
      },
      {
        "key": "compassion",
        "label": "무엇을 알게 되든 그 동문도 한 사람이다. 원한의 뿌리는 네가 끊을 수도 있다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "deflect",
        "label": "지나간 일에 매이지 마라. 네 앞길이나 보거라.",
        "effects": {
          "persona": {
            "warmth": -1
          },
          "trust": -2
        }
      },
      {
        "key": "honor",
        "label": "무엇이 있든 강씨의 이름은 강씨가 책임진다. 떳떳이 돌아가 가문을 세워라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-gang-muyeol-10",
    "band": "departure",
    "disciple": "gang-muyeol",
    "when": {
      "ageMin": 15
    },
    "body": "사부님, 강호에서 정파의 이름으로 협을 행하다 보면, 언젠가 제 가문이 부끄러워질 일을 만날 수도 있겠지요. 그날이 오면... 저는 가문과 협, 무엇을 택해야 합니까.",
    "options": [
      {
        "key": "righteous",
        "label": "협이 먼저다. 그릇된 가문을 바로 세우는 것도 협이니라. 그것이 진짜 효(孝)다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "mercy": 1
          },
          "trust": 2,
          "righteousness": 2
        }
      },
      {
        "key": "balance",
        "label": "그날이 오기 전엔 답하지 마라. 다만 사람을 해치지 않는 쪽으로 기울여라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "blood",
        "label": "피는 물보다 진하다. 가문을 등지는 무인에게 강호도 등을 보인다.",
        "effects": {
          "persona": {
            "freedom": -1,
            "ambition": 1
          },
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-01",
    "band": "child",
    "disciple": "i-cheongha",
    "when": {
      "ageMax": 10
    },
    "body": "(문이 삐걱이자 손이 허리춤으로 갔다가 멈춘다) ...죄송합니다. 누가 들어오는 줄 알고. 사부님, 등 뒤에 사람이 서 있으면... 가만히 못 있겠어요.",
    "options": [
      {
        "key": "safe",
        "label": "여기선 등 뒤를 지킬 자가 나다. 손을 내려놓거라.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "name",
        "label": "삐걱인 건 바람이다. 바람과 적을 구별하는 것부터 배우자.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "useful",
        "label": "그 빠른 손, 강호에선 쓸 데가 있을 게다.",
        "effects": {
          "persona": {
            "mercy": -1,
            "ambition": 1
          },
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-02",
    "band": "child",
    "disciple": "i-cheongha",
    "when": {
      "ageMax": 10,
      "trustMax": 30
    },
    "body": "사부님은... 왜 저한테 잘해주세요? 사람이 잘해주면, 나중에 꼭 뭔가를 시켜요. 더 무서운 걸요. 저 알아요.",
    "options": [
      {
        "key": "nothing",
        "label": "나는 네게 시킬 것이 없다. 그저 네가 밥을 먹고 자는 걸 보고 싶을 뿐이다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "patient",
        "label": "믿으라 하지 않으마. 시간이 알려줄 게다.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "transaction",
        "label": "잘해주는 만큼 너도 갚으면 된다. 그게 셈이지.",
        "effects": {
          "persona": {
            "warmth": -2,
            "ambition": 1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-03",
    "band": "child",
    "disciple": "i-cheongha",
    "when": {
      "ageMax": 10
    },
    "body": "사부님... 제 진짜 이름이 뭐였는지 기억이 안 나요. 거기선 다들 저를 번호로 불렀어요. 저한테도... 어머니가 있었을까요?",
    "options": [
      {
        "key": "newname",
        "label": "오늘부터 너는 청하다. 맑을 청, 노을 하. 내가 지어 주마.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 5,
          "darkness": -1
        }
      },
      {
        "key": "honest",
        "label": "있었을 게다. 너를 잃고 지금도 어딘가서 울고 있을 게다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 2
        }
      },
      {
        "key": "forward",
        "label": "지난 이름은 잊어라. 뒤를 보는 칼은 베이는 법이다.",
        "effects": {
          "persona": {
            "freedom": -1,
            "prudence": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-04",
    "band": "growth",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "(품속을 자꾸 만지작거린다) 사부님, 사람을 한 번 해친 손은... 깨끗해질 수 있습니까. 아무리 씻어도 손바닥에 그게 묻어 있는 것 같습니다.",
    "options": [
      {
        "key": "wash",
        "label": "손은 씻어지지 않는다. 허나 그 손으로 다른 이를 살리면, 그것이 씻음이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 3
          },
          "trust": 3,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "guilt",
        "label": "묻어 있다 느끼는 그 마음이, 네가 그들과 다른 증거다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 2
        }
      },
      {
        "key": "numb",
        "label": "곧 무뎌진다. 무인의 손이란 본래 그런 것이다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -2
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-05",
    "band": "growth",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "needsRival": true
    },
    "body": "사부님, {rival}는 자꾸 제 옆에 와서 웃어요. 친해지자고요. ...그게 더 무서워요. 가까운 사람일수록 등을 보이게 되고, 등을 보이면 죽으니까요.",
    "options": [
      {
        "key": "trust",
        "label": "여기선 가까운 자가 너를 살린다. {rival}의 손은 칼이 아니라 손이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "try",
        "label": "한 번만 등을 보여 보거라. 아무 일도 없을 게다. 약속하마.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 3
        }
      },
      {
        "key": "guard",
        "label": "경계를 풀라 강요하진 않으마. 네 속도로 가거라.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-06",
    "band": "turmoil",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "(목소리가 낮게 가라앉는다) 사부님. 요즘 누군가 저를 자꾸 지켜봅니다. 시선이 차갑습니다. ...이런 시선엔 한 가지 뜻밖에 없었습니다, 거기선. 먼저 손을 쓰지 않으면 당하는. 제 손이 자꾸 그 버릇으로 돌아가려 합니다.",
    "options": [
      {
        "key": "stop",
        "label": "그 손, 거두어라. 시선이 곧 칼은 아니다. 여긴 그렇게 사는 곳이 아니다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "mercy": 1
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 2
        }
      },
      {
        "key": "shield",
        "label": "누가 너를 보거든, 내게 말하거라. 그 시선은 내가 먼저 받아서마.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "instinct",
        "label": "...네 손이 그리 말하거든, 그 버릇을 믿어도 된다. 살아남는 게 먼저다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "mercy": -3
          },
          "trust": -2,
          "darkness": 1,
          "righteousness": -3
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-07",
    "band": "turmoil",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "(품에서 작은 옥패를 꺼내 손에 쥔다) 사부님... 이건 제가 처음 손에 피를 묻혔을 때, 그 사람 것이었습니다. 버려야 하는데, 버리면 그 사람이 아주 없던 일이 될 것 같아서. ...전 왜 이걸 못 버립니까.",
    "options": [
      {
        "key": "keep",
        "label": "버리지 마라. 그 무게를 지고 가는 것이, 네가 갚는 방식이다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 3
          },
          "trust": 4,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "bury",
        "label": "함께 묻어 주자꾸나. 잊는 게 아니라, 보내 주는 것이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "discard",
        "label": "죽은 자에게 마음 쓸 것 없다. 미련은 검을 무디게 한다.",
        "effects": {
          "persona": {
            "prudence": 1,
            "mercy": -2
          },
          "trust": -2,
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-08",
    "band": "turmoil",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "high"
    },
    "body": "(눈빛이 평소와 다르다) 사부님, 의뢰에서 손을 쓸 때... 그 순간만큼은 아무 생각이 없어서 편합니다. 죄책감도, 무서움도. 차라리 그 상태로 사는 게 낫지 않습니까. 마음이 없으면 아프지도 않으니까요.",
    "options": [
      {
        "key": "anchor",
        "label": "그 편함이 너를 잡아먹는다. 아픈 게 살아 있는 것이다. 돌아와라, 청하.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 2
          },
          "trust": 3,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "watch",
        "label": "오늘 밤은 내 곁에서 자거라. 혼자 두지 않으마.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "abandon",
        "label": "마음이 짐이거든, 내려놓아도 좋다. 강호는 그런 자를 더 쓴다.",
        "effects": {
          "persona": {
            "mercy": -3,
            "ambition": 1
          },
          "trust": -3,
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-09",
    "band": "departure",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 15
    },
    "body": "곧 하산입니다. 사부님... 저들이 절 다시 찾아올 겁니다. 도망친 칼은 끝까지 쫓는 법이니까요. 강호에 나가는 순간, 다시 그 손으로 돌아가게 될까 두렵습니다.",
    "options": [
      {
        "key": "choose",
        "label": "쫓겨도 너는 이제 네가 벨 자를 네가 고른다. 그것이 도망친 칼과 다른 점이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "freedom": 1
          },
          "trust": 3,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "return",
        "label": "쫓기거든 돌아오너라. 이 산문은 늘 네 뒤를 지킨다.",
        "effects": {
          "persona": {
            "warmth": 3
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "harden",
        "label": "쫓아오거든 베어라. 이번엔 명령이 아니라 네 목숨을 위해서다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-i-cheongha-10",
    "band": "departure",
    "disciple": "i-cheongha",
    "when": {
      "ageMin": 15,
      "trustMin": 60
    },
    "body": "사부님. 거기선 누가 절 거두면, 다 갚고 나면 버려졌습니다. 한데 사부님은... 제게 아무것도 안 시키셨습니다. 끝까지요. 떠나기 전에, 한 번은 여쭙고 싶었습니다. 왜 저 같은 걸 거두셨습니까.",
    "options": [
      {
        "key": "worth",
        "label": "버려진 것이 아니라 길을 잃었을 뿐인 아이였으니까. 너는 거둘 값어치가 있었다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 2
          },
          "trust": 5,
          "darkness": -1
        }
      },
      {
        "key": "father",
        "label": "이유는 없다. 그저... 네가 내 제자였으면 했다. 그뿐이다.",
        "effects": {
          "persona": {
            "warmth": 2
          },
          "trust": 4
        }
      },
      {
        "key": "gruff",
        "label": "쓸 만해 보여서다. ...라고 하면 믿겠느냐. (희미하게 웃는다)",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": 1
          },
          "trust": 2
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-01",
    "band": "child",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMax": 10
    },
    "body": "사부님. 이 깨진 옥패의 나머지 반쪽... 제가 꼭 찾아야 해요. 어머니가 마지막으로 제 손에 쥐여준 거예요. 어디서 찾을 수 있는지 알려주세요.",
    "options": [
      {
        "key": "vow",
        "label": "언젠가 네 손으로 찾을 게다. 그때까지 그 반쪽은 내가 함께 지켜주마.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": 2
          },
          "trust": 4
        }
      },
      {
        "key": "steady",
        "label": "급히 찾으면 잃기 쉽다. 먼저 검을 세우고, 그 다음 길을 보거라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 1
        }
      },
      {
        "key": "cold",
        "label": "잃은 것을 좇는 자는 잃은 것에 묶인다. 그 패는 잊는 편이 낫다.",
        "effects": {
          "persona": {
            "warmth": -2,
            "prudence": 1
          },
          "trust": -3
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-02",
    "band": "child",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMax": 10
    },
    "body": "사부님. 다른 아이들은 자다가 무서우면 운다는데... 저는 안 울어요. 우는 건 약한 거잖아요. 저는 약하면 안 돼요. 그렇죠?",
    "options": [
      {
        "key": "allow",
        "label": "어린아이가 우는 것은 약함이 아니다. 울고 나면 내일 검을 더 곧게 쥘 수 있느니라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 4
        }
      },
      {
        "key": "endure",
        "label": "참는 법을 일찍 익혔구나. 허나 혼자 다 짊어지지는 마라.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "harden",
        "label": "그래. 무인은 눈물을 안으로 삼키는 법이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -2
          }
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-03",
    "band": "child",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님. {rival}랑 다른 애들은 자꾸 같이 놀자고 해요. 근데 저는... 친해지기 싫어요. 정들면, 또 잃으면, 아프니까요. 안 친해져도 되죠?",
    "options": [
      {
        "key": "gentle",
        "label": "잃는 것이 무서워 곁을 비우면, 가장 외로운 자가 된다. 천천히, 한 사람부터.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 2
          },
          "trust": 3
        }
      },
      {
        "key": "respect",
        "label": "마음의 문은 네 손으로 여는 것이다. 억지로 열라 하지 않으마.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "alone",
        "label": "검객의 길은 본디 외롭다. 곁을 비워두는 것도 한 방편이니라.",
        "effects": {
          "persona": {
            "warmth": -1,
            "prudence": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-04",
    "band": "growth",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님. 독고세가 검법 초식 몇 줄이 어렴풋이 떠올랐습니다. 가전 검법을 복원하고 싶습니다. 끊어진 가문의 검을, 제가 다시 잇겠습니다. 도와주십시오.",
    "options": [
      {
        "key": "restore",
        "label": "좋다. 끊어진 결을 잇는 것은 명예로운 길이다. 옛 검보를 함께 더듬어보자.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 4,
          "righteousness": 1
        }
      },
      {
        "key": "balance",
        "label": "가전의 검만 좇지 마라. 정도의 검을 함께 익혀야 그 검이 비뚤어지지 않는다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "righteousness": 1
        }
      },
      {
        "key": "warn",
        "label": "그 검을 어디에 쓰려느냐. 잇는 것이 목적이냐, 갚는 것이 목적이냐.",
        "effects": {
          "persona": {
            "prudence": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-05",
    "band": "growth",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 10,
      "ageMax": 12,
      "hasEnemy": true
    },
    "body": "사부님. 그 아이... 강북의 무관 집안이라 들었습니다. 강씨 무관이라고요. 혹시 그 무관에 대해 아시는 게 있으십니까. 그냥... 궁금해서 여쭙는 겁니다.",
    "options": [
      {
        "key": "probe",
        "label": "그저 궁금한 눈이 아니구나. 무엇을 짚고 있는 게냐. 내게 와서 말하거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "caution",
        "label": "확인되지 않은 것으로 동문을 재단하지 마라. 의심은 검보다 먼저 사람을 벤다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "evade",
        "label": "강호의 무관이 한둘이더냐. 네가 알 바 아니다. 수련에나 힘써라.",
        "effects": {
          "persona": {
            "warmth": -1
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-06",
    "band": "turmoil",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "사부님. 멸문하던 날 새벽, 아버지가 누군가에게 \"강씨 무관에 말해놓았소\"라고 하시던 게... 이제야 또렷이 떠오릅니다. 6세의 기억이라 확신은 못 합니다. 허나 그 이름이 가까이 있습니다. 제가 어떻게 해야 합니까.",
    "options": [
      {
        "key": "truth",
        "label": "기억은 흐려도 갈 길은 분명하다. 진실은 칼이 아니라 증거로 캐는 것이다. 그 길을 함께 가자.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 2
          },
          "trust": 4,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "restrain",
        "label": "확신 없는 칼은 죄 없는 자를 벨 수 있다. 손을 거두고, 먼저 사실을 가려라.",
        "effects": {
          "persona": {
            "prudence": 3,
            "mercy": 1
          },
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "silence",
        "label": "(말없이 그 어깨에 손을 얹는다) ... 무겁겠구나. 그 무게, 나도 함께 지마.",
        "effects": {
          "persona": {
            "warmth": 2,
            "mercy": 1
          },
          "trust": 5
        }
      },
      {
        "key": "stoke",
        "label": "그 이름을 잊지 마라. 검이 닿는 날, 망설이지도 마라.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-07",
    "band": "turmoil",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "darknessRiskMin": "medium"
    },
    "body": "사부님. 정도의 검은 너무 느립니다. 복수를 이루기 전에 제가 늙어 죽을 것 같습니다. 더 빨리, 더 독하게 베는 검결이 있다 들었습니다. 가문의 검을 등지는 건 아닙니다. 그저... 더 빠른 길일 뿐입니다.",
    "options": [
      {
        "key": "forbid",
        "label": "빠른 검은 너를 먼저 벤다. 그 길 끝에서 가문이 잇고자 한 것은 사라진다. 안 된다.",
        "effects": {
          "persona": {
            "integrity": 3
          },
          "trust": 1,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "reframe",
        "label": "복수를 위해 가문의 검을 버리겠다? 그것이야말로 그들이 끝내 가문을 죽이는 것이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 2
          },
          "trust": 2,
          "darkness": -1
        }
      },
      {
        "key": "indulge",
        "label": "그리 급하거든... 말리지 않으마. 네 검은 네 것이니.",
        "effects": {
          "persona": {
            "freedom": 2,
            "mercy": -1
          },
          "trust": 1,
          "darkness": 1,
          "righteousness": -2
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-08",
    "band": "turmoil",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "trustMin": 2
    },
    "body": "사부님. 오늘 처음으로... 검을 쥐는데 복수가 아니라 그냥 검 자체가 좋았습니다. 가문 생각도, 그 이름도 떠오르지 않았어요. 한순간이었지만요. 이런 제가... 어머니께 죄스러운 걸까요.",
    "options": [
      {
        "key": "bless",
        "label": "어머니가 네게 준 것은 복수가 아니라 삶이었을 게다. 검이 즐거웠다면, 잘 살고 있는 게다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 2
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "grow",
        "label": "검이 좋아지는 그 순간이 진짜 검객이 되는 때다. 그 마음을 키워라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 1
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "duty",
        "label": "잠시 잊는 것도 사람의 일이다. 허나 짊어진 의무가 사라진 것은 아니다.",
        "effects": {
          "persona": {
            "integrity": 2
          },
          "trust": -1
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-09",
    "band": "departure",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 15
    },
    "body": "사부님. 곧 하산입니다. 강호에 나가 두 가지를 이루고자 합니다. 무너진 독고세가를 다시 세우고, 멸문의 진실을 밝히는 것. 어느 쪽을 먼저 잡아야 할지, 마지막으로 여쭙고 싶습니다.",
    "options": [
      {
        "key": "build",
        "label": "먼저 세워라. 무너진 가문을 일으키는 것이 죽은 자에게 바치는 가장 큰 검이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "ambition": 1
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "truth-first",
        "label": "진실부터 밝혀라. 허나 칼이 아니라 법도와 증거로. 정도의 손으로 캐낸 진실만이 가문을 더럽히지 않는다.",
        "effects": {
          "persona": {
            "integrity": 3,
            "prudence": 2
          },
          "trust": 2,
          "darkness": -1,
          "righteousness": 1
        }
      },
      {
        "key": "free",
        "label": "순서는 네가 정하거라. 다만 어느 쪽이든, 그 끝에 네가 남아 있어야 한다는 것만 잊지 마라.",
        "effects": {
          "persona": {
            "freedom": 2,
            "warmth": 1
          },
          "trust": 3
        }
      }
    ]
  },
  {
    "id": "m-dokgo-yeon-10",
    "band": "departure",
    "disciple": "dokgo-yeon",
    "when": {
      "ageMin": 15,
      "trustMin": 1
    },
    "body": "사부님. ... 이 산문에 처음 왔을 때, 저는 누구도 사부로 두지 않겠다 다짐했었습니다. 사람은 결국 떠나거나 죽으니까요. 그런데 떠나는 날이 되니... 처음으로, 떠나기가 싫습니다. 이 마음을 어찌해야 합니까.",
    "options": [
      {
        "key": "home",
        "label": "떠나기 싫은 곳이 생겼다는 것은, 네가 다시 사람으로 돌아왔다는 뜻이다. 이곳은 늘 네 집이다.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 5
        }
      },
      {
        "key": "carry",
        "label": "사람은 떠나도 그 검은 남는다. 내가 가르친 검이 네 곁에 있는 한, 나는 늘 너와 함께다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": 1
          },
          "trust": 4
        }
      },
      {
        "key": "release",
        "label": "떠나는 발을 무겁게 하지 마라. 미련 없이 가야 멀리 간다. 가거라, 망설임 없이.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-01",
    "band": "child",
    "disciple": "baek-yeon",
    "when": {
      "ageMax": 10
    },
    "body": "사부님, 마당에 개미들이 줄지어 가요. 한참 봤는데요, 아무것도 안 하고 그냥 보는 게 제일 좋아요. 수련을 꼭 해야 하나요?",
    "options": [
      {
        "key": "let-be",
        "label": "보는 것도 공부다. 오늘은 그 줄을 끝까지 따라가 보거라.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 3
        }
      },
      {
        "key": "balance",
        "label": "보는 것과 익히는 것은 한 몸이다. 보았으니 이제 한 번 휘둘러 보자.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "push",
        "label": "한가로움도 정도껏이다. 검부터 잡거라.",
        "effects": {
          "persona": {
            "integrity": 2,
            "warmth": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-02",
    "band": "child",
    "disciple": "baek-yeon",
    "when": {
      "ageMax": 10
    },
    "body": "아버지가 그러셨어요. 억지로 하지 않는 게 도(道)래요. 그런데 사부님은 자꾸 더 하라고 하시잖아요. 누가 맞아요?",
    "options": [
      {
        "key": "honor-father",
        "label": "네 아버지 말씀이 옳다. 다만 비우려면 먼저 채워 봐야 안다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 3
          },
          "trust": 3
        }
      },
      {
        "key": "both-true",
        "label": "둘 다 길이다. 어느 쪽이 네 것인지는 네가 정하거라.",
        "effects": {
          "persona": {
            "freedom": 2,
            "prudence": 1
          },
          "trust": 1
        }
      },
      {
        "key": "my-roof",
        "label": "이 산문에선 내 말을 따르거라. 도는 나중에 논하자.",
        "effects": {
          "persona": {
            "integrity": 2,
            "freedom": -2
          },
          "trust": -2
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-03",
    "band": "child",
    "disciple": "baek-yeon",
    "when": {
      "ageMax": 10,
      "needsRival": true
    },
    "body": "사부님, {rival}랑 다른 동문이 떡 때문에 다퉜어요. 저는 안 끼고 그냥 봤어요. 다툴 일이 아닌데... 둘 다 곧 잊을 거예요.",
    "options": [
      {
        "key": "wisdom",
        "label": "어린 것이 이치를 아는구나. 보는 눈을 잃지 마라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "step-in",
        "label": "보기만 해선 다툼이 멎지 않는다. 다음엔 한 마디 건네 보거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 2
          },
          "trust": 1
        }
      },
      {
        "key": "cold",
        "label": "남의 일은 남의 일이다. 그렇게 거리를 두는 편이 편하지.",
        "effects": {
          "persona": {
            "freedom": 1,
            "warmth": -2,
            "mercy": -1
          }
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-04",
    "band": "growth",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "사부님, 내공을 고르는 일은 즐겁습니다. 그저 앉아 숨을 고르면 안이 맑아져요. 그런데 굳이 검을 들어 누구와 겨뤄야 하는 까닭을 잘 모르겠습니다.",
    "options": [
      {
        "key": "inner-first",
        "label": "안을 먼저 다스리는 자가 끝내 멀리 간다. 그 길을 계속 가거라.",
        "effects": {
          "persona": {
            "prudence": 3
          },
          "trust": 3,
          "righteousness": 1
        }
      },
      {
        "key": "need-edge",
        "label": "맑은 물도 둑이 없으면 흩어진다. 검은 네 고요를 지키는 둑이다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "prudence": 1
          },
          "trust": 2
        }
      },
      {
        "key": "worldly",
        "label": "강호는 숨만 고른다고 살아남는 곳이 아니다. 손에 힘을 길러라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": -1,
            "ambition": 1
          }
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-05",
    "band": "growth",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 10,
      "ageMax": 12
    },
    "body": "오랜만에 아버지께 서신이 왔습니다. 산을 떠도시며 잘 계신답니다. 보고 싶지만... 붙잡지 않는 것이 아버지를 사랑하는 길이라 배웠습니다. 이상한가요?",
    "options": [
      {
        "key": "let-flow",
        "label": "이상하지 않다. 흐르는 것을 흐르게 두는 것도 정(情)이다.",
        "effects": {
          "persona": {
            "warmth": 2,
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "allow-longing",
        "label": "그리우면 그립다 하여도 좋다. 비우는 척하지는 마라.",
        "effects": {
          "persona": {
            "warmth": 3,
            "mercy": 1
          },
          "trust": 2
        }
      },
      {
        "key": "praise-detach",
        "label": "어린 나이에 집착을 놓는구나. 그 마음, 귀하다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "prudence": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-06",
    "band": "turmoil",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14
    },
    "body": "사부님, 의뢰에서 다친 자를 보았습니다. 손을 대 기운을 돌려 주었더니 살았습니다. 한데... 나설지 한참을 망설였습니다. 무위(無爲)라면 그냥 두는 것이 옳지 않았을까요.",
    "options": [
      {
        "key": "act-is-way",
        "label": "살릴 수 있는 손을 거두는 것은 무위가 아니라 외면이다. 잘했다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 4,
          "righteousness": 2
        }
      },
      {
        "key": "your-choice",
        "label": "망설였다는 건 네 안에서 둘이 다툰 게다. 답은 네가 이미 냈고.",
        "effects": {
          "persona": {
            "freedom": 1,
            "prudence": 2
          },
          "trust": 2
        }
      },
      {
        "key": "detach",
        "label": "삶과 죽음은 흐름이다. 매번 손을 대다 보면 네가 먼저 닳는다.",
        "effects": {
          "persona": {
            "warmth": -1,
            "prudence": 1,
            "mercy": -2
          }
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-07",
    "band": "turmoil",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "stressMin": 55,
      "darknessRiskMin": "medium"
    },
    "body": "사부님... 요 며칠 호흡을 고르려 앉으면, 안이 맑아지질 않습니다. 자꾸 무언가가 끓어오릅니다. 처음 겪는 일입니다. 제 안의 고요가... 깨진 것 같습니다.",
    "options": [
      {
        "key": "anchor",
        "label": "고요는 깨지는 게 아니라 흐려질 뿐이다. 내 곁에 앉아 다시 골라 보자.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 2
          },
          "trust": 4,
          "darkness": -1
        }
      },
      {
        "key": "ask-source",
        "label": "끓는 것에는 까닭이 있다. 무엇이 네 물을 데웠는지, 천천히 말해 보거라.",
        "effects": {
          "persona": {
            "prudence": 3,
            "mercy": 1
          },
          "trust": 3,
          "darkness": -1
        }
      },
      {
        "key": "suppress",
        "label": "도사라면 그쯤은 눌러야지. 끓거든 더 깊이 가라앉혀라.",
        "effects": {
          "persona": {
            "integrity": 1,
            "warmth": -2
          },
          "trust": -2,
          "darkness": 1
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-08",
    "band": "turmoil",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 13,
      "ageMax": 14,
      "hasEnemy": true
    },
    "body": "사부님. 누군가 제 호흡 수련을 비웃었습니다. \"앉아만 있는 게 무공이냐\"고요. 평소 같으면 흘렸을 말인데... 그 얼굴이 자꾸 떠오릅니다. 흘려지지가 않습니다.",
    "options": [
      {
        "key": "name-it",
        "label": "흘려지지 않는다면 흘리려 애쓰지 마라. 마주 봐야 비로소 지나간다.",
        "effects": {
          "persona": {
            "integrity": 1,
            "prudence": 2
          },
          "trust": 3
        }
      },
      {
        "key": "compassion",
        "label": "비웃는 자는 대개 제 안이 시끄러운 자다. 가엾이 여겨 보거라.",
        "effects": {
          "persona": {
            "warmth": 1,
            "mercy": 3
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "let-it-burn",
        "label": "그 얼굴, 새겨 두어라. 언젠가 검으로 답하면 그만이다.",
        "effects": {
          "persona": {
            "mercy": -2,
            "ambition": 2
          },
          "darkness": 1,
          "righteousness": -1
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-09",
    "band": "departure",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 15
    },
    "body": "곧 하산입니다. 강호란 다툼이 끊이지 않는 곳이라 들었습니다. 저는... 나서기보다 비켜서 살고 싶습니다. 산 어딘가에 작은 도관을 짓고 도(道)를 닦으며. 그것은 도피입니까, 사부님.",
    "options": [
      {
        "key": "valid-path",
        "label": "비켜서는 것도 한 평생이다. 닦은 도가 깊으면 산이 곧 강호다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "prudence": 3
          },
          "trust": 3
        }
      },
      {
        "key": "be-needed",
        "label": "허나 네 손은 사람을 살린다. 그 손을 산에 묻는 것이 정녕 도이겠느냐.",
        "effects": {
          "persona": {
            "integrity": 1,
            "mercy": 2
          },
          "trust": 2,
          "righteousness": 1
        }
      },
      {
        "key": "decide-later",
        "label": "지금 정하지 마라. 강호를 한 번 보고 와서 그때 산을 택해도 늦지 않다.",
        "effects": {
          "persona": {
            "freedom": 1,
            "prudence": 2
          },
          "trust": 1
        }
      }
    ]
  },
  {
    "id": "m-baek-yeon-10",
    "band": "departure",
    "disciple": "baek-yeon",
    "when": {
      "ageMin": 15,
      "trustMin": 2
    },
    "body": "사부님. 아버지를 다시 만난다면, 저는 더 이상 그분이 가르치던 어린아이가 아닐 겁니다. 사부님의 검과 아버지의 도(道)가 제 안에서 자꾸 다툽니다. 둘 다 안고 갈 수 있을까요.",
    "options": [
      {
        "key": "two-rivers",
        "label": "두 강이 한 바다로 든다. 다툰다 여기지 말고 흐르게 두면, 어느새 하나가 된다.",
        "effects": {
          "persona": {
            "warmth": 1,
            "prudence": 3
          },
          "trust": 4
        }
      },
      {
        "key": "choose-own",
        "label": "내 검도 네 아버지의 도도 빌린 옷일 뿐이다. 끝내 네 것을 지어 입거라.",
        "effects": {
          "persona": {
            "freedom": 3,
            "ambition": 1
          },
          "trust": 2
        }
      },
      {
        "key": "father-first",
        "label": "다툰다면 아버지의 도를 앞세워라. 검은 그 도를 지키는 데만 쓰면 된다.",
        "effects": {
          "persona": {
            "integrity": 2,
            "mercy": 1
          },
          "trust": 2,
          "righteousness": 1
        }
      }
    ]
  }
];
