// 하산 직업 분포 시뮬 — 15년 졸업 시점 직종·직책 분포를 플레이스타일 30종 × N판으로 집계.
// 실행: node .claude/skills/balance-sim/jobdist.cjs [N=300]
//
// ⚠️ 모델 성격(정직):
//  · 직업 판정 규칙 = src/systems/jobSystem.evaluateJobs + src/data/jobs.ts 게이트를 **그대로 복제**(정확).
//  · 양육 결과(최종 스탯·갈래 성·인격·흑화·명성) = **시작 캐릭터 6인 × 플레이스타일 설계 모델**(근사 — 실측 아님).
//    → 실코드 풀게임 1판이 15년에 ~6분이라 30×100=3000판이 불가(≈300시간)해서 택한 경로(사용자 합의 2026-06-17).
//  · 평판 인자 = 중립(1.0) 고정(헤드리스 시작 평판이 중립). 노선 게이트 docs/30 은 미반영(보수적).
//  · 직책 = careerStartFromJob(노선 + tier→시작 직책 레벨). docs/28 §4.
//  · 표본 N(기본 300) × 캐릭터 6 = 프로필당 1800 졸업생.

const N = Number(process.argv[2] ?? 300);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const clamp01 = (n) => clamp(n, 0, 1);
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0.5);

