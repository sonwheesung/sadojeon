// 자동 랜덤 플레이 — QA 하네스. docs 전반(이벤트·면담·사문이벤트·LLM·영약)이 실제로
// "맞는 상황에서" 발동하는지 + LLM 응답이 정당한지 자동 진행으로 검증한다.
//
// 매 턴: advanceTurn → 월간/결산 모달 자동 닫기 → triggerPostSettlement →
//        서신함의 모든 강제선택 항목을 *랜덤*으로 해소(LLM await) → 의뢰 랜덤 파견.
// 발동 항목마다 트리거 컨텍스트(제자 상태)와 LLM prompt/raw/effects를 로그로 남긴다.
//
// in-app(app/dev/autoplay): 실제 온디바이스 LLM 호출(응답 대기 있음).
// headless(scripts): RN 스텁 + 룰 폴백(LLM 미호출).

import { advanceTurn, triggerPostSettlement } from '@/systems/timeSystem';
import { isRespondable, responseOptionsFor, resolveInboxItem } from '@/systems/inboxResolve';
import { canDispatch, dispatchQuest } from '@/systems/questSystem';
import { currentAge } from '@/systems/discipleCtx';
import { useGameStore } from '@/stores/gameStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useQuestStore } from '@/stores/questStore';
import { useTimeStore } from '@/stores/timeStore';
import { REALM_LABEL } from '@/types/realm';
import { configureRandom } from './policyHelpers';
import type { InboxItem } from '@/types';

export interface AutoPlayEvent {
  date: string; // "3년차 여름 5월 2주차"
  totalDay: number;
  domain: string; // oneLiner·wish·moral·meeting·quest_event·graduation·seclusion_petition · (비응답: rumor·report…)
  kind: string; // inbox kind
  title: string;
  body: string;
  // 트리거 컨텍스트 — "맞는 상황에 떴는지" 판정용.
  ctx?: {
    name: string;
    age: number;
    realm: string;
    stress: number;
    trust: number;
    darkness: number;
    status: string;
  };
  choiceKey?: string;
  choiceLabel?: string;
  // LLM — "응답이 정당한지" 판정용.
  llmCalled?: boolean;
  llmSource?: string;
  llmPrompt?: string;
  llmRaw?: string;
}

const rand = () => Math.random();

function dateLabel(): string {
  const t = useTimeStore.getState().current;
  const season = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' }[t.season];
  return `${t.year}년차 ${season} ${t.week}주 ${t.day}일`;
}

function ctxOf(item: InboxItem): AutoPlayEvent['ctx'] {
  const p = (item.payload ?? {}) as Record<string, unknown>;
  const id = String(p.discipleId ?? '');
  const d = id ? useDiscipleStore.getState().disciples[id] : undefined;
  if (!d) return undefined;
  return {
    name: d.name,
    age: currentAge(d),
    realm: REALM_LABEL[d.realm],
    stress: Math.round(d.stress ?? 0),
    trust: Math.round(d.trustToMaster ?? 0),
    darkness: d.darknessLevel,
    status: d.status,
  };
}

// 비응답(읽기 전용) 항목도 로그 — 사문 이벤트·풍문·영약 제련·졸업 등 "무엇이 떴나" 관찰용.
function logPassiveInbox(before: string[], emit: (e: AutoPlayEvent) => void): void {
  const items = useInboxStore.getState().items;
  for (const item of items) {
    if (before.includes(item.id)) continue;
    if (isRespondable(item)) continue; // 응답형은 resolve 시 따로 로그
    const p = (item.payload ?? {}) as Record<string, unknown>;
    emit({
      date: dateLabel(),
      totalDay: useTimeStore.getState().totalDay,
      domain: String(p.domain ?? item.kind),
      kind: item.kind,
      title: item.title,
      body: 'body' in item ? String((item as { body?: string }).body ?? item.preview) : item.preview,
      ctx: ctxOf(item),
    });
  }
}

// 서신함의 모든 강제선택 항목을 정책대로 해소 — LLM await. 발동·선택·LLM 디버그 로그.
async function resolveAll(emit: (e: AutoPlayEvent) => void, policy: PlayPolicy): Promise<void> {
  // 항목 스냅샷(해소가 목록을 바꾼다).
  const items = [...useInboxStore.getState().items];
  for (const item of items) {
    if (!isRespondable(item)) continue;
    const opts = responseOptionsFor(item).filter((o) => !o.disabled);
    if (opts.length === 0) continue;
    const key = policy.pickInboxKey(item, opts);
    const pick = opts.find((o) => o.key === key) ?? opts[0];
    const ctx = ctxOf(item);
    const p = (item.payload ?? {}) as Record<string, unknown>;
    const before = usePendingStore.getState().llmDebugBuffer.length;
    await resolveInboxItem(item, pick.key); // 여기서 LLM 호출(대기) 가능
    const dbg = usePendingStore.getState().llmDebugBuffer.slice(before).find((d) => d.prompt || d.raw);
    emit({
      date: dateLabel(),
      totalDay: useTimeStore.getState().totalDay,
      domain: String(p.domain ?? item.kind),
      kind: item.kind,
      title: item.title,
      body: 'body' in item ? String((item as { body?: string }).body ?? item.preview) : item.preview,
      ctx,
      choiceKey: pick.key,
      choiceLabel: pick.label,
      llmCalled: dbg?.llmCalled,
      llmSource: dbg?.source,
      llmPrompt: dbg?.prompt,
      llmRaw: dbg?.raw,
    });
  }
}

