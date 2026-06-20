// Repository 조립 지점 — 앱은 여기서 export 하는 인스턴스(인터페이스 타입)에만 의존.
// 인프라 교체 시 이 파일의 구현체만 바꾼다 (예: Supabase → 로컬 SQLite → 목).

import type {
  AccountRepository,
  DiscipleCatalogRepository,
  LogRepository,
  RunRepository,
} from './types';
import { SupabaseDiscipleCatalogRepo } from './supabase/discipleCatalogRepo';
import { SupabaseRunRepo } from './supabase/runsRepo';
import { SupabaseLogRepo } from './supabase/logsRepo';
import { SupabaseAccountRepo } from './supabase/accountRepo';

export const discipleCatalog: DiscipleCatalogRepository = new SupabaseDiscipleCatalogRepo();
export const runs: RunRepository = new SupabaseRunRepo();
export const logs: LogRepository = new SupabaseLogRepo();
export const account: AccountRepository = new SupabaseAccountRepo();

export type {
  CommonDisciple,
  DiscipleCatalogRepository,
  InboxRecord,
  ItemRecord,
  JianghuState,
  LogEntry,
  LogLevel,
  LogRepository,
  RunRecord,
  RunCore,
  RunDiscipleRecord,
  RunNpcRecord,
  RunRepository,
  RunWrite,
} from './types';
