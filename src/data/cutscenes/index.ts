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

  // ── 깨달음 — 절정·초절정 벽을 깨는 순간(폐관·실전 공용, 제자당 회차 최대 2회) ──
  {
    eventId: 'enlightenment',
    hanzi: '悟',
    title: '깨달음',
    tone: 'ink',
    defaultLine: '{name}이 문득 멈춰 섰다. 천 번을 두드려도 꿈쩍 않던 벽이, 오늘 소리 없이 무너져 내렸다.',
    byDisciple: {
      'jang-cheol': {
        line: '장철은 오래도록 제 두 손을 내려다보았다. 평생 밭을 갈고 벽을 버티던 손이, 오늘 처음으로 가벼웠다.',
        quote: '지키는 것과 버티는 것이…… 같은 것이었어요, 사부님.',
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
  {
    // 선천진기 — 영약도 의원도 없는 사경. 타고난 진원을 끌어올려 죽음을 떨친다. 대가는 근본의 손상.
    eventId: 'fatal_rescue_innate',
    hanzi: '眞',
    title: '선천진기(先天眞氣) — 진원을 태우다',
    tone: 'blood',
    defaultLine: '영약도, 의원도 없었다. 단전 가장 깊은 곳 — 타고난 진원이 마지막으로 끓어올랐다. {name}은 피를 토하며 일어섰다. 죽음은 떨쳤으나, 근본이 상해 공력이 흩어졌다.',
  },

  // ── 전용 아크 컷 — 캐릭터별 정점·시그니처(docs/20 ②). 노선/사건에 도달한 제자만 발화, 칸 비면 폴백 ──
  // 호위 노선 정점 — 상단 총관(호위 사다리 끝) 등극. 성인 컷. 트리거: careerSystem 직책 정점(후속).
  {
    eventId: 'career_peak_escort',
    hanzi: '守',
    title: '호위의 정점 — 상단 총관',
    tone: 'gold',
    defaultLine: '{name}이 상단의 깃발 아래 섰다. 평생 누군가의 뒤를 지켜 온 길이, 마침내 수백 명의 앞을 지키는 자리에 닿았다.',
    byDisciple: {
      'jang-cheol': {
        line: '장철은 상단의 큰 깃발 아래 우뚝 섰다. 어릴 적 벽을 버티던 그 손으로, 이제 한 상단의 앞을 지킨다.',
        quote: '지키는 자리에 끝이 있다면…… 여기까지 와도 되겠지요, 사부님.',
      },
    },
  },
  // 고향을 지키다 — 도적떼에게서 고향 마을을 구함(가족 위협·호위 의뢰). 청소년 시그니처 컷.
  {
    eventId: 'hometown_defense',
    hanzi: '鄕',
    title: '고향을 지키다',
    tone: 'ink',
    defaultLine: '{name}이 제 손으로 고향 어귀를 막아섰다. 어릴 적 매일 지나던 그 길목이었다.',
    byDisciple: {
      'jang-cheol': {
        line: '장철은 도적떼 앞에 홀로 고향 어귀를 막아섰다. 등 뒤로, 어릴 적 빵을 나눠 먹던 골목이 있었다.',
        quote: '여기 사람들은…… 제가 지킵니다. 그러려고 배운 무공이니까요.',
      },
    },
  },
] as const;

export function findCutscene(eventId: string): CutsceneDef | undefined {
  return CUTSCENES.find((c) => c.eventId === eventId);
}
