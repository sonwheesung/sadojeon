import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { findMartialArt } from '@/data/martialArts';
import { useScheduleStore } from '@/stores/scheduleStore';
import { computeMonthlyReport, stageLabel } from '@/systems/reportSystem';
import { colors, radius, spacing, typography } from '@/theme';

// 월말 결산 모달 — pendingReport 가 true 일 때 자동 표시.
// 직전 스냅샷 대비 변동량 (제자별 진척·승급·신뢰 + 사문 자산) 표시.
// 닫히면 그 뒤 MonthlyScheduleModal 이 표시되도록 순차 배치.
export function MonthlyReportModal() {
  const pending = useScheduleStore((s) => s.pendingReport);
  const resolve = useScheduleStore((s) => s.resolveMonthlyReport);

  if (!pending) return null;

  const report = computeMonthlyReport();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={resolve}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>지난 달 결산</Text>
          {report ? (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {report.disciples.map((row) => (
                <View key={row.id} style={styles.row}>
                  <Text style={styles.name}>{row.name}</Text>
                  <Text style={styles.line}>
                    무공 진척 {row.progressDelta >= 0 ? '+' : ''}
                    {Math.round(row.progressDelta)}
                  </Text>
                  {row.promotions.length > 0 ? (
                    <View>
                      {row.promotions.map((p) => {
                        const art = findMartialArt(p.artId);
                        return (
                          <Text key={p.artId} style={styles.promotion}>
                            {art?.name ?? p.artId} {stageLabel(p.from)} → {stageLabel(p.to)}
                          </Text>
                        );
                      })}
                    </View>
                  ) : null}
                  <Text style={styles.line}>
                    신뢰 {row.trustDelta >= 0 ? '+' : ''}
                    {row.trustDelta}
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <Text style={styles.assets}>
                사문 자산 {report.assetsDelta >= 0 ? '+' : ''}
                {report.assetsDelta.toLocaleString()} 동화
              </Text>
            </ScrollView>
          ) : (
            <Text style={styles.empty}>변동 없음.</Text>
          )}
          <Pressable
            style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
            onPress={resolve}
            accessibilityRole="button"
            accessibilityLabel="다음 달"
          >
            <Text style={styles.confirmLabel}>다음 달 ▶</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
  },
  body: {
    paddingVertical: spacing.sm,
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkSoft,
    borderStyle: 'dashed',
    gap: 2,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  line: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  promotion: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
    marginVertical: spacing.sm,
  },
  assets: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'right',
  },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  confirm: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.md,
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  pressed: {
    opacity: 0.85,
  },
});
