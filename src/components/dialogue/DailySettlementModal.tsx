import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useInboxStore } from '@/stores/inboxStore';
import { useFieldEventStore } from '@/stores/fieldEventStore';
import { usePendingStore } from '@/stores/pendingStore';
import type { LlmDebugEntry } from '@/stores/pendingStore';
import { getGameApi } from '@/engine/gameApi';
import type { DailyLogKind } from '@/types';
import { colors, radius, spacing, typography } from '@/theme';
import { LlmDebugPanel } from './LlmDebugPanel';

// 하루 정산 모달 — advanceTurn 끝에 자동 표시.
// PM 결의 일일 정산 + LLM 백그라운드 대기 화면.
//
// 동작:
// - 진행 직후 자동 표시
// - 최소 2초 [다음 ▶] 버튼 비활성 (정산 음미 + LLM 응답 도착 대기 자연스럽게)
// - 사용자 [다음 ▶] → clear → 다음 모달 (한 마디·희망·도덕) 트리거
//
// 표시 내용:
// - 날짜
// - 각 제자 일지 한 줄씩 (강조 색)
// - [DEV] LLM I/O 디버그 패널 (이 turn 에서 호출된 LLM 호출들)

const MIN_DISPLAY_MS = 2000;

export function DailySettlementModal() {
  const settlement = usePendingStore((s) => s.settlement);
  const clearStore = usePendingStore((s) => s.clearSettlement);
  const inflight = usePendingStore((s) => s.inflightResolutions);
  const [timerDone, setTimerDone] = useState(false);
  const closingRef = useRef(false); // [다음] 이중 탭 → settle 이중 호출 차단

  // [다음] 활성 = 최소 음미 시간 경과 + 백그라운드 LLM 해결이 모두 끝남.
  // 미완 응답이 남아 있으면 "하루를 기록하는 중…" 으로 계속 대기(선택은 안 기다림).
  const canClose = timerDone && inflight === 0;

  const onClose = async () => {
    if (closingRef.current) return; // 이중 [다음] 무시(정산 후속 이중 실행 방지)
    closingRef.current = true;
    clearStore();
    await getGameApi().settle(); // 정산 후속 — 서버 인터페이스 경유(로컬 어댑터=triggerPostSettlement)
    // 강호/의뢰 현장 급보가 대기 중이면 사문함으로 보내지 않는다 — FieldEventOverlay 가
    // 컷씬+선택 모달로 먼저 처리(서신함 아님). docs/20·38.
    if (useFieldEventStore.getState().queue.length > 0) return;
    // 그 외 응답 필수(면담·희망·도덕 등) 항목이 생겼으면 바로 사문함으로 이동.
    if (useInboxStore.getState().decisionPendingCount() > 0) {
      router.push('/inbox');
    }
  };

  // 정산 표시 시 최소 시간 후 타이머 완료.
  useEffect(() => {
    if (settlement) {
      closingRef.current = false; // 새 정산 → 닫기 가드 해제
      setTimerDone(false);
      const t = setTimeout(() => setTimerDone(true), MIN_DISPLAY_MS);
      return () => clearTimeout(t);
    }
    setTimerDone(false);
    return undefined;
  }, [settlement]);

  if (!settlement) {
    return <Modal visible={false} transparent />;
  }

  const { dateLabel, log, llmDebugs } = settlement;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => canClose && onClose()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>하루 정산</Text>
          <Text style={styles.date}>{dateLabel}</Text>
          <View style={styles.divider} />

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {log.entries.length === 0 ? (
              <Text style={styles.empty}>사문은 조용히 그날을 보냈다.</Text>
            ) : (
              log.entries.map((e) => (
                <Text key={e.id} style={[styles.line, lineStyle(e.kind)]}>
                  · {e.text}
                </Text>
              ))
            )}

            {llmDebugs.length > 0 ? (
              <DebugList debugs={llmDebugs} />
            ) : null}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.confirm,
              !canClose && styles.confirmDisabled,
              canClose && pressed && styles.confirmPressed,
            ]}
            onPress={() => canClose && onClose()}
            disabled={!canClose}
            accessibilityRole="button"
            accessibilityLabel={canClose ? '다음' : '잠시 대기'}
          >
            <Text
              style={[styles.confirmLabel, !canClose && styles.confirmLabelDisabled]}
            >
              {canClose ? '다음 ▶' : '하루를 기록하는 중…'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DebugList({ debugs }: { debugs: LlmDebugEntry[] }) {
  if (!__DEV__) return null;
  return (
    <View style={styles.debugBlock}>
      {debugs.map((d, idx) => (
        <View key={idx} style={styles.debugEntry}>
          <Text style={styles.debugCaption}>
            [{d.source}] {d.discipleName} — {d.llmCalled ? 'LLM 응답' : '룰 폴백'}
          </Text>
          <LlmDebugPanel prompt={d.prompt} raw={d.raw} />
        </View>
      ))}
    </View>
  );
}

function lineStyle(kind: DailyLogKind) {
  switch (kind) {
    case 'promotion':
      return styles.linePromotion;
    case 'collapse':
      return styles.lineCollapse;
    case 'plateau':
      return styles.linePlateau;
    case 'stamina_drop':
      return styles.lineStaminaDrop;
    case 'stamina_rise':
      return styles.lineStaminaRise;
    case 'override':
      return styles.lineOverride;
    default:
      return styles.lineDefault;
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '92%',
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  date: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.xs,
  },
  body: { maxHeight: 360 },
  bodyContent: { gap: 4 },
  empty: {
    fontFamily: typography.serif,
    fontStyle: 'italic',
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: typography.sizes.sm * 1.5,
  },
  lineDefault: { color: colors.inkLight },
  linePromotion: {
    fontFamily: typography.serifBold,
    color: colors.brown,
  },
  lineCollapse: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  linePlateau: {
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  lineStaminaDrop: {
    fontFamily: typography.serifMedium,
    color: colors.sealDark,
  },
  lineStaminaRise: {
    fontFamily: typography.serifMedium,
    color: colors.green,
  },
  lineOverride: {
    color: colors.inkLight,
    fontStyle: 'italic',
  },

  debugBlock: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  debugEntry: {
    gap: 2,
  },
  debugCaption: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },

  confirm: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  confirmDisabled: {
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
    opacity: 0.6,
  },
  confirmPressed: { opacity: 0.85 },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
  },
  confirmLabelDisabled: { color: colors.inkSoft },
});
