// buggify — 시드 결정론 결함주입 게이트 (FoundationDB BUGGIFY 패턴). docs/43.
// armBuggify() 로 무장한 뒤에만, 시드된 random() 으로 *드물게* true 를 반환해 주입점에서 "유효하지만
// 극단적인" 스트레서(자금 결핍·타이밍 비틀기 등)를 일으킨다 → 평범한 플레이로는 잘 안 닿는 엣지케이스를
// 결정적·재현 가능하게 강제. 평소(미무장)엔 전부 no-op 라 프로덕션 코드엔 영향 없음(테스트 전용).
// 주입점 추가: 코드/하네스에 `if (buggify()) injectStressor()` 한 줄. 스트레서는 *엔진이 견뎌야 할*
// 유효 극단이어야 한다(임의 손상 X) — 견디지 못해 불변식이 깨지면 그게 버그다.
import { random, randomRange } from '../../src/systems/rng';

let armed = false;
let defaultProb = 0.03;

export function armBuggify(prob = 0.03): void { armed = true; defaultProb = prob; }
export function disarmBuggify(): void { armed = false; }
export function isBuggified(): boolean { return armed; }

// 무장됐을 때만 시드된 확률로 true. 미무장이면 항상 false(no-op).
export function buggify(prob = defaultProb): boolean { return armed && random() < prob; }

// 주입할 스트레서 값(시드 결정론). [lo, hi).
export function buggifyRange(lo: number, hi: number): number { return randomRange(lo, hi); }
