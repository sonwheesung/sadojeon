// 엔진 콘솔 공용 런타임 — 의뢰·직업·성장 등 스토어 환경이 필요한 패널이 공유. 한 번만 seedNewRun 으로
// 사문·제자를 깔고 자동저장 OFF(브라우저는 DB 안 씀). 각 패널이 제자 필드를 덮어 테스트한다.
import { seedNewRun } from '@/systems/newRun';
import { setAutoSaveEnabled } from '@/systems/runSync';
import { setFoodCost, setPatronageMult } from '@/systems/economySystem';
import { setGeumchangBudget } from '@/systems/questSystem';
import { useGameStore, useDiscipleStore } from '@/stores';

let inited = false;
export function ensureRun(): void {
  if (inited) return;
  setAutoSaveEnabled(false);
  seedNewRun(['jang-cheol', 'jin-sohwa', 'yun-soso', 'baek-yeon']);
  useGameStore.getState().setPhase('playing');
  setFoodCost(0); setPatronageMult(0); setGeumchangBudget(Infinity);
  inited = true;
}
export const ds = () => useDiscipleStore.getState();
