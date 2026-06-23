// react-native-executorch wrapper — Qwen3 1.7B(양자화) 호출.
//
// 실제 API:
//   import { LLMModule, QWEN3_1_7B_QUANTIZED, isAvailable } from 'react-native-executorch';
//   const llm = await LLMModule.fromModelName(QWEN3_1_7B_QUANTIZED, onProgress);
//   const out = await llm.generate([{role:'user', content: prompt}]);
// 모델 교체(Llama3.2 3B → Qwen3 1.7B): 한국어·JSON 준수 우수 + 폰 부담↓. 런타임 다운로드라 재빌드 불필요.
//
// 안전 정책:
//   - 라이브러리는 dynamic require — 미설치/Web 환경에서도 앱이 죽지 않음
//   - 모델 로드 실패 → loadStatus='error' → 호출자 RuleResolver 폴백
//   - 5초 타임아웃 — Promise.race
//   - 다운로드 진행률 → llmSettingsStore.downloadProgress
//   - 첫 호출 시 자동 다운로드 (~2GB). WiFi 권장.

import { useLlmSettingsStore } from '@/stores/llmSettingsStore';
import { LLM_MODEL_ID } from './version';

const TIMEOUT_MS = 30_000; // 첫 generate 는 모델 워밍업으로 더 걸릴 수 있어 넉넉히

// 시스템 프롬프트 — 매 generate 첫 메시지로 직접 주입.
// configure({chatConfig}) 는 0.8.x 에서 적용 안 됨(executorch WARN) → role:'system' 메시지로 전달.
const SYSTEM_PROMPT = [
  '/no_think', // Qwen3 추론(thinking) 비활성 — <think> 출력 없이 바로 JSON.
  '너는 무협 양육 시뮬레이션의 효과 산출기다.',
  '사부의 선택이 제자·사문에 미친 효과를 부호 있는 정수 변동값으로 평가한다.',
  '반드시 effects 래퍼를 포함한 JSON 한 줄만 출력한다 — 예: {"effects":{"trust":-3}}.',
  '코드펜스·설명·풍경 텍스트는 절대 출력하지 않는다.',
  '프롬프트의 예시 값을 그대로 베끼지 말고 상황에 맞게 직접 계산한다.',
].join(' ');

interface ExecutorchAPI {
  LLMModule?: {
    fromModelName: (
      namedSources: {
        modelName: string;
        modelSource: unknown;
        tokenizerSource: unknown;
        tokenizerConfigSource: unknown;
        capabilities?: readonly string[];
      },
      onDownloadProgress?: (p: number) => void,
    ) => Promise<LlmInstance>;
  };
  QWEN3_1_7B_QUANTIZED?: {
    modelName: string;
    modelSource: unknown;
    tokenizerSource: unknown;
    tokenizerConfigSource: unknown;
    generationConfig?: unknown;
  };
  isAvailable?: boolean;
}

interface LlmInstance {
  generate: (
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ) => Promise<string>;
  configure?: (config: unknown) => void;
  interrupt?: () => void;
  delete?: () => void;
}

let instance: LlmInstance | null = null;
let loadingPromise: Promise<boolean> | null = null;
// 실제 로드된 모델명 — 로그에 기록할 모델 ID. 로드 전엔 설정 라벨(LLM_MODEL_ID) 폴백.
let loadedModelName: string | null = null;

// ── 네이티브 모듈 로드는 반드시 "모듈 평가 시점"(require 가드 안)에서 한 번만 시도한다. ──
// 렌더 중 동적 require 를 하면 native 미링크/Expo Go 일 때 Metro 의 guardedLoadModule 이
// init 에러를 reportFatalError(전체 레드박스)로 띄운다 — 우리 try/catch 가 잡기 전에 발생.
// 모듈 top-level 의 require 는 이미 상위 require 가드 안이라, throw 가 그대로 catch 로 잡혀 조용히 폴백된다.
const api: ExecutorchAPI | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('react-native-executorch') as ExecutorchAPI;
    void m.isAvailable; // proxy getter 가 native 미링크 시 throw — 여기서 잡힘
    void m.LLMModule;
    void m.QWEN3_1_7B_QUANTIZED;
    return m;
  } catch {
    if (typeof console !== 'undefined') {
      console.warn(
        '[llm] react-native-executorch unavailable (Expo Go or native not linked) — RuleResolver only',
      );
    }
    return null;
  }
})();

function tryRequire(): ExecutorchAPI | null {
  return api;
}

