// 용봉지회(龍鳳之會) — docs/27 §5. 또래 제자들의 전투력 겨룸. 매년 1회.
// 활동 제자(이류↑·14세↑)가 타 문파 후기지수(생성 NPC)들과 전투력으로 순위를 다툰다.
// 결과 = 명성 가감 + 강호 풍문 서신. 숫자 직접 노출 X, 등수·풍문으로(docs/27 §6).

import { josa } from '@/utils/korean';
import { random } from '@/systems/rng';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { realmIndex } from '@/data/realm';
import { combatPower } from './combatPower';
import { playCutscene } from './cutsceneSystem';
import { currentAge } from './discipleCtx';
import type { Disciple } from '@/types';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// 타 문파 후기지수 이름 풀 — 매년 들끓는 강호 신예들. (성+호 조합으로 변주)
const RIVAL_SURNAMES = ['남궁', '모용', '제갈', '팽', '하후', '서문', '단목', '황보', '독고', '사공'];
const RIVAL_GIVEN = ['세진', '무경', '천류', '한설', '비연', '소운', '벽하', '준극', '청현'];
const RIVAL_TITLES = [
  '검화(劍花)',
  '소룡(小龍)',
  '백의서생',
  '귀견수',
  '추혼도',
  '옥면랑',
  '북천신권',
];

interface Entrant {
  name: string;
  power: number; // 전투력 + 운(運)
  isDisciple: boolean;
  discipleId?: string;
}

function eligible(d: Disciple | undefined): d is Disciple {
  return (
    !!d &&
    d.status !== 'graduated' &&
    d.status !== 'departed' &&
    currentAge(d) >= 14 &&
    realmIndex(d.realm) >= realmIndex('iryu')
  );
}

function pushNews(title: string, body: string, priority: 'normal' | 'high' = 'normal'): void {
  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `tourney-${day}-${Math.floor(random() * 1e6)}`,
    kind: 'rumor',
    title,
    preview: body,
    body,
    priority,
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}

// 참가 제자들의 전투력 중앙값을 기준으로 강호 신예 NPC 군을 빚는다(약~강 분포).
function makeRivals(median: number, count: number): Entrant[] {
  const out: Entrant[] = [];
  for (let i = 0; i < count; i += 1) {
    const surname = RIVAL_SURNAMES[Math.floor(random() * RIVAL_SURNAMES.length)];
    const given = RIVAL_GIVEN[Math.floor(random() * RIVAL_GIVEN.length)];
    const useTitle = random() < 0.4;
    const name = useTitle
      ? RIVAL_TITLES[Math.floor(random() * RIVAL_TITLES.length)]
      : `${surname}${given}`;
    // 0.55~1.7배 분포 — 대부분 비등, 간혹 압도적 천재. 0 바닥 방지.
    const factor = 0.55 + random() * 1.15;
    const base = Math.max(15, median) * factor;
    out.push({ name, power: Math.round(base + random() * base * 0.15), isDisciple: false });
  }
  return out;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

// 순위별 명성 보상. 상위일수록 크게. (강호 신예 사이에서의 자리)
function fameForRank(rank: number, fieldSize: number): number {
  if (rank === 1) return 16;
  if (rank === 2) return 11;
  if (rank === 3) return 8;
  if (rank <= Math.ceil(fieldSize / 2)) return 4;
  return 1;
}

function ordinal(rank: number): string {
  if (rank === 1) return '장원(壯元)';
  if (rank === 2) return '아원(亞元)';
  if (rank === 3) return '탐화(探花)';
  return `${rank}위`;
}

// 매년 1회 호출(timeSystem 연 경계). 자격 제자 없으면 조용히 넘어간다.
export function runYoungTalentsTournament(): void {
  const ds = useDiscipleStore.getState();
  const parts = ds.order.map((id) => ds.disciples[id]).filter(eligible);
  if (parts.length === 0) return;

  const med = median(parts.map((d) => combatPower(d)));
  const rivalCount = Math.max(5, parts.length * 2);
  const luck = () => Math.round((random() - 0.5) * Math.max(10, med) * 0.3); // ±15% 운

  const field: Entrant[] = [
    ...parts.map((d) => ({
      name: d.name,
      power: combatPower(d) + luck(),
      isDisciple: true,
      discipleId: d.id,
    })),
    ...makeRivals(med, rivalCount).map((r) => ({ ...r, power: r.power + luck() })),
  ];
  field.sort((a, b) => b.power - a.power);

  const year = useTimeStore.getState().current.year;
  const lines: string[] = [];
  field.forEach((e, idx) => {
    if (!e.isDisciple || !e.discipleId) return;
    const rank = idx + 1;
    const gain = fameForRank(rank, field.length);
    const d = ds.disciples[e.discipleId];
    if (d) ds.update(e.discipleId, { fame: clamp((d.fame ?? 0) + gain) });
    lines.push(`${e.name} — ${ordinal(rank)} (총 ${field.length}인 중)`);
  });

  const champ = field[0];
  const headline =
    champ.isDisciple
      ? `${year}년 용봉지회 — 우리 ${josa(champ.name, '이', '가')} 장원!`
      : `${year}년 용봉지회 — ${josa(champ.name, '이', '가')} 장원에 올랐다`;
  const body = `올해 용봉지회에 강호의 후기지수 ${field.length}인이 모였다.\n\n${lines.join('\n')}`;
  pushNews(headline, body, champ.isDisciple ? 'high' : 'normal');

  // 우리 제자가 장원 — 컷씬(docs/20 특별 사건 × 제자 전용 연출).
  if (champ.isDisciple && champ.discipleId) {
    playCutscene('tournament_champion', { id: champ.discipleId, name: champ.name });
  }
}
