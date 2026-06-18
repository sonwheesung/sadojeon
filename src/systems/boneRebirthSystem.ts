// 환골탈태(換骨奪胎) — 신품 영약으로 임독양맥을 타통해 몸이 다시 태어난다. docs/23 §5 · docs/13(심마).
// 정통무협 결: ① 수련(받침)이 받쳐야 약이 듣고 ② 타통은 목숨 건 일(심마가 끼면 주화입마) ③ 성공하면
// 벌모세수 — 탁기를 모두 씻어내고 근골이 재구성된다.
//
// 리스크: 심마 ≤ SAFE_SIMMA 안전. 초과분만큼 실패 확률 — 실패 = 주화입마 발작(simmaSystem).
//         단 영약은 몸이 받아내지 못해 토해냄(보존) → 심마를 다스린 뒤(안신단) 재도전 가능.
// 메리트: 외공 +8(근골) · 체력 그릇 +4(금강불괴 결) · 심마 0(탁기 일소) · 상처 완치 · 스트레스 0
//         · **젊은 육체 회귀**(boneReborn — 이후 외공·체력 훈련 나이 보정이 청년기 ×2.4 밑으로 안 떨어짐).

import { random } from '@/systems/rng';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { BONE_REBIRTH_STRENGTH_BONUS } from '@/data/realm';
import { triggerQiDeviation } from './simmaSystem';

// 이 심마까지는 무조건 안전 — 초과분 1당 실패 확률 +1%p. (심마 60이면 30%, 90이면 60%)
export const BONE_REBIRTH_SAFE_SIMMA = 30;
// 체력(endurance) 그릇 확장 — 몸이 단단해진다(금강불괴 결). 🔧 그레이박스.
export const BONE_REBIRTH_ENDURANCE_BONUS = 4;

// 환골탈태 시도 — 성공 시 효과 적용 + true(호출측이 영약 소모·경지 상승 진행).
// 실패 시 주화입마 발작 처리 + false(영약 보존 — 호출측은 소모하지 말 것).
export function attemptBoneRebirth(discipleId: string): boolean {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return false;

  // 임독양맥 타통 굴림 — 심마(마장)가 끼어 있으면 약기운이 역류한다.
  const simma = d.simma ?? 0;
  const failChance = Math.max(0, (simma - BONE_REBIRTH_SAFE_SIMMA) / 100);
  if (failChance > 0 && random() < failChance) {
    triggerQiDeviation(discipleId); // 주화입마 — 내상·내공 흩어짐. 영약은 토해내 보존.
    return false;
  }

  // 벌모세수 — 몸이 다시 태어난다.
  const strength = d.stats?.strength ?? { level: 0, exp: 0 };
  const endurance = d.stats?.endurance ?? { level: 0, exp: 0 };
  ds.update(discipleId, {
    stats: {
      ...d.stats,
      strength: { ...strength, level: Math.min(100, strength.level + BONE_REBIRTH_STRENGTH_BONUS) },
      endurance: { ...endurance, level: Math.min(100, endurance.level + BONE_REBIRTH_ENDURANCE_BONUS) },
    },
    simma: 0, // 탁기·마장 일소
    stress: 0, // 심신이 갓난아기처럼 맑아짐
    boneReborn: true, // 젊은 육체 회귀 — 근골이 다시 자란다(나이 보정 하한 ×2.4)
    // 상처·내상 완치 — 묵은 상처까지 씻겨 나간다(모든 속성 상처 일소).
    wounds: undefined,
    ...(d.status === 'injured' ? { status: 'training' as const } : {}),
  });

  const day = useTimeStore.getState().totalDay;
  useInboxStore.getState().add({
    id: `bone-rebirth-${d.id}-${day}`,
    kind: 'report',
    title: `${d.name} — 환골탈태(換骨奪胎)`,
    preview: `${d.name}의 몸에서 검은 진액이 배어 나오더니, 폐관실에 맑은 기운이 가득 찼다.`,
    body: `구전대환단의 약력이 ${d.name}의 임독양맥을 꿰뚫었다. 막혔던 기맥이 차례로 열리고, 묵은 탁기가 검은 진액이 되어 모공으로 배어 나왔다. 사흘 밤낮이 지나 폐관실 문이 열렸을 때 — 묵은 상처는 흔적도 없고, 근골은 다시 빚어졌으며, 눈빛은 갓난아기처럼 맑았다. 몸이 다시 태어난 것이다. 굳어가던 근골이 소년의 것처럼 다시 자라기 시작한다.`,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
  return true;
}
