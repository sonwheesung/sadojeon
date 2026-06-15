// 부상 생애주기 통합 시뮬 — 발생(의뢰/전투)·누적·자연치유·영약치료·훈련 차단(R1)을 실제 엔진으로 돌린다.
// 실행: npx tsx scripts/sim/woundsim.ts   (docs/37 §C2·R5, docs/29 §5-1)
// woundstack.ts(결정적 계약)의 상위 — 여기선 "여러 상황에서 통계·실루프 거동"을 본다.
import './_storageShim'; // 스토어 import 보다 먼저 — 노드 localStorage 폴리필.
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useTimeStore } from '../../src/stores/timeStore';
import { useItemStore } from '../../src/stores/itemStore';
import {
  hasWound,
  healWound,
  inflictWound,
  tickWoundRecovery,
  woundsOf,
  woundsLabel,
} from '../../src/systems/woundSystem';
import { tickDailyTraining } from '../../src/systems/trainingSystem';
import { issueOverride } from '../../src/systems/overrideSystem';
import type { Disciple, WoundType } from '../../src/types/disciple';

// 결정적 rng(재현용) — 시뮬 통계 룰: 측정 재현 가능.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260615);
function pick<T>(table: [T, number][]): T {
  const total = table.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [v, w] of table) {
    r -= w;
    if (r <= 0) return v;
  }
  return table[table.length - 1][0];
}

const ds = () => useDiscipleStore.getState();
function fresh(id: string, arts = false): void {
  ds().add({
    id,
    name: id,
    martialArts: arts ? [{ artId: 'ami-gicho-sword', seong: 2, exp: 0 }] : [],
    mainMartialArtId: arts ? 'ami-gicho-sword' : undefined,
    realm: 'iryu',
    realmProgress: { internal: 200, pity: 0, petitioned: false },
    status: 'training',
    stamina: 100,
    maxStamina: 100,
    stress: 0,
  } as unknown as Disciple);
}

// 의뢰/전투가 던지는 상처 한 방 — 속성·심도 분포는 docs 밴드 근사.
// 살수=독, 환경=화상/동상, 대부분=외상. 심도는 경상이 흔하고 치명상은 드물다.
function randomHit(): { type: WoundType; severity: number; days: number } {
  const type = pick<WoundType>([
    ['wound', 58],
    ['poison', 16],
    ['frost', 11],
    ['burn', 11],
    ['inner', 4],
  ]);
  const severity = pick<number>([
    [1, 8],
    [2, 17],
    [3, 28],
    [4, 30],
    [5, 17],
  ]);
  const days = severity === 1 ? 30 : severity === 2 ? 21 : severity === 3 ? 14 : severity === 4 ? 9 : 5;
  return { type, severity, days };
}

const N = 10000;
console.log('═══ 부상 생애주기 통합 시뮬 (n=10000, 결정적 rng) — docs/37 §C2·R5 ═══');

// ────────────────────────────────────────────────────────────────────────
// PART 1 — 다중 상처 누적: 위험한 의뢰 한 사이클(1~3 피격) 후 동시 상처 분포
// ────────────────────────────────────────────────────────────────────────
console.log('\n[1] 위험 의뢰 한 사이클(1~3회 피격) 후 동시 보유 상처 — 검상+독 동시 가능?');
{
  const cnt = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  let multiType = 0; // 서로 다른 속성 2종+ 동시
  let poisonPlusWound = 0; // "검상 + 독" 류 구체 사례
  let deepest1 = 0; // 치명상 보유
  for (let i = 0; i < N; i += 1) {
    ds().reset();
    fresh('h');
    const hits = pick<number>([
      [1, 50],
      [2, 35],
      [3, 15],
    ]);
    for (let h = 0; h < hits; h += 1) {
      const w = randomHit();
      inflictWound('h', w.type, w.severity, w.days);
    }
    const ws = woundsOf(ds().disciples['h']!);
    cnt[ws.length] = (cnt[ws.length] ?? 0) + 1;
    const types = new Set(ws.map((w) => w.type));
    if (types.size >= 2) multiType += 1;
    if (types.has('poison') && types.has('wound')) poisonPlusWound += 1;
    if (ws.some((w) => w.severity === 1)) deepest1 += 1;
  }
  const pct = (n: number) => `${((n / N) * 100).toFixed(1)}%`;
  console.log(`  동시 상처 1종 ${pct(cnt[1])} · 2종 ${pct(cnt[2])} · 3종 ${pct(cnt[3])}`);
  console.log(`  서로 다른 속성 2종+ 동시: ${pct(multiType)}  (← 종전엔 0% — 단일 슬롯이라 불가)`);
  console.log(`  '검상 + 독' 동시 보유: ${pct(poisonPlusWound)}  (각각 해독약·외상약 따로 필요)`);
  console.log(`  치명상(sev1) 포함: ${pct(deepest1)}`);
}

