// POST /api/newRun — 새 회차 시작(서버 권위). docs/31 Phase 1.
// 서버가 초기 시드를 생성(유일하게 허용된 엔트로피 — 서버 통제) → 엔진 newRun → runs+run_secrets 저장.
import { randomInt } from 'node:crypto';
import { newRun } from '../dist/engine.mjs';
import { admin, userFromRequest } from '../lib/supabaseAdmin.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const slot = Number(req.body?.slot ?? 1);
  const party = Array.isArray(req.body?.party) ? req.body.party : [];
  if (party.length < 2 || party.length > 4) {
    return res.status(400).json({ error: 'party must be 2~4 disciples' });
  }

  // 서버 통제 초기 시드 — 이후 모든 무작위가 이 시드로 결정(유저 비공개).
  const seed = randomInt(0, 2 ** 31);
  const result = newRun(party, seed); // 동기

  // 기존 슬롯 회차 정리(덮어쓰기) 후 새 row.
  await admin.from('runs').delete().eq('user_id', user.id).eq('slot', slot);
  const now = new Date().toISOString();
  const { data: inserted, error: insErr } = await admin.from('runs').insert({
    user_id: user.id, slot, status: 'active', diamonds: 0,
    // 신모델: 전체 상태는 state JSONB. 레거시 컬럼(game_time/master/sect/schedule)은 호환 위해 채움.
    state: result.state,
    game_time: result.state.time?.current ?? {},
    master: result.state.master?.master ?? {},
    sect: result.state.sect?.sect ?? {},
    schedule: result.state.schedule ?? {},
    created_at: now, updated_at: now,
  }).select('id').single();
  if (insErr || !inserted) return res.status(500).json({ error: 'insert failed' });

  await admin.from('run_secrets').upsert({ run_id: inserted.id, rng_state: result.rngState, turn: 0 });

  return res.status(200).json({ runId: inserted.id, state: result.state, events: result.events });
}
