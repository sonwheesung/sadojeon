// 엔진/시스템 단위 — 한 마디 LLM 선택 경로(docs/40 §B11, docs/37 Part D 추가후보 7 닫음).
// parsePick: 정상 JSON·관대 정규식 폴백·실패 null. selectOneLinerLlm: 모델 off·정상 pick·후보밖·throw·garbage
// 전부 후보 안에서만 결정되고 실패 시 룰 폴백(크래시 X). 모델은 모킹 — 실 게임은 모델 off라 어떤 sim 도 안 타던 갭.
// supabase 클라이언트는 jest 에 env 가 없어 import 만으로 createClient 가 throw → 스텁(체인: pendingStore→repositories→supabase).
jest.mock('@/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: false }));
jest.mock('./llm/executorchClient', () => ({
  canGenerate: jest.fn(),
  generate: jest.fn(),
  isReadySync: jest.fn(() => false),
  currentModelId: () => 'test-model', // pendingStore.pushLlmDebug 가 참조
}));

import { parsePick, selectOneLinerLlm, queueOneLiner } from './oneLinerSystem';
import {
  candidateOneLiners,
  isDistinctiveOneLiner,
  ONE_LINERS,
  type OneLinerCtx,
} from '@/data/scenarios/oneLiners';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import * as exec from './llm/executorchClient';
import type { Disciple } from '@/types';

const canGenerate = exec.canGenerate as jest.Mock;
const generate = exec.generate as jest.Mock;

function ctx(over: Partial<OneLinerCtx> = {}): OneLinerCtx {
  return {
    discipleId: 'jang-cheol',
    stress: 30,
    staminaPct: 80,
    trust: 60,
    darknessRisk: 'low',
    hasEnemy: false,
    mourning: false,
    age: 16,
    mainSeong: 4,
    rivalName: null,
    isWeakest: false,
    saidIds: [],
    recentIds: [],
    ...over,
  };
}
const D = { name: '장철' } as unknown as Disciple;
const inPool = (c: OneLinerCtx, id?: string) => candidateOneLiners(c).some((t) => t.id === id);

describe('parsePick — LLM 응답 id 추출', () => {
  it('정상 JSON → pick 값', () => expect(parsePick('{"pick":"abc"}')).toBe('abc'));
  it('앞뒤 텍스트 섞여도 정규식 폴백', () => expect(parsePick('골랐어 {"pick":"xyz-1"} 끝')).toBe('xyz-1'));
  it('pick 키 없음 → null', () => expect(parsePick('{"other":1}')).toBeNull());
  it('JSON 아님(garbage) → null', () => expect(parsePick('그냥 설명 문장')).toBeNull());
  it('빈 문자열 → null', () => expect(parsePick('')).toBeNull());
});

describe('selectOneLinerLlm — 선택과 폴백', () => {
  beforeEach(() => {
    canGenerate.mockReset();
    generate.mockReset();
  });

  it('후보가 ≥2 인 상황(테스트 전제)', () => {
    expect(candidateOneLiners(ctx()).length).toBeGreaterThan(1);
  });

  it('모델 off(canGenerate=false) → generate 미호출, 룰 후보 중에서 선택', async () => {
    canGenerate.mockResolvedValue(false);
    const c = ctx();
    const r = await selectOneLinerLlm(D, c);
    expect(r).not.toBeNull();
    expect(inPool(c, r!.id)).toBe(true);
    expect(generate).not.toHaveBeenCalled();
  });

  it('LLM 이 유효한 pick → 정확히 그 후보 반환', async () => {
    const c = ctx();
    const cands = candidateOneLiners(c);
    const target = cands[Math.min(2, cands.length - 1)];
    canGenerate.mockResolvedValue(true);
    generate.mockResolvedValue(`{"pick":"${target.id}"}`);
    const r = await selectOneLinerLlm(D, c);
    expect(r!.id).toBe(target.id);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('후보 밖 id 반환 → 룰 폴백(후보 안)', async () => {
    canGenerate.mockResolvedValue(true);
    generate.mockResolvedValue('{"pick":"does-not-exist-zzz"}');
    const c = ctx();
    const r = await selectOneLinerLlm(D, c);
    expect(r).not.toBeNull();
    expect(inPool(c, r!.id)).toBe(true);
  });

  it('generate 예외 → 룰 폴백(크래시 X)', async () => {
    canGenerate.mockResolvedValue(true);
    generate.mockRejectedValue(new Error('llm timeout'));
    const c = ctx();
    const r = await selectOneLinerLlm(D, c);
    expect(r).not.toBeNull();
    expect(inPool(c, r!.id)).toBe(true);
  });

  it('garbage 출력 → parsePick null → 룰 폴백', async () => {
    canGenerate.mockResolvedValue(true);
    generate.mockResolvedValue('전혀 JSON 이 아닌 출력');
    const c = ctx();
    const r = await selectOneLinerLlm(D, c);
    expect(r).not.toBeNull();
    expect(inPool(c, r!.id)).toBe(true);
  });
});

// 비동기 적재 원자성(docs/37 B11·Part D 사각⑦ 추가) — LLM 경로는 시간차 적재라 두 트리거가 같은 낡은
// 스냅샷을 볼 수 있다. queueOneLiner 가 적재 순간 실시간 상태로 중복·id 를 막는지 검증(정산 직렬화에 안 기댐).
describe('queueOneLiner — 비동기 적재 원자성(겹침 방어)', () => {
  const DISC_ID = 'jang-cheol';
  const distinctive = ONE_LINERS.find((t) => isDistinctiveOneLiner(t))!;
  const distinctive2 = ONE_LINERS.find(
    (t) => isDistinctiveOneLiner(t) && t.id !== distinctive.id,
  )!;
  const disc = { id: DISC_ID, name: '장철' } as unknown as Disciple;
  const idOnDay = (day: number) => `oneliner-${DISC_ID}-${day}`;

  beforeEach(() => {
    useDiscipleStore.getState().reset();
    useInboxStore.getState().reset();
    useDiscipleStore.getState().setAll([disc]);
  });

  it('전제 — 서로 다른 특이 대사 2종 존재', () => {
    expect(distinctive).toBeTruthy();
    expect(distinctive2).toBeTruthy();
  });

  it('같은 특이 대사 2회 적재(겹침) → 서신 1건·기록 1회(중복 차단)', () => {
    const c = ctx({ discipleId: DISC_ID, saidIds: [] }); // 낡은 스냅샷(둘 다 saidIds=[])
    queueOneLiner(disc, distinctive, c, 10);
    queueOneLiner(disc, distinctive, c, 10); // 같은 스냅샷 재적재 — pre-fix 면 서신 2건
    const items = useInboxStore.getState().items.filter((it) => it.id === idOnDay(10));
    expect(items).toHaveLength(1); // ← 핵심: 동일 id 중복 적재 차단
    const said = useDiscipleStore.getState().get(DISC_ID)!.saidOneLiners ?? [];
    expect(said.filter((x) => x === distinctive.id)).toHaveLength(1); // 특이 대사 1회만 기록
  });

  it('서로 다른 정상 한 마디(다른 날) → 둘 다 적재(과잉 차단 아님)', () => {
    queueOneLiner(disc, distinctive, ctx({ discipleId: DISC_ID }), 10);
    queueOneLiner(disc, distinctive2, ctx({ discipleId: DISC_ID }), 11);
    expect(useInboxStore.getState().items.filter((it) => it.id === idOnDay(10))).toHaveLength(1);
    expect(useInboxStore.getState().items.filter((it) => it.id === idOnDay(11))).toHaveLength(1);
    const said = useDiscipleStore.getState().get(DISC_ID)!.saidOneLiners ?? [];
    expect(said).toEqual(expect.arrayContaining([distinctive.id, distinctive2.id]));
  });

  it('적재 직전 제자가 떠남(remove) → 발화 취소(서신 미적재)', () => {
    useDiscipleStore.getState().remove(DISC_ID);
    queueOneLiner(disc, distinctive, ctx({ discipleId: DISC_ID }), 12);
    expect(useInboxStore.getState().items.filter((it) => it.id === idOnDay(12))).toHaveLength(0);
  });
});
