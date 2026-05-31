import { supabase } from '@/lib/supabase';
import type { LogEntry, LogRepository } from '../types';

// app_logs 기록 — 운영 증거·디버깅용. 실패는 삼킨다(로깅이 흐름을 막지 않음).
export class SupabaseLogRepo implements LogRepository {
  async write(entry: LogEntry): Promise<void> {
    try {
      const { data } = await supabase.auth.getUser();
      await supabase.from('app_logs').insert({
        user_id: data.user?.id ?? null,
        run_id: entry.runId ?? null,
        level: entry.level ?? 'info',
        source: entry.source ?? null,
        message: entry.message ?? null,
        payload: entry.payload ?? {},
      });
    } catch {
      // 무시 — 로깅 실패는 게임에 영향 없음.
    }
  }
}
