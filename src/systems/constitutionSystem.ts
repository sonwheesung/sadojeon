// 체질(불침) 부여 — 무공 없이 특정 제자에게 면역 체질을 부여(상점 특성 상품). docs/50 §5.
// woundResistOf 가 grantedConstitution 을 무공 파생분과 max merge 하므로, 부여 즉시 전투·상처 게이트에 반영된다.
import { useDiscipleStore } from '@/stores/discipleStore';
import type { WoundType } from '@/types/disciple';

// 부여 결과 — already=이미 그 단계 이상 보유(중복 차단), none=제자 없음.
export type GrantConstitutionResult = 'ok' | 'already' | 'none';

export function hasConstitution(discipleId: string, woundType: WoundType, level = 2): boolean {
  const d = useDiscipleStore.getState().disciples[discipleId];
  return (d?.grantedConstitution?.[woundType] ?? 0) >= level;
}

export function grantConstitution(discipleId: string, woundType: WoundType, level = 2): GrantConstitutionResult {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return 'none';
  const cur = d.grantedConstitution ?? {};
  if ((cur[woundType] ?? 0) >= level) return 'already'; // 이미 그 단계 보유 — 재부여 무의미
  ds.update(discipleId, { grantedConstitution: { ...cur, [woundType]: level } });
  return 'ok';
}