// ────────────────────────────────────────────────────────────────────────
// PART 2 — 자연 치유 일수 분포: 영약 없이 시간만으로 (심도별)
// ────────────────────────────────────────────────────────────────────────
console.log('\n[2] 자연 치유(영약 X) — 완전 회복까지 일수(심도별 단일 상처)');
{
  for (const sev of [1, 2, 3, 4, 5]) {
    const days = sev === 1 ? 30 : sev === 2 ? 21 : sev === 3 ? 14 : sev === 4 ? 9 : 5;
    let sum = 0;
    const reps = 2000;
    for (let i = 0; i < reps; i += 1) {
      ds().reset();
      fresh('h');
      inflictWound('h', 'wound', sev, days);
      let d = 0;
      while (hasWound(ds().disciples['h']!)) {
        tickWoundRecovery();
        d += 1;
        if (d > 100) break;
      }
      sum += d;
    }
    const label = ['', '치명상', '중상', '부상', '경상', '찰과상'][sev];
    console.log(`  ${label}(sev${sev})  평균 ${(sum / reps).toFixed(0)}일`);
  }
}

// ────────────────────────────────────────────────────────────────────────
// PART 3 — 다중 상처 자연치유 vs 영약치료: "치명 검상 + 독" 동시
// ────────────────────────────────────────────────────────────────────────
console.log('\n[3] 검상 치명상 + 독 중상 동시 — 자연치유 vs 영약 1속성 치료');
{
  // (a) 자연치유만 — 가장 긴 상처가 지배
  ds().reset();
  fresh('nat');
  inflictWound('nat', 'wound', 1, 30); // 검상 치명상 30일
  inflictWound('nat', 'poison', 2, 21); // 독 중상 21일
  console.log(`  발생 직후: ${woundsLabel(woundsOf(ds().disciples['nat']!))}`);
  let dn = 0;
  while (hasWound(ds().disciples['nat']!)) {
    tickWoundRecovery();
    dn += 1;
    if (dn > 100) break;
  }
  console.log(`  (a) 자연치유만 → 완전 회복 ${dn}일 (검상 30일이 지배, 독은 21일째 먼저 사라짐)`);

  // (b) 영약으로 검상만 즉시 치료 → 독은 남아 자연치유
  ds().reset();
  fresh('cure');
  useItemStore.getState().add({ id: 'saengsa-1', name: '생사인', category: 'elixir', count: 1 } as never);
  inflictWound('cure', 'wound', 1, 30);
  inflictWound('cure', 'poison', 2, 21);
  const okWound = healWound('cure', 'saengsa-1'); // 외상 grade1 = 검상 치명상
  const tryPoison = healWound('cure', 'saengsa-1'); // 재고 0 + 독엔 안 먹힘
  console.log(`  (b) 생사인으로 검상 치료=${okWound}, 그 약으로 독 치료 시도=${tryPoison}(외상약은 독 못 고침/재고0)`);
  console.log(`      남은 상처: ${woundsLabel(woundsOf(ds().disciples['cure']!))}`);
  let dc = 0;
  while (hasWound(ds().disciples['cure']!)) {
    tickWoundRecovery();
    dc += 1;
    if (dc > 100) break;
  }
  console.log(`      독만 자연치유 → 완전 회복 ${dc}일 (검상 즉시 치료로 ${dn - dc}일 단축)`);
}

