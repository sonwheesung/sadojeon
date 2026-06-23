// 한 마디 풀 — docs/12_인박스_면담.md "단계 1: 일상 한 마디"
// 매일 진행 시 무작위 제자 1명이 사부에게 한 마디. 사부는 4문장 중 하나로 응답.

import { random } from '@/systems/rng';
import { fillName } from '@/utils/korean';
import { GRADUATION } from '@/data/constants';

export type OneLinerCategory = 'training' | 'daily' | 'relation' | 'worry';
export type OneLinerTone = 'encourage' | 'nod' | 'caution' | 'ignore';

// 상황 조건 — 제자 현재 상태와 맞을 때만 그 한 마디가 뜬다(무작위 X). docs/12.
// 안 적은 키 = 무관. 예: 힘들다는 말은 stressMin, 적대 의심은 hasEnemy 가 받쳐야 발화.
export interface OneLinerCondition {
  stressMin?: number; // 스트레스 ≥ (지침·힘듦)
  stressMax?: number; // 스트레스 ≤ (개운·좋은 날)
  staminaPctMax?: number; // 체력 % ≤ (지침)
  trustMin?: number;
  trustMax?: number; // 신뢰 ≤ (마음 닫음)
  darknessRiskMin?: 'medium' | 'high'; // 흑화 위험 ≥
  darknessRiskMax?: 'low' | 'medium'; // 흑화 위험 ≤ (모순 방지 — 흑화 중엔 천진한 대사 차단)
  hasEnemy?: boolean; // 적대 관계 보유 시에만
  ageMin?: number;
  ageMax?: number;
  seongMin?: number; // 주력 무공 성 ≥ (정체·자만)
  needsRival?: boolean; // 자신보다 앞선 동문이 있을 때만(이름은 {rival} 치환)
  isWeakest?: boolean; // 사문에서 자신이 제일 약할 때
}

// 상황 결(mood) — LLM function-calling 선택의 메뉴 라벨. 룰 조건(when)과 별개로,
// "지금 이 제자의 결"을 한 단어로(흑화·불신·지침·자만·정체성·평온·향수·라이벌·적의·일상).
// 없으면 'normal'. docs/12·17.
export type OneLinerMood =
  | 'normal'
  | 'darkening' // 흑화 기미
  | 'distrust' // 사부 불신(저신뢰)
  | 'weary' // 지침·스트레스
  | 'pride' // 자만(앞서감)
  | 'identity' // 정체성·진로 회의
  | 'calm' // 평온·좋은 날
  | 'homesick' // 향수·가족
  | 'rival' // 비교·서열
  | 'enmity'; // 적의·응어리

export interface OneLinerTemplate {
  id: string;
  category: OneLinerCategory;
  body: string;
  when?: OneLinerCondition; // 없으면 언제든 가능
  onlyFor?: string; // 캐릭터 전용 시그니처 — 그 제자(poolId)일 때만. 없으면 공용. docs/12·15
  mood?: OneLinerMood; // LLM 선택 메뉴 라벨(없으면 normal)
}

