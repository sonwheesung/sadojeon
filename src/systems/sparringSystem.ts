// 양육기 동문 비무(比武) — docs/27 §5. 전투력을 양육 중에도 관찰 가능하게.
// 비등한 두 동문이 이따금 손을 맞춘다. 승패는 전투력+운, 결과 = 명성·스트레스·인격·관계.
// 강제 선택 아님(읽기 전용 보고). 사부가 산에서 지켜보는 풍경.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { realmIndex } from '@/data/realm';
import type { Disciple, RelationLevel } from '@/types';
import { combatPower } from './combatPower';
import { currentAge } from './discipleCtx';
import { shiftPersona } from './personaShift';

const SPAR_DAILY_CHANCE = 0.06; // 자격 2인↑일 때 하루 발동 확률(≈수 주 1회)
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

const REL_UP: Record<RelationLevel, RelationLevel> = {
  enemy: 'distant',
  distant: 'neutral',
  neutral: 'friend',
  friend: 'sworn',
  sworn: 'sworn',
};
const REL_DOWN: Record<RelationLevel, RelationLevel> = {
  sworn: 'friend',
  friend: 'neutral',
  neutral: 'distant',
  distant: 'enemy',
  enemy: 'enemy',
};

function eligible(d: Disciple | undefined): d is Disciple {
  return (
    !!d &&
    d.status === 'training' &&
    d.martialArts.length > 0 &&
    realmIndex(d.realm) >= realmIndex('samryu') &&
    currentAge(d) >= 12
  );
}

function pushReport(title: string, body: string, discipleId: string): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `spar-${day}-${Math.floor(Math.random() * 1e6)}`,
    kind: 'report',
    title,
    preview: body.split('\n')[0],
    body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'spar', discipleId },
  });
}

// 비등한 한 쌍 고르기 — 전투력 순 정렬 후 인접 쌍(실력차 작아 진짜 겨룸).
function pickPair(list: Disciple[]): [Disciple, Disciple] | null {
  if (list.length < 2) return null;
  const sorted = [...list].sort((a, b) => combatPower(a) - combatPower(b));
  const i = Math.floor(Math.random() * (sorted.length - 1)); // 0 .. len-2
  return [sorted[i], sorted[i + 1]];
}

// 매 진행 후 호출. 낮은 확률로 동문 비무 1건.
export function triggerDailySpar(): void {
  if (Math.random() >= SPAR_DAILY_CHANCE) return;
  const ds = useDiscipleStore.getState();
  const pool = ds.order.map((id) => ds.disciples[id]).filter(eligible);
  const pair = pickPair(pool);
  if (!pair) return;
  const [x, y] = pair;

  const luck = (p: number) => p + (Math.random() - 0.5) * (Math.max(20, p) * 0.4); // ±20% 운
  const px = luck(combatPower(x));
  const py = luck(combatPower(y));
  const winner = px >= py ? x : y;
  const loser = px >= py ? y : x;
  const decisive = Math.abs(px - py) > Math.max(15, Math.min(px, py) * 0.4);

  // 승자 — 자신감·명성, 패자 — 분함·배움. 스태미나 소모 공통.
  ds.update(winner.id, {
    fame: clamp((winner.fame ?? 0) + (decisive ? 4 : 2)),
    stamina: clamp(winner.stamina - 6, 0, winner.maxStamina),
    personality: shiftPersona(winner, { ambition: 2, integrity: 1 }),
  });
  ds.update(loser.id, {
    stress: clamp((loser.stress ?? 0) + (decisive ? 7 : 4)),
    stamina: clamp(loser.stamina - 6, 0, loser.maxStamina),
    // 진 쪽은 신중을 배우거나(대개) 야망이 끓는다.
    personality: shiftPersona(loser, { prudence: 2 }),
  });

  // 관계 — 패자의 결로 갈린다. 무뚝뚝·야심가는 앙금(↓), 그 외는 서로 인정(↑).
  const resentful = loser.personality.warmth < 40 || loser.personality.ambition > 65;
  const wRel = winner.relationships[loser.id] ?? 'neutral';
  const lRel = loser.relationships[winner.id] ?? 'neutral';
  if (resentful && decisive) {
    ds.setRelation(loser.id, winner.id, REL_DOWN[lRel]);
    ds.setRelation(winner.id, loser.id, REL_DOWN[wRel]);
  } else {
    ds.setRelation(loser.id, winner.id, REL_UP[lRel]);
    ds.setRelation(winner.id, loser.id, REL_UP[wRel]);
  }

  const body = decisive
    ? `${winner.name}과(와) ${loser.name}이(가) 손을 맞췄다. ${winner.name}의 무위가 한결 위였다. ${loser.name}은(는) 분을 삼키며 물러났다.`
    : `${winner.name}과(와) ${loser.name}이(가) 막상막하로 겨뤘다. 끝내 ${winner.name}이(가) 반 수 앞섰으나, 둘 다 적잖이 얻은 듯하다.`;
  pushReport(`${winner.name} · ${loser.name} — 동문 비무`, body, winner.id);
}
