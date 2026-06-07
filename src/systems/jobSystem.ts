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

// 주력 무공이 주어진 갈래 중 하나면 그 성, 아니면 0.
function mainSeongInSchools(d: Disciple, schools: readonly MartialArtSchool[]): number {
  const mainId = d.mainMartialArtId ?? d.martialArts[0]?.artId;
  const inst = mainId ? d.martialArts.find((a) => a.artId === mainId) : undefined;
  if (!inst) return 0;
  const art = findMartialArt(inst.artId);
  if (!art) return 0;
  return schools.includes(art.school) ? inst.seong : 0;
}

export function meetsJob(d: Disciple, job: Job): boolean {
  if (job.statReq) {
    for (const [k, v] of Object.entries(job.statReq)) {
      if (v != null && statLv(d, k as StatId) < v) return false;
    }
  }
  if (job.martial && mainSeongInSchools(d, job.martial.schools) < job.martial.minSeong) {
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
    const s = mainSeongInSchools(d, job.martial.schools);
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

export interface JobChance {
  job: Job;
  prob: number; // 0~1
}

// 졸업 시점 가능 직업 + 확률(적합도×문파 평판 가중, 정규화). 조건 충족 직업만, 확률 내림차순.
export function evaluateJobs(d: Disciple): JobChance[] {
  const scored = JOB_POOL.filter((j) => meetsJob(d, j)).map((j) => ({
    job: j,
    score: Math.max(0.02, fitness(d, j) * reputationFactor(d, j)),
  }));
  if (scored.length === 0) return [];
  const total = scored.reduce((s, x) => s + x.score, 0);
  return scored
    .map((x) => ({ job: x.job, prob: x.score / total }))
    .sort((a, b) => b.prob - a.prob);
}
