// 엔진/시스템 단위 — 캐릭터 필수 이벤트 아크. docs/47·48 · docs/40 §B.
// 검증: ① 계절 슬롯 배정(인원별) ② 빚진 연차 파생(계절 도래·이월·콘텐츠 갭) ③ 지급 게이트
// (training·resting 만, 의뢰·연단·폐관·부상 제외) ④ 멱등(중복 지급 X) ⑤ 해소 시 효과+기록(arcChoices).
// supabase·runSync 는 jest env 없어 import/저장이 throw → 스텁(inboxResolve→runSync 체인).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./runSync', () => ({ saveCurrentRunSilently: jest.fn() }));

import { assignArcSeasons, earliestOwedYear, triggerArcEvents } from './arcEventSystem';
import { ARC_EVENTS } from '@/data/scenarios/arcEvents';
import { isGraduationEligible } from './graduationSystem';
import { resolveInboxItem } from './inboxResolve';
import { shiftPersona } from './personaShift';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple, PersonalityTraits, Season } from '@/types';

const NEUTRAL: PersonalityTraits = {
  integrity: 50,
  freedom: 50,
  warmth: 50,
  prudence: 50,
  mercy: 50,
  ambition: 50,
};

function mk(over: Partial<Disciple> = {}): Disciple {
  return {
    id: 'han-baram',
    name: '한바람',
    hanjaName: '韓바람',
    entryYear: 1,
    age: 10,
    efficiency: {},
    insight: 3,
    fame: 0,
    martialArts: [],
    realm: 'samryu',
    realmProgress: { internal: 0, pity: 0, petitioned: false },
    trustToMaster: 30,
    stamina: 50,
    maxStamina: 50,
    stress: 0,
    stats: {},
    relationships: {},
    status: 'training',
    darknessLevel: 0,
    darknessRisk: 'low',
    personality: { ...NEUTRAL },
    notes: [],
    arcSeason: 'spring',
    ...over,
  };
}

function setTime(year: number, season: Season): void {
  useTimeStore.getState().setTime({ year, season, week: 1, day: 1, phase: 'morning' });
}

function seed(...list: Disciple[]): void {
  useDiscipleStore.setState({
    disciples: Object.fromEntries(list.map((d) => [d.id, d])),
    order: list.map((d) => d.id),
  });
}

beforeEach(() => {
  useInboxStore.getState().reset();
  setTime(1, 'spring');
});

describe('assignArcSeasons — 한 계절 1명, 최대 분산', () => {
  const seasonsOf = (n: number): (Season | undefined)[] => {
    const list = Array.from({ length: n }, (_, i) => mk({ id: `d${i}`, arcSeason: undefined }));
    assignArcSeasons(list);
    return list.map((d) => d.arcSeason);
  };
  it('1명 → 봄', () => expect(seasonsOf(1)).toEqual(['spring']));
  it('2명 → 봄·가을(마주봄)', () => expect(seasonsOf(2)).toEqual(['spring', 'autumn']));
  it('3명 → 봄·여름·가을', () => expect(seasonsOf(3)).toEqual(['spring', 'summer', 'autumn']));
  it('4명 → 4계절', () =>
    expect(seasonsOf(4)).toEqual(['spring', 'summer', 'autumn', 'winter']));
});

