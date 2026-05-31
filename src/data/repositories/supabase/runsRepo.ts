import { supabase } from '@/lib/supabase';
import type {
  InboxRecord,
  ItemRecord,
  JianghuState,
  RunCore,
  RunDiscipleRecord,
  RunNpcRecord,
  RunRecord,
  RunRepository,
  RunWrite,
} from '../types';

const RUN_COLUMNS = 'id, slot, status, diamonds, game_time, master, sect, schedule, updated_at';

interface RunRow {
  id: string;
  slot: number;
  status: string;
  diamonds: number;
  game_time: Record<string, unknown> | null;
  master: Record<string, unknown> | null;
  sect: Record<string, unknown> | null;
  schedule: Record<string, unknown> | null;
  updated_at: string;
}

function mapRun(row: RunRow): RunRecord {
  return {
    id: row.id,
    slot: row.slot,
    status: row.status,
    diamonds: row.diamonds,
    gameTime: row.game_time ?? {},
    master: row.master,
    sect: row.sect,
    schedule: row.schedule ?? {},
    updatedAt: row.updated_at,
  };
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error('인증되지 않음 — 로그인이 필요합니다.');
  return id;
}

function discipleRows(runId: string, userId: string, disciples: RunDiscipleRecord[]) {
  return disciples.map((d) => ({
    run_id: runId,
    user_id: userId,
    source_id: d.sourceId,
    name: d.name,
    status: d.status,
    state: d.state,
  }));
}

export class SupabaseRunRepo implements RunRepository {
  async listForUser(): Promise<RunRecord[]> {
    const { data, error } = await supabase
      .from('runs')
      .select(RUN_COLUMNS)
      .order('slot', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => mapRun(r as RunRow));
  }

