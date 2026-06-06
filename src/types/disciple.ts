import type { MartialArtInstance, MartialArtSchool, TalentAxis } from './martialArt';
import type { Realm, RealmProgress } from './realm';
import type { StatId, StatTrack } from './training';

export type DiscipleStatus =
  | 'training'
  | 'resting'
  | 'injured'
  | 'meditating'
  | 'questing'
  | 'graduated'
  | 'departed';

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

export interface Talents {
  body: number;
  qi: number;
  agility: number;
  insight: number;
  mind: number;
}

// 영역 학습 효율 — docs/28 §2. 캐릭터의 타고난 재능(속도 배율)을 갈래/영역마다 매김.
// 별 등급(starRank)·재능 5축(talents)을 대체하는 새 축. 안 적은 갈래 = '보통'.
// 슬라이스 2: 무공 갈래(MartialArtSchool) 효율. 비무공 영역 효율은 능력치 확장(슬라이스 3) 때.
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

// 구 5축 시나리오 조건 호환 — moralEvent 데이터가 아직 이 이름을 쓴다.
// 평가기가 6축 값으로 매핑(personalityCompat). 추후 시나리오 6축 재작성 시 제거.
export type LegacyPersonalityAxis = 'diligence' | 'pride' | 'loyalty' | 'curiosity' | 'empathy';
export type LegacyPersonalityMap = Partial<Record<LegacyPersonalityAxis, number>>;

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

export interface Disciple {
  id: string;
  name: string;
  hanjaName: string;
  entryYear: number;
  age: number;

  talents: Talents;
  hiddenTalents: Partial<Record<TalentAxis, number>>;
  // 영역 학습 효율(속도). 미시드(구 세이브)면 talents 로 폴백. docs/28 §2.
  efficiency?: EfficiencyMap;

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
  relationships: Record<string, RelationLevel>;

  status: DiscipleStatus;
  currentActivity?: DailyActivity;
  injuryDaysRemaining?: number;

  darknessLevel: DarknessLevel;
  darknessRisk: 'low' | 'medium' | 'high';

  personality: PersonalityTraits;

  // 옵셔널. 비어 있으면 personality 에서 자동 산출 (deriveTonePreferences).
  // 시드 시점에 미리 채워두면 그 값이 우선.
  tonePreferences?: OneLinerTonePreferences;

  notes: string[];
}
