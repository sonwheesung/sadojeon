// 새 회차 시드 — store가 비어 있을 때 디폴트 사부·사문·제자를 채운다.
// 호출 위치: (tabs)/index.tsx 최초 진입 시 master null이면 자동.
// 모든 시드값은 그레이박스용 디폴트. 추후 사부 작명·마을 영입 흐름으로 교체.

import { RECRUIT_POOL, type RecruitCandidate } from '@/data/disciples/recruitPool';
import {
  STARTING_DISCIPLE_POOL,
  STARTING_RIVALRIES,
  STARTING_FRIENDSHIPS,
} from '@/data/disciples/startingPool';
import { MARTIAL_ARTS } from '@/data/martialArts';
import { MASTER_STAT } from '@/data/constants';
import { deriveMaxStamina, START_ENDURANCE_LEVEL } from '@/data/training';
import {
  useCodexStore,
  useDiscipleStore,
  useEventHistoryStore,
  useGraduateStore,
  useReputationStore,
  useLlmSettingsStore,
  useMasterStore,
  useQuestStore,
  useScheduleStore,
  useSectAtmosphereStore,
  useSectStore,
  useTimeStore,
} from '@/stores';
import { captureSnapshot } from './reportSystem';
import { resetAlchemy } from './alchemySystem';
import { generateBoard } from './questSystem';
import { RUN_CHILD_SLICES } from './runSlices';
import type {
  Disciple,
  EfficiencyMap,
  Master,
  MartialArtInstance,
  PersonalityTraits,
  ScrollInventoryItem,
  SectState,
} from '@/types';

// ─── Master ─────────────────────────────────────────────────────────────────

function defaultMaster(): Master {
  return {
    id: 'master-1',
    name: '임청허',
    hanjaName: '林淸虛',
    age: 52,
    style: 'mystic',
    stats: {
      insight: MASTER_STAT.DEFAULT,
      experience: MASTER_STAT.DEFAULT,
      authority: MASTER_STAT.DEFAULT,
      prestige: MASTER_STAT.DEFAULT,
    },
    specialties: ['insight', 'mind'],
    signatureArtIds: [],
    reputation: { righteous: 30, wulin: 20, imperial: 10, underground: 0 },
    qi: 70,
    health: 80,
    yearsAsMaster: 0,
    disciplesGraduated: 0,
    disciplesLost: 0,
  };
}

// ─── Sect ───────────────────────────────────────────────────────────────────

function defaultSect(): SectState {
  return {
    name: '무명산문',
    hanjaName: '無名山門',
    reputation: 10,
    resources: 5000, // 50은(=5천 동). 1금=10은=1000동. 금/은/동 환산은 AppHeader. 고정·영구증가 X(업적은 다이아/칭호/콘텐츠만, docs/32). 30금→50은으로 하향(빠듯한 초반). 유지비 재고민 대상.
    facilities: [],
  };
}

// ─── Disciples ──────────────────────────────────────────────────────────────

// 시작 제자 — 무공·재능·성격 셋업. docs/06 입문 단계 시작.
// personality 6축 차등으로 톤 선호도 자동 산출 ([12](docs/12_인박스_면담.md)).
//
// 양육 슬롯 — docs/15. 최대 4명 최소 2명.
// 회차 시작 시 사용자가 RECRUIT_POOL 6명(무료) 중 2~4명을 직접 선택. 회차 도중 영입 X.
// 결제 2명은 IAP 해금(미구현), 강무열·독고연은 출시 후 추가(POST_LAUNCH_RECRUITS).
export interface DiscipleSeed {
  poolId: string;
  artId: string;
  efficiency?: EfficiencyMap;
  insight?: number; // 오성 1~5 — 깨달음 확률
  personality: PersonalityTraits;
}

function startingArtInstance(artId: string): MartialArtInstance {
  // 입문 = 1성, EXP 0. docs/26.
  return {
    artId,
    seong: 1,
    exp: 0,
    unlockedAt: 0,
  };
}

export function discipleFromSeed(seed: DiscipleSeed): Disciple | null {
  const pool = STARTING_DISCIPLE_POOL.find((d) => d.id === seed.poolId);
  if (!pool) return null;
  return {
    id: pool.id,
    name: pool.name,
    hanjaName: pool.hanjaName,
    entryYear: useTimeStore.getState().current.year,
    age: 10,
    efficiency: seed.efficiency ?? {},
    insight: seed.insight ?? 3,
    fame: 0,
    martialArts: [startingArtInstance(seed.artId)],
    mainMartialArtId: seed.artId,
    // 경지 — 무공 입문 → 삼류 시작. 천장은 주력 무공서 등급(별 등급 폐기, docs/28 §5).
    realm: 'samryu',
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 30,
    // 체력 = endurance Lv × 10. 시작 Lv 5 → 최대 체력 50. docs/25.
    stamina: deriveMaxStamina(START_ENDURANCE_LEVEL),
    maxStamina: deriveMaxStamina(START_ENDURANCE_LEVEL),
    stress: 0,
    stats: { endurance: { level: START_ENDURANCE_LEVEL, exp: 0 } },
    relationships: {},
    status: 'training',
    darknessLevel: 0,
    darknessRisk: 'low',
    personality: seed.personality,
    notes: [pool.originNote],
    // tonePreferences 는 미지정 — runtime 에서 personality 로 자동 산출.
  };
}