// 유휴 제자를 게시판 의뢰에 랜덤 파견. 낮은 확률 — 의뢰가 일상 이벤트(면담·한마디)를
// 과하게 밀어내지 않게(파견 중엔 일과 이벤트 미발동). 한 번에 한 명만.
function randomDispatch(): void {
  if (rand() > 0.08) return;
  const board = useQuestStore.getState().board;
  if (board.length === 0) return;
  const ds = useDiscipleStore.getState();
  const idle = ds.order
    .map((id) => ds.disciples[id])
    .filter((d) => d && d.status === 'training');
  if (idle.length === 0) return;
  const d = idle[Math.floor(rand() * idle.length)];
  const q = board[Math.floor(rand() * board.length)];
  if (d && q && canDispatch(d, q)) dispatchQuest(q.id, [d.id]);
}

// ── 플레이 정책(전략) ─────────────────────────────────────────────────────
// 자동 진행 시 "어떻게 플레이할지"를 갈아끼운다(SOLID — autoPlay 루프 본문은 안 바뀜).
//  - RandomPolicy: 전 선택 랜덤(이벤트·면담 발동 상황 QA용). in-app 기본.
//  - GrowthPolicy(dev/growthPolicy.ts): 일정·무공축·종목을 합리적으로 운용해 경지 성장 검증.
export interface PlayPolicy {
  label: string;
  // 그날 advanceTurn **직전** — 일정·일일선택·명령 세팅(훈련 정책). 랜덤은 미구현(기본 일정).
  configureBeforeDay?: () => void;
  // 서신함 강제선택 해소 시 어떤 선택지를 고를지(키 반환).
  pickInboxKey: (item: InboxItem, options: { key: string; label: string }[]) => string;
  // 의뢰 파견 정책.
  dispatch: () => void;
}

export const RandomPolicy: PlayPolicy = {
  label: 'random',
  configureBeforeDay: configureRandom, // 훈련 카테고리·종목·무공축·무공서·영약 전부 랜덤.
  pickInboxKey: (_item, options) => options[Math.floor(rand() * options.length)].key,
  dispatch: randomDispatch,
};

// 한 턴 자동 진행. 'ended' = 회차 종결. policy 미지정 시 랜덤.
export async function autoPlayDay(
  emit: (e: AutoPlayEvent) => void,
  policy: PlayPolicy = RandomPolicy,
): Promise<'continue' | 'ended'> {
  if (useGameStore.getState().phase === 'ended') return 'ended';

  // 정책 훈련 세팅 — advanceTurn(tickDailyTraining) 전에 일정·일일선택 주입.
  policy.configureBeforeDay?.();

  const beforeIds = useInboxStore.getState().items.map((i) => i.id);
  advanceTurn();

  // 월간 보고/설정 모달 — 현재 일정 유지하고 닫는다.
  const sched = useScheduleStore.getState();
  if (sched.pendingReport) sched.resolveMonthlyReport();
  if (sched.pendingSetup) sched.resolveMonthlySetup();

  // 회차 종결 체크(사부 수명).
  if (useGameStore.getState().phase === 'ended') return 'ended';

  // 결산 모달 → 후속 트리거(이벤트·면담·사문이벤트 발동).
  if (usePendingStore.getState().settlement) {
    usePendingStore.getState().clearSettlement();
    triggerPostSettlement();
  }

  // 새로 뜬 비응답 항목(사문이벤트·풍문·영약제련·졸업소식 등) 로그.
  logPassiveInbox(beforeIds, emit);
  // 강제선택 항목 정책대로 해소(+LLM).
  await resolveAll(emit, policy);
  // 의뢰 파견(정책).
  policy.dispatch();

  return 'continue';
}

export interface AutoPlayResult {
  days: number;
  events: AutoPlayEvent[];
}

// N일 자동 진행. onProgress(진행일, 총일) 주기 호출. 회차 종결 시 조기 종료.
// policy 미지정 시 랜덤(in-app QA 기본). 헤드리스는 GrowthPolicy 주입 가능.
export async function autoPlayRun(
  days: number,
  emit: (e: AutoPlayEvent) => void,
  onProgress?: (done: number, total: number) => void,
  shouldStop?: () => boolean,
  policy: PlayPolicy = RandomPolicy,
): Promise<AutoPlayResult> {
  let done = 0;
  for (let i = 0; i < days; i += 1) {
    if (shouldStop?.()) break;
    const r = await autoPlayDay(emit, policy);
    done += 1;
    if (onProgress && i % 7 === 0) {
      onProgress(done, days);
      // UI 양보 — 진행률 갱신·중단 버튼 반응.
      await new Promise((res) => setTimeout(res, 0));
    }
    if (r === 'ended') break;
  }
  onProgress?.(done, days);
  return { days: done, events: [] };
}
