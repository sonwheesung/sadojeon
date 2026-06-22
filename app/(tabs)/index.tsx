import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { CutsceneOverlay } from '@/components/cutscene/CutsceneOverlay';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { DailyChoiceModal } from '@/components/dialogue/DailyChoiceModal';
import { DailySettlementModal } from '@/components/dialogue/DailySettlementModal';
import { FieldEventOverlay } from '@/components/dialogue/FieldEventOverlay';
import { MilestoneModal } from '@/components/dialogue/MilestoneModal';
import { MonthlyReportModal } from '@/components/dialogue/MonthlyReportModal';
import { MonthlyScheduleModal } from '@/components/dialogue/MonthlyScheduleModal';
import { StartSelectModal } from '@/components/dialogue/StartSelectModal';
import { DailyLogPanel } from '@/components/sect/DailyLogPanel';
import { DiscipleMoodPanel } from '@/components/sect/DiscipleMoodPanel';
import { DiscipleRoster } from '@/components/sect/DiscipleRoster';
import { SectProgressBar } from '@/components/sect/SectProgressBar';
import { useBackConfirm } from '@/hooks/useBackConfirm';
import { useGameStore, useMasterStore, usePendingStore, useInboxStore } from '@/stores';
import { resetIfFirstRun } from '@/systems/devReset';
import { triggerTutorial } from '@/systems/tutorialSystem';
import { saveCurrentRunSilently } from '@/systems/runSync';
import { getGameApi } from '@/engine/gameApi';
import { colors, spacing } from '@/theme';

export default function SectScreen() {
  // 사용자가 "처음부터 진행" 명시 요청 — 일회성 자동 reset (sentinel 키).
  // 다음 진입부터는 reset X. 다시 초기화 원하면 devReset.ts 의 SENTINEL 값 변경.
  useEffect(() => {
    resetIfFirstRun();
  }, []);

  // master 가 비어 있으면 회차 첫 진입 → 시작 선택 모달.
  // 사용자가 풀에서 2~4명 선택 + 시작 → seedNewRun 호출 → master 채워짐 → 자동 숨김.
  const isFresh = useMasterStore((s) => s.master == null);

  // 진행 → 일일 세부 선택 모달 → 확정 시 하루 진행(GameApi).
  const [choiceOpen, setChoiceOpen] = useState(false);
  // 진행 중복 방지 — 원격(서버) 왕복 중 재확정 시 두 번 진행되는 것 차단. 로컬은 동기라 즉시 해제.
  const advancingRef = useRef(false);

  // 사부 사망 → phase='ended' 전환 시 회차 종결 화면으로 자동 진입.
  const phase = useGameStore((s) => s.phase);
  useEffect(() => {
    if (phase === 'ended') {
      router.replace('/run-end');
    }
  }, [phase]);

  // 뒤로가기 → 사문 선택 화면으로 이동 확인.
  useBackConfirm(
    {
      title: '사문 선택으로 이동',
      message: '지금 사문에서 나가 사문 선택 화면으로 이동할까요?',
      confirmLabel: '이동',
      tone: 'danger',
    },
    () => router.replace('/slot-select'),
  );

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <AppHeader />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DailyLogPanel />
          <DiscipleRoster />
          <DiscipleMoodPanel />
        </ScrollView>
        <SectProgressBar onProgress={() => setChoiceOpen(true)} />
      </PaperCard>
      <DailyChoiceModal
        visible={choiceOpen}
        onCancel={() => setChoiceOpen(false)}
        onConfirm={() => {
          setChoiceOpen(false);
          // 정산 모달 미해소·회차 종료 상태에선 진행 금지(이중 진행·정산 건너뜀 차단). docs/37 C10.
          if (advancingRef.current) return; // 진행 중이면 무시(원격 왕복 중 중복 진행 차단)
          if (usePendingStore.getState().settlement || useGameStore.getState().phase === 'ended') return;
          // 결정 필요한 서신이 있으면 진행 불가 — 무시 불가 규칙(docs/12). 게이트 우회/경합 방어.
          if (useInboxStore.getState().decisionPendingCount() > 0) return;
          advancingRef.current = true;
          getGameApi()
            .advance() // 하루 진행 — 서버 인터페이스 경유(로컬 어댑터=기존 동작)
            .catch((e) => console.warn('[advance] 진행 실패', e))
            .finally(() => {
              advancingRef.current = false;
            });
        }}
      />
      <StartSelectModal
        visible={isFresh}
        onComplete={() => {
          saveCurrentRunSilently();
          triggerTutorial('intro'); // 첫 사문 개창 직후 — 핵심 루프 안내(계정 1회). docs/44
        }}
      />
      <MonthlyReportModal />
      <MonthlyScheduleModal />
      <DailySettlementModal />
      <MilestoneModal />
      <CutsceneOverlay />
      {/* 강호 출행·의뢰 중 급보 — 정산 닫힌 뒤 컷씬+선택 모달로(서신함 아님). docs/20·38 */}
      <FieldEventOverlay />
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
});