// ─── 직업 풀(src/data/jobs.ts 복제) ───────────────────────────────────────
const COMBAT = ['sword', 'saber', 'fist', 'lightness', 'hidden', 'external', 'darkArts'];
const JOBS = [
  // peak
  { id: 'murim-lord', name: '무림맹주', tier: 'peak', statReq: { knowledge: 70, guarding: 60 }, martial: { schools: ['sword', 'saber', 'fist'], minSeong: 8 }, personaMin: { integrity: 70, mercy: 55, ambition: 55 } },
  { id: 'divine-healer', name: '신의', tier: 'peak', statReq: { medicine: 80, knowledge: 70, alchemy: 50 }, personaMin: { mercy: 60 } },
  { id: 'medicine-king', name: '약왕', tier: 'peak', statReq: { alchemy: 80, medicine: 55 } },
  { id: 'ganghos-shadow', name: '강호의 그림자', tier: 'peak', statReq: { scouting: 85 }, martial: { schools: ['lightness'], minSeong: 7 } },
  { id: 'dark-blade', name: '어둠의 절세 살수', tier: 'peak', statReq: { scouting: 70 }, martial: { schools: ['sword', 'darkArts'], minSeong: 8 }, personaMax: { mercy: 30 } },
  { id: 'daoist-master', name: '도가 명사', tier: 'peak', statReq: { knowledge: 70 }, martial: { schools: ['qigong'], minSeong: 8 }, personaMin: { prudence: 70 }, personaMax: { ambition: 35 } },
  { id: 'sword-saint', name: '검성', tier: 'peak', martial: { schools: ['sword'], minSeong: 9 }, personaMin: { freedom: 55 } },
  { id: 'demon-protector', name: '마교 호법', tier: 'peak', martial: { schools: COMBAT, minSeong: 9 }, personaMax: { integrity: 40 } },
  { id: 'chivalrous-chief', name: '의적 거두', tier: 'peak', martial: { schools: COMBAT, minSeong: 8 }, personaMin: { integrity: 60, freedom: 55, mercy: 60 } },
  { id: 'caravan-master', name: '상단 총관', tier: 'peak', statReq: { guarding: 75, etiquette: 65, knowledge: 55 }, personaMax: { freedom: 35 } },
  // upper
  { id: 'caravan-guard-captain', name: '상단 호위장', tier: 'upper', statReq: { guarding: 70, strength: 55, etiquette: 50 }, personaMax: { freedom: 40 } },
  { id: 'escort-house-master', name: '표국주', tier: 'upper', statReq: { guarding: 55, etiquette: 45 }, martial: { schools: COMBAT, minSeong: 5 } },
  { id: 'orthodox-protector', name: '정파 호법', tier: 'upper', martial: { schools: ['sword', 'saber', 'fist'], minSeong: 7 }, personaMin: { integrity: 60 } },
  { id: 'wandering-physician', name: '강호 의원', tier: 'upper', statReq: { medicine: 55, alchemy: 35 } },
  { id: 'assassin-leader', name: '살수 단장', tier: 'upper', statReq: { scouting: 55 }, martial: { schools: ['sword', 'darkArts'], minSeong: 6 }, personaMax: { mercy: 40 } },
  { id: 'righteous-bandit', name: '의적 단장', tier: 'upper', martial: { schools: COMBAT, minSeong: 6 }, personaMin: { integrity: 55, freedom: 50, mercy: 55 } },
  { id: 'blade-master', name: '이름난 검객', tier: 'upper', martial: { schools: ['sword'], minSeong: 7 }, personaMin: { freedom: 50 } },
  { id: 'demon-head', name: '마두', tier: 'upper', martial: { schools: COMBAT, minSeong: 7 }, personaMax: { integrity: 45 } },
  { id: 'shadow-captain', name: '밀정 두목', tier: 'upper', statReq: { scouting: 60 }, martial: { schools: ['lightness'], minSeong: 5 } },
  { id: 'daoist-priest', name: '도가 명숙', tier: 'upper', statReq: { knowledge: 55 }, martial: { schools: ['qigong'], minSeong: 6 }, personaMin: { prudence: 60 }, personaMax: { ambition: 40 } },
  { id: 'strategist', name: '강호 책사', tier: 'upper', statReq: { knowledge: 75, formation: 60 }, personaMin: { prudence: 65, integrity: 50 } },
  // common
  { id: 'escort-warrior', name: '표국 무사', tier: 'common', statReq: { guarding: 30 } },
  { id: 'village-physician', name: '마을 의원', tier: 'common', statReq: { medicine: 30 } },
  { id: 'wanderer', name: '떠돌이 무인', tier: 'common', martial: { schools: COMBAT, minSeong: 4 }, personaMin: { freedom: 55 } },
  { id: 'village-guardian', name: '마을 보호자', tier: 'common', statReq: { guarding: 25 }, personaMin: { mercy: 50 } },
  { id: 'bounty-hunter', name: '현상금 사냥꾼', tier: 'common', statReq: { scouting: 40 }, martial: { schools: COMBAT, minSeong: 5 }, personaMin: { freedom: 50 } },
  { id: 'spy-scout', name: '정탐꾼', tier: 'common', statReq: { scouting: 35 } },
  { id: 'wandering-daoist', name: '도사', tier: 'common', statReq: { knowledge: 35 }, martial: { schools: ['qigong'], minSeong: 4 } },
  { id: 'roving-hero', name: '의협', tier: 'common', martial: { schools: COMBAT, minSeong: 5 }, personaMin: { mercy: 50, freedom: 50 } },
  { id: 'sect-warrior', name: '정파 무사', tier: 'common', martial: { schools: ['sword', 'saber', 'fist'], minSeong: 4 }, personaMin: { integrity: 50 } },
  { id: 'sapa-warrior', name: '사파 무인', tier: 'common', martial: { schools: COMBAT, minSeong: 4 }, personaMax: { integrity: 40 } },
  // limited
  { id: 'quack-doctor', name: '야매 의사', tier: 'limited', statReq: { medicine: 12 } },
  { id: 'petty-assassin', name: '말단 살수', tier: 'limited', statReq: { scouting: 20 }, martial: { schools: ['sword', 'darkArts'], minSeong: 3 }, personaMax: { mercy: 45 } },
  { id: 'gatekeeper', name: '문지기', tier: 'limited', statReq: { guarding: 15 } },
  { id: 'town-idler', name: '동네 한량', tier: 'limited' },
];
const TIER_WEIGHT = { peak: 3.6, upper: 2.2, common: 1.2, limited: 0.45 };

