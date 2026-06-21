// 대오(大悟) 굴림 계측 — **sim 전용**(기본 off, 프로덕션 무영향). docs/23 화경 밸런스.
// 화경 대오는 "벽 도달 + 영약 보유" 상태에서만 굴린다(trainingSystem 폐관·실전 두 지점). 계산기
// (scripts/sim/hwagyeong_calc)가 필요로 하는 입력 = "그 상태에서 실제 굴린 횟수"(Nq·Ns)인데, 이는
// 15년 총 극험이 아니라 후반 좁은 창이라 추정이 빗나간다. sim 에서 켜고 실측해 계산기를 정밀화한다.
// 굴림 1회 = recordDaeoh 1회(성공/실패 무관 attempt) — trainingSystem 이 호출. off 면 즉시 return(무비용).

let on = false;

export interface DaeohCounts {
  secludeRolls: number; // 폐관 대오 굴림 수(벽+영약+벽곡단 상태의 폐관일)
  secludeWins: number; //  그중 대오가 온 수
  questRolls: number; //   실전(위험·극험) 대오 굴림 수(벽+영약 상태의 결투·큰의뢰 생환)
  questWins: number; //    그중 대오가 온 수
  // 화경 벽 도달 진단(페이싱) — 처음 벽에 선 날 + 그때 세 기둥 값(어느 기둥이 마지막 관문인지).
  firstWallDay: number; //   처음 화경 벽 충족한 totalDay(Infinity=미도달)
  wallInternal: number; //   그 순간 내공
  wallExternal: number; //   그 순간 외공
  wallSeong: number; //      그 순간 주력 성
}

export const daeoh: DaeohCounts = {
  secludeRolls: 0, secludeWins: 0, questRolls: 0, questWins: 0,
  firstWallDay: Infinity, wallInternal: 0, wallExternal: 0, wallSeong: 0,
};

export function enableDaeohTelemetry(v: boolean): void {
  on = v;
}

export function resetDaeoh(): void {
  daeoh.secludeRolls = 0;
  daeoh.secludeWins = 0;
  daeoh.questRolls = 0;
  daeoh.questWins = 0;
  daeoh.firstWallDay = Infinity;
  daeoh.wallInternal = 0;
  daeoh.wallExternal = 0;
  daeoh.wallSeong = 0;
}

// 화경 벽 첫 도달 기록(가장 이른 날만). internal/external/seong = 그 순간 세 기둥.
export function recordWall(day: number, internal: number, external: number, seong: number): void {
  if (!on || day >= daeoh.firstWallDay) return;
  daeoh.firstWallDay = day;
  daeoh.wallInternal = internal;
  daeoh.wallExternal = external;
  daeoh.wallSeong = seong;
}

export function recordDaeoh(mode: 'seclude' | 'quest', win: boolean): void {
  if (!on) return;
  if (mode === 'seclude') {
    daeoh.secludeRolls += 1;
    if (win) daeoh.secludeWins += 1;
  } else {
    daeoh.questRolls += 1;
    if (win) daeoh.questWins += 1;
  }
}
