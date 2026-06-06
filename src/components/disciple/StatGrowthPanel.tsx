import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { statCap } from '@/data/training';
import type { Disciple } from '@/types';
import { STAT_LABEL, type StatId, type StatTrack } from '@/types/training';
import { colors, radius, spacing, typography } from '@/theme';

// 단련 스탯 — 능력치·지식의 Lv/EXP. 체력·공부 훈련으로 성장 (docs/25).
// 관찰 가능한 성장 지표라 수치 노출 OK (feedback_hidden_game_state).
// 의뢰 조건(예: 진법 Lv N 이상)에도 쓰일 값.
// 체력(endurance)은 Lv 대신 최대 체력(=Lv×10) 수치로 표기. 상한 도달 시 "(최대)".

const ABILITY: StatId[] = ['strength', 'agility', 'endurance'];
const KNOWLEDGE: StatId[] = ['formation', 'etiquette', 'knowledge'];
// 비무공 소양 — 교습(공부)으로 키움. 정탐·호위는 의뢰(B) 도입 시 합류.
const APTITUDE: StatId[] = ['medicine', 'alchemy'];

export function StatGrowthPanel({ disciple }: { disciple: Disciple }) {
  return (
    <View style={styles.section}>
      <SectionLabel>단련</SectionLabel>
      <View style={styles.panel}>
        <Group title="능력치" ids={ABILITY} disciple={disciple} />
        <Group title="지식" ids={KNOWLEDGE} disciple={disciple} />
        <Group title="소양" ids={APTITUDE} disciple={disciple} />
      </View>
    </View>
  );
}

function Group({
  title,
  ids,
  disciple,
}: {
  title: string;
  ids: StatId[];
  disciple: Disciple;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {ids.map((id) => (
        <StatRow key={id} id={id} track={disciple.stats?.[id]} disciple={disciple} />
      ))}
    </View>
  );
}

function StatRow({
  id,
  track,
  disciple,
}: {
  id: StatId;
  track?: StatTrack;
  disciple: Disciple;
}) {
  const level = track?.level ?? 0;
  const cap = statCap(id);
  const maxed = level >= cap;
  // 체력은 최대 체력 수치(Lv×10). 그 외는 Lv. EXP 진행도는 노출 X — 관찰 가능한 결과(값)만.
  const valueText =
    id === 'endurance'
      ? `${disciple.maxStamina ?? level * 10}`
      : `Lv ${level}`;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{STAT_LABEL[id]}</Text>
      <View style={styles.spacer} />
      <Text style={[styles.lv, maxed && styles.lvMax]}>
        {valueText}
        {maxed ? ' (최대)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  group: { gap: 4 },
  groupTitle: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    width: 44,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  spacer: { flex: 1 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paperDark,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.seal,
  },
  barFillMax: {
    backgroundColor: colors.gold,
  },
  lv: {
    width: 78,
    textAlign: 'right',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  lvMax: {
    color: colors.gold,
  },
});