// ─── 노선·직책(src/data/careers.ts 복제) ──────────────────────────────────
const JOB_ROUTE = {
  'murim-lord': 'righteous', 'orthodox-protector': 'righteous', strategist: 'righteous', 'sect-warrior': 'righteous',
  'divine-healer': 'healer', 'medicine-king': 'healer', 'wandering-physician': 'healer', 'village-physician': 'healer', 'quack-doctor': 'healer',
  'ganghos-shadow': 'shadow', 'shadow-captain': 'shadow', 'spy-scout': 'shadow',
  'dark-blade': 'assassin', 'assassin-leader': 'assassin', 'petty-assassin': 'assassin',
  'daoist-master': 'daoist', 'daoist-priest': 'daoist', 'wandering-daoist': 'daoist',
  'caravan-guard-captain': 'escort', 'escort-house-master': 'escort', 'escort-warrior': 'escort', 'village-guardian': 'escort', 'caravan-master': 'escort', gatekeeper: 'escort',
  'righteous-bandit': 'vigilante', 'chivalrous-chief': 'vigilante', 'roving-hero': 'vigilante',
  wanderer: 'wanderer', 'sword-saint': 'wanderer', 'blade-master': 'wanderer', 'bounty-hunter': 'wanderer',
  'demon-protector': 'demonic', 'demon-head': 'demonic', 'sapa-warrior': 'demonic',
  'town-idler': 'commoner',
};
const JOB_RANK = {
  'sect-warrior': 0, strategist: 1, 'orthodox-protector': 2, 'murim-lord': 3,
  'quack-doctor': 0, 'village-physician': 1, 'wandering-physician': 2, 'medicine-king': 3, 'divine-healer': 4,
  'spy-scout': 0, 'shadow-captain': 1, 'ganghos-shadow': 2,
  'petty-assassin': 0, 'assassin-leader': 1, 'dark-blade': 2,
  'wandering-daoist': 0, 'daoist-priest': 1, 'daoist-master': 2,
  gatekeeper: 0, 'escort-warrior': 1, 'village-guardian': 2, 'escort-house-master': 3, 'caravan-guard-captain': 4, 'caravan-master': 5,
  wanderer: 0, 'bounty-hunter': 1, 'blade-master': 2, 'sword-saint': 3,
  'roving-hero': 0, 'righteous-bandit': 1, 'chivalrous-chief': 2,
  'sapa-warrior': 0, 'demon-head': 1, 'demon-protector': 2,
  'town-idler': 0,
};
const ROUTE_LABEL = { righteous: '정파', vigilante: '의적', escort: '호위', wanderer: '떠돌이', assassin: '살수', shadow: '정탐', demonic: '마도', healer: '의원', daoist: '도가', commoner: '야인' };
const ROUTE_LADDER = {
  righteous: ['정파 무사', '분파 호법', '무림맹 호법', '무림맹주'], vigilante: ['뜨내기 협객', '의협', '의적', '의적 거두'],
  escort: ['문지기', '표국 무사', '호위장', '상단 총관'], wanderer: ['낭인', '이름난 검객', '일대 명숙', '강호 명사'],
  assassin: ['말단 살수', '살수', '살수 단장', '어둠의 절세'], shadow: ['세작', '정탐꾼', '밀정 두목', '강호의 그림자'],
  demonic: ['마졸', '사파 무인', '마두', '마교 호법'], healer: ['돌팔이', '마을 의원', '강호 의원', '신의'],
  daoist: ['행자', '도사', '도가 명숙', '도가 명사'], commoner: ['한량', '마을 무사', '마을 유지', '지방 명망가'],
};
const TIER_TO_LEVEL = { peak: 3, upper: 2, common: 1, limited: 0 };
function careerStartFromJob(jobId, tier) {
  const route = JOB_ROUTE[jobId] ?? 'commoner';
  const ladder = ROUTE_LADDER[route];
  const level = Math.min(ladder.length - 1, TIER_TO_LEVEL[tier]);
  return { route, level, title: ladder[level] };
}