// 현재(또는 예정) 모델 ID — LLM 로그에 함께 저장해 모델 교체 추적.
export function currentModelId(): string {
  return loadedModelName ?? LLM_MODEL_ID;
}

export function isLlmAvailable(): boolean {
  return Boolean(api?.isAvailable && api.LLMModule && api.QWEN3_1_7B_QUANTIZED);
}

export function isReady(): boolean {
  return instance != null && useLlmSettingsStore.getState().loadStatus === 'ready';
}

// react-native-executorch 0.8.x: 모델 로드 전 ResourceFetcher 어댑터 init 필수.
// Expo 환경 → react-native-executorch-expo-resource-fetcher 어댑터 사용.
let initialized = false;

function ensureInitialized(): void {
  if (initialized) return;
  initialized = true;
  try {
    const exec = api as unknown as {
      initExecutorch?: (opts: { resourceFetcher: unknown }) => void;
    } | null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fetcherMod = require('react-native-executorch-expo-resource-fetcher') as {
      ExpoResourceFetcher?: unknown;
    };
    if (exec && typeof exec.initExecutorch === 'function' && fetcherMod.ExpoResourceFetcher) {
      exec.initExecutorch({ resourceFetcher: fetcherMod.ExpoResourceFetcher });
    }
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn('[llm] initExecutorch 실패', e);
    }
  }
}

// 모델 로드 (다운로드 + 초기화). 첫 호출 시 한 번만.
export async function ensureLoaded(): Promise<boolean> {
  if (instance) return true;
  if (loadingPromise) return loadingPromise;

  const settings = useLlmSettingsStore.getState();
  if (!settings.enabled) return false;

  const m = tryRequire();
  if (!m?.LLMModule || !m.QWEN3_1_7B_QUANTIZED) {
    settings.setLoadStatus('error', 'react-native-executorch 미설치 또는 네이티브 미빌드');
    return false;
  }

  // ResourceFetcher 어댑터 init — 모델 다운로드 전 필수.
  ensureInitialized();

  settings.setLoadStatus('downloading');
  settings.setDownloadProgress(0);

  loadingPromise = (async () => {
    try {
      const llm = await m.LLMModule!.fromModelName(
        m.QWEN3_1_7B_QUANTIZED!,
        (progress: number) => {
          useLlmSettingsStore.getState().setDownloadProgress(progress);
        },
      );
      instance = llm;
      loadedModelName = (m.QWEN3_1_7B_QUANTIZED?.modelName as string) ?? LLM_MODEL_ID;
      useLlmSettingsStore.getState().setLoadStatus('ready');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (typeof console !== 'undefined') {
        console.warn('[llm] loadLLM failed — fallback to RuleResolver', msg);
      }
      useLlmSettingsStore.getState().setLoadStatus('error', msg);
      instance = null;
      return false;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('llm timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// 단일 프롬프트 → 텍스트. JSON 강제는 prompt + parser 에서 처리.
export async function generate(prompt: string): Promise<string> {
  if (!instance) {
    const ok = await ensureLoaded();
    if (!ok || !instance) throw new Error('llm not ready');
  }
  useLlmSettingsStore.getState().incrementCallCount();
  return withTimeout(
    instance.generate([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]),
    TIMEOUT_MS,
  );
}

// 호출 가능 여부 (설정 토글 + cap + 모델 ready).
export async function canGenerate(): Promise<boolean> {
  const s = useLlmSettingsStore.getState();
  if (!s.enabled) return false;
  if (s.perRunCallCount >= s.perRunCap) return false;
  return s.loadStatus === 'ready' && instance != null;
}

// 동기 준비 체크 — 비동기 흐름을 못 타는 곳(한 마디 트리거)에서 LLM 경로/룰 폴백을 가르는 데 쓴다.
// canGenerate 와 같은 조건의 동기판. 모델 미로드(시뮬·테스트·다운로드 전)면 false → 룰 폴백.
export function isReadySync(): boolean {
  const s = useLlmSettingsStore.getState();
  return s.enabled && s.perRunCallCount < s.perRunCap && s.loadStatus === 'ready' && instance != null;
}

// 사용자가 토글 OFF 시 메모리 해제.
export function unload(): void {
  if (instance) {
    instance.interrupt?.();
    instance.delete?.();
    instance = null;
  }
  useLlmSettingsStore.getState().setLoadStatus('idle');
  useLlmSettingsStore.getState().setDownloadProgress(0);
}
