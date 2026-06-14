import { MASTER } from '@/data/constants';
import { useGameStore } from '@/stores/gameStore';
import { useMasterStore } from '@/stores/masterStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { useMoralEventStore } from '@/stores/moralEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import { moralToInbox, milestonesToInbox } from './eventInbox';
import type { Season } from '@/types/game';
import { isMonthStart, monthOfYear, weekOfMonth } from './calendar';
import { buildTickArtifacts } from './dailyLogSystem';
import { tickCareers } from './careerSystem';
import { tickWorld } from './worldDriver';
import { runYoungTalentsTournament } from './tournamentSystem';
import { tickReputationInfluence } from './reputationSystem';
import { checkGraduations } from './graduationSystem';
import { triggerDailyMoralEvent } from './moralEventSystem';
import { tickOverrideExpiry } from './overrideSystem';
import { captureSnapshot } from './reportSystem';
import { tickDailyTraining } from './trainingSystem';
import { generateBoard, tickQuests } from './questSystem';
import { triggerDailyOneLiner } from './oneLinerSystem';
import { triggerDailyMeeting } from './meetingSystem';
import { triggerDailySpar } from './sparringSystem';
import { triggerDailyRaid } from './raidSystem';
import { triggerDailyMediation } from './mediationSystem';
import { tickDarkness } from './darknessSystem';
import { tickSimma } from './simmaSystem';
import { tickCraft, tickElixirAbsorb } from './alchemySystem';
import { syncResearch } from './researchSystem';
import { tickWoundRecovery } from './woundSystem';
import { tickMonthlyEconomy } from './economySystem';
import { triggerDailyWish } from './wishSystem';
import { saveCurrentRunSilently } from './runSync';

// [진행] 1회 = 하루
// 순서:
// 1. 시간 +1일
// 2. 만료된 제자 명령 자동 해제
// 3. 회차 종결 체크 — 사부 사망
// 4. 새 달 시작: 결산 + 새 스냅샷 + 패턴 모달 (early return)
// 5. 무공 진척 tick → 일일 일지/배지 빌드
// 6. **정산 모달 표시** (사용자 의도 PM 결 — 일지 + LLM debug 누적)
//    └ 사용자 [다음 ▶] → triggerPostSettlement() → milestone/moral/wish/oneLiner 트리거
export function advanceTurn() {
  const before = useTimeStore.getState().current;
  useTimeStore.getState().advanceDay();
  syncResearch(); // 비급 연구(실시간 타이머) 기한 도래분 완료 처리. docs/05.
  tickOverrideExpiry();
  tickCraft(); // 연단 완료 처리(제조 기간 도래)
  tickElixirAbsorb(); // 내공단 흡수 진행(매일 perDay 내공)
  tickWoundRecovery(); // 상처 자연 치유(매일 1일, 0 시 복귀)

  const time = useTimeStore.getState().current;

  // 사부 시간 흐름 — 매년 봄 1일 시작 시 yearsAsMaster·age +1.
  if (time.year > before.year) {
    const m = useMasterStore.getState().master;
    if (m) {
      useMasterStore.getState().update({
        yearsAsMaster: m.yearsAsMaster + 1,
        age: m.age + 1,
      });
    }
    // 졸업 제자 평생 궤적 한 해 진행(승급·좌절·전직·사망) → 강호 풍문. docs/28 §4.
    tickCareers();
    // 용봉지회 — 또래 제자 전투력 겨룸(자격 제자 있을 때만) → 명성·풍문. docs/27 §5.
    runYoungTalentsTournament();
    // 문파 평판 영향 — 맹우 후의·적대 자객. docs/30.
    tickReputationInfluence();
    // (옛 자동 영약 제련 제거 — 이제 연단은 alchemySystem(연단실·레시피·재료·경제)으로만.)
  }

  // 강호 정세 한 계절 진행 — 세력 긴장·사건(봉기·토벌·전쟁 등)이 살아 움직인다. docs/08.
  // 계절 경계는 월 시작과 겹치고 아래 월 시작 블록이 early-return 하므로, 반드시 그 앞에서 돌린다.
  if (time.season !== before.season) {
    tickWorld();
  }

  // 회차 종결 — 사부 수명 도달 시 phase='ended' (그레이박스 99 = 비활성).
  const master = useMasterStore.getState().master;
  if (master && master.yearsAsMaster >= MASTER.LIFETIME_YEARS) {
    useMasterStore.getState().adjustHealth(-master.health);
    useGameStore.getState().setPhase('ended');
    return;
  }

  if (isMonthStart(time)) {
    // 월간 수지 — 식비·후원금·연단실 유지비(미납 시 가동중지). docs/11.
    tickMonthlyEconomy();
    // 게시판 월간 갱신 — 현재 평판 반영(우호 문파 후원 의뢰 포함). docs/29·30.
    generateBoard();
    const sched = useScheduleStore.getState();
    if (sched.lastSnapshot) sched.openMonthlyReport();
    sched.setSnapshot(captureSnapshot());
    sched.openMonthlySetup();
    return;
  }

  const reports = tickDailyTraining();
  const dateLabel = buildDateLabel();
  const { log, badges, milestones } = buildTickArtifacts(reports, dateLabel);
  usePendingStore.getState().setDailyTick(log, badges, milestones);
  // 의뢰 결산은 setDailyTick **뒤에** — setDailyTick 이 마일스톤 큐를 교체하므로, 앞서 부르면
  // 의뢰 결산 서신이 그대로 증발한다(🐛 2026-06-11 questmatrix 시뮬이 발견 — 결산 서신 미발송 버그).
  tickQuests(); // 기한 도래 의뢰 결산 → 마일스톤(서신함)

  // 정산 모달 set — 사용자가 [다음 ▶] 누를 때까지 일상 모달 trigger 대기.
  // llmDebugBuffer 는 이전 turn 응답 시 누적된 LLM 호출 정보.
  const llmDebugs = usePendingStore.getState().llmDebugBuffer;
  usePendingStore.getState().setSettlement({
    dateLabel,
    log,
    badges,
    llmDebugs,
  });
}

