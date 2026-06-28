// 스포트라이트 대상 레지스트리 — 실제 UI 요소가 자기 위치를 측정해 줄 수 있게 등록한다. docs/44.
// 스토어가 아니라 모듈 Map — 측정 함수는 렌더에 영향 없고, 스포트라이트가 활성일 때만 호출된다.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type MeasureFn = () => Promise<Rect | null>;

const registry = new Map<string, MeasureFn>();

export function registerSpotlightTarget(id: string, fn: MeasureFn): void {
  registry.set(id, fn);
}

export function unregisterSpotlightTarget(id: string, fn: MeasureFn): void {
  if (registry.get(id) === fn) registry.delete(id); // 최신 등록만 제거(언마운트 경합 방지)
}

// 대상의 현재 화면 좌표 측정 — 미등록/측정 실패면 null(오버레이가 중앙 폴백).
export async function measureSpotlightTarget(id: string): Promise<Rect | null> {
  const fn = registry.get(id);
  if (!fn) return null;
  try {
    return await fn();
  } catch {
    return null;
  }
}
