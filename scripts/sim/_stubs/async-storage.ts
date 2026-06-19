// 헤드리스용 in-memory AsyncStorage 스텁.
const store = new Map<string, string>();
export default {
  getItem: async (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: async (k: string, v: string) => { store.set(k, v); },
  removeItem: async (k: string) => { store.delete(k); },
  getAllKeys: async () => [...store.keys()],
  multiRemove: async (ks: string[]) => { ks.forEach((k) => store.delete(k)); },
  multiGet: async (ks: string[]) => ks.map((k) => [k, store.get(k) ?? null]),
  clear: async () => { store.clear(); },
};
