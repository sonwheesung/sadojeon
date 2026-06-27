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
  mourning?: boolean; // 동문 상실 애도 중에만(grief·위로 면담) / false=애도 아닐 때만. docs/12
  siblingEvent?: 'envy' | 'admire' | 'worry'; // 동문 경사·이변 반응 중 — 질투/축하/걱정. docs/12
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
  | 'enmity' // 적의·응어리
  | 'grief'; // 상실·애도 (동문 사망 후 mourning)

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

  // 상실·애도 — 동문 사망 후(mourning). 관찰 가능한 슬픔으로만(숨은변수 직설 X). 반복 허용(once-only 아님).
  { id: 'gr1', category: 'daily', mood: 'grief', body: '... 빈자리가 자꾸 눈에 밟힙니다. 거기 늘 그 동문이 있었는데요.', when: { mourning: true } },
  { id: 'gr2', category: 'worry', mood: 'grief', body: '사부님... 더 강해지면, 다음엔 지킬 수 있을까요. 또 누굴 잃지 않게요.', when: { mourning: true } },
  { id: 'gr3', category: 'daily', mood: 'grief', body: '오늘은 손에 검이 잡히질 않습니다. ... 잠깐, 멍하니 앉아만 있었어요.', when: { mourning: true } },
  { id: 'gr4', category: 'training', mood: 'grief', body: '같이 수련하던 자리가 비어 있으니... 자꾸 그쪽을 보게 됩니다.', when: { mourning: true } },

  // 동문 경사·이변 반응(전이형) — 동문이 경지 올림/크게 다침. 관계 차등(질투/축하/걱정). docs/12.
  { id: 'se-envy1', category: 'relation', mood: 'rival', body: '동문 하나가 또 한 걸음 위로 올라섰다더군요. ... 저는 아직 제자린데요.', when: { siblingEvent: 'envy' } },
  { id: 'se-envy2', category: 'worry', mood: 'rival', body: '다들 저만치 앞서가는데 저만 멈춰 있는 것 같아요. ... 조급해집니다.', when: { siblingEvent: 'envy' } },
  { id: 'se-admire1', category: 'relation', mood: 'normal', body: '동문이 큰 벽을 넘었답니다! ... 제 일처럼 기쁘네요. 저도 곧 따라가야죠.', when: { siblingEvent: 'admire' } },
  { id: 'se-worry1', category: 'relation', mood: 'normal', body: '동문이 크게 다쳐 누웠어요. ... 자꾸 그쪽에 마음이 쓰입니다.', when: { siblingEvent: 'worry' } },
  { id: 'se-worry2', category: 'daily', mood: 'normal', body: '얼른 나아야 할 텐데... 오늘은 어쩐지 수련도 손에 안 잡히네요.', when: { siblingEvent: 'worry' } },

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
  { id: 'amb21', category: 'daily', body: '처마 끝 고드름이 햇살에 녹아 떨어집니다. 봄이 가깝나 봅니다.' },
  { id: 'amb22', category: 'daily', body: '오늘은 연무장에 먼지가 없네요. 어제 누군가 정성껏 쓸었나 봅니다.', when: { stressMax: 60 } },
  { id: 'amb23', category: 'daily', body: '아궁이에 불을 지펴두었습니다. 방이 곧 따뜻해질 거예요.' },
  { id: 'amb24', category: 'daily', body: '뒷산 단풍이 붉게 물들었습니다. 잠깐 올려다보았습니다.', when: { stressMax: 60 } },
  { id: 'amb25', category: 'daily', body: '밤새 눈이 소복이 쌓였어요. 발자국 하나 없는 마당이 곱습니다.' },
  { id: 'amb26', category: 'relation', body: '동문이 먼저 인사를 건네왔습니다. 기분 좋은 아침입니다.', when: { stressMax: 60 } },
  { id: 'amb27', category: 'daily', body: '우물가에 살얼음이 끼었습니다. 손이 시려도 정신은 맑습니다.' },
  { id: 'amb28', category: 'training', body: '오늘은 목검 소리가 제법 매섭게 울렸습니다.', when: { stressMax: 60 } },
  { id: 'amb29', category: 'daily', body: '마루에 앉아 처마에 듣는 빗소리를 한참 들었습니다.', when: { stressMax: 60 } },
  { id: 'amb30', category: 'daily', body: '부엌에서 구수한 냄새가 납니다. 오늘 끼니가 기대됩니다.' },
  { id: 'amb31', category: 'daily', body: '마당 감나무에 까치가 앉았습니다. 좋은 소식이 오려나요.', when: { stressMax: 60 } },
  { id: 'amb32', category: 'daily', body: '서늘한 새벽 공기가 좋습니다. 하루를 여는 기분이 듭니다.' },
  { id: 'amb33', category: 'training', body: '손바닥 굳은살을 들여다봤습니다. 헛되이 보낸 날은 없었네요.', when: { stressMax: 60 } },
  { id: 'amb34', category: 'daily', body: '장독대 항아리를 닦아두었습니다. 햇빛에 반들반들합니다.' },
  { id: 'amb35', category: 'relation', body: '동문들 웃음소리가 마당을 넘어옵니다. 사문이 살아 있는 듯해요.', when: { stressMax: 65 } },
  { id: 'amb36', category: 'daily', body: '바람결에 풍경 소리가 맑게 울립니다. 마음이 따라 가라앉네요.', when: { stressMax: 55 } },
  { id: 'amb37', category: 'daily', body: '오늘은 별이 유난히 총총합니다. 잠시 마당에 서 있었어요.', when: { stressMax: 60 } },
  { id: 'amb38', category: 'training', body: '검집을 새 끈으로 동여맸습니다. 손에 착 감깁니다.', when: { stressMax: 60 } },
  { id: 'amb39', category: 'daily', body: '계곡에 물 길러 다녀왔습니다. 물맛이 차고 답니다.' },
  { id: 'amb40', category: 'daily', body: '문풍지를 새로 발랐어요. 외풍이 한결 덜합니다.' },

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

  // ════ 캐릭터별 일상 한 마디 (캐릭터당 30, 반복 허용·단조 방지·고유 결). 사용자 지시 2026-06-23 ════
  // 장철 — 농촌 우직, 힘쓰는 일·가족·고향·약자 보호.
  { id: 'sig-jang-d01', category: 'daily', body: '사부님! 이 돌절구 무거운데, 제가 옮겨둘게요.', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-d02', category: 'daily', body: '마당에 잡초 났어요. 뽑는 건 제가 잘해요, 헤헤.', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-d03', category: 'daily', body: '오늘 끼니 정말 맛있었어요. 한 그릇 더 먹어도 돼요?', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d04', category: 'daily', mood: 'homesick', body: '우리 마을은 지금쯤 모내기 한창일 텐데...', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d05', category: 'training', body: '주먹 백 번 더 칠게요. 손에 굳은살 박이는 거 좋아요.', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d06', category: 'daily', body: '사부님, 산에서 장작 패 왔어요. 겨울 따뜻하게 나세요.', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-d07', category: 'relation', body: '동문이 무거운 짐 들길래 제가 대신 졌어요. 저는 힘세니까요.', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d08', category: 'daily', mood: 'homesick', body: '새벽에 닭 우는 소리가 없으니 영 잠이 깨질 않아요.', onlyFor: 'jang-cheol', when: { ageMax: 11 } },
  { id: 'sig-jang-d09', category: 'daily', body: '비 와요! 고향에도 이 비가 닿으면 좋겠는데.', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d10', category: 'training', body: '사부님, 무거운 거 드는 수련 또 없어요? 그건 자신 있어요.', onlyFor: 'jang-cheol', when: { ageMax: 12 } },
  { id: 'sig-jang-d11', category: 'daily', body: '사부님, 창고 문짝이 삐걱대길래 제가 손봐뒀습니다.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d12', category: 'training', body: '땀 흘리고 나면 마음이 개운합니다. 밭일 끝낸 기분이에요.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d13', category: 'daily', body: '우물물 길어다 부엌에 채워뒀어요. 힘쓰는 일은 맡겨주세요.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d14', category: 'relation', body: '동문들 보면 형 생각이 나요. 다들 잘됐으면 좋겠습니다.', onlyFor: 'jang-cheol', when: { ageMin: 13 } },
  { id: 'sig-jang-d15', category: 'daily', mood: 'homesick', body: '가을 냄새가 나요. 추수 끝나면 마을 잔치 열렸는데.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d16', category: 'training', body: '저는 빠르진 않아도 끈기는 있습니다. 천천히 가겠습니다.', onlyFor: 'jang-cheol', when: { ageMin: 13 } },
  { id: 'sig-jang-d17', category: 'daily', body: '담장 무너진 데 흙 다져뒀어요. 이런 건 손에 익었거든요.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d18', category: 'relation', body: '어린 동문이 넘어졌길래 일으켜 줬어요. 안 다쳐서 다행이에요.', onlyFor: 'jang-cheol', when: { ageMin: 13 } },
  { id: 'sig-jang-d19', category: 'daily', body: '눈 오면 마당 쓸어둘게요. 사부님 미끄러지면 안 되니까요.', onlyFor: 'jang-cheol', when: { ageMin: 12 } },
  { id: 'sig-jang-d20', category: 'training', mood: 'pride', body: '몸이 단단해지는 게 느껴집니다. 이 길은 제게 맞아요.', onlyFor: 'jang-cheol', when: { ageMin: 13 } },
  { id: 'sig-jang-d21', category: 'daily', body: '사부님, 오늘도 마당 한 바퀴 둘러봤습니다. 별일 없습니다.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-d22', category: 'relation', mood: 'calm', body: '저는 이끄는 재주는 없어도, 곁을 지키는 건 할 수 있습니다.', onlyFor: 'jang-cheol', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-jang-d23', category: 'daily', mood: 'calm', body: '나무 그늘에 앉아 산바람 쐬니 좋네요. 고향 들판 같습니다.', onlyFor: 'jang-cheol', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-jang-d24', category: 'training', body: '화려한 무공은 못 익혀도, 손에 익은 건 흔들리지 않습니다.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-d25', category: 'daily', body: '겨울 땔감 넉넉히 쟁여뒀습니다. 추워도 걱정 마세요.', onlyFor: 'jang-cheol', when: {} },
  { id: 'sig-jang-d26', category: 'relation', body: '약한 사람을 지키는 무인이 되고 싶습니다. 그거면 됩니다.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-d27', category: 'daily', mood: 'homesick', body: '손마디가 굵어졌네요. 아버지 손도 이랬습니다.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-d28', category: 'daily', body: '무거운 짐은 제게 맡기세요. 그게 제일 잘하는 일입니다.', onlyFor: 'jang-cheol', when: {} },
  { id: 'sig-jang-d29', category: 'training', body: '오늘도 한 걸음입니다. 밭은 하루에 다 갈리지 않으니까요.', onlyFor: 'jang-cheol', when: { ageMin: 15 } },
  { id: 'sig-jang-d30', category: 'relation', mood: 'calm', body: '사문이 조용한 게 좋습니다. 다들 무탈한 거니까요.', onlyFor: 'jang-cheol', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },

  // 진소화 — 의술·약초·환 짓기, 사람 살리는 손, 동문 보살핌.
  { id: 'sig-sohwa-d01', category: 'daily', body: '마당 구석에 쑥이 돋았네요. 베지 말고 좀 말려둘게요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d02', category: 'daily', body: '아침 안개가 짙어요. 이런 날엔 약초 잎에 이슬이 곱게 맺혀요.', onlyFor: 'jin-sohwa', when: { ageMax: 11 } },
  { id: 'sig-sohwa-d03', category: 'daily', body: '끼니에 도라지를 좀 넣었어요. 목에 좋거든요, 다들 드셔보세요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d04', category: 'daily', body: '약 주머니 끈이 닳아서 새로 묶었어요. 이젠 잘 안 풀려요.', onlyFor: 'jin-sohwa', when: { ageMax: 11 } },
  { id: 'sig-sohwa-d05', category: 'daily', mood: 'homesick', body: '어머니 약방에선 이맘때 진피를 널어 말렸는데... 냄새가 참 좋았어요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d06', category: 'relation', body: '동문 손에 가시가 박혔길래 뽑아줬어요. 울지도 않더라고요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d07', category: 'daily', body: '비가 오려나 봐요. 무릎 아픈 마을 어른들이 늘 이맘때 말했거든요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d08', category: 'training', body: '오늘은 손끝에 기운 모으는 연습을 했어요. 환 빚을 때랑 비슷하더라고요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d09', category: 'daily', body: '솥에 약을 올렸어요. 너무 세게 끓이면 약효가 날아가요.', onlyFor: 'jin-sohwa', when: { ageMax: 12 } },
  { id: 'sig-sohwa-d10', category: 'daily', body: '제 키가 동문들보다 작아도, 약초밭 이랑은 제가 제일 잘 가꿔요.', onlyFor: 'jin-sohwa', when: { ageMax: 11 } },
  { id: 'sig-sohwa-d11', category: 'daily', body: '햇볕 좋은 날엔 약재를 다 꺼내 말려요. 곰팡이가 제일 무섭거든요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d12', category: 'training', mood: 'calm', body: '청심결을 외니 마음이 가라앉아요. 약을 달일 때도 이 마음이면 좋아요.', onlyFor: 'jin-sohwa', when: { ageMin: 12, trustMin: 45, stressMax: 40 } },
  { id: 'sig-sohwa-d13', category: 'relation', body: '{rival}가 어제 무리했는지 안색이 안 좋아요. 따뜻한 차라도 끓여드릴까 봐요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d14', category: 'daily', mood: 'pride', body: '활혈단 한 솥을 새로 빚었어요. 누가 다쳐도 이젠 덜 걱정이에요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d15', category: 'daily', body: '가을이라 단풍 들기 전에 마지막 약초를 거둬야 해요. 손이 바빠요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d16', category: 'daily', body: '뒷산 골짜기에 자령초가 한 무더기 있더라고요. 봐둔 자리 잊지 않으려고요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d17', category: 'relation', body: '동문들 약 챙기다 보면 하루가 짧아요. 그래도 이 일이 좋아요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d18', category: 'training', body: '검을 쥔 동문 옆에서 저는 붕대를 말아요. 각자 자리가 있는 거겠죠.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d19', category: 'daily', body: '약 냄새가 옷에 다 뱄어요. 이젠 이 냄새가 안 나면 허전해요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d20', category: 'daily', body: '겨울엔 약초가 귀해요. 미리 말려둔 걸로 환을 넉넉히 빚어둘게요.', onlyFor: 'jin-sohwa', when: { ageMin: 12 } },
  { id: 'sig-sohwa-d21', category: 'daily', mood: 'calm', body: '약재 항아리에 이름표를 다 붙였어요. 급할 때 헷갈리면 안 되니까요.', onlyFor: 'jin-sohwa', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-sohwa-d22', category: 'relation', mood: 'pride', body: '제가 빚은 환을 동문들이 군말 없이 삼켜줄 때, 마음이 참 놓여요.', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },
  { id: 'sig-sohwa-d23', category: 'daily', body: '손에 굳은살이 박였어요. 약초 다듬느라 생긴 거예요. 부끄럽진 않아요.', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },
  { id: 'sig-sohwa-d24', category: 'daily', mood: 'weary', body: '연단실 불을 밤새 지키고 왔어요. 약은 사람처럼, 손 안 가면 상하거든요.', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },
  { id: 'sig-sohwa-d25', category: 'training', body: '이제 작은 상처는 침으로 막아요. 동문 손 떨릴 일은 제가 줄여야죠.', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },
  { id: 'sig-sohwa-d26', category: 'daily', mood: 'homesick', body: '약방을 다시 열면 이 향초부터 걸어둘 거예요. 어머니 가게처럼요.', onlyFor: 'jin-sohwa', when: { ageMin: 15 } },
  { id: 'sig-sohwa-d27', category: 'daily', mood: 'calm', body: '봄볕에 약초를 너니 마당이 환해요. 이런 날이면 마음도 같이 펴져요.', onlyFor: 'jin-sohwa', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-sohwa-d28', category: 'relation', body: '다친 데를 숨기는 동문이 제일 미워요. 곪기 전에 보여줘야 하는데.', onlyFor: 'jin-sohwa', when: {} },
  { id: 'sig-sohwa-d29', category: 'daily', body: '약 달이는 냄새 맡으면 다들 모여들어요. 사문 마당이 약방 같아졌어요.', onlyFor: 'jin-sohwa', when: {} },
  { id: 'sig-sohwa-d30', category: 'daily', body: '손 시린 날엔 약초 다듬기가 더뎌요. 그래도 한 잎 한 잎 정성껏요.', onlyFor: 'jin-sohwa', when: {} },

  // 한바람 — 거리 자란 자유·떠돌이, 빠른 보법, 바깥 동경.
  { id: 'sig-baram-d01', category: 'daily', body: '담장 위가 제일 좋아요. 여기 앉으면 멀리까지 다 보여요.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d02', category: 'daily', body: '사부님, 신발 또 닳았어요. 가만있질 못해서 그런가 봐요.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d03', category: 'daily', body: '방 안에만 있으면 발이 근질거려요. 마당 한 바퀴 돌고 올게요!', onlyFor: 'han-baram', when: { ageMax: 11 } },
  { id: 'sig-baram-d04', category: 'daily', body: '오늘 아침밥 뭐예요? 거리에선 이런 거 못 먹었는데.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d05', category: 'training', body: '눈 감고도 지붕까지 뛰어올라요. 한번 보실래요?', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d06', category: 'daily', body: '저 새가 어디로 가는지 따라가 봤어요. 산 너머까지요!', onlyFor: 'han-baram', when: { ageMax: 11 } },
  { id: 'sig-baram-d07', category: 'training', body: '발 디딜 자리는 발이 먼저 알아요. 머리로 생각 안 해도요.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d08', category: 'daily', body: '문 닫고 자는 거, 아직도 좀 답답해요. 그래도 따뜻하긴 해요.', onlyFor: 'han-baram', when: { ageMax: 12 } },
  { id: 'sig-baram-d09', category: 'daily', body: '바람 부는 날이 제일 좋아요. 뛰면 같이 날아가는 기분이라.', onlyFor: 'han-baram', when: {} },
  { id: 'sig-baram-d10', category: 'daily', mood: 'homesick', body: '저잣거리 냄새가 그리워요. 사람 많고 시끌시끌한 거요.', onlyFor: 'han-baram', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-baram-d11', category: 'training', body: '느리게 걷는 게 더 어려워요. 빨리 가는 건 쉬운데.', onlyFor: 'han-baram', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-baram-d12', category: 'daily', body: '뒷산 길을 다 외웠어요. 지름길도 세 개나 찾았고요.', onlyFor: 'han-baram', when: { ageMin: 12 } },
  { id: 'sig-baram-d13', category: 'daily', body: '오늘 장 서는 날이죠? 잠깐 구경만 하고 올게요.', onlyFor: 'han-baram', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-baram-d14', category: 'relation', body: '{rival}랑 산비탈에서 누가 빠른지 겨뤘어요. 제가 이겼고요!', onlyFor: 'han-baram', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-baram-d15', category: 'training', body: '발소리 안 내고 걷는 거, 거리에서 배운 거예요. 쓸 데가 많네요.', onlyFor: 'han-baram', when: { ageMin: 12 } },
  { id: 'sig-baram-d16', category: 'daily', body: '한자리에 오래 앉아 있으면 좀이 쑤셔요. 사부님은 어떻게 참아요?', onlyFor: 'han-baram', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-baram-d17', category: 'relation', mood: 'calm', body: '동문들이랑 같이 밥 먹는 거, 생각보다 나쁘지 않네요.', onlyFor: 'han-baram', when: { ageMin: 13, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baram-d18', category: 'daily', body: '비 오는 날엔 처마 밑이 최고예요. 빗소리 듣는 거 좋아해요.', onlyFor: 'han-baram', when: { ageMin: 12 } },
  { id: 'sig-baram-d19', category: 'training', body: '몸이 가벼워야 멀리 가요. 그래서 무거운 건 안 들어요.', onlyFor: 'han-baram', when: { ageMin: 12 } },
  { id: 'sig-baram-d20', category: 'daily', body: '별 보면서 자던 버릇이 남았어요. 가끔 마당에서 자도 돼요?', onlyFor: 'han-baram', when: { ageMin: 13 } },
  { id: 'sig-baram-d21', category: 'daily', mood: 'calm', body: '오늘은 마음이 차분해요. 어디 안 나가고 그냥 여기 있을래요.', onlyFor: 'han-baram', when: { ageMin: 13, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baram-d22', category: 'daily', body: '저는 갇힌 곳이 싫지, 사람이 싫은 건 아니에요. 헷갈리지 마세요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d23', category: 'daily', body: '산 아래 길이 어디로 이어지는지, 끝까지 가보고 싶어요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d24', category: 'training', mood: 'pride', body: '이제 보법은 발이 알아서 해요. 머리는 다른 걸 봐도 돼요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d25', category: 'relation', body: '약한 동문 하나가 자꾸 눈에 밟혀요. 그냥... 챙기게 되네요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d26', category: 'daily', body: '발 빠른 게 도망치는 데만 쓰이는 줄 알았는데, 아니더라고요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d27', category: 'daily', body: '여기 밥은 늘 같은 시간에 나와서 좋아요. 굶을 걱정이 없잖아요.', onlyFor: 'han-baram', when: { ageMin: 13 } },
  { id: 'sig-baram-d28', category: 'daily', body: '담 너머 세상이 궁금해요. 넓고, 가보지 못한 데가 많으니까요.', onlyFor: 'han-baram', when: { ageMin: 15 } },
  { id: 'sig-baram-d29', category: 'relation', mood: 'calm', body: '{rival}가 같이 산길 가자고 했어요. 동무 생기는 거, 나쁘지 않네요.', onlyFor: 'han-baram', when: { ageMin: 13, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baram-d30', category: 'daily', mood: 'weary', body: '오늘은 좀 지쳤어요. 멀리까지 뛰어갔다 왔거든요.', onlyFor: 'han-baram', when: { ageMin: 13 } },

  // 윤소소 — 양반가 정파 검녀, 올곧음·단정함, 어머니 가르침.
  { id: 'sig-yun-d01', category: 'daily', body: '아침에 일어나면 옷매무새부터 가다듬어요. 어머니 가르침이라.', onlyFor: 'yun-soso', when: { ageMax: 11 } },
  { id: 'sig-yun-d02', category: 'training', body: '검 한 자루는 똑바로 서야 해요. 비뚤어진 검은 검이 아니에요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d03', category: 'daily', body: '저녁마다 그날 배운 글을 한 번 더 읽어요. 머리에 새기려고요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d04', category: 'training', body: '같은 베기를 백 번 하면 손이 길을 외워요. 어제보다 곧아졌어요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d05', category: 'daily', body: '무명옷도 단정하면 부끄럽지 않아요. 자세가 옷보다 중하니까요.', onlyFor: 'yun-soso', when: { ageMax: 11 } },
  { id: 'sig-yun-d06', category: 'daily', body: '책상 위 붓과 검은 늘 제자리에 둬요. 어수선한 건 못 봐요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d07', category: 'relation', body: '동문이 글자를 모른다 하기에 한 자씩 적어 보여줬어요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d08', category: 'training', body: '사부님, 오늘 검결 한 구절만 더 봐주세요. 자세가 맞는지요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d09', category: 'daily', body: '아침 마당을 쓸어요. 깨끗한 자리에서 검을 들고 싶어서요.', onlyFor: 'yun-soso', when: { ageMax: 11 } },
  { id: 'sig-yun-d10', category: 'daily', mood: 'homesick', body: '어머니 편지가 왔어요. 잘 계신다니, 마음이 놓이네요.', onlyFor: 'yun-soso', when: { ageMax: 12 } },
  { id: 'sig-yun-d11', category: 'training', body: '검을 쥔 손에 굳은살이 박였어요. 부끄럽지 않은 손이에요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d12', category: 'daily', body: '병법 책을 한 권 빌렸어요. 진을 짜는 법이 재미있어요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d13', category: 'training', body: '오늘은 발놀림을 다듬었어요. 검만 빨라선 소용없다더군요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d14', category: 'daily', body: '예법은 약한 게 아니에요. 곧은 사람이 갖추는 것이지요.', onlyFor: 'yun-soso', when: { ageMin: 13 } },
  { id: 'sig-yun-d15', category: 'relation', body: '동문이 자세가 흐트러지기에 한마디 했어요. 미움받아도 옳은 건 옳으니까요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d16', category: 'training', body: '검결을 다 외웠어요. 이제 뜻을 새겨야 한다더군요.', onlyFor: 'yun-soso', when: { ageMin: 13 } },
  { id: 'sig-yun-d17', category: 'daily', body: '단정한 매무새는 흐트러진 마음을 잡아줘요. 어머니 말씀이 맞아요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d18', category: 'training', body: '청풍검의 한 초식이 손에 붙었어요. 곧은 길이 보이는 듯해요.', onlyFor: 'yun-soso', when: { ageMin: 13 } },
  { id: 'sig-yun-d19', category: 'daily', body: '글을 읽다 좋은 구절을 베껴 적었어요. 의를 말한 글이 좋아요.', onlyFor: 'yun-soso', when: { ageMin: 12 } },
  { id: 'sig-yun-d20', category: 'relation', mood: 'calm', body: '동문과 검을 맞대보았어요. 서로 곧으면 배우는 게 많네요.', onlyFor: 'yun-soso', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-yun-d21', category: 'training', body: '하산이 멀지 않으니, 검 하나는 부끄럽지 않게 세워두려 해요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d22', category: 'daily', body: '아침마다 같은 자리에서 검을 들어요. 흔들리지 않으려고요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d23', category: 'daily', body: '검은 사람을 지키는 것이라 들었어요. 그 말을 늘 새기고 있어요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d24', category: 'training', body: '이제 백 번 베지 않아도 손이 알아요. 그래도 게을리하진 않아요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d25', category: 'relation', body: '어린 동문에게 검결 한 줄을 적어 줬어요. 제가 받은 걸 돌려주는 거죠.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d26', category: 'daily', body: '병법을 익히니 강호가 조금 보여요. 의로 서는 길을 가려고요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d27', category: 'training', mood: 'pride', body: '검끝이 흔들리지 않게 됐어요. 마음이 곧으면 검도 곧다더군요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d28', category: 'daily', mood: 'calm', body: '단정히 앉아 차를 한 잔 마셔요. 이런 고요함이 좋아졌어요.', onlyFor: 'yun-soso', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-yun-d29', category: 'daily', mood: 'homesick', body: '먼 길을 걸어도 등은 곧게 펴요. 어머니가 보고 계신 듯해서요.', onlyFor: 'yun-soso', when: { ageMin: 15 } },
  { id: 'sig-yun-d30', category: 'relation', body: '동문들이 의젓해졌다 하니, 조금 쑥스럽네요. 그저 본분일 뿐인데.', onlyFor: 'yun-soso', when: { ageMin: 15 } },

  // 강무열 — 무관 셋째, 가문 명예·책임감, 도법, 동문 챙김. (출시후 캐릭터, 콘텐츠 선행 작성)
  { id: 'sig-muyeol-d01', category: 'daily', body: '아침마다 마당부터 쓸어요. 무관에선 그게 첫 수련이었어요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d02', category: 'training', body: '도를 쥐면 마음이 단단해져요. 손에 제일 잘 맞아요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d03', category: 'daily', body: '집 떠나 처음엔 낯설었는데, 이젠 여기가 좋아요.', onlyFor: 'gang-muyeol', when: { ageMax: 11 } },
  { id: 'sig-muyeol-d04', category: 'relation', body: '{rival}한테 자리 양보했어요. 동문끼린 챙겨야죠.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d05', category: 'daily', mood: 'homesick', body: '형들한테 편지 왔어요! 저더러 게으름 피우지 말래요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d06', category: 'training', body: '도법 한 동작을 백 번 그어봤어요. 손이 기억할 때까지요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d07', category: 'daily', body: '밥은 남기면 안 돼요. 농사짓는 분들 생각해야죠.', onlyFor: 'gang-muyeol', when: { ageMax: 11 } },
  { id: 'sig-muyeol-d08', category: 'relation', body: '{rival}이 넘어졌길래 일으켜 줬어요. 그게 맞는 거잖아요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d09', category: 'daily', body: '자세 흐트러지면 형들이 등을 탁 쳤어요. 그래서 늘 곧게 앉아요.', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d10', category: 'training', body: '사부님, 오늘은 도를 더 무겁게 휘둘러 봐도 될까요?', onlyFor: 'gang-muyeol', when: { ageMax: 12 } },
  { id: 'sig-muyeol-d11', category: 'training', body: '도 손질은 제 일이에요. 무기를 아끼는 게 무인의 도리죠.', onlyFor: 'gang-muyeol', when: { ageMin: 12 } },
  { id: 'sig-muyeol-d12', category: 'relation', body: '동문이 막히는 동작 있길래 좀 봐줬어요. 가르치니 저도 늘더라고요.', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d13', category: 'daily', body: '강호엔 약한 이를 괴롭히는 무리가 있다죠. 그건 무예가 아니에요.', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d14', category: 'daily', mood: 'pride', body: '형들도 제 나이엔 이만큼 했을까요? 더 해야겠어요.', onlyFor: 'gang-muyeol', when: { ageMin: 12 } },
  { id: 'sig-muyeol-d15', category: 'training', body: '도법은 곧게 베는 게 핵심이에요. 잔재주는 안 배우려고요.', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d16', category: 'relation', mood: 'weary', body: '{rival}이 요즘 지쳐 보여요. 제가 짐을 좀 나눠 들까요?', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d17', category: 'daily', body: '사부님 가르침을 적어 둬요. 잊으면 안 되니까요.', onlyFor: 'gang-muyeol', when: { ageMin: 12 } },
  { id: 'sig-muyeol-d18', category: 'training', mood: 'pride', body: '오늘 한 수 깨우친 것 같아요. 형들한테 보여주고 싶네요.', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d19', category: 'daily', mood: 'homesick', body: '집에서 보낸 옷이 작아졌어요. 그만큼 컸나 봐요.', onlyFor: 'gang-muyeol', when: { ageMin: 12 } },
  { id: 'sig-muyeol-d20', category: 'relation', body: '동문끼린 등을 맡길 수 있어야죠. 합을 더 맞춰보고 싶어요.', onlyFor: 'gang-muyeol', when: { ageMin: 13 } },
  { id: 'sig-muyeol-d21', category: 'daily', mood: 'calm', body: '의젓하게 굴려는 게 아니에요. 그냥 그래야 마음이 편해요.', onlyFor: 'gang-muyeol', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-muyeol-d22', category: 'training', body: '도를 쥔 지 여러 해, 이젠 손이 아니라 마음으로 베요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d23', category: 'relation', body: '어린 동문들 챙기는 게 이젠 제 몫 같아요. 누가 시킨 건 아니에요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d24', category: 'daily', body: '바른 길이 늘 쉬운 길은 아니더라고요. 그래도 그쪽으로 가요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d25', category: 'daily', mood: 'homesick', body: '하산하면 가문 무관을 잇고 싶어요. 형들과 어깨 나란히요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d26', category: 'training', body: '혼자 그어선 더 안 늘어요. 누군가와 겨뤄봐야 보여요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d27', category: 'relation', body: '{rival}과 언젠가 마음 터놓고 얘기하고 싶어요. 동문이니까요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d28', category: 'daily', body: '곤란한 이를 못 본 척은 못 해요. 그게 배운 대로 사는 거죠.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },
  { id: 'sig-muyeol-d29', category: 'daily', mood: 'calm', body: '사부님 가르침은 평생 새기고 살게요. 그게 제 뿌리예요.', onlyFor: 'gang-muyeol', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-muyeol-d30', category: 'training', body: '도가 무뎌지면 사람도 무뎌진다 했죠. 매일 손질하는 이유예요.', onlyFor: 'gang-muyeol', when: { ageMin: 15 } },

  // 이청하 — 어둠에서 나온 옛 살수, 조용함, 온기를 배워감. (일상은 회복·평범의 결)
  { id: 'sig-cheong-d01', category: 'daily', body: '아침 마당이 조용해요. ... 이 조용함은, 무섭지 않은 조용함이네요.', onlyFor: 'i-cheongha', when: { ageMax: 11 } },
  { id: 'sig-cheong-d02', category: 'daily', body: '여기는 밥 때가 되면 꼭 누가 절 불러요. ... 그게 좀 이상해요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d03', category: 'relation', body: '아무 말 안 해도 옆에 앉아 있는 게... 편한 사람도 있더라고요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d04', category: 'daily', body: '창가 자리가 좋아요. 거기 앉으면 마당이 다 보여서요.', onlyFor: 'i-cheongha', when: { ageMax: 11 } },
  { id: 'sig-cheong-d05', category: 'daily', body: '햇볕을... 처음으로 오래 쬐어 봤어요. 따뜻한 거였네요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d06', category: 'training', body: '발소리를 죽이는 건 익숙해요. 근데 일부러 내라셔서, 연습 중이에요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d07', category: 'daily', body: '여기 차는... 쓴맛 끝에 단맛이 와요. 천천히 마시게 돼요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d08', category: 'relation', body: '누가 제 이름을 부르면 아직 좀 놀라요. ... 나쁜 건 아니에요.', onlyFor: 'i-cheongha', when: { ageMax: 11 } },
  { id: 'sig-cheong-d09', category: 'daily', body: '문틈으로 들어오는 바람 소리, 가만히 듣고 있었어요.', onlyFor: 'i-cheongha', when: { ageMax: 12 } },
  { id: 'sig-cheong-d10', category: 'daily', body: '오늘은 악몽 없이 잤어요. ... 작은 일인데, 좀 기뻐요.', onlyFor: 'i-cheongha', when: { ageMax: 12, stressMax: 40 } },
  { id: 'sig-cheong-d11', category: 'daily', body: '연못의 연잎이 비를 받아내는 걸 한참 봤어요. 안 젖더라고요.', onlyFor: 'i-cheongha', when: { ageMin: 12 } },
  { id: 'sig-cheong-d12', category: 'relation', body: '동문이 제 몫까지 떡을 챙겨놨더라고요. ... 어떻게 갚아야 할지요.', onlyFor: 'i-cheongha', when: { ageMin: 12, trustMin: 40 } },
  { id: 'sig-cheong-d13', category: 'training', body: '검을 천천히 닦는 시간이 좋아졌어요. 마음이 같이 가라앉아요.', onlyFor: 'i-cheongha', when: { ageMin: 12 } },
  { id: 'sig-cheong-d14', category: 'daily', body: '요즘은 사람 많은 자리도 끝에 앉아 있곤 해요. 조금씩요.', onlyFor: 'i-cheongha', when: { ageMin: 13, trustMin: 40 } },
  { id: 'sig-cheong-d15', category: 'daily', body: '뒷마당 고양이가 이젠 제 손에 와요. 가만 기다렸더니요.', onlyFor: 'i-cheongha', when: { ageMin: 12 } },
  { id: 'sig-cheong-d16', category: 'relation', mood: 'calm', body: '{rival}가 떠드는 소리, 시끄러운데... 이상하게 안 거슬려요.', onlyFor: 'i-cheongha', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-cheong-d17', category: 'training', body: '보법은 숨소리부터예요. 천천히 들이쉬는 걸 다시 배우는 중이에요.', onlyFor: 'i-cheongha', when: { ageMin: 12 } },
  { id: 'sig-cheong-d18', category: 'daily', mood: 'calm', body: '저녁 종소리가 울리면, 이제 여기 있구나 싶어요.', onlyFor: 'i-cheongha', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-cheong-d19', category: 'daily', body: '마당 쓰는 일을 자청했어요. 손을 움직이면 잡생각이 줄어요.', onlyFor: 'i-cheongha', when: { ageMin: 12 } },
  { id: 'sig-cheong-d20', category: 'relation', body: '아픈 동문 옆에 죽 그릇을 놔두고 왔어요. ... 들키진 않았겠죠.', onlyFor: 'i-cheongha', when: { ageMin: 13, trustMin: 40 } },
  { id: 'sig-cheong-d21', category: 'daily', body: '이젠 옷깃을 덜 여미게 돼요. 여기 공기가 편해서 그런가 봐요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d22', category: 'training', body: '아침마다 같은 자리에서 검을 들어요. 이 반복이 저를 붙잡아 줘요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d23', category: 'relation', mood: 'calm', body: '동문 웃음소리가 멀리서 들리면, 그냥 가만 듣고 있어요.', onlyFor: 'i-cheongha', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-cheong-d24', category: 'daily', body: '오늘은 제가 먼저 인사를 건넸어요. 작은 거지만... 해냈어요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d25', category: 'daily', body: '비 그친 마당 냄새, 좋더라고요. 한참 서서 맡았어요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d26', category: 'relation', body: '어린 동문이 자꾸 따라다녀요. ... 떼어내질 못하겠어요.', onlyFor: 'i-cheongha', when: { ageMin: 15, trustMin: 40 } },
  { id: 'sig-cheong-d27', category: 'training', body: '느리게 베는 연습을 해요. 빠른 건 옛 손이 기억하니까, 일부러요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d28', category: 'daily', mood: 'calm', body: '여기 밤은 조용하지만, 외롭지 않은 조용함이에요. 이제는요.', onlyFor: 'i-cheongha', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-cheong-d29', category: 'daily', body: '약초밭 김매기를 거들었어요. 살리는 일 손에 익히는 중이에요.', onlyFor: 'i-cheongha', when: { ageMin: 15 } },
  { id: 'sig-cheong-d30', category: 'relation', body: '사부님 곁이 제일 마음이 놓여요. ... 이런 말, 이제 할 수 있네요.', onlyFor: 'i-cheongha', when: { ageMin: 15, trustMin: 40 } },

  // 독고연 — 멸문 명문가 생존자, 긍지·자존, 가문의 검. (출시후 캐릭터, 콘텐츠 선행 작성)
  { id: 'sig-dokgo-d01', category: 'daily', body: '검은 매일 닦아 둡니다. 흐려지면 마음도 흐려지니까요.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d02', category: 'daily', body: '아침에 옷매무새부터 바로 합니다. 어머니께서 그리 이르셨어요.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d03', category: 'daily', body: '저는 떠들썩한 자리는 별로예요. 혼자 검을 보는 편이 낫습니다.', onlyFor: 'dokgo-yeon', when: { ageMax: 11 } },
  { id: 'sig-dokgo-d04', category: 'daily', body: '사부님, 식사는 거르지 마세요. 끼니는 곧 몸가짐입니다.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d05', category: 'daily', body: '자세가 굽으면 검도 굽습니다. 그래서 늘 등을 곧게 폅니다.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d06', category: 'daily', body: '허리의 옥패요? ... 그냥 늘 지니는 것입니다. 묻지 마세요.', onlyFor: 'dokgo-yeon', when: { ageMax: 11 } },
  { id: 'sig-dokgo-d07', category: 'daily', mood: 'homesick', body: '어머니께서 끓여주시던 죽이 떠오르네요. 담백한 맛이었어요.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d08', category: 'training', body: '검을 쥐면 마음이 가지런해집니다. 그 느낌이 좋아서요.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d09', category: 'training', body: '같은 검초를 백 번은 그어야 손에 붙습니다. 게으름은 안 됩니다.', onlyFor: 'dokgo-yeon', when: { ageMax: 12 } },
  { id: 'sig-dokgo-d10', category: 'daily', body: '동문들이 시끄러워도 저는 괜찮아요. 제 할 일만 하면 됩니다.', onlyFor: 'dokgo-yeon', when: { ageMax: 11 } },
  { id: 'sig-dokgo-d11', category: 'training', mood: 'pride', body: '가문의 검은 화려하지 않습니다. 곧고 단정한 검이지요.', onlyFor: 'dokgo-yeon', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-dokgo-d12', category: 'training', body: '저는 정통 검법이 좋습니다. 잔재주는 손에 맞지 않아요.', onlyFor: 'dokgo-yeon', when: { ageMin: 12 } },
  { id: 'sig-dokgo-d13', category: 'daily', body: '오늘 새벽에도 홀로 검을 그었습니다. 고요한 시간이 좋습니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 12 } },
  { id: 'sig-dokgo-d14', category: 'training', mood: 'pride', body: '어머니께서 가르쳐주신 검초가 손끝에 남아 있어요. 잊지 않았습니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 13 } },
  { id: 'sig-dokgo-d15', category: 'daily', body: '비단옷이 많이 닳았네요. 그래도 단정히 입으면 됩니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 12, ageMax: 14 } },
  { id: 'sig-dokgo-d16', category: 'relation', body: '약한 동문은 챙겨야지요. 명문가에선 그게 도리라 배웠습니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 12 } },
  { id: 'sig-dokgo-d17', category: 'training', body: '깨달은 것이 있으면 동문에게도 일러줍니다. 검은 나눠야 늡니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 12 } },
  { id: 'sig-dokgo-d18', category: 'daily', body: '책을 읽다 보면 밤이 깊어요. 글 속에 길이 있더군요.', onlyFor: 'dokgo-yeon', when: { ageMin: 13 } },
  { id: 'sig-dokgo-d19', category: 'relation', body: '예를 갖춰 대해주시면 저도 예로 답합니다. 그게 마땅하지요.', onlyFor: 'dokgo-yeon', when: { ageMin: 12 } },
  { id: 'sig-dokgo-d20', category: 'daily', mood: 'pride', body: '저는 칭찬에 들뜨지 않습니다. 그저 다음 검초를 그을 뿐입니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 13 } },
  { id: 'sig-dokgo-d21', category: 'daily', mood: 'calm', body: '마음이 차분할 때 검이 가장 맑습니다. 요즘이 그래요.', onlyFor: 'dokgo-yeon', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-dokgo-d22', category: 'training', body: '검은 이제 몸의 일부 같습니다. 손이 먼저 길을 압니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d23', category: 'training', mood: 'pride', body: '가문의 검을 다시 강호에 세우고 싶습니다. 정통의 결로요.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d24', category: 'daily', body: '산을 내려갈 날이 가까워지네요. 검 하나는 부끄럽지 않게 익혔습니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d25', category: 'relation', body: '사부님의 가르침은 곧고 따뜻했습니다. 그건 평생 기억하겠습니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d26', category: 'training', body: '폐관에 들면 며칠이고 검만 봅니다. 외로움은 익숙합니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d27', category: 'daily', mood: 'pride', body: '옷은 닳아도 자세는 닳지 않습니다. 그건 제가 지키는 것이라서요.', onlyFor: 'dokgo-yeon', when: { ageMin: 15 } },
  { id: 'sig-dokgo-d28', category: 'relation', body: '곧은 동문은 깊이 믿습니다. 의로운 사람은 한눈에 알아봅니다.', onlyFor: 'dokgo-yeon', when: { ageMin: 13 } },
  { id: 'sig-dokgo-d29', category: 'daily', mood: 'calm', body: '검을 닦다 보면 어머니 생각이 납니다. 이젠 담담히 떠올립니다.', onlyFor: 'dokgo-yeon', when: { trustMin: 45, stressMax: 40 } },
  { id: 'sig-dokgo-d30', category: 'training', body: '제 검이 향할 곳은 제가 정합니다. 곧은 길 하나면 됩니다.', onlyFor: 'dokgo-yeon', when: {} },

  // 백연 — 도사의 딸, 평정·자비, 차·연꽃·명상·아버지 가르침.
  { id: 'sig-baek-d01', category: 'daily', body: '오늘 아침 안개가 산을 덮었어요. 가만히 보고만 있었어요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d02', category: 'daily', body: '호로병에 맑은 물을 받아왔어요. 차를 우려 드릴까요?', onlyFor: 'baek-yeon', when: { ageMax: 11 } },
  { id: 'sig-baek-d03', category: 'daily', body: '연못에 연잎이 새로 폈어요. 잠깐 보고 와도 될까요?', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d04', category: 'daily', mood: 'calm', body: '숨을 천천히 고르면 마음이 잔잔한 물처럼 돼요.', onlyFor: 'baek-yeon', when: { ageMax: 12, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baek-d05', category: 'daily', body: '아버지는 새벽에 도경을 읽으셨어요. 저도 따라 해봐요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d06', category: 'training', body: '명상 자리를 마당 끝으로 옮겼어요. 바람 소리가 좋아서요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d07', category: 'daily', body: '비가 와요. 처마 밑 빗방울 세는 것도 수련 같아요.', onlyFor: 'baek-yeon', when: { ageMax: 11 } },
  { id: 'sig-baek-d08', category: 'training', body: '약초 이름을 외우고 있어요. 잎 모양이 다 달라 재미있어요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d09', category: 'relation', body: '{rival}에게 차를 한 잔 따라줬어요. 같이 마시니 좋네요.', onlyFor: 'baek-yeon', when: { ageMax: 12 } },
  { id: 'sig-baek-d10', category: 'daily', body: '뜰의 돌 위에 새가 앉았어요. 가만히 두니 한참 머물러요.', onlyFor: 'baek-yeon', when: { ageMax: 11 } },
  { id: 'sig-baek-d11', category: 'training', mood: 'calm', body: '내공이 천천히 단전을 채워요. 서두르지 않아도 돼요.', onlyFor: 'baek-yeon', when: { ageMin: 12, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baek-d12', category: 'daily', body: '아버지가 보내신 연꽃이 시들었어요. 그대로도 곱더라고요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d13', category: 'training', body: '심법을 외우다 보니 호흡이 절로 길어졌어요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d14', category: 'daily', body: '오늘은 말을 줄여봤어요. 비우니 머리가 맑아져요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-d15', category: 'relation', body: '{rival}이 지쳐 보여서, 차 한 잔 우려 곁에 뒀어요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d16', category: 'training', body: '도가의 검은 막지 않고 흘려요. 손이 조금 알아가요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-d17', category: 'daily', body: '달이 밝아 마당에 앉아 있었어요. 잠은 좀 줄여도 돼요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d18', category: 'training', body: '상처 난 동문 약을 다려뒀어요. 식기 전에 줘야 해서요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d19', category: 'daily', mood: 'weary', body: '오늘은 명상이 잘 안 됐어요. 마음이 자꾸 흩어지네요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-d20', category: 'daily', body: '뜰을 쓸다 보면 마음도 함께 쓸리는 것 같아요.', onlyFor: 'baek-yeon', when: { ageMin: 12 } },
  { id: 'sig-baek-d21', category: 'daily', mood: 'calm', body: '바람이 불면 부는 대로 둬요. 거스르지 않는 게 도예요.', onlyFor: 'baek-yeon', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baek-d22', category: 'training', body: '폐관에 들면 사흘쯤 조용히 있을게요. 차만 챙겨갈게요.', onlyFor: 'baek-yeon', when: { ageMin: 15 } },
  { id: 'sig-baek-d23', category: 'daily', body: '하산하면 산속 차밭을 먼저 보고 싶어요. 향이 그립거든요.', onlyFor: 'baek-yeon', when: { ageMin: 15 } },
  { id: 'sig-baek-d24', category: 'relation', body: '동문들 얼굴을 하나하나 마음에 담아두고 있어요.', onlyFor: 'baek-yeon', when: { ageMin: 15 } },
  { id: 'sig-baek-d25', category: 'training', mood: 'calm', body: '벽이 보일 때면 더 밀지 않아요. 물러나 숨을 고르면 길이 나요.', onlyFor: 'baek-yeon', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baek-d26', category: 'daily', body: '아버지께 안부 서신을 적었어요. 연꽃 피었다고만 썼어요.', onlyFor: 'baek-yeon', when: { ageMin: 15 } },
  { id: 'sig-baek-d27', category: 'daily', body: '의술서를 다시 펼쳤어요. 살리는 글이라 마음이 편해요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-d28', category: 'relation', body: '{rival}과 마주 앉아 같이 호흡을 골라봤어요. 한결 잔잔해졌대요.', onlyFor: 'baek-yeon', when: { ageMin: 13 } },
  { id: 'sig-baek-d29', category: 'daily', body: '연꽃차를 우렸어요. 사부님 한 잔, 저 한 잔이요.', onlyFor: 'baek-yeon', when: {} },
  { id: 'sig-baek-d30', category: 'daily', body: '오늘도 별일 없었어요. 그게 가장 좋은 하루 같아요.', onlyFor: 'baek-yeon', when: {} },

  // 진백호 — 떠돌이 천재, 자유분방·자만, 빠른 습득, 바깥 동경. (결제 캐릭터, 콘텐츠 선행 작성)
  { id: 'sig-baekho-d01', category: 'daily', body: '아침 댓바람부터 검 한 번 휘둘렀더니 몸이 풀렸어요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-d02', category: 'training', body: '어제 본 그 동작, 자고 일어나니까 손이 먼저 기억하던데요?', onlyFor: 'jin-baekho', when: { ageMax: 11 } },
  { id: 'sig-baekho-d03', category: 'daily', body: '담장 너머 새소리 들리면, 저도 모르게 그쪽을 봐요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-d04', category: 'training', mood: 'pride', body: '이 보법, 한 번 따라 했더니 그냥 되던데요. 신기하죠?', onlyFor: 'jin-baekho', when: { ageMax: 12, seongMin: 4 } },
  { id: 'sig-baekho-d05', category: 'relation', body: '{rival}한테 떠돌던 시절 얘기 해줬더니, 눈 동그래지더라고요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-d06', category: 'daily', body: '밥 한 그릇이 이렇게 따뜻한 거였구나, 가끔 새삼스러워요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-d07', category: 'daily', body: '연무장 구석 나무에 올라가서 보면, 사문이 한눈에 들어와요.', onlyFor: 'jin-baekho', when: { ageMax: 11 } },
  { id: 'sig-baekho-d08', category: 'training', body: '사부님, 이거 끝났어요. 다음 거는 뭐예요? 빨리요.', onlyFor: 'jin-baekho', when: { ageMax: 12 } },
  { id: 'sig-baekho-d09', category: 'relation', body: '{rival}랑 같이 검 맞춰보면, 옛날 강가 생각이 나요.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d10', category: 'daily', body: '산 아래 장터는 어떤 냄새가 날까요? 한번 가보고 싶어요.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d11', category: 'training', mood: 'pride', body: '새 무공 한 권 더 주세요. 몸이 근질근질해서요.', onlyFor: 'jin-baekho', when: { ageMin: 12, seongMin: 4 } },
  { id: 'sig-baekho-d12', category: 'daily', body: '비 오는 날이 좋아요. 처마 밑에서 멍하니 보는 거요.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d13', category: 'training', body: '같은 동작 백 번보다 다른 무공 한 번이 더 늘던데요.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d14', category: 'relation', body: '동문들이 제 손놀림 따라 해보려다 웃어버려요. 미안하긴 한데.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d15', category: 'daily', mood: 'calm', body: '오늘은 그냥 아무것도 안 하고 하늘만 봤어요. 이런 날도 좋죠.', onlyFor: 'jin-baekho', when: { ageMin: 12, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baekho-d16', category: 'training', mood: 'pride', body: '검도 권도 다 재밌어요. 굳이 하나만 고를 이유 있나요?', onlyFor: 'jin-baekho', when: { ageMin: 12, seongMin: 5 } },
  { id: 'sig-baekho-d17', category: 'daily', body: '담 밖으로 지나가는 사람들 보면, 다 어디 가나 궁금해요.', onlyFor: 'jin-baekho', when: { ageMin: 12 } },
  { id: 'sig-baekho-d18', category: 'training', body: '사부님 시연 한 번이면 충분해요. 두 번은 좀 지루하고요.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-d19', category: 'daily', body: '여기 밥은 굶을 일 없으니까, 그거 하나는 참 든든해요.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-d20', category: 'relation', body: '{rival}는 느려도 끝까지 해요. 저랑은 결이 다른데 멋지죠.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-d21', category: 'daily', body: '바람 방향이 바뀌면 괜히 발이 근질거려요. 떠돌던 버릇인가 봐요.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-d22', category: 'training', mood: 'pride', body: '벽에 부딪힌다는 게 뭐예요? 아직 그런 거 못 느껴봤는데요.', onlyFor: 'jin-baekho', when: { ageMin: 13, seongMin: 5 } },
  { id: 'sig-baekho-d23', category: 'daily', mood: 'calm', body: '강가 소리 들리는 곳에 앉아 있으면 마음이 편해져요.', onlyFor: 'jin-baekho', when: { ageMin: 13, trustMin: 45, stressMax: 40 } },
  { id: 'sig-baekho-d24', category: 'training', body: '몸 풀러 새벽에 잠깐 산을 한 바퀴 돌고 왔어요.', onlyFor: 'jin-baekho', when: { ageMin: 13 } },
  { id: 'sig-baekho-d25', category: 'daily', body: '강호엔 제가 아직 본 적 없는 무공이 얼마나 많을까요?', onlyFor: 'jin-baekho', when: { ageMin: 15 } },
  { id: 'sig-baekho-d26', category: 'training', body: '요즘은 혼자 새로운 초식 만들어보는 게 제일 재밌어요.', onlyFor: 'jin-baekho', when: { ageMin: 15 } },
  { id: 'sig-baekho-d27', category: 'relation', body: '{rival}랑 졸업하면 강호 어디서 또 마주칠 것 같아요.', onlyFor: 'jin-baekho', when: { ageMin: 15 } },
  { id: 'sig-baekho-d28', category: 'daily', body: '산 위에서 멀리 보면, 가보지 않은 길이 다 손짓하는 것 같아요.', onlyFor: 'jin-baekho', when: { ageMin: 15 } },
  { id: 'sig-baekho-d29', category: 'training', mood: 'pride', body: '이만큼 빨리 익히는 게 제 길이라면, 끝까지 가봐야죠.', onlyFor: 'jin-baekho', when: { ageMin: 15, seongMin: 5 } },
  { id: 'sig-baekho-d30', category: 'daily', body: '여기서 배운 건, 어디로 가든 제 손에 남아 있을 거예요.', onlyFor: 'jin-baekho', when: { ageMin: 15 } },

  // 사천화 — 약·독 의가의 딸, 신중·자존, 암기·해독·가풍. (결제 캐릭터, 콘텐츠 선행 작성)
  { id: 'sig-cheonhwa-d01', category: 'daily', body: '이 약초, 말려야 향이 살아요. 어머니가 그러셨어요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d02', category: 'daily', body: '손은 매일 닦아요. 독을 다루는 손이라서요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d03', category: 'daily', body: '주머니 속 약은 다 종류별로 나눠 담았어요. 안 헷갈리게요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 11 } },
  { id: 'sig-cheonhwa-d04', category: 'daily', body: '오늘 햇볕은 딱 좋네요. 너무 쬐면 안 된다 배웠지만요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d05', category: 'training', body: '암기는 던지기 전에 손끝 감각부터예요. 급하면 빗나가요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d06', category: 'daily', body: '뜰의 풀 중에 약이 되는 게 셋, 독이 되는 게 둘 있어요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d07', category: 'daily', body: '머리 묶는 데 시간이 좀 걸려요. 단정해야 마음이 가라앉아요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 11 } },
  { id: 'sig-cheonhwa-d08', category: 'training', body: '같은 약도 양을 달리하면 약이 독이 돼요. 신기하지 않아요?', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d09', category: 'daily', body: '천천히 살펴봐야 해요. 급한 손은 약을 그르치니까요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d10', category: 'relation', body: '{rival}이 약초를 밟을 뻔했어요. 다음엔 잘 보라 일렀어요.', onlyFor: 'sa-cheonhwa', when: { ageMax: 12 } },
  { id: 'sig-cheonhwa-d11', category: 'training', body: '오늘은 해독약을 새로 빚어봤어요. 향이 제법 맞아요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d12', category: 'training', body: '암기는 자세보다 호흡이래요. 들숨에 멈추고 날숨에 던져요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d13', category: 'daily', body: '약 다리는 불은 약해야 해요. 센 불은 다 망쳐요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d14', category: 'daily', body: '독초도 손질을 잘하면 사람을 살려요. 가풍이 그래요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d15', category: 'relation', body: '{rival}이 어제 좀 아파 보였어요. 가벼운 약을 챙겨줬어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12, trustMin: 40 } },
  { id: 'sig-cheonhwa-d16', category: 'training', body: '지법은 손가락 하나하나가 무기예요. 매일 따로 풀어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 13 } },
  { id: 'sig-cheonhwa-d17', category: 'daily', body: '비 오는 날은 약초를 안 캐요. 물 먹은 건 향이 죽거든요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d18', category: 'daily', mood: 'calm', body: '약 향 맡으며 손질하는 시간이 제일 마음이 놓여요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12, trustMin: 45, stressMax: 40 } },
  { id: 'sig-cheonhwa-d19', category: 'training', mood: 'pride', body: '오늘 던진 암기가 다 한곳에 박혔어요. ... 좀 뿌듯했어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 13 } },
  { id: 'sig-cheonhwa-d20', category: 'relation', body: '동문이 약초 용법을 묻길래 우리 집 방식을 알려줬어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d21', category: 'daily', mood: 'homesick', body: '집에선 이맘때 약재를 다 갈무리했어요. ... 손이 기억해요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d22', category: 'daily', body: '쓴 약일수록 잘 듣는 법이에요. 안 쓰면 의심부터 해요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 12 } },
  { id: 'sig-cheonhwa-d23', category: 'training', body: '이제 해독약은 향만 맡아도 모자란 게 뭔지 알아요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d24', category: 'daily', body: '약 짓는 손은 정갈해야 해요. 사부님 가르침과 닮았어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d25', category: 'training', body: '암기와 약을 함께 쓰면, 던지지 않고도 길을 막을 수 있어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d26', category: 'daily', mood: 'pride', body: '제가 빚은 약을 동문이 찾을 때가 있어요. 헛배운 건 아닌가 봐요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d27', category: 'relation', body: '동문과 약 얘기를 하면 시간이 금방 가요. 길은 달라도요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15, trustMin: 40 } },
  { id: 'sig-cheonhwa-d28', category: 'daily', body: '약방 정리는 제가 맡을게요. 어디에 뭐가 있는지 손에 익었어요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d29', category: 'training', body: '독을 깊이 알수록 더 조심해요. 아는 만큼 무서운 거예요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15 } },
  { id: 'sig-cheonhwa-d30', category: 'daily', mood: 'calm', body: '약을 다 갈무리한 저녁이면, 하루가 단정히 마무리된 기분이에요.', onlyFor: 'sa-cheonhwa', when: { ageMin: 15, trustMin: 45, stressMax: 40 } },
];

// 한 마디 발화 컨텍스트 — 제자 현재 상태 스냅샷(oneLinerSystem 에서 산출).
export interface OneLinerCtx {
  discipleId: string; // 발화 제자(poolId) — 캐릭터 전용 시그니처 필터용
  stress: number;
  staminaPct: number;
  trust: number;
  darknessRisk: 'low' | 'medium' | 'high';
  hasEnemy: boolean;
  mourning: boolean; // 동문 상실 애도 중(mourningUntilDay > 현재일) — calm/pride 차단·grief 후보
  siblingEvent: 'envy' | 'admire' | 'worry' | null; // 동문 경사·이변 반응(전이형) — 질투/축하/걱정
  age: number;
  mainSeong: number;
  rivalName: string | null; // 자신보다 앞선 최강 동문 이름(없으면 null)
  isWeakest: boolean; // 사문 최약
  saidIds: string[]; // 이미 건넨 특이 대사 id — 중복 배제(같은 특이 대사 2번 금지). docs/12
  recentIds: string[]; // 최근 건넨 한 마디 id(최대 12) — recency 회피("방금 한 말" 임시 배제). docs/12
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

// "특이한" 한 마디 = 무거운 감정의 일회성 고백(흑화·불신·적의·정체성 위기)만. 한 번만(두 번 금지).
// 가벼운 결(normal·calm·weary·pride·rival·homesick)은 캐릭터 전용이어도 평상 기복이라 반복 허용.
// ※ onlyFor 만으로 once-only 처리하면 30개 일상 시그니처가 금세 소진→공용 풀로 떨어져 같은 줄이
//   폭증한다(이력분석 2026-06-23: 같은 줄 80+회). 그래서 무거운 감정결만 once-only로 좁힌다. docs/12.
const ONCE_ONLY_MOODS = new Set<OneLinerMood>(['darkening', 'distrust', 'enmity', 'identity']);

// 한 번만 써야 하는 특이 대사인가 — 무거운 감정결(흑화·불신·적의·정체성)뿐. 그 외(일상·평온·향수 등)는 반복 가능.
export function isDistinctiveOneLiner(t: OneLinerTemplate): boolean {
  return t.mood != null && ONCE_ONLY_MOODS.has(t.mood);
}

// 모순 방지 — 결이 현재 상태와 톤이 어긋나면 배제. 핵심: 흑화 기미 중엔 '평온'한 한 마디 금지
// ("누군가를 꺾고 싶다" 직후 "차 한 잔이 제일 좋습니다" 류 톤 충돌 차단). when 게이트로 못 막는 결 모순 보강.
function moodConsistent(t: OneLinerTemplate, c: OneLinerCtx): boolean {
  // 평온 — 흑화·저신뢰·적의·애도 중엔 톤 급변(이중인격)이라 차단. 게이트 차단집합 ⊇ 모순 밴드(37 B11).
  //  흑화↔평온·불신↔평온(2026-06-23) + 적의↔평온(OL4)·상실↔평온(애도, 2026-06-27) 차단.
  if (t.mood === 'calm' && (c.darknessRisk !== 'low' || c.trust < 40 || c.hasEnemy || c.mourning)) return false;
  // 자만 — 동문 상실 애도 중엔 "내가 제일 앞선다" 류 차단(상실↔자만 톤 급변).
  if (t.mood === 'pride' && c.mourning) return false;
  return true;
}

// 이번 ctx 에서 발화 가능한 템플릿인가 — 상태(when) + 모순(mood) + 중복(특이 대사 1회).
function eligible(t: OneLinerTemplate, c: OneLinerCtx): boolean {
  if (!matchesCondition(t.when, c)) return false;
  if (!moodConsistent(t, c)) return false;
  if (isDistinctiveOneLiner(t) && c.saidIds.includes(t.id)) return false; // 이미 건넨 특이 대사 = 제외
  return true;
}

// recency 회피 — "방금 한 말"(recentIds)은 후보에서 임시로 뺀다. 단 풀이 너무 작아지면(≤3) 무시(고갈 방지).
// "같은 대사 또 나오네" 체감을 없애는 핵심 레버. 큰 일상 풀과 합쳐 회차당 같은 줄 노출을 크게 낮춘다. docs/12.
function freshen(pool: OneLinerTemplate[], c: OneLinerCtx): OneLinerTemplate[] {
  if (pool.length <= 3 || c.recentIds.length === 0) return pool;
  const fresh = pool.filter((t) => !c.recentIds.includes(t.id));
  return fresh.length >= 3 ? fresh : pool;
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
  if (w.mourning != null && c.mourning !== w.mourning) return false;
  if (w.siblingEvent != null && c.siblingEvent !== w.siblingEvent) return false;
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
  const sig = freshen(matched.filter((t) => t.onlyFor === c.discipleId), c); // 최근 발화 제외
  const uni = freshen(matched.filter((t) => !t.onlyFor), c);
  const useSig = sig.length > 0 && (uni.length === 0 || random() < 0.6);
  const pool = useSig ? sig : uni;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)];
}

// LLM function-calling 선택용 후보 — 조건 맞는 대사(전용 있으면 전용+공용). LLM 이 이 중 하나를
// 상황에 맞게 고른다. 폴백(모델 off·실패)은 pickContextualOneLiner(룰, 전용 우선). docs/12·17.
export function candidateOneLiners(c: OneLinerCtx): OneLinerTemplate[] {
  const matched = ONE_LINERS.filter((t) => eligible(t, c)); // 중복·모순 제거된 후보만 LLM 에 노출
  const sig = freshen(matched.filter((t) => t.onlyFor === c.discipleId), c); // 최근 발화 제외(recency)
  const uni = freshen(matched.filter((t) => !t.onlyFor), c);
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
