import type { Season } from './game';
import type { MartialArtInstance, MartialArtSchool } from './martialArt';
import type { Realm, RealmProgress } from './realm';
import type { StatId, StatTrack } from './training';

// 내공·영단 속성 — 오행. 같은 속성 영단이 잘 흡수되고, 상극이면 흡수 저하·심마 위험.
export type QiAttribute = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

// 상처 속성 — 외상·화상·중독·동상·내상. 치료엔 같은 속성 + 충분한 등급(심도 이하) 영약 필요.
export type WoundType = 'wound' | 'burn' | 'poison' | 'frost' | 'inner';

// 제자가 입은 상처 — 속성 + 심도 + 자연치유 잔여일.
// severity: 1=치명상(가장 깊음) ~ 5=경미. 치료 영약은 grade ≤ severity 라야 낫는다(낮은 등급=강한 약).
// 즉, 깊은 상처(severity 1)는 최상급(grade 1) 영약만 듣고, 경미(severity 5)는 아무 등급이나 듣는다.
// 영약이 없으면 daysRemaining 동안 자연 치유(매일 1 감소, 0 시 회복).
export interface Wound {
  type: WoundType;
  severity: number;
  daysRemaining: number;
}

export type DiscipleStatus =
  | 'training'
  | 'resting'
  | 'injured'
  | 'meditating'
  | 'questing'
  | 'crafting' // 연단 중 — 제조 기간 동안 다른 작업(훈련·의뢰) 불가
  | 'graduated'
  | 'departed' // 사망·실종(의뢰 재난) — 애도(mournLostSibling) 발화
  | 'runaway'; // 몰래 하산 — 환멸로 조용히 떠남(사망 아님, 애도 X). docs/51. 회차 종결엔 terminal.

// 이별 형태 — 응답 성향(docs/03) 분기. normal=정상 졸업, expelled=파문(미구현), secret=몰래 하산(docs/51).
export type PartingForm = 'normal' | 'expelled' | 'secret';

export type ActivityType =
  | 'martial_training'
  | 'basic_training'
  | 'meditation'
  | 'group_training'
  | 'application'
  | 'seclusion'
  | 'quest'
  | 'rest';

export type RelationLevel = 'enemy' | 'distant' | 'neutral' | 'friend' | 'sworn';

export type DarknessLevel = 0 | 1 | 2 | 3 | 4;

// 영역 학습 효율 — docs/28 §2. 캐릭터의 타고난 재능(속도 배율)을 갈래/영역마다 매김.
// 별 등급(starRank)·재능 5축을 대체하는 성장 속도 축. 안 적은 갈래 = '보통'.
export type EfficiencyTier = '특화' | '상성' | '보통' | '미숙' | '상극';
// 효율 키 = 무공 갈래(MartialArtSchool) + 비무공/단련 능력치(StatId). 안 적은 키 = '보통'.
export type EfficiencyKey = MartialArtSchool | StatId;
export type EfficiencyMap = Partial<Record<EfficiencyKey, EfficiencyTier>>;

// 인격 6축 (0~100, 50=중립, 키=고극). docs/28 §6. 옛 5축(성실·자존·의리·호기·공감) 폐기.
export interface PersonalityTraits {
  integrity: number; // 강직 (↔유순)
  freedom: number; // 자유 (↔의무)
  warmth: number; // 다정 (↔무뚝뚝)
  prudence: number; // 신중 (↔충동)
  mercy: number; // 자비 (↔냉정)
  ambition: number; // 야망 (↔평온)
}

// 인격 6축 부분 맵 — 시나리오 트리거 조건(require/forbid)·인격 변동(personalityShift)에 쓰임. docs/28 §6.
// (구 5축 LegacyPersonality* 는 시나리오 6축 재작성으로 폐기. 옛 세이브 하이드레이트는 discipleStore.migratePersonality 가 문자열 키로 직접 처리.)
export type PersonaMap = Partial<Record<keyof PersonalityTraits, number>>;

// 한 마디 응답 톤별 신뢰 변동 가중치 — docs/12.
// 디폴트는 personality 에서 자동 산출되지만, 특수 캐릭터는 수동 오버라이드 가능.
export interface OneLinerTonePreferences {
  encourage: number;
  nod: number;
  caution: number;
  ignore: number;
}

export interface DailyActivity {
  morning: ActivityType;
  afternoon: ActivityType;
}

