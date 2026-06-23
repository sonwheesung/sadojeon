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

import { parsePick, selectOneLinerLlm } from './oneLinerSystem';
import { candidateOneLiners, type OneLinerCtx } from '@/data/scenarios/oneLiners';
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
