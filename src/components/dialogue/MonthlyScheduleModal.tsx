import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { monthOfYear } from '@/systems/calendar';
import { DAY_LABEL, WEEK_DAYS, type MonthlySchedule } from '@/types/schedule';
import {
  TRAINING_CATEGORIES,
  TRAINING_CATEGORY_LABEL,
  type TrainingCategory,
} from '@/types/training';
import { colors, radius, spacing, typography } from '@/theme';

// 월 시작 시 자동 표시. 월~일 7일 각자 활동 + 의뢰 횟수.
export function MonthlyScheduleModal() {
  const pending = useScheduleStore((s) => s.pendingSetup);
  const reportPending = useScheduleStore((s) => s.pendingReport);
  const current = useScheduleStore((s) => s.schedule);
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const resolve = useScheduleStore((s) => s.resolveMonthlySetup);
  const time = useTimeStore((s) => s.current);

  const [draft, setDraft] = useState<MonthlySchedule>(current);

  const visible = pending && !reportPending;

  useEffect(() => {
    if (visible) setDraft(current);
  }, [visible, current]);

  if (!visible) return null;

  const month = monthOfYear(time);

  const setDay = (dayIdx: number, cat: TrainingCategory) => {
    const next = [...draft.weeklyPattern];
    next[dayIdx - 1] = cat;
    setDraft({ ...draft, weeklyPattern: next });
  };

  const onConfirm = () => {
    setSchedule(draft);
    resolve();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {time.year}년차 {month}월 일정
          </Text>
          <Text style={styles.subtitle}>월~일 각자 활동 선택. 매주 같은 패턴 반복.</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            {WEEK_DAYS.map((day) => (
              <DayRow
                key={day}
                label={DAY_LABEL[day]}
                value={draft.weeklyPattern[day - 1]}
                onChange={(v) => setDay(day, v)}
              />
            ))}
            <QuestRow
              value={draft.monthlyQuests}
              onChange={(n) => setDraft({ ...draft, monthlyQuests: n })}
            />
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.confirm, pressed && styles.confirmPressed]}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="확정"
          >
            <Text style={styles.confirmLabel}>확정 ▶</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DayRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TrainingCategory;
  onChange: (v: TrainingCategory) => void;
}) {
  return (
    <View style={styles.dayRow}>
      <Text style={styles.dayLabel}>{label}</Text>
      <View style={styles.dayOptions}>
        {TRAINING_CATEGORIES.map((c) => {
          const selected = c === value;
          return (
            <Pressable
              key={c}
              onPress={() => onChange(c)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {TRAINING_CATEGORY_LABEL[c]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function QuestRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const options = [0, 1, 2, 3];
  return (
    <View style={styles.dayRow}>
      <Text style={styles.dayLabel}>의뢰</Text>
      <View style={styles.dayOptions}>
        {options.map((n) => {
          const selected = n === value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {n === 0 ? '없음' : `${n}회`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: '92%',
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  body: { paddingVertical: spacing.sm },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  dayLabel: {
    width: 32,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    textAlign: 'center',
  },
  dayOptions: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.paperBright,
    borderStyle: 'solid',
    borderColor: colors.seal,
  },
  optionLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  optionLabelSelected: {
    fontFamily: typography.serifBold,
    color: colors.seal,
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
  confirmPressed: { opacity: 0.85 },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
});