// ────────────────────────────────────────────────────────────────────────
// PART 4 — 훈련 차단(R1) 실루프: 부상 제자는 폐관 명령해도 쉰다
// ────────────────────────────────────────────────────────────────────────
console.log('\n[4] 훈련 차단(R1) — 실제 일과 루프(tickDailyTraining) 14일');
{
  ds().reset();
  useTimeStore.setState({ totalDay: 1 } as never);
  fresh('well', true); // 건강한 비교군
  fresh('hurt', true); // 부상군
  issueOverride('well', 'seclusion', 60); // 둘 다 폐관 명령(집중 수련)
  issueOverride('hurt', 'seclusion', 60);
  // 부상군은 체력을 좀 깎고 검상 부상(sev3·30일) — 폐관 명령했어도 다쳤으니 쉬어야 함
  ds().update('hurt', { stamina: 55 });
  inflictWound('hurt', 'wound', 3, 30);

  // 검 숙련 누적 진척 = seong*1000 + exp (성 오르면 exp 리셋되므로 합산해 단조 비교).
  const snap = (id: string) => {
    const d = ds().disciples[id]!;
    const art = d.martialArts.find((a) => a.artId === 'ami-gicho-sword')!;
    return { skill: art.seong * 1000 + art.exp, stamina: d.stamina, status: d.status };
  };
  const w0 = snap('well');
  const h0 = snap('hurt');

  for (let day = 0; day < 14; day += 1) {
    ds().update('well', { stamina: 100 }); // 건강 대조군은 매일 충분히 쉰 상태(탈진 변수 제거 — 부상 게이트만 비교)
    tickDailyTraining();
    tickWoundRecovery();
  }
  const w1 = snap('well');
  const h1 = snap('hurt');

  console.log(`  건강(폐관 수련 14일): 검 숙련 진척 +${(w1.skill - w0.skill).toFixed(1)} · status ${w1.status}`);
  console.log(`  부상(폐관 명령했으나 다침): 검 숙련 진척 +${(h1.skill - h0.skill).toFixed(1)} · 체력 ${h0.stamina}→${h1.stamina}(쉬며 회복) · status ${h1.status}`);
  console.log(`  → R1 확인: 부상군 무공 진척 ${h1.skill - h0.skill === 0 ? '0 (차단됨 ✅)' : '❌ 새어나감'}, 체력은 ${h1.stamina > h0.stamina ? '회복됨 ✅' : '❌'}`);

  // 치료 후 같은 폐관 명령으로 훈련 재개
  useItemStore.getState().add({ id: 'hwalhyeol-3', name: '활혈단', category: 'elixir', count: 1 } as never);
  const cured = healWound('hurt', 'hwalhyeol-3'); // 외상 grade3 = 부상(sev3) 치료(grade≤severity)
  const h2 = snap('hurt');
  for (let day = 0; day < 5; day += 1) {
    ds().update('hurt', { stamina: 100 });
    tickDailyTraining();
  }
  const h3 = snap('hurt');
  console.log(`  치료(활혈단)=${cured} → status ${h2.status}. 이후 5일 폐관: 검 숙련 진척 +${(h3.skill - h2.skill).toFixed(1)} → ${h3.skill - h2.skill > 0 ? '훈련 재개됨 ✅' : '❌'}`);
}

// ────────────────────────────────────────────────────────────────────────
// PART 5 — 전체 사이클 한 줄 서사 데모(1인)
// ────────────────────────────────────────────────────────────────────────
console.log('\n[5] 한 제자 전체 사이클 데모 — 의뢰 부상 → 회복 대기 → 치료 → 복귀');
{
  ds().reset();
  fresh('story', true);
  console.log('  의뢰 출정… 산채 화공에 화상, 매복 살수에 독침 둘 다 맞음');
  inflictWound('story', 'burn', 4, 9); // 화상 경상 — 청량고(grade4)로 치료
  inflictWound('story', 'poison', 3, 14); // 독 부상 — 해독단(grade3)으로 치료
  console.log(`  → 귀환: 치료 중 (${woundsLabel(woundsOf(ds().disciples['story']!))}), status=${ds().disciples['story']!.status}`);
  for (let d = 0; d < 7; d += 1) tickWoundRecovery();
  console.log(`  7일 자연치유 후: ${woundsLabel(woundsOf(ds().disciples['story']!))}`);
  useItemStore.getState().add({ id: 'haedok-3', name: '해독단', category: 'elixir', count: 1 } as never);
  useItemStore.getState().add({ id: 'cheongryang-4', name: '청량고', category: 'elixir', count: 1 } as never);
  healWound('story', 'haedok-3'); // 독 치료
  console.log(`  해독단 복용 → ${woundsLabel(woundsOf(ds().disciples['story']!)) || '(상처 없음)'}`);
  healWound('story', 'cheongryang-4'); // 화상 치료
  const s = ds().disciples['story']!;
  console.log(`  청량고 복용 → 상처 ${hasWound(s) ? woundsLabel(woundsOf(s)) : '전부 완치'}, status=${s.status} (복귀)`);
}

console.log('\n═══ 끝 — 발생·누적·자연치유·영약치료·훈련차단(R1) 전부 실엔진 거동 확인 ═══');
