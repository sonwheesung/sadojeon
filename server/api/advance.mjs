// POST /api/advance — 하루 진행(서버 권위). docs/31 Phase 1.
// 흐름: JWT 검증 → runs.state + run_secrets.rng_state 로드 → 엔진 advance(동기) → 저장 → 응답.
// 시드상태(rng_state)는 응답에 절대 안 실린다(비공개 → 세이브 스커밍 봉쇄).
import { advance } from '../dist/engine.mjs';
import { admin, userFromRequest } from '../lib/supabaseAdmin.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const user = await userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const slot = Number(req.body?.slot ?? 1);

  // ── 로드 (await) ──
  const { data: run, error: runErr } = await admin
    .from('runs').select('id, state').eq('user_id', user.id).eq('slot', slot).single();
  if (runErr || !run?.state) return res.status(404).json({ error: 'run not found' });
  const { data: secret } = await admin
    .from('run_secrets').select('rng_state, turn').eq('run_id', run.id).single();

  // ── 엔진 (동기 critical section — yield 없음 → 요청 간 무오염) ──
  const result = advance(run.state, Number(secret?.rng_state ?? 0));

  // ── 저장 (await) ──
  await admin.from('runs')
    .update({ state: result.state, updated_at: new Date().toISOString() })
    .eq('id', run.id);
  await admin.from('run_secrets')
    .update({ rng_state: result.rngState, turn: Number(secret?.turn ?? 0) + 1 })
    .eq('run_id', run.id);

  // ── 응답 — 상태(클라 렌더) + 이벤트. rngState 제외(비공개). ──
  return res.status(200).json({ state: result.state, events: result.events });
}
