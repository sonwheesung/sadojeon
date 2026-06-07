import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiscipleProfile } from './DiscipleProfile';
import { RECRUIT_POOL } from '@/data/disciples/recruitPool';
import { STARTING_DISCIPLE_POOL } from '@/data/disciples/startingPool';
import { SECT } from '@/data/constants';
import { seedNewRun } from '@/systems/newRun';
import { colors, radius, spacing, typography } from '@/theme';

// 시작 선택 모달 — 회차 첫 진입(master==null) 시 표시.
// 풀에서 최소 2명, 최대 4명 선택 후 [시작 ▶] 으로 seedNewRun 호출.
// 거두지 않은 후보는 강호로 흩어진다 (docs/08 NPC 시드).
//
// onComplete: seed 완료 시 부모에게 알림. 부모는 모달을 닫는다 (master 가 채워졌으므로 isFreshRun=false).
interface Props {
  visible: boolean;
  onComplete: () => void;
}

export function StartSelectModal({ visible, onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= SECT.CAPACITY) return prev;
      return [...prev, id];
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onStart = () => {
    if (selected.length < SECT.MIN) return;
    seedNewRun(selected);
    setSelected([]);
    onComplete();
  };

  const canStart = selected.length >= SECT.MIN;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>사문 개창</Text>
          <Text style={styles.subtitle}>
            거둘 제자를 고른다 — 최소 {SECT.MIN}명, 최대 {SECT.CAPACITY}명
          </Text>
          <Text style={styles.counter}>
            {selected.length} / {SECT.CAPACITY} 선택
          </Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {RECRUIT_POOL.map((c) => {
              const pool = STARTING_DISCIPLE_POOL.find((d) => d.id === c.poolId);
              const isSelected = selected.includes(c.poolId);
              const disabled = !isSelected && selected.length >= SECT.CAPACITY;
              const isOpen = expanded.includes(c.poolId);
              return (
                <View
                  key={c.poolId}
                  style={[
                    styles.row,
                    isSelected && styles.rowSelected,
                    disabled && styles.rowDisabled,
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [styles.selectArea, pressed && styles.rowPressed]}
                    onPress={() => toggle(c.poolId)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled }}
                    accessibilityLabel={`${pool?.name ?? c.poolId} ${isSelected ? '선택 해제' : '선택'}`}
                  >
                    <View style={styles.rowHead}>
                      <Text style={[styles.name, isSelected && styles.nameSelected]}>
                        {pool?.name ?? c.poolId}
                      </Text>
                      <Text style={styles.hanja}>{pool?.hanjaName ?? '?'}</Text>
                      <View style={styles.check}>
                        <Text style={styles.checkMark}>{isSelected ? '✓' : ''}</Text>
                      </View>
                    </View>
                    <Text style={styles.story} numberOfLines={2}>
                      {c.storyLine}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.toggle, pressed && styles.rowPressed]}
                    onPress={() => toggleExpand(c.poolId)}
                    accessibilityRole="button"
                    accessibilityLabel={`${pool?.name ?? c.poolId} 유년 신상 ${isOpen ? '접기' : '펼치기'}`}
                  >
                    <Text style={styles.toggleLabel}>
                      {isOpen ? '신상 접기 ▴' : '유년 신상 ▾'}
                    </Text>
                  </Pressable>

                  {isOpen && <DiscipleProfile profile={c.childhood} />}
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.confirm,
              !canStart && styles.confirmDisabled,
              pressed && canStart && styles.confirmPressed,
            ]}
            onPress={onStart}
            disabled={!canStart}
            accessibilityRole="button"
            accessibilityLabel="회차 시작"
          >
            <Text
              style={[styles.confirmLabel, !canStart && styles.confirmLabelDisabled]}
            >
              {canStart ? '거두고 시작 ▶' : `${SECT.MIN}명 이상 선택`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
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
  subtitle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  counter: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.paperLight,
    gap: 4,
  },
  rowSelected: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowPressed: {
    opacity: 0.85,
  },
  selectArea: {
    gap: 4,
  },
  toggle: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  toggleLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wide,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  nameSelected: {
    color: colors.seal,
  },
  hanja: {
    flex: 1,
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.inkSoft,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  story: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    lineHeight: typography.sizes.xs * 1.4,
  },
  confirm: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  confirmDisabled: {
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
    opacity: 0.55,
  },
  confirmPressed: { opacity: 0.85 },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
  },
  confirmLabelDisabled: {
    color: colors.inkSoft,
  },
});
