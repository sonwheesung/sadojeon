// 졸업 제자 의지 갈등 — docs/28 §3④. 실행: npx tsx scripts/sim/graduationwill.ts
// 뚜렷한 인격이면 제자가 원하는 길이 생기고, 사부 선택과 어긋나면 설득/존중 분기.
import './_storageShim';
import { JOB_POOL, type Job } from '../../src/data/jobs';
import { discipleWill, graduationWillConflict } from '../../src/systems/jobSystem';
import { resolveGraduationConflict, resolveGraduationPick } from '../../src/systems/graduationChoice';
import { useDiscipleStore } from '../../src/stores/discipleStore';
import { useGraduateStore } from '../../src/stores/graduateStore';
import { useInboxStore } from '../../src/stores/inboxStore';
import type { Disciple, PersonalityTraits } from '../../src/types';

let pass = 0;
let fail = 0;
function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { pass += 1; console.log(`  PASS  ${label}${detail ? `   ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${label}${detail ? `   ${detail}` : ''}`); }
}

const NEUTRAL: PersonalityTraits = { integrity: 50, freedom: 50, warmth: 50, prudence: 50, mercy: 50, ambition: 50 };
function disc(persona: Partial<PersonalityTraits>, over: Partial<Disciple> = {}): Disciple {
  return {
    id: 'd1', name: '제자', status: 'graduated', relationships: {}, martialArts: [], realm: 'jeoljeong',
    darknessLevel: 0, trustToMaster: 50, personality: { ...NEUTRAL, ...persona }, fame: 0, ...over,
  } as unknown as Disciple;
}
const job = (id: string): Job => JOB_POOL.find((j) => j.id === id)!;
const healer = job('divine-healer'); //  personaMin mercy 60
const assassin = job('dark-blade'); //     personaMax mercy 30
const cands = [healer, assassin];

console.log('═══ 졸업 의지 갈등 스모크 ═══\n');

// C1 밋밋한 인격 → 의지 없음(사부 결정).
check('밋밋(전 축 50) → 의지 null', discipleWill(disc({}), cands) === null);

// C2 뚜렷(자비 90) → 자비 직업을 원함.
const merciful = disc({ mercy: 90 });
check('자비 90 → 신의를 원함', discipleWill(merciful, cands)?.id === 'divine-healer');

// C3 갈등 — 사부가 살수를 권하면 어긋남.
check('자비 90 + 살수 권함 → 갈등(신의 의지)', graduationWillConflict(merciful, cands, 'dark-blade')?.id === 'divine-healer');
check('자비 90 + 신의 권함 → 갈등 없음', graduationWillConflict(merciful, cands, 'divine-healer') === null);
check('밋밋 + 살수 권함 → 갈등 없음', graduationWillConflict(disc({}), cands, 'dark-blade') === null);

// C4 존중 — 제자 뜻(신의)으로 확정 + 신뢰↑.
useDiscipleStore.getState().reset();
useGraduateStore.getState().reset();
useInboxStore.getState().reset();
useDiscipleStore.getState().add(disc({ mercy: 90 }, { trustToMaster: 50 }));
resolveGraduationConflict('d1', 'dark-blade', 'divine-healer', 'respect');
check('존중 → graduatedJob=신의', useDiscipleStore.getState().disciples['d1']?.graduatedJob === 'divine-healer');
check('존중 → 신뢰 +8', useDiscipleStore.getState().disciples['d1']?.trustToMaster === 58);
check('존중 → 졸업 궤적 레코드 생성', useGraduateStore.getState().records.some((r) => r.id === 'd1'));

// C5 설득 — 사부 길(살수)로 확정 + 신뢰↓.
useDiscipleStore.getState().reset();
useGraduateStore.getState().reset();
useDiscipleStore.getState().add(disc({ mercy: 90 }, { trustToMaster: 50 }));
resolveGraduationConflict('d1', 'dark-blade', 'divine-healer', 'persuade');
check('설득 → graduatedJob=살수', useDiscipleStore.getState().disciples['d1']?.graduatedJob === 'dark-blade');
check('설득 → 신뢰 -10', useDiscipleStore.getState().disciples['d1']?.trustToMaster === 40);

// C6 갈등 없는 졸업(밋밋·자격 town-idler뿐) → resolveGraduationPick 즉시 확정.
useDiscipleStore.getState().reset();
useGraduateStore.getState().reset();
useInboxStore.getState().reset();
useDiscipleStore.getState().add(disc({}, { id: 'd2', name: '평범', realm: 'samryu' }));
resolveGraduationPick('d2', 'town-idler');
check('밋밋 졸업 → 갈등 이벤트 없음', !useInboxStore.getState().items.some((i) => (i.payload as { domain?: string })?.domain === 'graduation_conflict'));
check('밋밋 졸업 → 즉시 확정(graduatedJob)', useDiscipleStore.getState().disciples['d2']?.graduatedJob === 'town-idler');

console.log(`\n═══ 결과: ${pass} PASS · ${fail} FAIL ═══`);
process.exit(fail > 0 ? 1 : 0);