// 정산 모달 [다음 ▶] 누른 후 — 후속 트리거 (졸업 체크 + 일상 이벤트).
// DailySettlementModal.onClose 에서 호출.
export function triggerPostSettlement(): void {
  // 졸업 체크 — 조건 만족 제자 status='graduated' + milestone 큐 + phase='ended' (전원 완주 시).
  checkGraduations();

  // 진행 중 발생 이벤트는 모두 서신함에 적재 — 화면에 모달을 띄우지 않는다.

  // 도덕 갈등 이벤트 — 엔진이 pending 에 세팅한 걸 서신함으로 옮기고 pending 비움.
  triggerDailyMoralEvent();
  const moral = useMoralEventStore.getState().pending;
  if (moral) {
    moralToInbox(moral);
    useMoralEventStore.getState().clear();
  }

  // 희망·한마디·면담 — 각자 확률 + 상황 조건 굴려 서신함에 적재.
  triggerDailyWish();
  triggerDailyOneLiner();
  triggerDailyMeeting();
  triggerDailySpar(); // 동문 비무 — 전투력 양육기 노출(저확률). docs/27 §5
  triggerDailyRaid(); // 산적 습격 — 강호 사건, 전투 엔진 실전(저확률·사망 없음). docs/35 §7
  triggerDailyMediation(); // 중재 면담·상담 기회 — 응어리 쌍이 있을 때. docs/33 §3
  tickDarkness(); // 흑화 자율 진행(risk 매일·level 주1회). docs/13
  tickSimma(); // 심마 누적·진정 + 주화입마 발작 굴림. docs/13·26

  // 변곡점(승급/탈진/졸업) — 모달 대신 서신함 알림으로. pending 큐 비움.
  const milestones = usePendingStore.getState().milestones;
  if (milestones.length > 0) {
    milestonesToInbox(milestones);
    usePendingStore.setState({ milestones: [] });
  }

  // 하루 마무리 — 현재 회차 상태를 DB에 저장 (fire-and-forget).
  saveCurrentRunSilently();
}

const SEASON_LABEL: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

function buildDateLabel(): string {
  const time = useTimeStore.getState().current;
  const m = monthOfYear(time);
  const w = weekOfMonth(time);
  return `${time.year}년차 ${SEASON_LABEL[time.season]} ${m}월 ${w}주차 ${time.day}일`;
}