// ─── evaluateJobs (src/systems/jobSystem.ts 복제, 평판=중립 1.0) ────────────
const statLv = (d, id) => d.stats[id] ?? 0;
function bestSeong(d, schools) { let b = 0; for (const s of schools) b = Math.max(b, d.seong[s] ?? 0); return b; }
function meetsJob(d, job) {
  if (job.statReq) for (const [k, v] of Object.entries(job.statReq)) if (statLv(d, k) < v) return false;
  if (job.martial && bestSeong(d, job.martial.schools) < job.martial.minSeong) return false;
  if (job.personaMin) for (const [k, v] of Object.entries(job.personaMin)) if (d.persona[k] < v) return false;
  if (job.personaMax) for (const [k, v] of Object.entries(job.personaMax)) if (d.persona[k] > v) return false;
  return true;
}
function abilityFit(d, job) {
  const p = [];
  if (job.statReq) for (const [k, req] of Object.entries(job.statReq)) p.push(clamp01((statLv(d, k) - req) / Math.max(1, 100 - req)));
  if (job.martial) { const s = bestSeong(d, job.martial.schools); p.push(clamp01((s - job.martial.minSeong) / Math.max(1, 10 - job.martial.minSeong))); }
  return avg(p);
}
function personaFit(d, job) {
  const p = [];
  if (job.personaMin) for (const [k, req] of Object.entries(job.personaMin)) p.push(clamp01((d.persona[k] - req) / Math.max(1, 100 - req)));
  if (job.personaMax) for (const [k, cap] of Object.entries(job.personaMax)) p.push(clamp01((cap - d.persona[k]) / Math.max(1, cap)));
  return avg(p);
}
function fitness(d, job) {
  const a = abilityFit(d, job), pf = personaFit(d, job), fame = clamp01((d.fame ?? 0) / 80);
  return 0.45 * a + 0.3 * pf + 0.15 * fame + 0.1 * pf;
}
const DARK_ROUTES = new Set(['assassin', 'shadow', 'vigilante', 'demonic']);
const LIGHT_ROUTES = new Set(['righteous', 'escort', 'healer', 'daoist']);
function darknessFactor(d, job) {
  if (d.darkness < 3) return 1;
  const route = JOB_ROUTE[job.id];
  if (DARK_ROUTES.has(route)) return d.darkness >= 4 ? 2.2 : 1.6;
  if (LIGHT_ROUTES.has(route)) return d.darkness >= 4 ? 0.3 : 0.5;
  return 1;
}
function evaluateJobs(d) {
  const FB = 'town-idler';
  const qualified = JOBS.filter((j) => j.id !== FB && meetsJob(d, j));
  if (qualified.length === 0) { const fb = JOBS.find((j) => j.id === FB); return [{ job: fb, prob: 1 }]; }
  const top = new Map();
  for (const j of qualified) {
    const route = JOB_ROUTE[j.id] ?? j.id; const cur = top.get(route);
    if (!cur || (JOB_RANK[j.id] ?? 0) > (JOB_RANK[cur.id] ?? 0)) top.set(route, j);
  }
  const winners = [...top.values()].map((j) => ({ job: j, score: Math.max(0.02, fitness(d, j) * TIER_WEIGHT[j.tier] * 1 * darknessFactor(d, j)) }));
  const total = winners.reduce((s, x) => s + x.score, 0);
  return winners.map((x) => ({ job: x.job, prob: x.score / total })).sort((a, b) => b.prob - a.prob);
}
function sampleJob(chances) { let r = Math.random(); for (const c of chances) { r -= c.prob; if (r <= 0) return c.job; } return chances[chances.length - 1].job; }

