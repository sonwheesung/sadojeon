// 컷씬 데이터 — docs/20. "특별한 사건 × 제자 전용 연출" 격자.
// 사건마다 틀 1개(한자·제목·결·기본 서사), 제자마다 byDisciple 한 칸(전용 서사·대사).
// 칸이 비면 defaultLine({name} 치환)으로 재생 — 사건 추가도 제자 연출 추가도 데이터 한 줄.
// 일러스트(Phase 2)는 assets/images/cutscenes/<eventId>/<discipleId>.png 규약 예정 — 지금은 그레이박스.

// 결(배경·큰 글씨 색) — gold: 영광(장원·돌파) / ink: 담담한 큰 사건 / blood: 생사의 갈림.
export type CutsceneTone = 'gold' | 'ink' | 'blood';

export interface CutsceneVariant {
  line: string; // 그 제자만의 서사 한 줄
  quote?: string; // 그 제자의 한마디 (선택)
}

export interface CutsceneDef {
  eventId: string;
  hanzi: string; // 정중앙 큰 글씨 1~2자
  title: string; // 사건명
  tone: CutsceneTone;
  defaultLine: string; // 전용 연출 없는 제자용 — {name} 치환
  byDisciple?: Record<string, CutsceneVariant>; // key = 제자 id(poolId)
}

export const CUTSCENES: readonly CutsceneDef[] = [
  // ── 용봉지회 장원 — 강호 후기지수들 정점에 서는 순간 ──────────────────────
  {
    eventId: 'tournament_champion',
    hanzi: '壯元',
    title: '용봉지회 장원',
    tone: 'gold',
    defaultLine: '강호의 후기지수들 사이에서, {name}이 가장 높은 자리에 섰다.',
    byDisciple: {
      'jang-cheol': {
        line: '장철은 쓰러진 상대를 일으켜 세운 뒤에야, 멋쩍게 머리를 긁적였다.',
        quote: '운이 좋았습니다. ……손은, 안 다치셨습니까.',
      },
      'jin-sohwa': {
        line: '진소화는 이긴 손으로 먼저 상대의 맥부터 짚었다. 단상의 환호가 머쓱해졌다.',
        quote: '많이 다치진 않으셨죠? 금창약, 여기 있어요.',
      },
      'han-baram': {
        line: '한바람은 단상 난간 위에 훌쩍 올라앉아, 산문 쪽 하늘을 보며 웃었다.',
        quote: '봤지? 산문 앞에 주저앉아 있던 그 애 맞아.',
      },
      'yun-soso': {
        line: '윤소소는 검을 거두고, 사방의 군웅에게 반듯하게 예를 올렸다.',
        quote: '사문의 검이 그르지 않았음을 보였을 뿐입니다.',
      },
      'i-cheongha': {
        line: '이청하는 쏟아지는 환호 속에서도 버릇처럼 출구부터 눈으로 쟀다. 그러다, 처음으로 멈췄다.',
        quote: '……이렇게 많은 눈앞에서 이긴 건, 처음이야.',
      },
      'baek-yeon': {
        line: '백연은 호흡을 길게 고르고, 소리 없이 단을 내려왔다.',
        quote: '이기고 지는 것 또한 흐름이지요. 오늘은 흐름이 이쪽에 있었을 뿐.',
      },
      'gang-muyeol': {
        line: '강무열은 도를 닦아 넣고, 가문이 있는 북쪽 하늘을 한 번 올려다보았다.',
        quote: '이 이름, 부끄럽지 않게 쓰겠습니다.',
      },
      'dokgo-yeon': {
        line: '독고연은 환호에 답하지 않았다. 다만 검끝이, 아주 잠시 떨렸다.',
        quote: '독고(獨孤)는, 아직 끝나지 않았다.',
      },
    },
  },

  // ── 치명상 생환 — 즉사 없음 룰의 세 갈래(docs/29 생존 체인). 살린 경로마다 다른 컷 ──
  {
    eventId: 'fatal_rescue_elixir',
    hanzi: '生',
    title: '구사일생 — 영약',
    tone: 'blood',
    defaultLine: '금창영약이 {name}의 입술 사이로 흘러들었다. 끊겼던 숨이, 길게 돌아왔다.',
  },
  {
    eventId: 'fatal_rescue_medic',
    hanzi: '醫',
    title: '구사일생 — 의술',
    tone: 'blood',
    defaultLine: '동행한 의원의 침이 혈을 짚자, {name}의 낯에 핏기가 돌아왔다.',
  },
  {
    eventId: 'fatal_rescue_village',
    hanzi: '命',
    title: '구사일생 — 사투',
    tone: 'blood',
    defaultLine: '{name}을 업고 밤길을 내달렸다. 마을 의원 문턱에서 — 숨이, 돌아왔다.',
  },
] as const;

export function findCutscene(eventId: string): CutsceneDef | undefined {
  return CUTSCENES.find((c) => c.eventId === eventId);
}
