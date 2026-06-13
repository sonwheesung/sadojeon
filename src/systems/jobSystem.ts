// 졸업 직업 판정 — docs/28 §3. 최소조건 필터 → 적합도 점수 → 확률 분포.
// 적합도 = 능력 초과분(50%) + 인격 부합(35%) + 제자 의지(15%, 현재 인격 재사용).
// 유대·명성은 후속(스토어 연결 시 가중치 재배분). 선택 UI도 후속 — 지금은 풀·확률만 산출.

import { JOB_POOL, type Job } from '@/data/jobs';
import { JOB_ROUTE, ROUTE_FACTION } from '@/data/careers';
import { repTier, type RepTier } from '@/data/factions';
import { findMartialArt } from '@/data/martialArts';
import { useReputationStore } from '@/stores/reputationStore';
import type { Disciple, PersonalityTraits } from '@/types';
import type { MartialArtSchool } from '@/types/martialArt';
import type { StatId } from '@/types/training';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0.5);

function statLv(d: Disciple, id: StatId): number {
  return d.stats?.[id]?.level ?? 0;
}

// 보유 무공 중 주어진 갈래의 **최고 성**(주력 아니어도). 2026-06-14: 종전 "주력 한 갈래만" 판정은
// 외공·내공을 주력 삼은 제자(최적 양육이 최고등급을 주력으로)가 익힌 검·도술을 무시해 전투 직업에
// 전부 탈락(절정 고수 75%가 동네 한량) → 그 갈래의 가장 깊은 무공으로 판정(검을 7성까지 닦았으면 검객 자격).
function bestSeongInSchools(d: Disciple, schools: readonly MartialArtSchool[]): number {
  let best = 0;
  for (const inst of d.martialArts) {
    const art = findMartialArt(inst.artId);
    if (art && schools.includes(art.school)) best = Math.max(best, inst.seong);
  }
  return best;
}

export function meetsJob(d: Disciple, job: Job): boolean {
  if (job.statReq) {
    for (const [k, v] of Object.entries(job.statReq)) {
      if (v != null && statLv(d, k as StatId) < v) return false;
    }
  }
  if (job.martial && bestSeongInSchools(d, job.martial.schools) < job.martial.minSeong) {
    return false;
  }
  if (job.personaMin) {
    for (const [k, v] of Object.entries(job.personaMin)) {
      if (v != null && d.personality[k as keyof PersonalityTraits] < v) return false;
    }
  }
  if (job.personaMax) {
    for (const [k, v] of Object.entries(job.personaMax)) {
      if (v != null && d.personality[k as keyof PersonalityTraits] > v) return false;
    }
  }
  return true;
}

// 능력 초과분 0~1 — 최소 조건을 얼마나 웃도나(정점일수록 ↑).
function abilityFit(d: Disciple, job: Job): number {
  const parts: number[] = [];
  if (job.statReq) {
    for (const [k, req] of Object.entries(job.statReq)) {
      if (req == null) continue;
      parts.push(clamp01((statLv(d, k as StatId) - req) / Math.max(1, 100 - req)));
    }
  }
  if (job.martial) {
    const s = bestSeongInSchools(d, job.martial.schools);
    parts.push(clamp01((s - job.martial.minSeong) / Math.max(1, 10 - job.martial.minSeong)));
  }
  return avg(parts);
}

// 인격 부합 0~1 — 조건 축을 얼마나 충족·여유 있나.
function personaFit(d: Disciple, job: Job): number {
  const parts: number[] = [];
  if (job.personaMin) {
    for (const [k, req] of Object.entries(job.personaMin)) {
      if (req == null) continue;
      const val = d.personality[k as keyof PersonalityTraits];
      parts.push(clamp01((val - req) / Math.max(1, 100 - req)));
    }
  }
  if (job.personaMax) {
    for (const [k, cap] of Object.entries(job.personaMax)) {
      if (cap == null) continue;
      const val = d.personality[k as keyof PersonalityTraits];
      parts.push(clamp01((cap - val) / Math.max(1, cap)));
    }
  }
  return avg(parts);
}

function fitness(d: Disciple, job: Job): number {
  const a = abilityFit(d, job);
  const p = personaFit(d, job);
  const fame = Math.max(0, Math.min(1, (d.fame ?? 0) / 80));
  // 능력 45% + 인격 30% + 명성 15% + 제자 의지 10%(인격 재사용). docs/28 §3.
  return 0.45 * a + 0.3 * p + 0.15 * fame + 0.1 * p;
}

// 졸업 진로 게이트 — 직업 노선의 연관 문파 평판이 적합도를 가중. docs/30.
// 정파 직업인데 정파와 척졌으면 거의 안 열리고, 맹우면 잘 열린다. 문파 없는 노선=1.0.
const REP_FACTOR: Record<RepTier, number> = {
  hostile: 0.2,
  cold: 0.6,
  neutral: 1,
  friendly: 1.3,
  ally: 1.6,
};

function reputationFactor(d: Disciple, job: Job): number {
  const route = JOB_ROUTE[job.id];
  const factionId = route ? ROUTE_FACTION[route] : undefined;
  if (!factionId) return 1;
  const rs = useReputationStore.getState();
  const v = Math.max(rs.sect[factionId] ?? 0, rs.disciple[d.id]?.[factionId] ?? 0);
  return REP_FACTOR[repTier(v)];
}

// 흑화 회귀 — 깊이 어두워진 제자는 졸업 시 사파/어둠 길로 기운다. docs/13.
const DARK_ROUTES = new Set(['assassin', 'shadow', 'vigilante']);
const LIGHT_ROUTES = new Set(['righteous', 'escort', 'healer', 'daoist']);
function darknessFactor(d: Disciple, job: Job): number {
  if (d.darknessLevel < 3) return 1;
  const route = JOB_ROUTE[job.id];
  if (route && DARK_ROUTES.has(route)) return d.darknessLevel >= 4 ? 2.2 : 1.6;
  if (route && LIGHT_ROUTES.has(route)) return d.darknessLevel >= 4 ? 0.3 : 0.5;
  return 1;
}

export interface JobChance {
  job: Job;
  prob: number; // 0~1
}

// 졸업 시점 가능 직업 + 확률(적합도×문파 평판 가중, 정규화). 조건 충족 직업만, 확률 내림차순.
// 동네 한량(요구조건 0)은 **순수 최후 폴백** — 다른 직업이 하나라도 자격되면 경쟁에서 제외(2026-06-14).
// (종전엔 무조건 직업이 avg([])=0.5의 공짜 적합도로 간신히 자격되는 실제 직업을 이겨 절정 고수가 동네 한량으로
//  졸업하는 버그. 동네 한량은 "정말 아무 길도 못 찾은" 경우에만 나와야 한다.)
export function evaluateJobs(d: Disciple): JobChance[] {
  const FALLBACK_ID = 'town-idler';
  const real = JOB_POOL.filter((j) => j.id !== FALLBACK_ID && meetsJob(d, j)).map((j) => ({
    job: j,
    score: Math.max(0.02, fitness(d, j) * reputationFactor(d, j) * darknessFactor(d, j)),
  }));
  if (real.length === 0) {
    const fb = JOB_POOL.find((j) => j.id === FALLBACK_ID);
    return fb ? [{ job: fb, prob: 1 }] : [];
  }
  const total = real.reduce((s, x) => s + x.score, 0);
  return real
    .map((x) => ({ job: x.job, prob: x.score / total }))
    .sort((a, b) => b.prob - a.prob);
}