// ─── 시작 캐릭터 6인 (sim.cjs CHARS + jobs 게이트에 맞춘 적성 매핑) ──────────
// skillAff: 그 갈래/스탯의 적성(특화 1.0·상성 0.72·보통 0.5·미숙 0.32·상극 0.14). persona: 기본 6축.
// mainSchools: 주력으로 닦는 무공 갈래(성이 오르는 곳). statAff: 직업 게이트 스탯 적성.
const AFF = { 특화: 1.0, 상성: 0.72, 보통: 0.5, 미숙: 0.32, 상극: 0.14 };
const CHARS = [
  { id: 'jang', n: '장철', mainSchools: { fist: '특화', external: '특화' }, statAff: { guarding: '특화', strength: '특화', etiquette: '보통', knowledge: '보통', medicine: '미숙', scouting: '상극', alchemy: '상극', formation: '보통' }, persona: { integrity: 62, freedom: 38, warmth: 50, prudence: 52, mercy: 55, ambition: 45 } },
  { id: 'jin', n: '진소화', mainSchools: { qigong: '특화' }, statAff: { medicine: '특화', alchemy: '특화', knowledge: '상성', etiquette: '보통', scouting: '미숙', guarding: '상극', strength: '상극', formation: '보통' }, persona: { integrity: 52, freedom: 45, warmth: 58, prudence: 55, mercy: 62, ambition: 40 } },
  { id: 'han', n: '한바람', mainSchools: { lightness: '특화', darkArts: '특화', sword: '상성' }, statAff: { scouting: '특화', knowledge: '상성', etiquette: '보통', medicine: '미숙', guarding: '보통', strength: '보통', formation: '상성' }, persona: { integrity: 42, freedom: 62, warmth: 45, prudence: 50, mercy: 42, ambition: 56 } },
  { id: 'yun', n: '윤소소', mainSchools: { sword: '특화', lightness: '상성', qigong: '상성' }, statAff: { knowledge: '특화', guarding: '상성', etiquette: '상성', formation: '상성', scouting: '보통', medicine: '미숙', strength: '보통' }, persona: { integrity: 56, freedom: 54, warmth: 52, prudence: 54, mercy: 52, ambition: 56 } },
  { id: 'cheongha', n: '이청하', mainSchools: { sword: '특화', lightness: '특화', darkArts: '특화' }, statAff: { scouting: '특화', knowledge: '상성', etiquette: '보통', guarding: '보통', strength: '보통', medicine: '미숙', formation: '보통' }, persona: { integrity: 46, freedom: 56, warmth: 44, prudence: 48, mercy: 38, ambition: 60 } },
  { id: 'baek', n: '백연', mainSchools: { qigong: '특화' }, statAff: { knowledge: '특화', medicine: '상성', alchemy: '보통', etiquette: '상성', formation: '상성', scouting: '미숙', guarding: '미숙', strength: '상극' }, persona: { integrity: 54, freedom: 44, warmth: 56, prudence: 66, mercy: 56, ambition: 32 } },
];
const ALL_SCHOOLS = ['sword', 'saber', 'fist', 'lightness', 'hidden', 'external', 'darkArts', 'qigong'];
const ALL_STATS = ['guarding', 'strength', 'medicine', 'alchemy', 'scouting', 'knowledge', 'etiquette', 'formation'];

// ─── 플레이스타일 → 졸업생 최종 속성 모델 ─────────────────────────────────
// spend: 무과금=절정 천장 / 중과금=초절정 / 핵과금=화경(절품서·신품영약). 스탯·성 상한을 끌어올린다.
// und(이해): 1.0=천장 도달 / 0.9·0.8=비효율(주력 외 분산·부상)로 미달 + 명성↓.
// archetype: 플레이어가 전원을 특정 길로 몰 때 — 스탯/갈래 집중 + (사파)흑화·인격 하향.
// seongCap: docs 결 — 무과금=절정(특화 주력 ~6성)·중과금=초절정(~7)·핵과금=화경(절품서 ~9). docs/36·project_realm_balance.
const SPEND = { 무과금: { statMul: 1.0, seongCap: 6, fameBase: 28, elixir: 0 }, 중과금: { statMul: 1.15, seongCap: 7, fameBase: 40, elixir: 2 }, 핵과금: { statMul: 1.32, seongCap: 9, fameBase: 55, elixir: 4 } };