describe('earliestOwedYear — 빚진 가장 이른 연차', () => {
  it('봄 슬롯·1년차 봄·기록 없음 → 1', () => {
    expect(earliestOwedYear(mk({ arcSeason: 'spring' }), 1, 'spring')).toBe(1);
  });
  it('봄 슬롯·1년차 겨울(계절 지남) → 여전히 1', () => {
    expect(earliestOwedYear(mk({ arcSeason: 'spring' }), 1, 'winter')).toBe(1);
  });
  it('가을 슬롯·1년차 봄(계절 미도래) → null', () => {
    expect(earliestOwedYear(mk({ arcSeason: 'autumn' }), 1, 'spring')).toBeNull();
  });
  it('가을 슬롯·1년차 가을(도래) → 1', () => {
    expect(earliestOwedYear(mk({ arcSeason: 'autumn' }), 1, 'autumn')).toBe(1);
  });
  it('1년차 기록됨·2년차 봄 → 다음 연차 2 (이월/진행)', () => {
    const d = mk({
      arcSeason: 'spring',
      arcChoices: [{ year: 1, eventId: 'arc-han-baram-y1', title: '', choiceKey: 'x', choiceLabel: '', day: 0 }],
    });
    expect(earliestOwedYear(d, 2, 'spring')).toBe(2);
  });
  it('1~15 모두 기록·16년차 → null (콘텐츠 끝, 거짓 빚 X)', () => {
    const d = mk({
      arcSeason: 'spring',
      arcChoices: Array.from({ length: 15 }, (_, i) => ({
        year: i + 1,
        eventId: '',
        title: '',
        choiceKey: '',
        choiceLabel: '',
        day: 0,
      })),
    });
    expect(earliestOwedYear(d, 16, 'spring')).toBeNull();
  });
  it('콘텐츠 있는 중간 연차도 빚으로 — 1~3 기록·4년차 봄 → 4 (full 콘텐츠)', () => {
    const d = mk({
      arcSeason: 'spring',
      arcChoices: [1, 2, 3].map((y) => ({ year: y, eventId: '', title: '', choiceKey: '', choiceLabel: '', day: 0 })),
    });
    expect(earliestOwedYear(d, 4, 'spring')).toBe(4);
  });
  it('이월 — 1년차 못 받고 2년차 봄: 가장 이른 1 먼저', () => {
    expect(earliestOwedYear(mk({ arcSeason: 'spring' }), 2, 'spring')).toBe(1);
  });
  it('발화 계절 미배정 → null', () => {
    expect(earliestOwedYear(mk({ arcSeason: undefined }), 5, 'winter')).toBeNull();
  });
  it('콘텐츠 없는 제자 → null', () => {
    expect(earliestOwedYear(mk({ id: 'no-such', arcSeason: 'spring' }), 1, 'spring')).toBeNull();
  });
});

describe('triggerArcEvents — 지급 게이트·멱등', () => {
  const arcItems = () =>
    useInboxStore.getState().items.filter((it) => (it.payload as { domain?: string })?.domain === 'arc');

  it('활성(training)·빚진 연차 → 서신함에 1개 지급', () => {
    seed(mk({ status: 'training' }));
    triggerArcEvents();
    const items = arcItems();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('arc-han-baram-y1');
    expect(items[0].kind).toBe('event'); // 진행 게이트 차단(DECISION_KINDS)
  });

  it('의뢰 중(questing) → 미지급(이월)', () => {
    seed(mk({ status: 'questing' }));
    triggerArcEvents();
    expect(arcItems()).toHaveLength(0);
  });

  it('연단 중(crafting) → 미지급', () => {
    seed(mk({ status: 'crafting' }));
    triggerArcEvents();
    expect(arcItems()).toHaveLength(0);
  });

  it('폐관 중(meditating) → 미지급(§10 E2 폐관 보호)', () => {
    seed(mk({ status: 'meditating' }));
    triggerArcEvents();
    expect(arcItems()).toHaveLength(0);
  });

  it('부상(injured) → 미지급', () => {
    seed(mk({ status: 'injured' }));
    triggerArcEvents();
    expect(arcItems()).toHaveLength(0);
  });

  it('두 번 호출해도 1개만(멱등)', () => {
    seed(mk({ status: 'training' }));
    triggerArcEvents();
    triggerArcEvents();
    expect(arcItems()).toHaveLength(1);
  });

  it('이미 그 해 기록됨 → 재지급 X', () => {
    seed(
      mk({
        status: 'training',
        arcChoices: [{ year: 1, eventId: 'arc-han-baram-y1', title: '', choiceKey: 'x', choiceLabel: '', day: 0 }],
      }),
    );
    triggerArcEvents();
    expect(arcItems()).toHaveLength(0); // 2년차 봄 전이라 owe 없음
  });
});