  async getCore(id: string): Promise<RunCore | null> {
    const { data: runData, error: runErr } = await supabase
      .from('runs')
      .select(RUN_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (runErr) throw runErr;
    if (!runData) return null;

    const { data: discData, error: discErr } = await supabase
      .from('run_disciples')
      .select('source_id, name, status, state')
      .eq('run_id', id)
      .order('created_at', { ascending: true });
    if (discErr) throw discErr;

    const disciples: RunDiscipleRecord[] = (discData ?? []).map((d) => ({
      sourceId: (d.source_id as string | null) ?? null,
      name: d.name as string,
      status: d.status as string,
      state: (d.state as Record<string, unknown>) ?? {},
    }));

    return { run: mapRun(runData as RunRow), disciples };
  }

  // ── 자식 도메인 로드 (각 슬라이스가 자기 것만) ──

  async getInbox(runId: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('inbox_items')
      .select('payload')
      .eq('run_id', runId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .map((r) => r.payload as Record<string, unknown>)
      .filter((p) => p && typeof p === 'object');
  }

  async getJianghu(runId: string): Promise<JianghuState | null> {
    const { data, error } = await supabase
      .from('jianghu_state')
      .select('factions, events')
      .eq('run_id', runId)
      .maybeSingle();
    if (error) throw error;
    return data ? { factions: data.factions, events: data.events } : null;
  }

  async getItems(runId: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('items')
      .select('payload')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? [])
      .map((r) => r.payload as Record<string, unknown>)
      .filter((p) => p && typeof p === 'object');
  }

  async getNpcs(runId: string): Promise<RunNpcRecord[]> {
    const { data, error } = await supabase
      .from('run_npcs')
      .select('npc_id, faction, status, data')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      npcId: r.npc_id as string,
      faction: r.faction as string,
      status: r.status as string,
      data: (r.data as Record<string, unknown>) ?? {},
    }));
  }

  async saveSlot(payload: RunWrite, disciples: RunDiscipleRecord[]): Promise<string> {
    // 슬롯당 1회차(unique user,slot) — 기존 있으면 교체.
    const { data: existing, error: findErr } = await supabase
      .from('runs')
      .select('id')
      .eq('slot', payload.slot)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing?.id) {
      await this.update(existing.id as string, payload, disciples);
      return existing.id as string;
    }

    const uid = await requireUserId();
    const { data, error } = await supabase
      .from('runs')
      .insert({
        user_id: uid,
        slot: payload.slot,
        status: payload.status ?? 'active',
        diamonds: payload.diamonds,
        game_time: payload.gameTime,
        master: payload.master,
        sect: payload.sect,
        schedule: payload.schedule,
      })
      .select('id')
      .single();
    if (error) throw error;
    const runId = data.id as string;
    if (disciples.length > 0) {
      const { error: dErr } = await supabase
        .from('run_disciples')
        .insert(discipleRows(runId, uid, disciples));
      if (dErr) throw dErr;
    }
    return runId;
  }

  async update(id: string, payload: RunWrite, disciples: RunDiscipleRecord[]): Promise<void> {
    const uid = await requireUserId();
    const { error } = await supabase
      .from('runs')
      .update({
        slot: payload.slot,
        status: payload.status ?? 'active',
        diamonds: payload.diamonds,
        game_time: payload.gameTime,
        master: payload.master,
        sect: payload.sect,
        schedule: payload.schedule,
      })
      .eq('id', id);
    if (error) throw error;

    // 제자 전량 교체 (스냅샷 단순화).
    const { error: delErr } = await supabase.from('run_disciples').delete().eq('run_id', id);
    if (delErr) throw delErr;
    if (disciples.length > 0) {
      const { error: insErr } = await supabase
        .from('run_disciples')
        .insert(discipleRows(id, uid, disciples));
      if (insErr) throw insErr;
    }
  }

  async saveInbox(runId: string, items: InboxRecord[]): Promise<void> {
    const uid = await requireUserId();
    const { error: delErr } = await supabase
      .from('inbox_items')
      .delete()
      .eq('run_id', runId);
    if (delErr) throw delErr;
    if (items.length === 0) return;
    const rows = items.map((it) => ({
      run_id: runId,
      user_id: uid,
      kind: it.kind,
      title: it.title,
      preview: it.preview,
      body: it.body,
      priority: it.priority,
      created_at_day: it.createdAtDay,
      read: it.read,
      resolved: it.resolved,
      payload: it.item,
    }));
    const { error: insErr } = await supabase.from('inbox_items').insert(rows);
    if (insErr) throw insErr;
  }

  async saveJianghu(runId: string, state: JianghuState): Promise<void> {
    const uid = await requireUserId();
    const { error } = await supabase.from('jianghu_state').upsert(
      {
        run_id: runId,
        user_id: uid,
        factions: state.factions ?? {},
        events: state.events ?? [],
      },
      { onConflict: 'run_id' },
    );
    if (error) throw error;
  }

  async saveItems(runId: string, items: ItemRecord[]): Promise<void> {
    const uid = await requireUserId();
    const { error: delErr } = await supabase.from('items').delete().eq('run_id', runId);
    if (delErr) throw delErr;
    if (items.length === 0) return;
    const rows = items.map((it) => ({
      run_id: runId,
      user_id: uid,
      category: it.category,
      item_key: it.itemKey,
      qty: it.qty,
      payload: it.item,
    }));
    const { error: insErr } = await supabase.from('items').insert(rows);
    if (insErr) throw insErr;
  }

  async saveNpcs(runId: string, npcs: RunNpcRecord[]): Promise<void> {
    const uid = await requireUserId();
    const { error: delErr } = await supabase.from('run_npcs').delete().eq('run_id', runId);
    if (delErr) throw delErr;
    if (npcs.length === 0) return;
    const rows = npcs.map((n) => ({
      run_id: runId,
      user_id: uid,
      npc_id: n.npcId,
      faction: n.faction,
      status: n.status,
      data: n.data,
    }));
    const { error: insErr } = await supabase.from('run_npcs').insert(rows);
    if (insErr) throw insErr;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('runs').delete().eq('id', id);
    if (error) throw error;
  }
}