export const ONE_LINERS: OneLinerTemplate[] = [
  // 수련 — 힘듦은 스트레스 높을 때만, 개운함은 낮을 때만
  { id: 't1', category: 'training', body: '사부님, 오늘 수련은 손에 잡힙니다.', when: { stressMax: 45 } },
  { id: 't2', category: 'training', body: '어제보다 한 걸음 나아간 것 같습니다.', when: { stressMax: 55 } },
  { id: 't3', category: 'training', body: '몸이 무겁습니다. 결이 안 잡히는 날입니다.', when: { stressMin: 50 } },
  { id: 't4', category: 'training', body: '진행도가 좀처럼 오르지 않아 답답합니다.', when: { stressMin: 45 } },
  { id: 't5', category: 'training', body: '검이 손에서 겉돕니다. 너무 지쳤나 봅니다.', when: { staminaPctMax: 35 } },
  { id: 't6', category: 'training', body: '이 무공, 이제 어느 정도 알 듯합니다.', when: { seongMin: 4, stressMax: 60 } },

  // 일상 — 대체로 무관
  { id: 'd1', category: 'daily', body: '아침 안개가 산문을 덮었습니다. 좋은 날입니다.', when: { stressMax: 60 } },
  { id: 'd2', category: 'daily', body: '간밤 꿈자리가 사나웠습니다. 오늘은 검을 내려놓고 좀 쉬고 싶습니다.', when: { stressMin: 35 } },
  { id: 'd3', category: 'daily', body: '사부님, 차 한 잔 드시지요. 갓 끓인 것입니다.' },

  // 관계
  // 비교·서열 — {rival}=자기보다 앞선 최강 동문 이름. 어림/연상 말투, 최약 여부로 분기.
  { id: 'r1-young', category: 'relation', mood: 'rival', body: '사부님! {rival}는 어떻게 그렇게 잘해요? 저도 빨리 그렇게 되고 싶어요.', when: { ageMax: 11, needsRival: true } },
  { id: 'r1-weak', category: 'relation', mood: 'rival', body: '사부님... 솔직히 제가 사문에서 제일 약한 것 같아요. {rival}만큼 하려면 멀었어요.', when: { isWeakest: true, needsRival: true } },
  { id: 'r1-old', category: 'relation', mood: 'rival', body: '{rival}를 보면 아직 멀었구나 싶습니다. 더 갈아야겠지요.', when: { ageMin: 12, needsRival: true } },
  { id: 'r2', category: 'relation', body: '오늘 동문과 한 마디 나눴습니다. 마음이 풀립니다.', when: { stressMax: 65 } },
  { id: 'r3', category: 'relation', mood: 'enmity', body: '... 누군가 저를 자꾸 쳐다보는 듯합니다.', when: { hasEnemy: true } },

  // 고민
  { id: 'w1', category: 'worry', mood: 'identity', body: '제 길이 정녕 이쪽인지 가끔 묻게 됩니다.', when: { ageMin: 12 } },
  { id: 'w2', category: 'worry', mood: 'rival', body: '강호엔 제 또래가 벌써 이름을 냈다더군요. 저는 아직 산문 안인데...', when: { ageMin: 12 } },
  { id: 'w3', category: 'worry', mood: 'distrust', body: '... 별것 아닙니다. 신경 쓰지 마십시오.', when: { trustMax: 40 } },
  { id: 'w4', category: 'worry', body: '사부님은 제 재능을 어떻게 보십니까.' },
  // 흑화 기미 — '어둠'을 라벨하지 않고 관찰 가능한 말·태도로만(feedback_hidden_game_state)
  { id: 'w5', category: 'worry', mood: 'darkening', body: '사부님... 강한 자가 약한 자를 누르는 것이, 정녕 그른 일입니까.', when: { darknessRiskMin: 'medium' } },
  { id: 'w6', category: 'worry', mood: 'darkening', body: '요즘은 검을 쥐면, 외려 마음이 차게 가라앉습니다.', when: { darknessRiskMin: 'medium' } },
  { id: 'w7', category: 'worry', mood: 'enmity', body: '... 그날 그자의 눈을, 아직도 잊지 못합니다.', when: { darknessRiskMin: 'high', hasEnemy: true } },

  // ── 캐릭터 시그니처 ── (onlyFor=poolId, 나이대 분산. disciples/*.md 기반. 작성원칙: want·나이대 말투·숨은변수 직설 X)
  // 장철(jang-cheol) — 산촌 농가 둘째, 가족 그리움·우직·마을 지킴, 야망 낮음.
  { id: 'sig-jang-1', category: 'daily', body: '어머니가 만들어주신 떡이 그리워요. 이맘때면 김이 모락모락 났는데.', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-2', category: 'daily', body: '사부님, 우리 형은 농사일 잘하고 있을까요? 비는 제때 왔을지...', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-3', category: 'training', body: '사부님, 저는 강한 무공보다 마을 지키는 무공이 좋아요.', onlyFor: 'jang-cheol', when: { ageMin: 11, ageMax: 13 } },
  { id: 'sig-jang-4', category: 'daily', body: '어머니께 편지 한 통 부쳐도 될까요? 잘 지낸다고요.', onlyFor: 'jang-cheol', when: { ageMin: 11, ageMax: 13 } },
  { id: 'sig-jang-5', category: 'worry', body: '강호엔 나쁜 자가 많다던데... 제가 거기서 살아남을 수 있을까요.', onlyFor: 'jang-cheol', when: { ageMin: 13 } },
  { id: 'sig-jang-6', category: 'worry', body: '큰 무인이 못 되어도 괜찮습니다. 저는 고향을 지킬 수 있으면 그걸로 족해요.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-7', category: 'relation', body: '사부님 가르침, 평생 잊지 않겠습니다. 산을 내려가도요.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },

  // 진소화(jin-sohwa) — 약방 딸, 의술·다정·자비, 동문 돌봄, 살상 거부.
  { id: 'sig-sohwa-1', category: 'relation', body: '동문이 어디 다친 데는 없는지, 제가 좀 봐드려도 될까요?', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-2', category: 'daily', body: '오늘 산에서 백출을 캐왔어요. 내일은 환을 한번 빚어볼게요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-3', category: 'daily', body: '사부님, 어제 잘 못 주무셨지요? 안색이 좋지 않으세요.', onlyFor: 'jin-sohwa' },
  { id: 'sig-sohwa-4', category: 'training', body: '강한 무공보다, 사람을 살리는 손이 되고 싶어요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-5', category: 'worry', body: '강호엔 정말로 사람을 해치는 이들이 있나요? 저는... 잘 모르겠어요.', onlyFor: 'jin-sohwa', when: { ageMin: 13 } },
  { id: 'sig-sohwa-6', category: 'worry', body: '사람을 베는 무공만은, 저는 끝내 못 익힐 것 같아요. 그래도 될까요?', onlyFor: 'jin-sohwa', when: { ageMin: 13 } },
  { id: 'sig-sohwa-7', category: 'worry', body: '저는 무인이라기보단 의원에 가까운 것 같아요. 사부님은 어떻게 보세요?', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },

  // ════ 상황별 공용 — 흑화·불신·지침·자만·정체성·평온·적의(mood 로 LLM 메뉴화) ════
  // 흑화 기미 — '어둠' 라벨 X, 관찰 가능한 말·태도로만(feedback_hidden_game_state)
  { id: 'dk1', category: 'worry', mood: 'darkening', body: '손에 힘을 줄 때마다... 누군가를 꺾고 싶다는 생각이 듭니다.', when: { darknessRiskMin: 'medium' } },
  { id: 'dk2', category: 'daily', mood: 'darkening', body: '요즘은 사문 규율이 거추장스럽게 느껴집니다. 왜 그런지 모르겠어요.', when: { darknessRiskMin: 'medium' } },
  { id: 'dk3', category: 'relation', mood: 'darkening', body: '동문들이 저를 슬슬 피하는 듯합니다. ... 뭐, 상관없습니다만.', when: { darknessRiskMin: 'high' } },
  { id: 'dk4', category: 'worry', mood: 'darkening', body: '약한 것은, 결국 약한 게 죄 아닙니까. ... 사부님은 다르게 보십니까.', when: { darknessRiskMin: 'high' } },
  // 사부 불신 — 저신뢰
  { id: 'ds1', category: 'worry', mood: 'distrust', body: '... 됐습니다. 어차피 말해도 달라질 게 없겠지요.', when: { trustMax: 30 } },
  { id: 'ds2', category: 'daily', mood: 'distrust', body: '사부님은 제게 별 관심이 없으신 듯합니다. ... 괜찮습니다.', when: { trustMax: 25 } },
  { id: 'ds3', category: 'training', mood: 'distrust', body: '시키시는 대로는 하겠습니다. 그뿐입니다.', when: { trustMax: 30 } },
  { id: 'ds4', category: 'worry', mood: 'distrust', body: '제 말을 들어주실 줄은... 솔직히 기대하지 않았습니다.', when: { trustMax: 38, stressMin: 40 } },
  // 지침 — 스트레스·체력
  { id: 'wr1', category: 'daily', mood: 'weary', body: '사부님... 오늘 하루만 쉬어가도 되겠습니까. 몸이 천근만근입니다.', when: { stressMin: 60 } },
  { id: 'wr2', category: 'training', mood: 'weary', body: '머릿속이 멍합니다. 검을 휘둘러도 형이 그려지질 않아요.', when: { staminaPctMax: 30 } },
  { id: 'wr3', category: 'worry', mood: 'weary', body: '요즘은... 무엇을 위해 이리 버티는지 모르겠습니다.', when: { stressMin: 70 } },
  // 자만 — 앞서가는 자
  { id: 'pr1', category: 'training', mood: 'pride', body: '이 정도면 산 아래 웬만한 무사들은 상대도 안 되겠지요?', when: { seongMin: 5, stressMax: 55 } },
  { id: 'pr2', category: 'relation', mood: 'pride', body: '솔직히 사문에서 저만큼 하는 사람도 없지 않습니까.', when: { seongMin: 6 } },
  { id: 'pr3', category: 'worry', mood: 'pride', body: '사부님께 더 배울 게 남았는지... 가끔 그런 생각이 스칩니다.', when: { seongMin: 7 } },
  // 정체성·진로
  { id: 'id1', category: 'worry', mood: 'identity', body: '사부님, 저는 강호에 나가면 어떤 무인이 되어 있을까요.', when: { ageMin: 13 } },
  { id: 'id2', category: 'worry', mood: 'identity', body: '제가 가야 할 길이 정말 이쪽이 맞는지, 요즘 자주 묻게 됩니다.', when: { ageMin: 14 } },
  { id: 'id3', category: 'worry', mood: 'identity', body: '하산이 멀지 않았다 들었습니다. 두렵기도, 설레기도 합니다.', when: { ageMin: 15 } },
  // 평온
  { id: 'ca1', category: 'daily', mood: 'calm', body: '오늘은 마음이 참 잔잔합니다. 이런 날엔 수련도 잘 됩니다.', when: { stressMax: 30 } },
  { id: 'ca2', category: 'daily', mood: 'calm', body: '사부님과 마시는 차 한 잔이, 요즘은 하루 중 제일 좋습니다.', when: { stressMax: 35, trustMin: 50 } },
  // 적의·응어리
  { id: 'en1', category: 'relation', mood: 'enmity', body: '... 한 사람과는, 아무리 해도 같은 자리에 못 있겠습니다.', when: { hasEnemy: true } },
  { id: 'en2', category: 'worry', mood: 'enmity', body: '사부님, 미워하는 마음을 다스리는 것도... 무공입니까.', when: { hasEnemy: true, stressMin: 40 } },

  // ════ 공용 일상 잡담 — 결 없음(반복 허용). 단조 방지용 대량 풀(이력분석 2026-06-23, 같은 줄 250+회 반복 해소) ════
  // 사문 생활의 결: 마당·계절·끼니·소제·산·연무장. 숨은 변수 직설 X, 나이대 무난한 말투.
  { id: 'amb1', category: 'daily', body: '사부님, 오늘 아침 마당을 쓸다 동백이 핀 걸 봤습니다.', when: { stressMax: 65 } },
  { id: 'amb2', category: 'daily', body: '장작을 패 두었습니다. 겨울 채비는 일찍 해 두는 게 좋겠지요.', when: { stressMax: 60 } },
  { id: 'amb3', category: 'daily', body: '우물물이 차갑습니다. 세수를 하고 나니 정신이 번쩍 듭니다.' },
  { id: 'amb4', category: 'daily', body: '산새 우는 소리에 눈을 떴습니다. 오늘은 일찍 시작하겠습니다.', when: { stressMax: 60 } },
  { id: 'amb5', category: 'daily', body: '점심 죽이 참 따뜻했습니다. 잘 먹었습니다, 사부님.' },
  { id: 'amb6', category: 'daily', body: '연무장 바닥을 다시 골라 두었습니다. 발이 한결 편합니다.', when: { stressMax: 60 } },
  { id: 'amb7', category: 'daily', body: '간밤에 비가 와 계곡물이 불었습니다. 물소리가 우렁찹니다.' },
  { id: 'amb8', category: 'daily', body: '마당 약초밭에 싹이 올라왔습니다. 사부님, 보셨어요?', when: { stressMax: 60 } },
  { id: 'amb9', category: 'daily', body: '검을 손질해 두었습니다. 날이 다시 곱게 섭니다.', when: { stressMax: 60 } },
  { id: 'amb10', category: 'daily', body: '오늘은 바람이 좋아, 산마루까지 단숨에 뛰어 올랐습니다.', when: { stressMax: 55 } },
  { id: 'amb11', category: 'daily', body: '서고를 정리하다 오래된 권보를 하나 찾았습니다. 손때가 묻었더군요.', when: { stressMax: 60 } },
  { id: 'amb12', category: 'daily', body: '달이 밝아 잠이 오질 않습니다. 마당이나 한 바퀴 돌고 오겠습니다.', when: { stressMax: 60 } },
  { id: 'amb13', category: 'daily', body: '동문들과 장작 나르기 내기를 했습니다. ... 제가 졌습니다.', when: { stressMax: 60 } },
  { id: 'amb14', category: 'daily', body: '짚신이 다 닳았습니다. 새로 한 켤레 삼아야겠어요.' },
  { id: 'amb15', category: 'daily', body: '처마 밑 제비가 새끼를 쳤습니다. 아침마다 시끌벅적합니다.', when: { stressMax: 60 } },
  { id: 'amb16', category: 'daily', body: '오늘은 하늘이 유난히 높습니다. 가을인가 봅니다.' },
  { id: 'amb17', category: 'daily', body: '발끝이 시립니다. 첫서리가 내렸나 봅니다.' },
  { id: 'amb18', category: 'daily', body: '오늘은 수련보다 빨래가 더 힘들었습니다. ... 농입니다, 사부님.', when: { stressMax: 55 } },
  { id: 'amb19', category: 'relation', body: '오늘 동문이 떡을 나눠줬습니다. 같이 먹으니 더 맛있더군요.', when: { stressMax: 60 } },
  { id: 'amb20', category: 'daily', body: '약방 냄새가 좋습니다. 코끝이 알싸해요.' },

  // 수련 결 — 느는 감각/막히는 감각(가벼움, 반복 허용)
  { id: 'tx1', category: 'training', body: '오늘은 자세가 어제보다 낮게 잡힙니다. 조금씩은 느는 모양입니다.', when: { stressMax: 60 } },
  { id: 'tx2', category: 'training', body: '같은 초식을 백 번 그었습니다. 손이 먼저 길을 압니다.', when: { stressMax: 55 } },
  { id: 'tx3', category: 'training', body: '호흡이 길어졌습니다. 내쉴 때 검끝이 덜 떨립니다.', when: { stressMax: 55 } },
  { id: 'tx4', category: 'training', body: '어제 짚어주신 곳을 고치니 한결 매끄럽습니다.', when: { stressMax: 60, trustMin: 45 } },
  { id: 'tx5', category: 'training', body: '발 디딤이 자꾸 엉킵니다. 보법은 아직 멀었나 봅니다.', when: { stressMin: 40 } },

  // 지침 변주 — weary 과다(이력분석 21%) 단조 해소
  { id: 'wr4', category: 'training', mood: 'weary', body: '오늘은 목검이 쇳덩이 같습니다.', when: { stressMin: 55 } },
  { id: 'wr5', category: 'daily', mood: 'weary', body: '눈꺼풀이 자꾸 내려앉습니다. ... 죄송합니다, 사부님.', when: { staminaPctMax: 35 } },
  { id: 'wr6', category: 'training', mood: 'weary', body: '손에 물집이 또 잡혔습니다. ... 괜찮습니다, 곧 굳겠지요.', when: { stressMin: 50 } },
  { id: 'wr7', category: 'daily', mood: 'weary', body: '잠깐 앉아도 되겠습니까. ... 숨 좀 고르고 다시 하겠습니다.', when: { staminaPctMax: 30 } },

  // 평온 변주 — calm 은 신뢰 받쳐줄 때만(모순 방지 moodConsistent 와 합치). 반복 허용.
  { id: 'ca3', category: 'daily', mood: 'calm', body: '사부님 곁에 있으면 마음이 놓입니다. ... 별 이유는 없어요.', when: { trustMin: 55, stressMax: 40 } },
  { id: 'ca4', category: 'training', mood: 'calm', body: '오늘은 검을 쥐어도 마음이 고요합니다. 이런 날이 좋습니다.', when: { stressMax: 30, trustMin: 45 } },

  // ════ 캐릭터 시그니처 — 한바람·윤소소·이청하·백연·진백호·사천화 (disciples/*.md 기반) ════
  // 한바람 — 거리에서 자란 자유·떠돌이, 흑화 위험, 부모 상실.
  { id: 'sig-baram-1', category: 'daily', mood: 'normal', body: '사부님, 잠깐 산 아래 좀 다녀와도 돼요? 안이 답답해서요.', onlyFor: 'han-baram', when: { ageMax: 11 } },
  { id: 'sig-baram-2', category: 'worry', mood: 'homesick', body: '... 부모님이 어떤 분들이었는지, 저는 잘 기억이 안 나요.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-3', category: 'training', mood: 'normal', body: '보법은 금세 늘어요! 더 빠른 거, 더 어려운 거 가르쳐줘요.', onlyFor: 'han-baram', when: { ageMin: 11, ageMax: 13 } },
  { id: 'sig-baram-4', category: 'worry', mood: 'distrust', body: '사부님이 절 거둔 거... 그냥 의리 때문이에요?', onlyFor: 'han-baram', when: { trustMax: 35 } },
  { id: 'sig-baram-5', category: 'daily', mood: 'darkening', body: '산 아래서 만난 무인이 좋은 비급을 보여줬어요. 그거, 익혀도 돼요?', onlyFor: 'han-baram', when: { darknessRiskMin: 'medium' } },
  { id: 'sig-baram-6', category: 'worry', mood: 'identity', body: '사부님 가르침은 고맙지만... 저는 한곳에 매여선 못 사는 사람 같아요.', onlyFor: 'han-baram', when: { ageMin: 13 } },
  { id: 'sig-baram-7', category: 'relation', mood: 'normal', body: '정파 의적이 되려고요. 가난한 사람들 돕는. ... 저답죠?', onlyFor: 'han-baram', when: { ageMin: 15 } },
  // 윤소소 — 양반가 정파 검녀, 복수의 트라우마, 일방적 적대(이청하).
  { id: 'sig-yun-1', category: 'training', mood: 'normal', body: '사부님, 검법을 더 가르쳐주세요. 더 빨리, 더 깊이요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-2', category: 'daily', mood: 'normal', body: '어머니께서 굳세게 자라라 하셨습니다. 저는 시집 따위 가지 않아요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-3', category: 'worry', mood: 'identity', body: '올곧은 검을 쥔, 정파의 검객이 되고 싶습니다.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-4', category: 'relation', mood: 'enmity', body: '... 그 아이만 보면 가슴이 차갑게 굳습니다. 이유는 묻지 말아 주세요.', onlyFor: 'yun-soso', when: { hasEnemy: true } },
  { id: 'sig-yun-5', category: 'worry', mood: 'darkening', body: '사부님, 복수가... 정녕 그릇된 마음입니까.', onlyFor: 'yun-soso', when: { darknessRiskMin: 'medium' } },
  { id: 'sig-yun-6', category: 'worry', mood: 'identity', body: '죽은 이는 돌아오지 않는데... 제가 쥔 이 검은 무엇을 위한 걸까요.', onlyFor: 'yun-soso', when: { ageMin: 14 } },
  { id: 'sig-yun-7', category: 'daily', mood: 'calm', body: '오래 품고 있던 것을, 이제 그만 내려놓으려 합니다.', onlyFor: 'yun-soso', when: { ageMin: 15, stressMax: 50 } },
  // 이청하 — 어둠에서 빠져나온 살수, 죄책감, 자기 본성과의 싸움.
  { id: 'sig-cheong-1', category: 'worry', mood: 'distrust', body: '... 사부님은 왜 저 같은 아이를 거두셨습니까.', onlyFor: 'i-cheongha', when: { trustMax: 35 } },
  { id: 'sig-cheong-2', category: 'daily', mood: 'weary', body: '어젯밤도 그 꿈을 꿨습니다. 어떤 사람의... 마지막 눈빛을요.', onlyFor: 'i-cheongha', when: { stressMin: 45 } },
  { id: 'sig-cheong-3', category: 'training', mood: 'normal', body: '검을 쥐면 옛 손버릇이 자꾸 올라옵니다. ... 그게 두렵습니다.', onlyFor: 'i-cheongha', when: { ageMin: 11, ageMax: 14 } },
  { id: 'sig-cheong-4', category: 'relation', mood: 'normal', body: '동문들이 점점 따뜻하게 느껴집니다. ... 익숙하지 않은 기분이에요.', onlyFor: 'i-cheongha', when: { trustMin: 45 } },
  { id: 'sig-cheong-5', category: 'worry', mood: 'darkening', body: '사부님... 저는 끝내, 용서받을 수 있는 사람일까요.', onlyFor: 'i-cheongha', when: { darknessRiskMin: 'medium' } },
  { id: 'sig-cheong-6', category: 'worry', mood: 'identity', body: '어둠에서 빠져나온 이 손으로, 이젠 사람을 지키고 싶습니다. 가능할까요.', onlyFor: 'i-cheongha', when: { ageMin: 14 } },
  // 백연 — 도사의 딸, 평정·자비, 어두운 동문 보살핌.
  { id: 'sig-baek-1', category: 'daily', mood: 'calm', body: '아버지께서 그러셨어요. 마음을 비우면 도(道)가 가까이 온다고요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-2', category: 'relation', mood: 'normal', body: '사부님, 마음이 어두워 보이는 동문이 있어요. 함께 명상해도 될까요?', onlyFor: 'baek-yeon' },
  { id: 'sig-baek-3', category: 'training', mood: 'calm', body: '흰 연꽃은 진흙에서 피어도 맑습니다. 저도 그러고 싶어요.', onlyFor: 'baek-yeon', when: { stressMax: 55 } },
  { id: 'sig-baek-4', category: 'worry', mood: 'identity', body: '사부님, 도(道)와 무(武)의 균형은 어디에 있는 걸까요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-5', category: 'worry', mood: 'normal', body: '강호의 다툼이 안타깝습니다. ... 도(道)로는 풀 수 없는 걸까요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-6', category: 'relation', mood: 'calm', body: '졸업하면 아버지 곁으로 돌아가, 자비의 손길을 펴고 싶어요.', onlyFor: 'baek-yeon', when: { ageMin: 15 } },
  // 진백호 — 떠돌이 천재, 자유·자만, 자유 폭발 위험, 한바람과 옛 인연.
  { id: 'sig-baekho-1', category: 'training', mood: 'pride', body: '사부님, 이 검법 어렵지 않은데요? 다른 거 가르쳐주세요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-2', category: 'relation', mood: 'normal', body: '한바람 형이랑 같은 사문이 되다니, 세상 참 좁네요.', onlyFor: 'jin-baekho', when: { ageMax: 13 } },
  { id: 'sig-baekho-3', category: 'relation', mood: 'pride', body: '동문들이 왜 저 무공을 어려워하는지 모르겠어요. ... 제가 빠른 거겠죠.', onlyFor: 'jin-baekho', when: { seongMin: 5 } },
  { id: 'sig-baekho-4', category: 'worry', mood: 'identity', body: '저는 무엇이 되고 싶은지 모르겠어요. 무림맹주? ... 답답한걸요.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-5', category: 'daily', mood: 'darkening', body: '사문이 좁게 느껴져요. 그냥... 강호로 나가버리고 싶어요.', onlyFor: 'jin-baekho', when: { darknessRiskMin: 'medium' } },
  { id: 'sig-baekho-6', category: 'worry', mood: 'distrust', body: '사부님... 제 양육이 부족했다 여기실까 봐, 그게 좀 무서워요.', onlyFor: 'jin-baekho', when: { trustMax: 40 } },
  { id: 'sig-baekho-7', category: 'relation', mood: 'normal', body: '저는 자유로운 검의 길로 가겠어요. 사부님 가르침은 안고서요.', onlyFor: 'jin-baekho', when: { ageMin: 15 } },
  // 사천화 — 약·독 의가의 딸, 신중·자존, 가전을 노리는 외부 위협.
  { id: 'sig-cheonhwa-1', category: 'daily', mood: 'normal', body: '사부님, 이 약초는 향이 익숙합니다. 집에서도 다뤘거든요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-2', category: 'training', mood: 'normal', body: '암기와 독은 깊이가 끝이 없어요. 더 깊이 배우고 싶습니다.', onlyFor: 'sa-cheonhwa', when: { ageMin: 11 } },
  { id: 'sig-cheonhwa-3', category: 'worry', mood: 'homesick', body: '집에 위기가 있다는 소식이 왔어요. ... 가봐야 할까요, 사부님.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-4', category: 'relation', mood: 'enmity', body: '... 가전을 노리는 자들의 그림자가, 사문에까지 닿을까 두렵습니다.', onlyFor: 'sa-cheonhwa', when: { hasEnemy: true } },
  { id: 'sig-cheonhwa-5', category: 'worry', mood: 'identity', body: '약왕(藥王)이 되고 싶어요. 단, 집안도 잇고 싶고요. ... 둘 다 욕심일까요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 14 } },
  { id: 'sig-cheonhwa-6', category: 'worry', mood: 'darkening', body: '어둠은 어둠으로 갚는 수밖에 없는 걸까요. ... 가끔 그런 생각이 듭니다.', onlyFor: 'sa-cheonhwa', when: { darknessRiskMin: 'medium' } },
];

// 한 마디 발화 컨텍스트 — 제자 현재 상태 스냅샷(oneLinerSystem 에서 산출).
export interface OneLinerCtx {
  discipleId: string; // 발화 제자(poolId) — 캐릭터 전용 시그니처 필터용
  stress: number;
  staminaPct: number;
  trust: number;
  darknessRisk: 'low' | 'medium' | 'high';
  hasEnemy: boolean;
  age: number;
  mainSeong: number;
  rivalName: string | null; // 자신보다 앞선 최강 동문 이름(없으면 null)
  isWeakest: boolean; // 사문 최약
  saidIds: string[]; // 이미 건넨 특이 대사 id — 중복 배제(같은 특이 대사 2번 금지). docs/12
}

const RISK_RANK: Record<'low' | 'medium' | 'high', number> = { low: 0, medium: 1, high: 2 };

// 나이 조건 스케일 — 면담·한마디의 ageMin/ageMax 는 "10세 입문 → 15세 하산" 옛 5년 호로 작성됨
// (child≤10 · growth 10-12 · turmoil 13-14 · departure 15+). 실제 양육은 RAISING_YEARS(15년, 10→25세)라,
// 실제 나이를 옛 스케일로 눌러 같은 인생 곡선을 15년에 그대로 펼친다. 데이터(생성물 포함)는 손대지 않는다. docs/06·12.
// 마지막 DEPARTURE_LEAD(2년)은 departure(출도전기)로 비워, "곧 하산" 대사가 하산 직전부터 뜨게 한다.
const CONTENT_ENTRY_AGE = 10; // 입문 나이(압축 기준점)
const CONTENT_ARC = 5; // 옛 콘텐츠 호 길이(10→15세)
const DEPARTURE_LEAD = 2; // 하산 직전 출도전기 길이(년)
const RAISING_ARC = GRADUATION.RAISING_YEARS - DEPARTURE_LEAD; // 콘텐츠 호를 펼칠 실제 구간(10→23세)
function toContentAge(realAge: number): number {
  return CONTENT_ENTRY_AGE + (realAge - CONTENT_ENTRY_AGE) * (CONTENT_ARC / RAISING_ARC);
}

// "특이한" 한 마디로 보는 결 — 무거운 감정 비트는 한 번만(두 번 이상 금지). 가벼운 결
// (normal·calm·weary·pride·rival)은 평상시 기복이라 반복 허용. docs/12. (사용자 룰 2026-06-23)
const ONCE_ONLY_MOODS = new Set<OneLinerMood>(['darkening', 'distrust', 'enmity', 'identity', 'homesick']);

// 한 번만 써야 하는 특이 대사인가 — 캐릭터 전용(시그니처) 또는 무거운 감정결.
export function isDistinctiveOneLiner(t: OneLinerTemplate): boolean {
  return t.onlyFor != null || (t.mood != null && ONCE_ONLY_MOODS.has(t.mood));
}

// 모순 방지 — 결이 현재 상태와 톤이 어긋나면 배제. 핵심: 흑화 기미 중엔 '평온'한 한 마디 금지
// ("누군가를 꺾고 싶다" 직후 "차 한 잔이 제일 좋습니다" 류 톤 충돌 차단). when 게이트로 못 막는 결 모순 보강.
function moodConsistent(t: OneLinerTemplate, c: OneLinerCtx): boolean {
  // 평온은 흑화 기미 없고(흑화↔평온 차단) + 사부 신뢰가 최소선은 될 때만 — 불신(저신뢰)과 평온이
  // 며칠 새 오가는 톤 급변 차단(이력분석 2026-06-23: 백연 calm↔distrust 다발). distrust 게이트는 trustMax≤38.
  if (t.mood === 'calm' && (c.darknessRisk !== 'low' || c.trust < 40)) return false;
  return true;
}

// 이번 ctx 에서 발화 가능한 템플릿인가 — 상태(when) + 모순(mood) + 중복(특이 대사 1회).
function eligible(t: OneLinerTemplate, c: OneLinerCtx): boolean {
  if (!matchesCondition(t.when, c)) return false;
  if (!moodConsistent(t, c)) return false;
  if (isDistinctiveOneLiner(t) && c.saidIds.includes(t.id)) return false; // 이미 건넨 특이 대사 = 제외
  return true;
}

// 상황 조건 매처 — 한마디·면담 공용.
export function matchesCondition(w: OneLinerCondition | undefined, c: OneLinerCtx): boolean {
  if (!w) return true;
  if (w.stressMin != null && c.stress < w.stressMin) return false;
  if (w.stressMax != null && c.stress > w.stressMax) return false;
  if (w.staminaPctMax != null && c.staminaPct > w.staminaPctMax) return false;
  if (w.trustMin != null && c.trust < w.trustMin) return false;
  if (w.trustMax != null && c.trust > w.trustMax) return false;
  if (w.darknessRiskMin != null && RISK_RANK[c.darknessRisk] < RISK_RANK[w.darknessRiskMin]) return false;
  if (w.darknessRiskMax != null && RISK_RANK[c.darknessRisk] > RISK_RANK[w.darknessRiskMax]) return false;
  if (w.hasEnemy != null && c.hasEnemy !== w.hasEnemy) return false;
  if (w.ageMin != null || w.ageMax != null) {
    const a = toContentAge(c.age); // 실제 나이 → 옛 5년 호 스케일로 압축해 비교
    if (w.ageMin != null && a < w.ageMin) return false;
    if (w.ageMax != null && a > w.ageMax) return false;
  }
  if (w.seongMin != null && c.mainSeong < w.seongMin) return false;
  if (w.needsRival && !c.rivalName) return false;
  if (w.isWeakest != null && c.isWeakest !== w.isWeakest) return false;
  return true;
}

// 현재 상태에 맞는 한 마디 중 1개. 캐릭터 전용 시그니처가 있으면 우선(60%) — 매일 보는 한 마디가
// 제자마다 달라지게(캐릭터 매력). 다른 제자 전용은 자동 제외. 맞는 게 없으면 null(그 날 발화 X). docs/12.
export function pickContextualOneLiner(c: OneLinerCtx): OneLinerTemplate | null {
  const matched = ONE_LINERS.filter((t) => eligible(t, c)); // 상태+모순+중복 게이트
  const sig = matched.filter((t) => t.onlyFor === c.discipleId);
  const uni = matched.filter((t) => !t.onlyFor);
  const useSig = sig.length > 0 && (uni.length === 0 || random() < 0.6);
  const pool = useSig ? sig : uni;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)];
}

// LLM function-calling 선택용 후보 — 조건 맞는 대사(전용 있으면 전용+공용). LLM 이 이 중 하나를
// 상황에 맞게 고른다. 폴백(모델 off·실패)은 pickContextualOneLiner(룰, 전용 우선). docs/12·17.
export function candidateOneLiners(c: OneLinerCtx): OneLinerTemplate[] {
  const matched = ONE_LINERS.filter((t) => eligible(t, c)); // 중복·모순 제거된 후보만 LLM 에 노출
  const sig = matched.filter((t) => t.onlyFor === c.discipleId);
  const uni = matched.filter((t) => !t.onlyFor);
  return sig.length ? [...sig, ...uni] : uni;
}

// 발화 이력 id → 최근 본문 N개(LLM 모순 방지 프롬프트용). 모르는 id(삭제된 대사)는 건너뜀.
export function recentSaidBodies(saidIds: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = saidIds.length - 1; i >= 0 && out.length < n; i--) {
    const t = ONE_LINERS.find((x) => x.id === saidIds[i]);
    if (t) out.push(t.body);
  }
  return out;
}

