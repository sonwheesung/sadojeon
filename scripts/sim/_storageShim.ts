// 노드(tsx) 환경 스토리지 shim — 실제 Zustand persist 스토어를 sim 에서 돌릴 때 쓴다.
// @react-native-async-storage 웹 폴백이 window.localStorage 를 찾는데 노드엔 없어 터진다.
// 스토어 모듈보다 **먼저** import 되어야 AsyncStorage 가 이 메모리 구현을 집어 든다(ESM 평가 순서).
const mem = new Map<string, string>();
const ls = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => {
    mem.set(k, String(v));
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: (i: number) => Array.from(mem.keys())[i] ?? null,
  get length() {
    return mem.size;
  },
};
const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
if (!g.window) g.window = { localStorage: ls };
if (!g.localStorage) g.localStorage = ls;
