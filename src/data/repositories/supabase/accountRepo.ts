import { supabase } from '@/lib/supabase';
import type { AccountRepository } from '../types';

// 계정 상태(account_state) — 회차 무관 유저 단위 누적(업적·해금 무공서·집계·다이아). user_id당 1행.
async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error('인증되지 않음 — 로그인이 필요합니다.');
  return id;
}

export class SupabaseAccountRepo implements AccountRepository {
  async getAccount(): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
      .from('account_state')
      .select('data')
      .maybeSingle(); // RLS 로 현재 유저 1행만
    if (error) throw error;
    return data ? (data.data as Record<string, unknown>) : null;
  }

  async saveAccount(data: Record<string, unknown>): Promise<void> {
    const uid = await requireUserId();
    const { error } = await supabase.from('account_state').upsert(
      { user_id: uid, data: data ?? {}, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  }
}
