import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography, radius } from '@/theme';
import { starText } from '@/data/labels';

export interface EquipmentCandidate {
  id: string;
  name: string;
  grade: number; // 1~5
  effects: string;
  equipped?: boolean;
}

interface EquipmentListProps {
  candidates: readonly EquipmentCandidate[];
  onEquip: (id: string) => void;
}

// 장비 슬롯 — 후보 아이템 목록. 시안 결 (5개 행, 현재 장착 강조).
export function EquipmentList({ candidates, onEquip }: EquipmentListProps) {
  return (
    <View style={styles.panel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {candidates.map((item) => (
          <CandidateRow key={item.id} item={item} onEquip={onEquip} />
        ))}
      </ScrollView>
    </View>
  );
}

function CandidateRow({
  item,
  onEquip,
}: {
  item: EquipmentCandidate;
  onEquip: (id: string) => void;
}) {
  return (
    <View style={[styles.row, item.equipped && styles.rowEquipped]}>
      <View style={styles.icon} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.star}>{starText(item.grade)}</Text>
        </View>
        <Text style={styles.effects} numberOfLines={1}>
          {item.effects}
        </Text>
      </View>
      <Pressable
        style={styles.equipButton}
        onPress={() => onEquip(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} 장착`}
      >
        <Text style={styles.equipLabel}>장착</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    backgroundColor: colors.paperLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  rowEquipped: {
    backgroundColor: colors.paperBright,
  },
  icon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
  },
  info: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  star: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  effects: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  equipButton: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  equipLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
});
