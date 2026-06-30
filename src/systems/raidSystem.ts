// 산적 습격 — 첫 강호 사건. docs/07 · docs/35 §7 (2026-06-11).
// 바깥일 보러 나간 제자가 녹림 무리와 마주친다 → 전투 엔진 실전 n:n 1판.
// v1: **사망 없음**(lethal:false) — 일상 사건에서 제자를 잃지 않는다(사망은 결투 의뢰의
// 생존 체인 경로만). 이기면 명성·푼돈 전리품, 지면 부상·스트레스. 숫자 비노출 — 서신 풍경.

import { random } from '@/systems/rng';
import { josa } from '@/utils/korean';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useSectStore } from '@/stores/sectStore';
import { useTimeStore } from '@/stores/timeStore';
import { realmIndex } from '@/data/realm';
import type { Disciple } from '@/types';
import type { Combatant } from '@/types/combat';
import { combatantFromDisciple, makeNpcCombatant, narrateCombat, simulateCombat } from './combat';
import { currentAge } from './discipleCtx';
import { inflictWound } from './woundSystem';
import { absorbDrainedQi } from './simmaSystem';

const RAID_DAILY_CHANCE = 0.012; // 🔧 연 ~4회 — 잦으면 소음, 드물면 잊힌다.
const LOOT_MIN = 60; //            전리품(동) 🔧
const LOOT_MAX = 160;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function eligible(d: Disciple | undefined): d is Disciple {
  return (
    !!d &&
    d.status === 'training' &&
    d.martialArts.length > 0 &&
    realmIndex(d.realm) >= realmIndex('samryu') &&
    currentAge(d) >= 12
  );
}

function makeRaiders(count: number, sectRep: number): Combatant[] {
  return Array.from({ length: count }, (_, i) => {
    // 이름난 사문일수록 노리는 자들도 격이 있다 — 명성 비례로 이류가 섞인다. 🔧
    const tougher = sectRep >= 40 && random() < Math.min(0.5, sectRep / 200);
    const archetype = random() < 0.75 ? ('bandit' as const) : ('rogue' as const);
    return makeNpcCombatant({
      id: `raider-${i}`,
      name: archetype === 'bandit' ? `산적${i + 1}` : `사파 낭인${i + 1}`,
      realm: tougher ? 'iryu' : 'samryu',
      archetype,
      quality: 0.35 + random() * 0.3,
    });
  });
}

// 매 진행 후 호출(timeSystem). 낮은 확률로 습격 1건.
export function triggerDailyRaid(): void {
  if (random() >= RAID_DAILY_CHANCE) return;
  const ds = useDiscipleStore.getState();
  const pool = ds.order.map((id) => ds.disciples[id]).filter(eligible);
  if (pool.length === 0) return;

  // 나가 있던 1~2명이 당한다.
  const shuffled = [...pool].sort(() => random() - 0.5);
  const party = shuffled.slice(0, random() < 0.5 ? 1 : Math.min(2, shuffled.length));
  const sectRep = useSectStore.getState().sect?.reputation ?? 0;
  const raiders = makeRaiders(1 + Math.floor(random() * Math.min(3, party.length + 1)), sectRep);

  const r = simulateCombat(party.map(combatantFromDisciple), raiders, {
    mode: 'real',
    lethal: false, // v1 — 습격으로는 죽지 않는다
  });
  const won = r.winner === 'A';

  // 결과 적용 — 부상(엔진 제안), 스트레스, 승리 보상.
  const RAID_MVP_FAME_BONUS = 3; // 활약 1위(mvp) 추가 명성 — n:n(2인+)에서만 차등(docs/37 R37)
  const aCount = r.combatants.filter((c) => c.side === 'A').length;
  for (const c of r.combatants) {
    if (c.side !== 'A') continue;
    const d = ds.disciples[c.id];
    if (!d) continue;
    if (c.wound) inflictWound(c.id, c.wound.type, c.wound.severity, c.wound.days);
    if (c.drainedQi) absorbDrainedQi(c.id, c.drainedQi); // 흡공 결산(R36)
    // 활약 1위(엔진 mvpId)는 같은 위험에 더 큰 공 — n:n 보상 차등(R37). 단신(1인)이면 차등 무의미.
    const mvpBonus = won && aCount >= 2 && c.id === r.mvpId ? RAID_MVP_FAME_BONUS : 0;
    ds.update(c.id, {
      stress: clamp((d.stress ?? 0) + (won ? 4 : 10)),
      ...(won ? { fame: clamp((d.fame ?? 0) + 3 + mvpBonus) } : {}),
    });
  }
  let lootNote = '';
  if (won) {
    const loot = LOOT_MIN + Math.floor(random() * (LOOT_MAX - LOOT_MIN + 1));
    useSectStore.getState().adjustResources(loot);
    lootNote = ' 놈들이 버리고 간 봇짐에서 푼돈이 나왔다.';
  }

  const names = party.map((d) => d.name).join('·');
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `raid-${day}-${Math.floor(random() * 1e6)}`,
    kind: 'report',
    title: won ? `${names} — 산길의 습격을 물리치다` : `${names} — 산길에서 봉변`,
    preview: `${josa(names, '이', '가')} 산길에서 ${raiders.length}인의 무리와 마주쳤다.`,
    body: `${josa(names, '이', '가')} 바깥일을 보고 돌아오는 산길에서 ${raiders.length}인의 무리와 마주쳤다.\n\n${narrateCombat(r)}${lootNote}`,
    priority: won ? 'normal' : 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'raid', discipleId: party[0]?.id },
  });
}
