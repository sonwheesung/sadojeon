import { supabase } from '@/lib/supabase';
import type { CommonDisciple, DiscipleCatalogRepository } from '../types';

// common_disciples 행 → 도메인 타입 매핑. data jsonb 의 메타를 펼친다.
function mapRow(row: {
  id: string;
  name: string;
  hanja_name: string | null;
  star_rank: number;
  bio: string | null;
  data: Record<string, unknown> | null;
}): CommonDisciple {
  const data = row.data ?? {};
  return {
    id: row.id,
    name: row.name,
    hanjaName: row.hanja_name ?? '',
    starRank: row.star_rank,
    bio: row.bio,
    gender: typeof data.gender === 'string' ? data.gender : undefined,
    group: typeof data.group === 'string' ? data.group : undefined,
    isPremium: typeof data.isPremium === 'boolean' ? data.isPremium : undefined,
  };
}

const COLUMNS = 'id, name, hanja_name, star_rank, bio, data';

export class SupabaseDiscipleCatalogRepo implements DiscipleCatalogRepository {
  async listAll(): Promise<CommonDisciple[]> {
    const { data, error } = await supabase
      .from('common_disciples')
      .select(COLUMNS)
      .order('star_rank', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }

  async findById(id: string): Promise<CommonDisciple | null> {
    const { data, error } = await supabase
      .from('common_disciples')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  }
}
