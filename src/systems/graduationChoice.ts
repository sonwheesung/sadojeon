// 졸업 결정 해소 — docs/28 §3·§3④. 사부가 권한 직업 확정 + **제자 의지 갈등**(설득/존중).
// graduationSystem(언제 졸업하나·milestone)과 분리: 여기는 inbox 응답으로 직업을 확정하는 책임만.
// pendingStore(→executorch RN) 비의존 → 헤드리스 검증 가능. inboxResolve 가 호출.

import { JOB_POOL, type Job } from '@/data/jobs';
import { evaluateJobs, graduationWillConflict } from './jobSystem';
import { graduateToCareer, switchGraduateCareer } from './careerSystem';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import type { Disciple } from '@/types';

function jobById(id: string): Job | undefined {
  return JOB_POOL.find((j) => j.id === id);
}

// 졸업 직업 확정 — graduatedJob 기록 + 평생 궤적 시작(§4). **멱등**(이미 확정이면 무시 — 중복 보상 방지).
function finalizeGraduation(d: Disciple, jobId: string): void {
  if (d.graduatedJob) return; // 이미 졸업 직업 확정됨(재진입·중복 탭 방지)
  useDiscipleStore.getState().update(d.id, { graduatedJob: jobId });
  graduateToCareer(d, jobId);
}

// 제자 의지 갈등 — 사부가 권한 길과 제자가 원하는 길이 다를 때 설득/존중 분기. docs/28 §3④.
function enqueueGraduationConflict(d: Disciple, userPickId: string, willJob: Job, day: number): void {
  const userName = jobById(userPickId)?.name ?? '그 길';
  const sceneLine =
    `${d.name}이 고개를 들어 사부를 바라보았다.\n` +
    `「사부님. ${userName}의 길을 일러 주심을 압니다. 허나… 저는 ${willJob.name}이 되고 싶습니다.」\n` +
    `제 뜻이 분명한 제자다. 스승의 권함과 제자의 바람이 엇갈렸다.`;
  useInboxStore.getState().add({
    id: `gradconflict-${day}-${d.id}`,
    kind: 'event',
    eventId: `gradconflict-${d.id}`,
    title: `${d.name} — 엇갈린 뜻`,
    preview: sceneLine,
    priority: 'high',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: {
      domain: 'graduation_conflict',
      discipleId: d.id,
      userPickId,
      willJobId: willJob.id,
      choices: [
        { key: 'persuade', label: `${userName}의 길로 설득한다 (사부의 뜻)` },
        { key: 'respect', label: `${willJob.name}의 뜻을 존중한다 (제자의 바람)` },
      ],
    },
  });
}

// 졸업 선택 해소(서신함). **항상 사부 선택으로 즉시 확정**(제자가 무직으로 표류하거나 회차종료서
// 누락되는 것 방지 — docs/37 C10). 제자 의지와 어긋나면 추가로 갈등 이벤트를 띄워, '존중' 시 전환.
export function resolveGraduationPick(discipleId: string, chosenJobId: string): void {
  const d = useDiscipleStore.getState().disciples[discipleId];
  if (!d) return;
  const candidates = evaluateJobs(d).slice(0, 4).map((j) => j.job);
  const willJob = graduationWillConflict(d, candidates, chosenJobId);
  finalizeGraduation(d, chosenJobId); // 항상 확정 — 갈등 무시해도 직업·궤적은 보장
  if (willJob && willJob.id !== chosenJobId) {
    enqueueGraduationConflict(d, chosenJobId, willJob, useTimeStore.getState().totalDay);
  }
}

// 갈등 해소 — 설득(사부의 길 유지) / 존중(제자의 길로 전환). 신뢰 변동 + 소식.
// 직업은 resolveGraduationPick 에서 이미 사부 선택으로 확정됨. '존중'이면 의지 직업으로 전환(보상 재적용 X).
export function resolveGraduationConflict(
  discipleId: string,
  userPickId: string,
  willJobId: string,
  decision: 'persuade' | 'respect',
): void {
  const ds = useDiscipleStore.getState();
  const d = ds.disciples[discipleId];
  if (!d) return;
  const day = useTimeStore.getState().totalDay;
  const respect = decision === 'respect';
  // 신뢰 — 뜻을 존중하면 사제의 정이 깊어지고, 끝내 꺾으면 응어리가 남는다.
  ds.update(discipleId, {
    trustToMaster: Math.max(0, Math.min(100, d.trustToMaster + (respect ? 8 : -10))),
  });
  // 직업 확정/전환 — pick 에서 이미 확정됐으면 전환(존중)·유지(설득), 아직이면 여기서 확정.
  if (respect) {
    if (d.graduatedJob) {
      if (willJobId && willJobId !== d.graduatedJob) switchGraduateCareer(d, willJobId);
    } else {
      finalizeGraduation(d, willJobId);
    }
  } else if (!d.graduatedJob) {
    finalizeGraduation(d, userPickId);
  }
  const willName = jobById(willJobId)?.name ?? '제 뜻';
  const userName = jobById(userPickId)?.name ?? '권한 길';
  const body = respect
    ? `${d.name}의 뜻을 꺾지 않았다. 「…고맙습니다, 사부님.」 제 길(${willName})을 향해 나선다.`
    : `${d.name}을 달래어 ${userName}로 돌려세웠다. 제자는 끝내 고개를 끄덕였으나, 그 눈빛엔 못다 한 바람이 어렸다.`;
  useInboxStore.getState().add({
    id: `gradconflict-result-${day}-${d.id}`,
    kind: 'report',
    title: `${d.name} — 하산`,
    preview: body,
    body,
    priority: 'normal',
    createdAtDay: day,
    read: false,
    resolved: false,
    payload: { domain: 'jianghu_news' },
  });
}
