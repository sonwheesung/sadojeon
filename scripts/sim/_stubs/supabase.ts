// supabase 스텁(헤드리스 sim) — 순수 로직 회귀는 DB 를 건드리지 않는다. 호출 시 빈 결과.
const chain: any = new Proxy(() => chain, {
  get: () => chain,
  apply: () => Promise.resolve({ data: null, error: null }),
});
export const supabase: any = new Proxy({}, { get: () => chain });
export default supabase;
