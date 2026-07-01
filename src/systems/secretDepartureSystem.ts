// 몰래 하산(환멸 이탈) 시스템 — docs/51. 관계 실패로 제자가 조용히 사문을 떠난다.
// 매월(월 시작) tick. 저신뢰 + 고스트레스 + 선하고 자유로운 기질이 연속으로 충족된 달을 센다
// (disillusionMonths). 조건이 깨지면(면담·휴식으로 신뢰↑·스트레스↓) 0으로 리셋 = 개입 창.
// 임계(DEPART_MONTHS) 도달 시 **결정론** 발화: status='runaway'(사망 아님 — 애도 X). 경고 서신으로 예고.
// 원칙: 트리거는 돈이 아니라 마음의 붕괴. 파산의 신뢰 하락(economySystem)은 한 입력일 뿐 직접 트리거 아님.
// 상태 'runaway'는 departed(사망)와 분리 — 회차 종결엔 terminal, 애도·통계엔 death 취급 금지. docs/51.

import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { josa } from '@/utils/korean';
import type { Disciple, DiscipleStatus, ReportItem } from '@/types';

// 게이트 상수 — docs/51 §3. 전부 숨은 변수(UI 비노출).
export const SECRET_DEPARTURE = {
  TRUST_MAX: 15, // 사부신뢰 이 값 이하
  STRESS_MIN: 70, // 스트레스 이 값 이상
  MERCY_MIN: 55, // 자비(천성 선함)
  INTEGRITY_MIN: 55, // 강직
  FREEDOM_MIN: 60, // 자유(견디기보다 떠나는 아이 — 참고 견디는 아이는 저등급 졸업으로 남는다)
  WARN_MONTHS: 3, // 이 개월에 경고 서신 1회(아직 개입 여지)
  DEPART_MONTHS: 5, // 이 개월 도달 시 몰래 하산 발화
} as const;

// 사문에 실제 머무는 제자만 판정 — 의뢰·연단·폐관 중이거나 이미 떠난 제자는 스킵(돌아온 뒤 판정).
const PRESENT_STATUSES: ReadonlyArray<DiscipleStatus> = ['training', 'resting', 'injured'];

// 이달 환멸 조건 충족 여부 — 선하고 자유로운 아이가 저신뢰·고스트레스로 방치됐나. 순수 함수(테스트용).
export function isDisillusioned(d: Disciple): boolean {
  return (
    d.trustToMaster <= SECRET_DEPARTURE.TRUST_MAX &&
    (d.stress ?? 0) >= SECRET_DEPARTURE.STRESS_MIN &&
    d.personality.mercy >= SECRET_DEPARTURE.MERCY_MIN &&
    d.personality.integrity >= SECRET_DEPARTURE.INTEGRITY_MIN &&
    d.personality.freedom >= SECRET_DEPARTURE.FREEDOM_MIN
  );
}

function reportItem(id: string, day: number, title: string, body: string): ReportItem {
  return {
    id, kind: 'report', priority: 'high', createdAtDay: day, read: false, resolved: false,
    title, preview: body.slice(0, 40), body,
  };
}

// 매월(월 시작) 호출 — timeSystem. 환멸 카운터 갱신 + 임계 시 몰래 하산 발화. 결정론(RNG 없음).
export function tickSecretDeparture(): void {
  const ds = useDiscipleStore.getState();
  const inbox = useInboxStore.getState();
  const day = useTimeStore.getState().totalDay;

  for (const id of ds.order) {
    const d = ds.disciples[id];
    if (!d) continue;
    if (!PRESENT_STATUSES.includes(d.status)) continue; // 떠남·졸업·의뢰·연단·폐관 중 스킵

    const prev = d.disillusionMonths ?? 0;
    const months = isDisillusioned(d) ? prev + 1 : 0;
    if (months !== prev) ds.update(id, { disillusionMonths: months });

    if (months >= SECRET_DEPARTURE.DEPART_MONTHS) {
      // 몰래 하산 — 조용히 떠남. 사망 아님(애도 X). 빈 슬롯은 남긴다(docs/03 미충원).
      ds.update(id, { status: 'runaway', partingForm: 'secret', disillusionMonths: 0 });
      inbox.add(
        reportItem(
          `runaway-${id}-${day}`,
          day,
          `${d.name}, 보이지 않는다`,
          `아침에 ${josa(d.name, '이', '가')} 보이지 않았다. 잠자리는 개켜져 있고, 짐도 없다.\n말없이 산을 내려간 듯하다. 붙잡을 이는 없다.`,
        ),
      );
    } else if (months === SECRET_DEPARTURE.WARN_MONTHS) {
      // 경고 서신 — 아직 개입 여지(면담·휴식으로 신뢰·스트레스 돌리면 다음 달 리셋). 한 번만.
      inbox.add(
        reportItem(
          `runaway-warn-${id}-${day}`,
          day,
          `${d.name}, 요즘 눈에 띄게 겉돈다`,
          `${josa(d.name, '이', '가')} 요즘 밤마다 자리를 오래 비운다고 한다. 말수도 부쩍 줄었다.\n마음이 사문을 떠나 있는 듯하다 — 지금이라면 아직 늦지 않았을지도.`,
        ),
      );
    }
  }
}
