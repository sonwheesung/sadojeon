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
  relationships: Record<string, RelationLevel>;

  status: DiscipleStatus;
  currentActivity?: DailyActivity;
  injuryDaysRemaining?: number; // (레거시) 잔여일 — 이제 wound.daysRemaining 이 정본. 호환 위해 같이 채움.
  // 입은 상처 — 속성·심도. status==='injured' 일 때 존재. 영약(속성·등급 매칭)으로 치료 or 자연 치유.
  wound?: Wound;

  // 내공 속성(오행) — 내공단 흡수 매칭. 영단 속성과 같으면 흡수 효율↑(상극이면↓). 미지정=무속성.
  qiAttribute?: QiAttribute;
  // 영단 흡수 상태 — 내공단 복용 시 until(totalDay)까지 매일 perDay 내공 흡수. 흡수 중엔 다른 영단 복용 불가.
  elixirAbsorb?: { until: number; perDay: number; attribute?: QiAttribute };

  // 하산 시 사부가 권한 강호 행로(직업 id, jobSystem). 졸업 후 평생 직책 궤적의 출발점. docs/28 §3·§4.
  graduatedJob?: string;

  darknessLevel: DarknessLevel;
  darknessRisk: 'low' | 'medium' | 'high';

  personality: PersonalityTraits;

  // 옵셔널. 비어 있으면 personality 에서 자동 산출 (deriveTonePreferences).
  // 시드 시점에 미리 채워두면 그 값이 우선.
  tonePreferences?: OneLinerTonePreferences;

  notes: string[];
}
