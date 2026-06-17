// 사부 개입 — 졸업 제자에게 서신·호출을 보낸다(능동). docs/08 "사부 개입 수단".
// 자율 시뮬(graduateEvents)과 달리 사용자가 발신 → 1계절 뒤 도달 → 제자가 신뢰·노선 따라 수용/무시.
// 수용은 전적으로 제자 결정 — 어둠 노선·낮은 신뢰면 사부의 말이 잘 닿지 않는다. 결과는 풍문 서신.
// 효과는 GraduateRecord(power·fame·status·route)에만 — 졸업 제자는 자율체라 직접 조작이 아니라 '청'이다.

import { ROUTE_LADDER, ROUTE_LABEL, type RouteId } from '@/data/careers';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGraduateStore, type GraduateRecord } from '@/stores/graduateStore';
import { useOutreachStore, type LetterTone, type OutreachMsg } from '@/stores/outreachStore';
import { useTimeStore } from '@/stores/timeStore';
import { pushJianghuNews } from './jianghuNews';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

const SEASON_DAYS = 84; // 도달 지연 — 1계절(3달×4주×7일). docs/08 "도달까지 1~2계절".
const DARK_ROUTES = new Set<RouteId>(['assassin', 'demonic', 'shadow']);

export const LETTER_TONE_LABEL: Record<LetterTone, string> = {
  encourage: '격려',
  advise: '충고',
  warn: '경고',
};

// 활동/부상 중이고 진행 중 전갈이 없을 때만 발신 가능(사망·실종·은거엔 못 닿음, 한 번에 하나).
export function pendingFor(graduateId: string): OutreachMsg | undefined {
  return useOutreachStore.getState().pending.find((m) => m.graduateId === graduateId);
}
export function canOutreach(g: GraduateRecord): { ok: boolean; reason?: string } {
  if (g.status !== 'active' && g.status !== 'injured') return { ok: false, reason: '강호에서 닿을 수 없는 제자다.' };
  if (pendingFor(g.id)) return { ok: false, reason: '이미 전갈이 가는 중이다.' };
  return { ok: true };
}

function enqueue(g: GraduateRecord, kind: OutreachMsg['kind'], tone?: LetterTone): boolean {
  if (!canOutreach(g).ok) return false;
  const today = useTimeStore.getState().totalDay;
  useOutreachStore.getState().add({
    id: `outreach-${g.id}-${today}`,
    graduateId: g.id,
    graduateName: g.name,
    kind,
    tone,
    sentDay: today,
    dueDay: today + SEASON_DAYS,
  });
  return true;
}

export function sendLetter(graduateId: string, tone: LetterTone): boolean {
  const g = useGraduateStore.getState().records.find((r) => r.id === graduateId);
  return g ? enqueue(g, 'letter', tone) : false;
}
export function sendSummon(graduateId: string): boolean {
  const g = useGraduateStore.getState().records.find((r) => r.id === graduateId);
  return g ? enqueue(g, 'summon', undefined) : false;
}

// 신뢰(졸업 시점 discipleStore 에 보존) — 사부의 말이 닿는 바탕.
function trustOf(graduateId: string): number {
  return useDiscipleStore.getState().disciples[graduateId]?.trustToMaster ?? 30;
}

// 개심 — 어둠 노선 제자를 정파의 길로 돌린다(드물게). 경고 서신·호출에서만.
function convertToRighteous(g: GraduateRecord): void {
  const ladder = ROUTE_LADDER.righteous;
  const level = Math.min(ladder.length - 1, Math.max(0, g.level - 1));
  useGraduateStore.getState().update(g.id, { route: 'righteous', level, title: ladder[level] });
}

