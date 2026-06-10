// 전투 시뮬레이션 엔진 — docs/35_전투_엔진.md.
// 대련(spar)·실전(real) 공용, 1:1 ~ n:n. 순수 엔진(스토어 무관) + 어댑터·NPC·서사.
//
//   simulateCombat([a], [b], { mode: 'spar' })                  — 대련 한 판
//   simulateCombat(제자들.map(combatantFromDisciple),
//                  [makeNpcCombatant({...})], { mode: 'real' }) — 실전(의뢰·강호 사건)
//   narrateCombat(result)                                       — 서신·일지 풍경 서술
//
// 효과 적용(상처 inflictWound·관계·EXP·심마)은 호출측 시스템이 결과를 보고 한다.

export { simulateCombat } from './engine';
export { combatantFromDisciple } from './fromDisciple';
export { makeNpcCombatant, type NpcArchetype, type NpcSpec } from './npc';
export { narrateCombat } from './narrate';
export { buildSheet, type CombatSheet } from './sheet';