// 본문 변수 치환 — {rival}=최강 동문 이름. 발화 시점에 실제 이름으로 박는다.
export function fillOneLinerBody(body: string, c: OneLinerCtx): string {
  // {rival} 치환 + 조사 자동 교정(받침 분기). 출처는 활성 동문(buildDiscipleCtx)·없으면 '동문'. docs/37.
  return fillName(body, { rival: c.rivalName ?? '동문' });
}

// 사부 응답 풀 — 톤별. 한 마디와 무관하게 범용으로 사용. 대사 또는 행동.
// 행동은 (괄호) 결로 표기 — 무협 소설 톤.
export const ONE_LINER_RESPONSES: Record<OneLinerTone, readonly string[]> = {
  encourage: [
    '그만하면 잘 견디고 있다. 조급함만 내려놓으면 길이 보일 게다.',
    '꽃은 재촉한다고 일찍 피지 않는다. 너에게도 너의 때가 온다.',
    '오늘 한 걸음이 하찮아 보여도, 십 년이면 천 걸음이 된다.',
    '나도 네 나이엔 그 자리에서 오래 헤맸다. 다 지나가더라.',
    '무공은 재주가 아니라 그 꾸준함에서 나오는 법이다.',
    '그 마음을 잊지 마라. 검보다 그것이 너를 멀리 데려간다.',
  ],
  nod: [
    '(천천히 고개를 끄덕이곤, 말을 아낀다.)',
    '(말없이 식은 차를 새로 따라 준다.)',
    '(먼 산을 한참 바라보다 옅게 웃는다.)',
    '(붓을 내려놓고, 네 눈을 가만히 들여다본다.)',
    '"...그랬구나." (그 한 마디뿐이다.)',
    '(곁에 앉아 함께 잠시 침묵해 준다.)',
  ],
  caution: [
    '마음이 풀어지면 검끝부터 무뎌지는 법이다.',
    '오늘의 깨달음이 내일도 네 것이리라 믿지 마라.',
    '자만은 가장 먼저 찾아드는 적이다. 스스로를 경계하라.',
    '그 말이 진심인지, 한 번 더 자신에게 물어보아라.',
    '쉬운 길은 대개 더 멀리 돌아가게 만든다.',
    '검을 탓하기 전에, 그 검을 쥔 마음을 먼저 보아라.',
  ],
  ignore: [
    '(잠시 침묵하다, 다시 붓을 든다.)',
    '그것은 끝내 네가 스스로 답해야 할 물음이다.',
    '(말없이 자리를 고쳐 앉을 뿐이다.)',
    '지금은 내가 답할 자리가 아니다.',
    '스스로 겪어야만 알게 되는 것도 있는 법이다.',
    '(대답 대신, 너를 한참 응시한다.)',
  ],
};

export function pickRandomOneLiner(): OneLinerTemplate {
  // 제자 무관 무작위 — 캐릭터 전용은 제외(엉뚱한 제자에 시그니처가 붙지 않게).
  const pool = ONE_LINERS.filter((t) => !t.onlyFor);
  return pool[Math.floor(random() * pool.length)];
}

export function pickResponse(tone: OneLinerTone): string {
  const pool = ONE_LINER_RESPONSES[tone];
  const idx = Math.floor(random() * pool.length);
  return pool[idx];
}
