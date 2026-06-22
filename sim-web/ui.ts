// 엔진 콘솔 공용 UI 부품 — 모든 엔진 패널이 같은 입력 컨트롤을 재사용(공통화). docs/36.
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const c of children) e.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}
export function $(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (!e) throw new Error(`#${id} 없음`);
  return e;
}
export function opt(value: string, label: string, selected: boolean): HTMLOptionElement {
  return el('option', { value, textContent: label, selected });
}
// 라벨 + 컨트롤 세로 묶음(콘솔 표준 입력 필드).
export function field(label: string, control: Node): HTMLElement {
  return el('div', { className: 'field' }, [el('span', { className: 'flabel', textContent: label }), control]);
}
// 드롭다운 한 줄 생성 — value 목록·라벨 맵·현재값·변경 콜백.
export function select<T extends string>(values: readonly T[], labelOf: (v: T) => string, cur: T, onChange: (v: T) => void): HTMLSelectElement {
  const s = el('select', { className: 'sel' }, values.map((v) => opt(v, labelOf(v), v === cur)));
  s.onchange = () => onChange(s.value as T);
  return s;
}
// 숫자 입력.
export function num(value: number, onChange: (n: number) => void, opts: { min?: number; max?: number; cls?: string } = {}): HTMLInputElement {
  const i = el('input', { className: opts.cls ?? 'count', type: 'number', value: String(value) });
  if (opts.min != null) i.min = String(opts.min);
  if (opts.max != null) i.max = String(opts.max);
  i.oninput = () => {
    let n = Number(i.value) | 0;
    if (opts.min != null) n = Math.max(opts.min, n);
    if (opts.max != null) n = Math.min(opts.max, n);
    onChange(n);
  };
  return i;
}
