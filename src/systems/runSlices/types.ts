// 회차별 자식 도메인 슬라이스 — 각 도메인이 자기 저장/복원/리셋을 소유 (단일 책임).
// runSync(오케스트레이터)는 등록된 슬라이스를 순회만 한다. 도메인 추가 = 슬라이스 1개 + 등록 한 줄.

export interface RunChildSlice {
  readonly key: string;
  save(runId: string): Promise<void>; // 스토어 → DB
  load(runId: string): Promise<void>; // DB → 스토어 (없으면 슬라이스가 기본 처리)
  reset(): void; // 새 회차 초기 상태
}
