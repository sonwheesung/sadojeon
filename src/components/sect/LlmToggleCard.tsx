import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLlmSettingsStore } from '@/stores/llmSettingsStore';
import { ensureLoaded, isLlmAvailable, unload } from '@/systems/llm/executorchClient';
import { colors, radius, spacing, typography } from '@/theme';

// 사부 통찰(LLM) 활성화 토글 카드.
// docs/17 Phase 1 정책: 도덕 이벤트 한정 LLM 활성. 기본 OFF.
// 사용자가 토글 ON → 첫 진입 시 Llama 3.2 3B SpinQuant (~2GB) 다운로드.
// WiFi 권장. 다운로드 완료되면 archetype·personal 도덕 이벤트에서 자동 사용.

export function LlmToggleCard() {
  const enabled = useLlmSettingsStore((s) => s.enabled);
  const loadStatus = useLlmSettingsStore((s) => s.loadStatus);
  const progress = useLlmSettingsStore((s) => s.downloadProgress);
  const lastError = useLlmSettingsStore((s) => s.lastError);
  const callCount = useLlmSettingsStore((s) => s.perRunCallCount);
  const callCap = useLlmSettingsStore((s) => s.perRunCap);
  const setEnabled = useLlmSettingsStore((s) => s.setEnabled);
  const [busy, setBusy] = useState(false);

  const available = isLlmAvailable();

  const onToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        setEnabled(false);
        unload();
      } else {
        setEnabled(true);
        await ensureLoaded();
      }
    } finally {
      setBusy(false);
    }
  };

  let statusLine: string;
  let showCounter = false;
  if (!available) {
    statusLine = '미설치 — 네이티브 빌드 후 가능';
  } else if (!enabled) {
    statusLine = '꺼짐 (룰 기반 평가)';
    showCounter = true;
  } else if (loadStatus === 'downloading') {
    statusLine = `모델 다운로드 ${Math.round(progress * 100)}%`;
  } else if (loadStatus === 'ready') {
    statusLine = '준비됨';
    showCounter = true;
  } else if (loadStatus === 'error') {
    statusLine = `오류: ${lastError ?? '알 수 없음'}`;
    showCounter = true;
  } else {
    statusLine = '준비 중';
  }
  if (showCounter) {
    statusLine += ` · 이번 회차 ${callCount}/${callCap}회`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.title}>사부의 통찰 (실험)</Text>
          <Text style={styles.subtitle}>{statusLine}</Text>
        </View>
        <Pressable
          onPress={onToggle}
          disabled={busy || !available}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled, disabled: busy || !available }}
          style={({ pressed }) => [
            styles.toggle,
            enabled && styles.toggleOn,
            (!available || busy) && styles.toggleDisabled,
            pressed && styles.togglePressed,
          ]}
        >
          <Text style={[styles.toggleLabel, enabled && styles.toggleLabelOn]}>
            {enabled ? '켜짐' : '꺼짐'}
          </Text>
        </Pressable>
      </View>
      {enabled && loadStatus === 'downloading' ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      ) : null}
      <Pressable
        onPress={() => router.push('/dev/autoplay' as Href)}
        style={styles.qaLink}
        accessibilityRole="button"
      >
        <Text style={styles.qaLinkText}>자동 플레이 QA ▶ (랜덤 진행·이벤트·LLM 검증)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  toggle: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    minWidth: 56,
    alignItems: 'center',
  },
  toggleOn: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  toggleDisabled: {
    opacity: 0.45,
  },
  togglePressed: {
    opacity: 0.85,
  },
  toggleLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  toggleLabelOn: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.paperLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.seal,
  },
  qaLink: {
    marginTop: 2,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.inkSoft,
  },
  qaLinkText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.brown,
  },
});