// 사문 보유 비급 — 시작 소장(acquisition 'start' = 본문 비급)만. docs/05·04 습득 경로.
// 나머지는 의뢰 드랍(questSystem.maybeDropScroll)·업적·결제로 입수.
function sectScrolls(): ScrollInventoryItem[] {
  return MARTIAL_ARTS.filter((art) => art.acquisition === 'start').map((art) => ({
    artId: art.id,
    acquiredAtRun: 1,
    acquiredAtDay: 0,
    status: 'identified',
    researchProgress: 100,
    isTrap: false,
    isIncomplete: false,
  }));
}

// 시작 관계 시드 — docs/15. 같은 회차에 거둔 제자 사이의 미리 정의된 적대·친밀을 붙인다.
// 둘 다 거둔 페어에만 적용. 적대=양방 'enemy'(상대 반응 캐스케이드가 발화하려면 상대→가해 'enemy' 필요),
// 친밀=양방 'friend'. 관계가 붙어야 개인 도덕 이벤트의 2차 효과(상대가 눈치채는 서사)가 작동한다.
function seedStartingRelations(list: Disciple[]): void {
  const byId = new Map(list.map((d) => [d.id, d]));
  for (const r of STARTING_RIVALRIES) {
    const a = byId.get(r.aware);
    const b = byId.get(r.unaware);
    if (!a || !b) continue;
    a.relationships[b.id] = 'enemy';
    b.relationships[a.id] = 'enemy';
  }
  for (const f of STARTING_FRIENDSHIPS) {
    const a = byId.get(f.a);
    const b = byId.get(f.b);
    if (!a || !b) continue;
    a.relationships[b.id] = 'friend';
    b.relationships[a.id] = 'friend';
  }
}

// ─── Entry ──────────────────────────────────────────────────────────────────

// 회차 새 시작 — 사용자가 시작 선택 모달에서 고른 2~4명을 받는다.
export function seedNewRun(selectedPoolIds: string[]): void {
  useTimeStore.getState().reset();
  useMasterStore.getState().setMaster(defaultMaster());
  useSectStore.getState().setSect(defaultSect());
  const list = selectedPoolIds
    .map((id) => RECRUIT_POOL.find((c) => c.poolId === id))
    .filter((c): c is RecruitCandidate => c != null)
    .map(discipleFromSeed)
    .filter((d): d is Disciple => d != null);
  seedStartingRelations(list); // docs/15 시작 적대·친밀
  useDiscipleStore.getState().setAll(list);
  // 사문 비급 시드 — 기존 보유 비급은 회차 영속이지만 첫 회차이므로 추가.
  const codex = useCodexStore.getState();
  for (const scroll of sectScrolls()) {
    if (!codex.hasScroll(scroll.artId)) {
      codex.addScroll(scroll);
    }
  }
  // 회차 격리 store 리셋 — docs/16 회차 누적 정책 + project_run_loop_carryover.
  useSectAtmosphereStore.getState().reset();
  resetAlchemy(); // 연단 상태(학습 레시피·재료·진행 중 제조) 회차 초기화
  useEventHistoryStore.getState().reset();
  useLlmSettingsStore.getState().resetCounter();
  // 자식 도메인(서신함·강호·물품·NPC) 회차 초기 상태로 — 각 슬라이스가 알아서 비우거나 시드.
  RUN_CHILD_SLICES.forEach((slice) => slice.reset());

  // 새 회차 첫 날 = 1년차 봄 1월 1주차 1일 = 월 시작.
  // 첫 달은 결산 X (직전 데이터 없음). 첫 스냅샷 저장 + 패턴 설정 모달만.
  useScheduleStore.getState().reset();
  // 의뢰 — 회차 초기화 + 사문 명성 기반 게시판 생성.
  useQuestStore.getState().reset();
  generateBoard();
  // 졸업 제자 평생 궤적 — 회차 스코프 초기화. docs/28 §4.
  useGraduateStore.getState().reset();
  // 문파 평판 — 회차 스코프 초기화(전원 평범). docs/30.
  useReputationStore.getState().reset();
  useScheduleStore.getState().setSnapshot(captureSnapshot());
  useScheduleStore.getState().openMonthlySetup();
}

// store가 비어 있는지 체크. 진입 시 자동 시드 트리거 조건.
export function isFreshRun(): boolean {
  return useMasterStore.getState().master == null;
}