// 필수 이벤트 아크 — 사부가 그 해 내린 선택의 영속 기록(회차 스코프). 졸업 회고의 원천. docs/47·48.
export interface ArcChoiceRecord {
  year: number; // 양육 연차 1~15
  eventId: string; // arc-<discipleId>-y<NN>
  title: string; // 이벤트 제목(회고 표시용)
  choiceKey: string;
  choiceLabel: string; // 사부가 고른 응답(회고에 그대로)
  day: number; // 선택한 totalDay
}

export interface Disciple {
  id: string;
  name: string;
  hanjaName: string;
  entryYear: number;
  age: number;

  // 영역 학습 효율(속도) — 무공 갈래·비무공 영역. docs/28 §2. (옛 재능 5축 대체.)
  efficiency: EfficiencyMap;
  // 오성(悟性) — 깨달음 확률(1~5). 재능 5축 중 유일 잔존. docs/28 §1·§5-3.
  insight: number;
  // 명성(名聲) — 의뢰 수행으로 누적. 직업 적합도·졸업 등급에 반영. docs/28 §3·§4.
  fame: number;

  martialArts: MartialArtInstance[];
  mainMartialArtId?: string;

  // 경지(境地) — 제자의 무 격. docs/23. 천장은 주력 무공서 등급 + 갈래 효율(별 등급 폐기, docs/28 §5).
  realm: Realm;
  realmProgress: RealmProgress; // 내공·무공 막대

  trustToMaster: number;
  // 현재 체력 0~maxStamina. 활동마다 차감, 휴식으로 회복. 비율 임계치로 진척 효율↓, 0 시 강제 휴식.
  // docs/06_훈련_일정.md "체력 — 현재 vs 최대".
  stamina: number;
  // 최대 체력 — endurance 단련 스탯으로 성장. 현재 체력의 상한.
  maxStamina: number;
  // 스트레스 0~100. 훈련·공부로 누적, 휴식으로 해소. 高 지속 시 신뢰·효율↓, 흑화 위험↑ (숨김 변수).
  stress: number;
  // 단련 스탯 (Lv/EXP). 체력·공부 카테고리로 성장. 무공은 martialArts 별도.
  stats: Partial<Record<StatId, StatTrack>>;
  // 익일 효율 패널티 (0~1). 빡센 종목(암벽 등) 다음날 진척에 (1-penalty) 곱. 매 tick 후 0 으로 소멸.
  fatiguePenalty?: number;
  // 동문 상실 애도 — 이 날(totalDay) 지나기 전까진 애도 중(평온·자만 대사 차단·grief 대사·위로 면담). docs/12.
  // 의뢰 재난 사망 시 mournLostSibling 이 친밀 차등으로 현재일+기간 설정(중복 상실 시 max 연장). 회차 스코프.
  mourningUntilDay?: number;
  // 동문 경사·이변 반응(전이형) — 동문이 경지상승/중상/흑화/첫성취/강호사망·명성 시 reactToSiblingMilestone 가
  // 관계 차등으로 설정. 질투(envy)/축하(admire)/걱정(worry)/불안(unease·흑화)/먼애도(grief_far·강호사망).
  // siblingEventUntilDay 지나면 소멸(짧은 창). 회차 스코프. docs/12.
  siblingEventMood?: 'envy' | 'admire' | 'worry' | 'unease' | 'grief_far';
  siblingEventUntilDay?: number;
  // 의뢰 다녀온 여운(전이형) — 결과별 본인 자가 대사용. proud(완수)/humbled(실패·위기). docs/12.
  questEchoMood?: 'proud' | 'humbled';
  questEchoUntilDay?: number;
  relationships: Record<string, RelationLevel>;
  // 동문 야망 충돌(docs/19) — 출도전기에 한 번 발화한 "같은 자리 욕망" 결정의 기록(회차당 제자 1회).
  // 설정되면 해당 제자는 그 회차에 다시 충돌 후보가 되지 않는다(중복 발화 차단). withId=상대, outcome=사부 결정.
  ambitionRivalry?: { withId: string; outcome: 'defer' | 'ally' | 'challenge' | 'ignore' };

  status: DiscipleStatus;
  currentActivity?: DailyActivity;
  // 입은 상처들 — 속성별로 최대 1개씩 동시 보유(외상·화상·중독·동상·내상 = 최대 5개). 같은 속성은 더 깊은
  // 쪽으로 합쳐진다(검상 치명상 + 독 = 둘 다 따로 남아 각각 치료해야 회복). status==='injured' = 상처 1개+ 보유.
  // 영약(속성·등급 매칭)으로 한 속성씩 치료하거나 자연 치유(각 상처 잔여일 따로 차감).
  wounds?: Wound[];

