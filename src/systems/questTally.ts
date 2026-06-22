// 의뢰 집계 적립 — docs/32. 결산 결과 한 건을 받아 계정 누적 카운터(tallyStore)에 반영.
// questSystem.resolveQuest 끝에서 **한 번만** 호출(단일 seam) — questSystem 은 tally 내부를 모른다.
// 적립값은 업적(data/achievements)이 선언적으로 읽어 "첫 X·N건·연속" 판정에 쓴다.

import { DOMAIN_TALLY, GRADE_TALLY, KIND_TALLY, STREAK, TALLY } from '@/data/tallyKeys';
import { useTallyStore } from '@/stores/tallyStore';
import type { Quest, QuestOutcome } from '@/types';

const WORLD_QUEST_PREFIX = 'world-evt-';

export interface QuestResultTally {
  outcome: QuestOutcome;
  quest: Quest;
  partySize: number; // 결산 시점 생존 동행 수
  death: boolean; //        동문을 잃었나
  fatalSurvived: boolean; // 치명상에서 살아 돌아왔나(영약·의원·자력·마을)
  scrollFound: boolean; //  의뢰로 비급을 얻었나
  divineElixir: boolean; // 극험에서 신품 영약을 얻었나
  noble: boolean; //        귀인(noble)을 구했나
}

export function recordQuestResult(r: QuestResultTally): void {
  const t = useTallyStore.getState();
  t.bump(TALLY.questAttempt);

  const success = r.outcome === 'full' || r.outcome === 'partial' || r.outcome === 'crisis';
  if (r.outcome === 'fail' || r.outcome === 'disaster') t.bump(TALLY.questFail);

  // 연속 무사고 — 흠 없는 완수만 잇는다(그 외 결과에 끊김).
  if (r.outcome === 'full') {
    t.bump(TALLY.questFull);
    t.bumpStreak(STREAK.flawless);
  } else {
    t.resetStreak(STREAK.flawless);
  }

  if (success) {
    t.bump(TALLY.questDone);
    t.bump(GRADE_TALLY[r.quest.grade]);
    t.bump(DOMAIN_TALLY[r.quest.domain]);
    if (r.quest.gray) t.bump(TALLY.gray);
    if (r.quest.faction) t.bump(TALLY.sponsored);
    if (r.quest.id.startsWith(WORLD_QUEST_PREFIX)) t.bump(TALLY.worldEvent);
    if (r.partySize <= 1) t.bump(TALLY.solo);
    if (r.partySize >= 3) t.bump(TALLY.party);
    if (r.noble) t.bump(TALLY.noble);
    if (r.quest.kind) t.bump(KIND_TALLY[r.quest.kind]); // 특수 유형 첫 완수(docs/29 §9)
  }

  // 생사·노획은 성공 여부와 무관(재난에도, 실패에도 일어날 수 있음).
  if (r.fatalSurvived) t.bump(TALLY.disasterSurvived);
  if (r.death) t.bump(TALLY.death);
  if (r.scrollFound) t.bump(TALLY.scrollFound);
  if (r.divineElixir) t.bump(TALLY.divineElixir);
}