function resolveLetter(g: GraduateRecord, tone: LetterTone): void {
  const trust = trustOf(g.id);
  const dark = DARK_ROUTES.has(g.route);
  // 수용 확률 — 신뢰 바탕 + 톤(격려는 쉽게·경고는 어렵게) + 어둠 노선 저항.
  let p = 0.4 + trust / 200 - (dark ? 0.2 : 0);
  if (tone === 'encourage') p += 0.15;
  if (tone === 'warn') p -= 0.15;
  const accepted = Math.random() < Math.max(0.05, Math.min(0.95, p));

  if (!accepted) {
    pushJianghuNews(
      `${g.name} — 서신`,
      `사부의 ${LETTER_TONE_LABEL[tone]} 서신이 ${g.name}에게 닿았으나, 귀담아듣지 않았다는 소식.`,
    );
    return;
  }
  if (tone === 'encourage') {
    const d = randInt(3, 6);
    useGraduateStore.getState().update(g.id, { fame: clamp(g.fame + d) });
    pushJianghuNews(`${g.name} — 격려`, `사부의 격려 서신에 힘을 얻은 ${g.name}, 강호에서 이름을 한층 떨친다.`);
  } else if (tone === 'advise') {
    const d = randInt(2, 5);
    useGraduateStore.getState().update(g.id, { power: clamp(g.power + d) });
    pushJianghuNews(`${g.name} — 충고`, `사부의 가르침을 새긴 ${g.name}, 무위를 한층 가다듬었다 한다.`);
  } else {
    // 경고 — 어둠 노선이면 개심 기회, 아니면 자중(명성 소폭).
    if (DARK_ROUTES.has(g.route) && Math.random() < 0.4) {
      convertToRighteous(g);
      pushJianghuNews(
        `${g.name} — 개심`,
        `사부의 경고가 끝내 마음에 닿았다. ${g.name}이 어둠의 길을 등지고 손을 씻기로 했다는 놀라운 소식.`,
        'high',
      );
    } else {
      useGraduateStore.getState().update(g.id, { fame: clamp(g.fame + 2) });
      pushJianghuNews(`${g.name} — 경고`, `사부의 경고를 새긴 ${g.name}, 한동안 몸을 사리며 자중한다 한다.`);
    }
  }
}

function resolveSummon(g: GraduateRecord): void {
  const trust = trustOf(g.id);
  const dark = DARK_ROUTES.has(g.route);
  // 호출은 직접 와야 하니 서신보다 응하기 어렵다. 다친 제자는 의탁차 더 잘 온다.
  let p = 0.3 + trust / 200 - (dark ? 0.25 : 0) + (g.status === 'injured' ? 0.1 : 0);
  const came = Math.random() < Math.max(0.05, Math.min(0.95, p));

  if (!came) {
    pushJianghuNews(`${g.name} — 부름`, `사부가 ${g.name}을 산문으로 불렀으나, 응하지 않았다는 소식.`);
    return;
  }
  const parts: string[] = [];
  if (g.status === 'injured') {
    useGraduateStore.getState().update(g.id, { status: 'active' });
    parts.push('상처를 다스리고');
  }
  const d = randInt(4, 8);
  const cur = useGraduateStore.getState().records.find((r) => r.id === g.id) ?? g;
  useGraduateStore.getState().update(g.id, { power: clamp(cur.power + d) });
  parts.push('사부의 직접 가르침을 받아 무위를 더했다');

  if (DARK_ROUTES.has(g.route) && Math.random() < 0.3) {
    convertToRighteous(g);
    pushJianghuNews(
      `${g.name} — 산문에 다녀가다`,
      `산문에 다녀간 ${g.name}, 사부와 긴 밤을 보낸 끝에 어둠의 길을 등지기로 했다 한다.`,
      'high',
    );
    return;
  }
  pushJianghuNews(`${g.name} — 산문에 다녀가다`, `${g.name}이 산문에 들러 ${parts.join(', ')}. 한 계절을 머물다 강호로 돌아갔다.`);
}

// advanceTurn 훅 — 도달한 전갈을 판정.
export function tickMasterOutreach(): void {
  const today = useTimeStore.getState().totalDay;
  const due = useOutreachStore.getState().pending.filter((m) => today >= m.dueDay);
  for (const m of due) {
    const g = useGraduateStore.getState().records.find((r) => r.id === m.graduateId);
    if (!g || g.status === 'dead' || g.status === 'missing' || g.status === 'retired') {
      // 전갈이 닿기 전 강호를 떠났다.
      if (g) pushJianghuNews(`${m.graduateName} — 전갈`, `사부의 전갈이 닿기 전, ${m.graduateName}은 이미 강호에서 멀어진 뒤였다.`);
      useOutreachStore.getState().remove(m.id);
      continue;
    }
    if (m.kind === 'letter' && m.tone) resolveLetter(g, m.tone);
    else resolveSummon(g);
    useOutreachStore.getState().remove(m.id);
  }
}

export { ROUTE_LABEL };