function buildDisciple(char, spend, und, arch) {
  const S = SPEND[spend];
  const stats = {}; const seong = {};
  // 무공 성 — 주력 갈래는 적성×spend, 그 외 보유 갈래는 약하게.
  for (const sc of ALL_SCHOOLS) {
    const aff = char.mainSchools[sc];
    if (aff) seong[sc] = clamp(Math.round(AFF[aff] * S.seongCap * und * rnd(0.92, 1.08)), 1, 10);
    else seong[sc] = 0;
  }
  // 스탯 — 적성 기반 천장(특화 ~62 → spend·und 적용; 핵과금 특화 ~82). 게이트 스탯만.
  for (const st of ALL_STATS) {
    const a = AFF[char.statAff[st] ?? '보통'] ?? 0.5;
    stats[st] = clamp(Math.round(a * 62 * S.statMul * und * rnd(0.9, 1.12)), 0, 100);
  }
  const persona = { ...char.persona };
  let darkness = 0;
  let fame = Math.round(S.fameBase * und * rnd(0.8, 1.2));

  // 아키타입 — 플레이어 의도가 육성을 비튼다(캐릭 적성과 어긋나면 효과 약함).
  if (arch === 'sapa') { // 전원 사파지향 — 마공·흑화. darkArts 적성 있으면 성↑, 없으면 흑화만.
    darkness = Math.random() < 0.6 ? 4 : 3;
    persona.integrity = clamp(persona.integrity - 28, 0, 100);
    persona.mercy = clamp(persona.mercy - 26, 0, 100);
    persona.ambition = clamp(persona.ambition + 14, 0, 100);
    if (char.mainSchools.darkArts) seong.darkArts = clamp(Math.round((AFF[char.mainSchools.darkArts] * S.seongCap + 2) * und), 1, 10);
  } else if (arch === 'healer') { // 의원·연단 천착 — medicine/alchemy 끌어올림(적성 한도).
    for (const st of ['medicine', 'alchemy', 'knowledge']) { const a = AFF[char.statAff[st] ?? '미숙']; stats[st] = clamp(Math.round(a * 78 * S.statMul * und * rnd(0.9, 1.1)), 0, 100); }
    persona.mercy = clamp(persona.mercy + 8, 0, 100);
  } else if (arch === 'shadow') { // 정탐·살수 — scouting + lightness/darkArts/sword 성.
    const a = AFF[char.statAff.scouting ?? '보통']; stats.scouting = clamp(Math.round(a * 80 * S.statMul * und * rnd(0.9, 1.1)), 0, 100);
  } else if (arch === 'sword') { // 검특화 정파 — sword 성 끌어올림 + 협의.
    const a = char.mainSchools.sword ? AFF[char.mainSchools.sword] : 0.4; seong.sword = clamp(Math.round((a * S.seongCap + 2) * und * rnd(0.92, 1.08)), 1, 10);
    persona.integrity = clamp(persona.integrity + 6, 0, 100);
  } else if (arch === 'daoist') { // 도가·내공 — qigong 성 + knowledge + 신중.
    const a = char.mainSchools.qigong ? AFF[char.mainSchools.qigong] : 0.4; seong.qigong = clamp(Math.round((a * S.seongCap + 1) * und * rnd(0.92, 1.08)), 1, 10);
    const k = AFF[char.statAff.knowledge ?? '보통']; stats.knowledge = clamp(Math.round(k * 72 * S.statMul * und), 0, 100);
    persona.prudence = clamp(persona.prudence + 10, 0, 100); persona.ambition = clamp(persona.ambition - 10, 0, 100);
  } else if (arch === 'escort') { // 호위·외공 — guarding/strength/etiquette.
    for (const st of ['guarding', 'strength', 'etiquette']) { const a = AFF[char.statAff[st] ?? '보통']; stats[st] = clamp(Math.round(a * 76 * S.statMul * und * rnd(0.9, 1.1)), 0, 100); }
    persona.freedom = clamp(persona.freedom - 12, 0, 100);
  } else if (arch === 'idle') { // 방치(random) — 분산·저효율. 전 수치 하향 + 명성 바닥.
    for (const st of ALL_STATS) stats[st] = Math.round(stats[st] * 0.6);
    for (const sc of ALL_SCHOOLS) if (seong[sc]) seong[sc] = clamp(Math.round(seong[sc] * 0.6), 1, 10);
    fame = Math.round(fame * 0.4);
  }
  return { stats, seong, persona, darkness, fame };
}

// 모델 경지(직업 게이트 아님 — docs 대조용): 주력 성·내공 근사.
function modelRealm(d, spend) {
  const topSeong = Math.max(0, ...Object.values(d.seong));
  const S = SPEND[spend];
  if (topSeong >= 9 && S.elixir >= 4) return Math.random() < 0.75 ? '화경' : '초절정'; // 핵과금: 절품서+신품영약
  if (topSeong >= 7 && S.elixir >= 2) return Math.random() < 0.3 ? '화경' : '초절정'; // 중과금: 가끔 화경
  if (topSeong >= 7) return '초절정';
  if (topSeong >= 6) return '절정';
  if (topSeong >= 4) return '일류';
  return topSeong >= 2 ? '이류' : '삼류';
}

