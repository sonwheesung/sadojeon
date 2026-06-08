// 성장형 플레이 정책 — 헤드리스 시뮬에서 "합리적으로 잘 키우면 어디까지 가나"를 검증.
// 랜덤(RandomPolicy)이 삼류 정체를 보여준다면, 이건 실제 게임 엔진으로 경지 진척이
// 설계대로(절정/초절정/화경) 도달 가능한지 교차검증한다(공식 복제 sim.cjs 와 대조).
//
// 레버(매일 advanceTurn 직전 세팅):
//  - 주간 패턴: 무공3·체력2·휴식2 (체력 순증 → 과훈련 injured 회피).
//  - 무공축: 다음 경지 내공요건 미달이면 심법(내공), 충족이면 초식(무공서 성). 경지 게이트 우선.
//  - 체력 종목: 기마자세(근력=외공 게이트, 어릴 때 보정 큼).
//  - 파견 안 함: 양육기 훈련 시간 최대화.
//  - 이벤트 응답: 랜덤(훈련이 성장 주레버라 이벤트는 부차적).

import { REALM_INTERNAL_REQ, nextRealm } from '@/data/realm';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import type { TrainingCategory } from '@/types';
import { RandomPolicy, type PlayPolicy } from './autoPlay';

const GROWTH_PATTERN: TrainingCategory[] = [
  'martial',
  'physical',
  'martial',
  'rest',
  'martial',
  'physical',
  'rest',
];

export const GrowthPolicy: PlayPolicy = {
  label: 'growth',
  configureBeforeDay() {
    const sched = useScheduleStore.getState();
    sched.setSchedule({ weeklyPattern: [...GROWTH_PATTERN], monthlyQuests: 0 });

    const ds = useDiscipleStore.getState();
    for (const id of ds.order) {
      const d = ds.disciples[id];
      if (!d || d.status !== 'training') continue;

      // 무공축 — 다음 경지 내공요건 미달이면 심법(내공 적립), 충족이면 초식(성 적립).
      const next = nextRealm(d.realm);
      const internal = d.realmProgress?.internal ?? 0;
      const needInternal = next != null && internal < (REALM_INTERNAL_REQ[next] ?? Infinity);
      sched.setDailyChoice(id, 'martial', needInternal ? 'simbeop' : 'chosik');

      // 체력 — 기마자세(근력=외공 게이트).
      sched.setDailyChoice(id, 'physical', 'phys_horse');
    }
  },
  pickInboxKey: RandomPolicy.pickInboxKey,
  dispatch: () => {}, // 파견 안 함 — 훈련 시간 최대화.
};
