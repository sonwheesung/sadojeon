import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  defaultOptionFor,
  findTrainingOption,
  optionsByCategory,
} from '@/data/training';
import { useDiscipleStore } from '@/stores/discipleStore';
import { categoryFor, useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { activeOverrideOf } from '@/systems/overrideSystem';
import { daeryeonChoiceValue } from '@/systems/daeryeonSystem';
import type { Disciple, TrainingCategory } from '@/types';
import { MARTIAL_AXES, MARTIAL_AXIS_LABEL, TRAINING_CATEGORY_LABEL } from '@/types/training';
import { colors, radius, spacing, typography } from '@/theme';

// 진행 직전 일일 세부 선택 — 그날 카테고리(무공/체력/공부)별 구체 종목을 제자마다 고른다.
// 기본값 = 그 제자가 (제자×카테고리)에서 마지막에 고른 것(dailyChoice 메모리) → "자동 기본 + 개별 변경".
// 휴식·임시명령(폐관/의뢰/치료) 제자는 고를 게 없어 제외.

interface Option {
  id: string;
  label: string;
}

interface ChoiceRow {
  disciple: Disciple;
  category: Exclude<TrainingCategory, 'rest'>;
  options: Option[];
  defaultId: string;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// 진행 시 처리되는 날 = 현재일 다음 (advanceDay 후 tick). 요일 1~7 wrap.
function upcomingDay(day: number): number {
  return (day % 7) + 1;
}

// 무공 축 3종 + 대련(그날 무공일·가용한 동문 상대마다 한 칸). docs/06 — 대련은 짝 수련.
function martialOptions(selfId: string, partners: Disciple[]): Option[] {
  const axes: Option[] = MARTIAL_AXES.map((ax) => ({ id: ax, label: MARTIAL_AXIS_LABEL[ax] }));
  const spars: Option[] = partners
    .filter((p) => p.id !== selfId)
    .map((p) => ({ id: daeryeonChoiceValue(p.id), label: `대련 — ${p.name}` }));
  return [...axes, ...spars];
}

function categoryOptions(cat: Exclude<TrainingCategory, 'rest' | 'martial'>): Option[] {
  return optionsByCategory(cat).map((o) => ({ id: o.id, label: o.label }));
}

export function DailyChoiceModal({ visible, onCancel, onConfirm }: Props) {
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const dailyChoice = useScheduleStore((s) => s.dailyChoice);
  const setDailyChoice = useScheduleStore((s) => s.setDailyChoice);
  const day = useTimeStore((s) => s.current.day);
  const insets = useSafeAreaInsets();

  // 이번 진행에서 무공/체력/공부 카테고리인 제자만 (휴식·명령 제외).
  const rows = useMemo<ChoiceRow[]>(() => {
    if (!visible) return [];
    const target = upcomingDay(day);
    const sched = useScheduleStore.getState();

    // 그날 무공일·가용(임시명령 없음·수련 가능)인 제자 — 대련 상대 후보.
    const martialMates: Disciple[] = order
      .map((id) => disciples[id])
      .filter((d): d is Disciple => {
        if (!d) return false;
        if (d.status !== 'training') return false;
        const ov = activeOverrideOf(d.id);
        if (ov && ov.command !== 'default') return false;
        return categoryFor(sched, d.id, target) === 'martial';
      });

    const out: ChoiceRow[] = [];
    for (const id of order) {
      const d = disciples[id];
      if (!d) continue;
      if (d.status === 'graduated' || d.status === 'departed') continue;
      const ov = activeOverrideOf(id);
      if (ov && ov.command !== 'default') continue; // 임시명령 = 카테고리 무시
      const cat = categoryFor(sched, id, target);
      if (cat === 'rest') continue;

      let options: Option[];
      let defaultId: string;
      if (cat === 'martial') {
        options = martialOptions(id, martialMates);
        const chosen = dailyChoice[id]?.martial;
        defaultId =
          chosen && options.some((o) => o.id === chosen) ? chosen : 'chosik';
      } else {
        options = categoryOptions(cat);
        const chosen = dailyChoice[id]?.[cat];
        defaultId =
          chosen && findTrainingOption(chosen)?.category === cat
            ? chosen
            : defaultOptionFor(cat)?.id ?? '';
      }
      if (options.length === 0) continue;
      out.push({ disciple: d, category: cat, options, defaultId });
    }
    return out;
  }, [visible, order, disciples, dailyChoice, day]);

  // 로컬 선택 상태 (제자 id → optionId). 비어 있으면 기본값(defaultId) 으로 폴백.
  const [picks, setPicks] = useState<Record<string, string>>({});

  const resolvePick = (row: ChoiceRow): string => picks[row.disciple.id] ?? row.defaultId;

  const onPick = (discipleId: string, optionId: string) => {
    setPicks((p) => ({ ...p, [discipleId]: optionId }));
  };

  const onProceed = () => {
    // 선택 저장 (제자×카테고리). 다음 진행의 기본값이 된다.
    for (const r of rows) {
      setDailyChoice(r.disciple.id, r.category, resolvePick(r));
    }
    setPicks({});
    onConfirm();
  };

  const onClose = () => {
    setPicks({});
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: spacing.base + insets.bottom }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>오늘의 수련</Text>
          <Text style={styles.subtitle}>제자별 세부 종목을 고른다. 두면 지난 선택 그대로.</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {rows.length === 0 ? (
              <Text style={styles.empty}>오늘 선택할 수련이 없다. (휴식·명령 중)</Text>
            ) : (
              rows.map((row) => (
                <View key={row.disciple.id} style={styles.row}>
                  <View style={styles.rowHead}>
                    <Text style={styles.name} numberOfLines={1}>
                      {row.disciple.name}
                    </Text>
                    <Text style={styles.cat}>{TRAINING_CATEGORY_LABEL[row.category]}</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.opts}
                  >
                    {row.options.map((opt) => {
                      const selected = resolvePick(row) === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => onPick(row.disciple.id, opt.id)}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          style={[styles.opt, selected && styles.optSelected]}
                        >
                          <Text style={[styles.optLabel, selected && styles.optLabelSelected]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="취소"
            >
              <Text style={styles.cancelLabel}>취소</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
              onPress={onProceed}
              accessibilityRole="button"
              accessibilityLabel="진행"
            >
              <Text style={styles.confirmLabel}>진행 ▶</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkSoft,
    marginBottom: spacing.xs,
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
    paddingBottom: spacing.xs,
  },
  list: { flexGrow: 0 },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkSoft,
    borderStyle: 'dashed',
    gap: spacing.xs,
  },
  rowHead: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  name: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  cat: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  opts: { flexDirection: 'row', gap: 4, paddingVertical: 2 },
  opt: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  optSelected: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  optLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  optLabelSelected: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm },
  cancel: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  confirm: {
    flex: 2,
    height: 48,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  pressed: { opacity: 0.85 },
});