  // 내공 속성(오행) — 내공단 흡수 매칭. 영단 속성과 같으면 흡수 효율↑(상극이면↓). 미지정=무속성.
  qiAttribute?: QiAttribute;
  // 영단 흡수 상태 — 내공단 복용 시 until(totalDay)까지 매일 perDay 내공 흡수. 흡수 중엔 다른 영단 복용 불가.
  elixirAbsorb?: { until: number; perDay: number; attribute?: QiAttribute };
  // 약발 내성 — 내공단 누적 복용 수(회차 내). 복용할수록 효과 체감(도배 방지). alchemySystem.
  danTolerance?: number;

  // 부여 체질(불침) — 무공 없이 상점에서 산 면역(속성→단계 1/2). woundResistOf 가 무공 파생분과 max merge.
  // 상점 특성 부여(constitutionSystem.grantConstitution). docs/50 §5.
  grantedConstitution?: Partial<Record<WoundType, number>>;

  // 하산 시 사부가 권한 강호 행로(직업 id, jobSystem). 졸업 후 평생 직책 궤적의 출발점. docs/28 §3·§4.
  graduatedJob?: string;
  // 이별 형태 — status='runaway'면 'secret'(몰래 하산). 응답 성향·엔딩 회수 분기. docs/51.
  partingForm?: PartingForm;
  // 환멸 누적 개월 — 저신뢰+고스트레스+기질 게이트가 연속으로 충족된 달 수. 임계 도달 시 몰래 하산 발화.
  // 조건 깨지면(면담·스트레스 완화 등으로) 0 리셋. UI 비노출(숨은 변수). docs/51 §3.
  disillusionMonths?: number;

  darknessLevel: DarknessLevel;
  darknessRisk: 'low' | 'medium' | 'high';
  // 흑화 저항 0~1 — 모든 흑화 증가(raiseDarkness)를 확률 게이트(random≥저항 시에만 +1). 캐릭터 본성으로
  // 난이도 차등(이청하 0.00 즉시 ~ 장철 0.90 최난). 전원 <1.0 = 면역 없음. 숨은 스탯(UI 비노출). docs/13.
  darknessResist?: number;

  // 심마(心魔) — 숨은 정신압 게이지 0~100. 무리한 돌파 실패·상극 내공 흡수·마공 깊이·지속 고스트레스로
  // 누적, 임계 넘으면 주화입마 발작(내상·내공 흩어짐). 안신단으로 가라앉힘. UI 비노출(흑화·스트레스처럼). docs/13·26.
  simma?: number;
  // 환골탈태 — 신품 영약으로 몸이 다시 태어남(boneRebirthSystem). 젊은 육체 회귀:
  // 이후 외공·체력 훈련의 나이 보정이 청년기(×2.4) 밑으로 떨어지지 않는다. docs/23 §5.
  boneReborn?: boolean;

  personality: PersonalityTraits;

  // 필수 이벤트 아크 — 발화 계절(회차 시작 시 로스터 인덱스로 배정, 한 계절 1명). docs/47 §10 E3.
  arcSeason?: Season;
  // 그 해 필수 이벤트에 내린 선택들(연차당 1개, 졸업 회고의 원천). docs/47 §4.
  arcChoices?: ArcChoiceRecord[];

  // 옵셔널. 비어 있으면 personality 에서 자동 산출 (deriveTonePreferences).
  // 시드 시점에 미리 채워두면 그 값이 우선.
  tonePreferences?: OneLinerTonePreferences;

  // 이미 건넨 "특이한" 한 마디 템플릿 id 들(회차 단위). 무거운 감정결(흑화·불신·적의·정체성) 대사는
  // 한 번만 — 두 번 이상 안 나오게 후보에서 영구 배제. 일상 잡담은 여기 안 쌓이고 반복 허용. docs/12.
  saidOneLiners?: string[];
  // 최근 건넨 한 마디 id 들(최대 12, 회차 단위). 일상 대사라도 "방금 한 말"은 한동안 다시 안 고르게
  // 후보에서 임시 배제(고갈되면 무시). "같은 말 또" 체감 제거. docs/12.
  recentOneLiners?: string[];

  notes: string[];
}
