import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import { useTutorialOnFocus } from '@/hooks/useTutorialOnFocus';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { monthOfYear } from '@/systems/calendar';
import { cancelOverride, OVERRIDE_LABEL } from '@/systems/overrideSystem';
import type { Disciple } from '@/types';
import { DAY_LABEL, WEEK_DAYS, type MonthlySchedule } from '@/types/schedule';
import {
  TRAINING_CATEGORIES,
  TRAINING_CATEGORY_LABEL,
  type TrainingCategory,
} from '@/types/training';
import { colors, radius, spacing, typography } from '@/theme';

const SECT_TARGET = 'sect';

// 사문 주간 일정 화면 — 메인 [일정 변경] 진입.
// 상단 대상 선택(사문 / 제자별)으로 주간 패턴을 전환 편집.
// - 사문: 사문 기본 주간 패턴 (모든 제자의 기본값)
// - 제자: 개인 주간 패턴 (사문보다 우선). 고치면 개인 일정이 되고, 되돌리기로 사문 복귀.
export default function ScheduleScreen() {
  useTutorialOnFocus('schedule'); // 일과 첫 진입 — 수련 편성 안내. docs/44
  const dateLabel = useGameDateLabel();
  const time = useTimeStore((s) => s.current);
  const totalDay = useTimeStore((s) => s.totalDay);
  const current = useScheduleStore((s) => s.schedule);
  const individualPatterns = useScheduleStore((s) => s.individualPatterns);
  const setSchedule = useScheduleStore((s) => s.setSchedule);
  const setIndividualPattern = useScheduleStore((s) => s.setIndividualPattern);
  const clearIndividualPattern = useScheduleStore((s) => s.clearIndividualPattern);
  const overrides = useScheduleStore((s) => s.overrides);
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const confirm = useConfirm();

  const [target, setTarget] = useState<string>(SECT_TARGET);
  const [draftSect, setDraftSect] = useState<MonthlySchedule>(current);
  // 제자별 개인 패턴 draft. 키 없음 = 사문 일정 따름.
  const [draftIndiv, setDraftIndiv] = useState<Record<string, TrainingCategory[]>>(
    () => ({ ...individualPatterns }),
  );

  const month = monthOfYear(time);

  // 일정에 포함되는 제자 (졸업·하산 제외).
  const discipleTargets = order
    .map((id) => disciples[id])
    .filter((d): d is Disciple => !!d && d.status !== 'graduated' && d.status !== 'departed');

  const isSect = target === SECT_TARGET;
  const effectivePattern = isSect
    ? draftSect.weeklyPattern
    : draftIndiv[target] ?? draftSect.weeklyPattern;
  const hasIndividual = !isSect && draftIndiv[target] != null;

  const activeOverrides = Object.values(overrides).filter(
    (o) => o.command !== 'default' && totalDay < o.startedAtDay + o.durationDays,
  );

  const setDay = (dayIdx: number, cat: TrainingCategory) => {
    if (isSect) {
      const next = [...draftSect.weeklyPattern];
      next[dayIdx - 1] = cat;
      setDraftSect({ ...draftSect, weeklyPattern: next });
    } else {
      const base = draftIndiv[target] ?? draftSect.weeklyPattern;
      const next = [...base];
      next[dayIdx - 1] = cat;
      setDraftIndiv({ ...draftIndiv, [target]: next });
    }
  };

  const revertToSect = async () => {
    const name = disciples[target]?.name ?? '제자';
    const ok = await confirm({
      title: '사문 일정으로 되돌리기',
      message: `${name}의 개인 일정을 지우고 사문 기본 일정을 따르게 합니다.`,
      confirmLabel: '되돌리기',
      tone: 'danger',
    });
    if (!ok) return;
    const { [target]: _removed, ...rest } = draftIndiv;
    setDraftIndiv(rest);
  };

  // 사문 패턴을 전원에게 일괄 적용 — 모든 개인 패턴을 비워 사문 일정을 따르게 한다.
  const applyToAll = async () => {
    const ok = await confirm({
      title: '사문 일정 전원 적용',
      message: `개인 일정을 따르는 제자 ${customCount}명을 모두 사문 기본 일정으로 되돌립니다.`,
      confirmLabel: '전원 적용',
      tone: 'danger',
    });
    if (!ok) return;
    setDraftIndiv({});
  };

  const customCount = discipleTargets.filter((d) => draftIndiv[d.id] != null).length;

  const onSave = async () => {
    const ok = await confirm({
      title: '일정을 저장할까요?',
      message: '사문 기본 일정과 제자별 개인 일정 변경을 모두 반영합니다.',
      confirmLabel: '저장',
    });
    if (!ok) return;
    setSchedule(draftSect);
    // 개인 패턴 동기화 — draft 에 있으면 설정, 없으면 사문 일정으로 되돌림.
    order.forEach((id) => {
      const p = draftIndiv[id];
      if (p) setIndividualPattern(id, p);
      else clearIndividualPattern(id);
    });
    router.back();
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header subtitle={`${time.year}년차 ${month}월 사문 일정`} date={dateLabel} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <View style={styles.patternHeader}>
              <SectionLabel>주간 패턴</SectionLabel>
              <View style={styles.selectorRow}>
                <View style={styles.selectorFlex}>
                  <TargetSelector
                    target={target}
                    disciples={discipleTargets}
                    individualPatterns={draftIndiv}
                    onSelect={setTarget}
                  />
                </View>
                {isSect && customCount > 0 && (
                  <Pressable
                    style={({ pressed }) => [styles.applyAllBtn, pressed && styles.pressed]}
                    onPress={applyToAll}
                    accessibilityRole="button"
                    accessibilityLabel="사문 일정 전원 일괄 적용"
                  >
                    <Text style={styles.applyAllLabel}>전원 적용</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {isSect ? (
              <Text style={styles.subtle}>
                {customCount > 0
                  ? `모든 제자의 기본 일정. 개인 일정을 따르는 제자 ${customCount}명.`
                  : '모든 제자의 기본 일정. 매주 반복.'}
              </Text>
            ) : hasIndividual ? (
              <View style={styles.indivRow}>
                <Text style={styles.subtle}>개인 일정 — 사문 일정과 별도로 반복.</Text>
                <Pressable
                  style={({ pressed }) => [styles.revertBtn, pressed && styles.pressed]}
                  onPress={revertToSect}
                  accessibilityRole="button"
                  accessibilityLabel="사문 일정으로 되돌리기"
                >
                  <Text style={styles.revertLabel}>사문 일정으로 ↩</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.subtle}>사문 일정을 따르는 중 — 고치면 개인 일정이 된다.</Text>
            )}

            {WEEK_DAYS.map((day) => (
              <DayRow
                key={day}
                label={DAY_LABEL[day]}
                value={effectivePattern[day - 1]}
                onChange={(v) => setDay(day, v)}
              />
            ))}

            {isSect && (
              <QuestRow
                value={draftSect.monthlyQuests}
                onChange={(n) => setDraftSect({ ...draftSect, monthlyQuests: n })}
              />
            )}
          </View>

          <View style={styles.panel}>
            <SectionLabel>활성 명령</SectionLabel>
            {activeOverrides.length === 0 ? (
              <Text style={styles.subtle}>현재 발행된 명령이 없다.</Text>
            ) : (
              activeOverrides.map((o) => {
                const d = disciples[o.discipleId];
                const remaining = o.startedAtDay + o.durationDays - totalDay;
                const onCancelOverride = async () => {
                  const ok = await confirm({
                    title: '명령 해제',
                    message: `${d?.name ?? '제자'}의 ${
                      o.command !== 'default' ? OVERRIDE_LABEL[o.command] : ''
                    } 명령을 해제할까요?`,
                    confirmLabel: '해제',
                    tone: 'danger',
                  });
                  if (ok) cancelOverride(o.discipleId);
                };
                return (
                  <View key={o.discipleId} style={styles.overrideRow}>
                    <View style={styles.overrideInfo}>
                      <Text style={styles.overrideName}>{d?.name ?? o.discipleId}</Text>
                      <Text style={styles.overrideMeta}>
                        {o.command !== 'default' ? OVERRIDE_LABEL[o.command] : ''} · {remaining}일 남음
                      </Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                      onPress={onCancelOverride}
                      accessibilityRole="button"
                      accessibilityLabel={`${d?.name ?? '제자'} 명령 해제`}
                    >
                      <Text style={styles.cancelBtnLabel}>해제</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
        <Footer onCancel={() => router.back()} onSave={onSave} />
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ subtitle, date }: { subtitle: string; date: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backLabel}>← 뒤로</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            일정 변경
          </Text>
        </View>
        <View style={{ width: 56 }} />
      </View>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
      <Text style={styles.headerDate}>{date}</Text>
    </View>
  );
}

// 대상 선택 — 드롭다운. 트리거 누르면 모달 리스트(사문 / 제자별)가 열린다.
// 개인 패턴 있는 제자엔 점 표시.
function TargetSelector({
  target,
  disciples,
  individualPatterns,
  onSelect,
}: {
  target: string;
  disciples: Disciple[];
  individualPatterns: Record<string, TrainingCategory[]>;
  onSelect: (t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const currentLabel =
    target === SECT_TARGET ? '사문' : disciples.find((d) => d.id === target)?.name ?? '사문';

  const pick = (t: string) => {
    onSelect(t);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="일정 대상 선택"
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {currentLabel}
        </Text>
        <Text style={styles.triggerCaret}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: spacing.base + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.dropdownTitle}>일정 대상</Text>
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              <TargetItem
                label="사문"
                hint="모든 제자의 기본 일정"
                selected={target === SECT_TARGET}
                onPress={() => pick(SECT_TARGET)}
              />
              {disciples.map((d) => (
                <TargetItem
                  key={d.id}
                  label={d.name}
                  hint={individualPatterns[d.id] != null ? '개인 일정' : '사문 일정 따름'}
                  dot={individualPatterns[d.id] != null}
                  selected={target === d.id}
                  onPress={() => pick(d.id)}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function TargetItem({
  label,
  hint,
  selected,
  dot,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  dot?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.dropdownItem,
        selected && styles.dropdownItemSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.dropdownItemMain}>
        <Text
          style={[styles.dropdownItemLabel, selected && styles.dropdownItemLabelSelected]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {dot && <View style={styles.targetDot} />}
      </View>
      <Text style={styles.dropdownItemHint}>{hint}</Text>
      {selected && <Text style={styles.dropdownCheck}>✓</Text>}
    </Pressable>
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

function Footer({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={({ pressed }) => [styles.footerBtn, pressed && styles.pressed]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="취소"
      >
        <Text style={styles.footerLabel}>취소</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.footerBtn, styles.footerBtnPrimary, pressed && styles.pressed]}
        onPress={onSave}
        accessibilityRole="button"
        accessibilityLabel="저장"
      >
        <Text style={[styles.footerLabel, styles.footerLabelPrimary]}>저장 ▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 2, paddingBottom: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { paddingVertical: 4, paddingHorizontal: 6 },
  backLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSubtitle: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  headerDate: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'center',
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.base },

  panel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  subtle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // 대상 선택 ----------------------------------------------------------------
  patternHeader: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectorFlex: { flex: 1 },
  applyAllBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
  },
  applyAllLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  // 드롭다운 트리거 -----------------------------------------------------------
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    backgroundColor: colors.paperBright,
  },
  triggerLabel: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  triggerCaret: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  targetDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.seal,
  },

  // 바텀시트 -----------------------------------------------------------------
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '70%',
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
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkSoft,
    marginBottom: spacing.xs,
  },
  dropdownTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  dropdownList: { flexGrow: 0 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  dropdownItemSelected: {
    backgroundColor: colors.paperBright,
  },
  dropdownItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownItemLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  dropdownItemLabelSelected: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
  dropdownItemHint: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    textAlign: 'right',
  },
  dropdownCheck: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.seal,
  },
  indivRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  revertBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  revertLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

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

  overrideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  overrideInfo: { gap: 2 },
  overrideName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  overrideMeta: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  cancelBtnLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnPrimary: {
    flex: 2,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  footerLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  footerLabelPrimary: {
    fontFamily: typography.serifBold,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  pressed: { opacity: 0.85 },
});