// ⓓ 점수 누적 검증 — 실제 shiftPersona(나이·관성 반영)로 15년 아크 효과(±8~12)가
// 인격을 적정하게 가르는지(과결정/미결정 아님). 밸런스 헤드리스 sim 은 arc 미발화라 분석 검증으로 대체. docs/47 §9.
describe('점수 누적 (ⓓ) — 15년 personaShift 적정성', () => {
  // currentAge = d.age + (time.year - entryYear). setTime(1)·entryYear 1 → currentAge = d.age.
  it('한 이벤트(+10)는 즉시 결정하지 않는다(중립 50 → 50~75)', () => {
    setTime(1, 'spring');
    const p = shiftPersona(mk({ age: 10 }), { integrity: 10 });
    expect(p.integrity).toBeGreaterThan(50);
    expect(p.integrity).toBeLessThan(75);
  });

  it('15년 일관된 양육 → 인격을 뚜렷이 형성(>80) + 100 클램프·정수', () => {
    setTime(1, 'spring');
    let personality = mk({ age: 10 }).personality;
    for (let y = 1; y <= 15; y++) {
      const age = 10 + (y - 1);
      personality = shiftPersona(mk({ age, personality }), { integrity: 10 });
    }
    expect(personality.integrity).toBeGreaterThan(80);
    expect(personality.integrity).toBeLessThanOrEqual(100);
    expect(Number.isInteger(personality.integrity)).toBe(true);
  });

  it('굳은 인격(90)은 한 번의 반대 양육으로 잘 안 변한다(관성 — docs/28 §6)', () => {
    setTime(1, 'spring');
    // 출도기(나이 18)·이미 강직 90 → 반대(−10) 한 방엔 거의 안 꺾인다.
    const p = shiftPersona(mk({ age: 18, personality: { ...NEUTRAL, integrity: 90 } }), { integrity: -10 });
    expect(p.integrity).toBeGreaterThan(80);
    expect(p.integrity).toBeLessThan(90);
  });

  it('15년 누적은 항상 1~100 정수 범위 안(오버플로 없음)', () => {
    setTime(1, 'spring');
    let personality = mk({ age: 10 }).personality;
    for (let y = 1; y <= 15; y++) {
      personality = shiftPersona(mk({ age: 10 + (y - 1), personality }), { integrity: 12, mercy: -12 });
    }
    for (const v of Object.values(personality)) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('졸업 게이트 — 빚진 하산 이벤트 남으면 졸업 보류 (E8)', () => {
  const allRecorded = Array.from({ length: 15 }, (_, i) => ({
    year: i + 1,
    eventId: '',
    title: '',
    choiceKey: '',
    choiceLabel: '',
    day: 0,
  }));

  it('15년 경과·빚진 arc 있음 → 졸업 불가(보류)', () => {
    setTime(16, 'spring');
    const d = mk({ entryYear: 1, status: 'training', arcSeason: 'spring', arcChoices: [] });
    expect(isGraduationEligible(d, 16)).toBe(false);
  });

  it('15개 모두 해소됨 → 졸업 가능', () => {
    setTime(16, 'spring');
    const d = mk({ entryYear: 1, status: 'training', arcSeason: 'spring', arcChoices: allRecorded });
    expect(isGraduationEligible(d, 16)).toBe(true);
  });

  it('발화 계절 미배정(구 세이브) → 게이트 영향 없음(졸업 가능)', () => {
    setTime(16, 'spring');
    const d = mk({ entryYear: 1, status: 'training', arcSeason: undefined, arcChoices: [] });
    expect(isGraduationEligible(d, 16)).toBe(true);
  });

  it('아직 15년 안 됨 → 졸업 불가(연차 게이트)', () => {
    setTime(10, 'spring');
    const d = mk({ entryYear: 1, status: 'training', arcSeason: 'spring', arcChoices: allRecorded });
    expect(isGraduationEligible(d, 10)).toBe(false);
  });
});

describe('해소(arc) — 효과 적용 + arcChoices 기록 + 보관(resolved, docs/37 R45)', () => {
  it('선택 → 인격 변동 + 기록 + 서신함 보관(삭제 아님)', async () => {
    seed(mk({ status: 'training', personality: { ...NEUTRAL } }));
    triggerArcEvents();
    const item = useInboxStore.getState().items.find((it) => it.id === 'arc-han-baram-y1')!;
    expect(item).toBeTruthy();

    // y3 흐릿한 얼굴의 'grieve'(warmth+10,mercy+6,trust+5) 대신 y1 'free'(freedom+12,trust-6) 선택.
    await resolveInboxItem(item, 'free');

    const d = useDiscipleStore.getState().disciples['han-baram'];
    // freedom 상승(나이10·관성 반영이라 평면 +12 아님, 하지만 증가).
    expect(d.personality.freedom).toBeGreaterThan(50);
    expect(d.trustToMaster).toBeLessThan(30);
    // 기록 1건(연차1).
    expect(d.arcChoices).toHaveLength(1);
    expect(d.arcChoices![0]).toMatchObject({ year: 1, eventId: 'arc-han-baram-y1', choiceKey: 'free' });
    // 보관 모델: 삭제가 아니라 resolved 표시로 남는다('지난 서신').
    const stored = useInboxStore.getState().items.find((it) => it.id === 'arc-han-baram-y1');
    expect(stored?.resolved).toBe(true);
  });

  it('해소 후 같은 해 재지급 안 됨(기록 기반) — 새 미해소 arc 0', async () => {
    seed(mk({ status: 'training' }));
    triggerArcEvents();
    const item = useInboxStore.getState().items.find((it) => it.id === 'arc-han-baram-y1')!;
    await resolveInboxItem(item, 'bring');
    triggerArcEvents();
    // 보관건(resolved)은 남지만, 새 미해소 arc 는 재지급되지 않는다.
    const unresolvedArc = useInboxStore
      .getState()
      .items.filter((it) => (it.payload as { domain?: string })?.domain === 'arc' && !it.resolved);
    expect(unresolvedArc).toHaveLength(0);
  });
});

// 콘텐츠 불변식 — 플레이어 노출 텍스트(title·body·choice.label)에 경지/숙련단계/숨은변수 단어 금지 +
// 구조(15연차·하산·persona 6축·흑화 미사용 캐릭터 darkness 0) 보장.
// docs/47 §8·§12, docs/48, docs/37 Part D(콘텐츠 불변식 미기계화 사각 — '소성'·'심마' 제목 누출이 1회성 수동점검을 빠져나감).
describe('콘텐츠 불변식 — 금지어·구조 (테스트 사각 닫기)', () => {
  // 경지명(§12 경지 중립)·숙련 단계어·숨은변수는 플레이어 텍스트 금지.
  // 세력 서사명(흑사파·정파·마교·도가)·'깨달음'·'내공/외공'은 허용(무협 일상어 — '흑화'는 매칭하나 '흑사파'는 안 됨).
  const FORBIDDEN = /삼류|이류|일류|절정|초절정|화경|소성|대성|극성|심마|주화입마|흑화|상극|적성|노선|오성/;
  // docs/48 교차 메모: 흑화 대신 "말없는 이별"(진소화)·"평정 상실"(백연)로 어둠 분기 대체 → darkness 미사용.
  const NO_DARKNESS = new Set(['jin-sohwa', 'baek-yeon']);
  const VALID_PERSONA = new Set(['integrity', 'freedom', 'warmth', 'prudence', 'mercy', 'ambition']);

  it('플레이어 노출 텍스트에 금지어(경지·숙련단계·숨은변수) 0', () => {
    const hits: string[] = [];
    for (const e of ARC_EVENTS) {
      const texts: [string, string][] = [
        ['title', e.title],
        ['body', e.body],
        ...e.choices.map((c) => [`choice:${c.key}`, c.label] as [string, string]),
      ];
      for (const [where, t] of texts) {
        const m = FORBIDDEN.exec(t);
        if (m) hits.push(`${e.discipleId} y${e.year} ${where}: "${m[0]}"`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('캐릭터마다 15연차(1~15 유일)·15년차=하산', () => {
    const byChar = new Map<string, number[]>();
    for (const e of ARC_EVENTS) {
      if (!byChar.has(e.discipleId)) byChar.set(e.discipleId, []);
      byChar.get(e.discipleId)!.push(e.year);
    }
    expect(byChar.size).toBe(10);
    for (const [id, years] of byChar) {
      expect([...years].sort((a, b) => a - b)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
      const y15 = ARC_EVENTS.find((e) => e.discipleId === id && e.year === 15)!;
      expect(y15.title).toContain('하산');
    }
  });

  it('persona 효과는 6축만 · 흑화 미사용 캐릭터(진소화·백연)는 darkness 0', () => {
    for (const e of ARC_EVENTS) {
      for (const c of e.choices) {
        for (const k of Object.keys(c.effects.persona ?? {})) {
          expect(VALID_PERSONA.has(k)).toBe(true);
        }
        if (NO_DARKNESS.has(e.discipleId)) {
          expect(c.effects.darkness ?? 0).toBe(0);
        }
      }
    }
  });
});
