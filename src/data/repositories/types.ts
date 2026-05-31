// 데이터 접근 추상화 (Repository) — 앱은 이 계약(인터페이스)에만 의존한다.
// 구현체(Supabase/로컬/목)를 갈아끼워도 앱·테스트는 안 깨진다 (DIP).
// 인프라 교체 = 어댑터 한 겹 교체. → "마이그레이션 1달 재테스트" 공포의 구조적 해법.

// 공통 제자 원본 (common_disciples 테이블).
export interface CommonDisciple {
  id: string;
  name: string;
  hanjaName: string;
  starRank: number;
  bio: string | null;
  gender?: string;
  group?: string;
  isPremium?: boolean;
}

export interface DiscipleCatalogRepository {
  // 제자 원본 전체 (성급 오름차순).
  listAll(): Promise<CommonDisciple[]>;
  // 단건 조회 (없으면 null).
  findById(id: string): Promise<CommonDisciple | null>;
}

// ─── 회차(runs) ──────────────────────────────────────────────────────────────
// 회차 상태는 변동이 잦아 JSONB 블롭으로 담는다 (스키마 churn 최소화).

export interface RunDiscipleRecord {
  sourceId: string | null; // common_disciples.id (영입 등은 null)
  name: string;
  status: string;
  state: Record<string, unknown>; // 전체 Disciple 객체
}

export interface RunRecord {
  id: string;
  slot: number;
  status: string;
  diamonds: number;
  gameTime: Record<string, unknown>;
  master: Record<string, unknown> | null;
  sect: Record<string, unknown> | null;
  schedule: Record<string, unknown>;
  updatedAt: string;
}

// 저장 payload — 회차 상태 스냅샷.
export interface RunWrite {
  slot: number;
  status?: string;
  diamonds: number;
  gameTime: unknown;
  master: unknown;
  sect: unknown;
  schedule: unknown;
}

// ─── 로그(app_logs) ──────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level?: LogLevel;
  source?: string; // 'llm:wish' | 'advanceTurn' ...
  message?: string;
  payload?: Record<string, unknown>; // 요청·응답·스택 등
  runId?: string | null;
}

export interface LogRepository {
  // 로그 1건 기록 — 실패는 삼킨다(로깅이 게임 흐름을 막지 않음).
  write(entry: LogEntry): Promise<void>;
}

// 서신함 항목 — 조회용 컬럼 + 전체 InboxItem 블롭(item).
export interface InboxRecord {
  kind: string;
  title: string;
  preview: string | null;
  body: string | null;
  priority: string;
  createdAtDay: number | null;
  read: boolean;
  resolved: boolean;
  item: Record<string, unknown>; // 전체 InboxItem (복원용)
}

// 강호 상태 — 회차당 1행.
export interface JianghuState {
  factions: unknown;
  events: unknown;
}

// 물품 — 조회용 컬럼 + 전체 StoredItem 블롭(item).
export interface ItemRecord {
  category: string;
  itemKey: string;
  qty: number;
  item: Record<string, unknown>; // 전체 StoredItem (복원용)
}

// 회차별 네임드 NPC 한 행 (run_npcs).
export interface RunNpcRecord {
  npcId: string;
  faction: string;
  status: string;
  data: Record<string, unknown>; // 전체 RunNpc (복원용)
}

// 회차 핵심 — 회차 행 + 제자(분리 불가). 자식 도메인(서신함·강호·물품·NPC)은 슬라이스가 따로 로드.
export interface RunCore {
  run: RunRecord;
  disciples: RunDiscipleRecord[];
}

export interface RunRepository {
  // 현재 유저의 모든 회차 (슬롯 오름차순).
  listForUser(): Promise<RunRecord[]>;
  // 회차 핵심(회차 행 + 제자) 로드.
  getCore(id: string): Promise<RunCore | null>;
  // 슬롯에 회차 저장 (있으면 교체) — 회차 id 반환. 제자는 전량 교체.
  saveSlot(payload: RunWrite, disciples: RunDiscipleRecord[]): Promise<string>;
  // 기존 회차 갱신 (제자 포함 전량 교체).
  update(id: string, payload: RunWrite, disciples: RunDiscipleRecord[]): Promise<void>;

  // ── 자식 도메인 (runSlices — 각 도메인이 자기 것만 load/save) ──
  getInbox(runId: string): Promise<Record<string, unknown>[]>; // 전체 InboxItem 배열
  saveInbox(runId: string, items: InboxRecord[]): Promise<void>;
  getJianghu(runId: string): Promise<JianghuState | null>;
  saveJianghu(runId: string, state: JianghuState): Promise<void>;
  getItems(runId: string): Promise<Record<string, unknown>[]>; // 전체 StoredItem 배열
  saveItems(runId: string, items: ItemRecord[]): Promise<void>;
  getNpcs(runId: string): Promise<RunNpcRecord[]>;
  saveNpcs(runId: string, npcs: RunNpcRecord[]): Promise<void>;

  delete(id: string): Promise<void>;
}