// ─── 30 프로필 ────────────────────────────────────────────────────────────
const ARCH = [
  { key: 'b100', label: '균형·이해100', arch: null, und: 1.0 },
  { key: 'b90', label: '균형·이해90', arch: null, und: 0.9 },
  { key: 'b80', label: '균형·이해80', arch: null, und: 0.8 },
  { key: 'sapa', label: '전원 사파지향', arch: 'sapa', und: 0.92 },
  { key: 'healer', label: '의원·연단지향', arch: 'healer', und: 0.95 },
  { key: 'shadow', label: '정탐·살수지향', arch: 'shadow', und: 0.95 },
  { key: 'sword', label: '검특화 정파지향', arch: 'sword', und: 0.95 },
  { key: 'daoist', label: '도가·내공지향', arch: 'daoist', und: 0.95 },
  { key: 'escort', label: '호위·외공지향', arch: 'escort', und: 0.95 },
  { key: 'idle', label: '방치(무작위)', arch: 'idle', und: 0.7 },
];
const TIERS = ['무과금', '중과금', '핵과금'];

function pct(map, total) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round((v / total) * 100)}%`);
}

console.log(`══════ 하산 직업 분포 — 플레이스타일 30종 × ${N}판 × 캐릭터 6인 ══════`);
console.log('직업 규칙=실코드 복제 / 양육결과=설계 모델(근사) / 평판=중립 / 직책=careerStartFromJob\n');

for (const tier of TIERS) {
  console.log(`\n████ ${tier} ████`);
  for (const a of ARCH) {
    const jobCount = {}; const routeRankCount = {}; const realmCount = {};
    let total = 0;
    for (let i = 0; i < N; i += 1) {
      for (const char of CHARS) {
        const d = buildDisciple(char, tier, a.und, a.arch);
        const job = sampleJob(evaluateJobs(d));
        const { route, title } = careerStartFromJob(job.id, job.tier);
        jobCount[job.name] = (jobCount[job.name] ?? 0) + 1;
        const rk = `${ROUTE_LABEL[route]}·${title}`;
        routeRankCount[rk] = (routeRankCount[rk] ?? 0) + 1;
        const rm = modelRealm(d, tier); realmCount[rm] = (realmCount[rm] ?? 0) + 1;
        total += 1;
      }
    }
    console.log(`\n  [${tier}·${a.label}]  경지: ${pct(realmCount, total).slice(0, 4).join(' · ')}`);
    console.log(`    직종: ${pct(jobCount, total).slice(0, 6).join(' · ')}`);
    console.log(`    직책: ${pct(routeRankCount, total).slice(0, 5).join(' · ')}`);
  }
}

// ─── docs 대조 ────────────────────────────────────────────────────────────
console.log('\n══════ docs 설계 대조 ══════');
function realmDist(tier, und, arch) {
  const c = {}; let t = 0;
  for (let i = 0; i < 2000; i += 1) for (const ch of CHARS) { const d = buildDisciple(ch, tier, und, arch); const r = modelRealm(d, tier); c[r] = (c[r] ?? 0) + 1; t += 1; }
  return { hwa: (c['화경'] ?? 0) / t, cho: (c['초절정'] ?? 0) / t, jeol: (c['절정'] ?? 0) / t };
}
const nf = realmDist('무과금', 1.0, null), zf = realmDist('중과금', 1.0, null), hf = realmDist('핵과금', 1.0, null);
console.log(`  무과금 최적: 화경 ${(nf.hwa * 100).toFixed(0)}% · 초절정 ${(nf.cho * 100).toFixed(0)}% · 절정 ${(nf.jeol * 100).toFixed(0)}%  (docs: 무과금=절정 기준, 조합 초절정)`);
console.log(`  중과금 최적: 화경 ${(zf.hwa * 100).toFixed(0)}% · 초절정 ${(zf.cho * 100).toFixed(0)}%`);
console.log(`  핵과금 최적: 화경 ${(hf.hwa * 100).toFixed(0)}% · 초절정 ${(hf.cho * 100).toFixed(0)}%  (docs: 화경=신품영약+절품서 게이트)`);
console.log(`  대조: 무과금 화경 희소(${(nf.hwa * 100).toFixed(0)}%<10%)? ${nf.hwa < 0.1 ? 'OK' : '⚠'} · 핵과금 화경 가능(${(hf.hwa * 100).toFixed(0)}%>0)? ${hf.hwa > 0 ? 'OK' : '⚠'} · 과금 단조↑? ${nf.hwa <= zf.hwa && zf.hwa <= hf.hwa ? 'OK' : '⚠'}`);
