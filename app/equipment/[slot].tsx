import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  EquipmentActions,
  EquipmentHeader,
  EquipmentList,
  type EquipmentCandidate,
} from '@/components/equipment';
import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABEL,
  type EquipmentSlotKey,
} from '@/data/labels';
import { colors, spacing, typography } from '@/theme';

// 사용자 시안 결 (image-cache/4.png) — 장비 슬롯 단일 상세.
// 슬롯 간 전환은 라우트 파라미터로 (이 화면은 한 슬롯 집중).

// ─── Placeholder data ──────────────────────────────────────────────────────

interface EquippedView {
  name: string;
  hanjaName: string;
  grade: number;
  effects: string;
}

const SLOT_EQUIPPED_PLACEHOLDER: Partial<Record<EquipmentSlotKey, EquippedView>> = {
  weapon: {
    name: '청룡검',
    hanjaName: '靑龍劍',
    grade: 4,
    effects: '공격 +12 · 민첩 +3',
  },
};

const SLOT_CANDIDATES_PLACEHOLDER: Partial<Record<EquipmentSlotKey, readonly EquipmentCandidate[]>> = {
  weapon: [
    { id: 'cheongryong', name: '청룡검', grade: 4, effects: '공격 +12 · 민첩 +3', equipped: true },
    { id: 'cheolgeom', name: '철검', grade: 3, effects: '공격 +8' },
    { id: 'gogeom', name: '고검', grade: 3, effects: '공격 +7 · 기력 +2' },
    { id: 'dando', name: '단도', grade: 2, effects: '공격 +6 · 민첩 +2' },
    { id: 'mokgeom', name: '목검', grade: 1, effects: '공격 +3' },
  ],
};

function isSlotKey(v: string | undefined): v is EquipmentSlotKey {
  return v != null && (EQUIPMENT_SLOTS as readonly string[]).includes(v);
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function EquipmentScreen() {
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const slotKey: EquipmentSlotKey = isSlotKey(slot) ? slot : 'weapon';

  const equipped = SLOT_EQUIPPED_PLACEHOLDER[slotKey] ?? {
    name: '미장착',
    hanjaName: '—',
    grade: 0,
    effects: '효과 없음',
  };
  const candidates = SLOT_CANDIDATES_PLACEHOLDER[slotKey] ?? [];

  const handleEquip = (id: string) => {
    // 추후: 스토어 업데이트
    void id;
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header slotLabel={EQUIPMENT_SLOT_LABEL[slotKey]} onBack={() => router.back()} />
        <View style={styles.body}>
          <EquipmentHeader
            name={equipped.name}
            hanjaName={equipped.hanjaName}
            grade={equipped.grade}
            effects={equipped.effects}
          />
          <EquipmentList candidates={candidates} onEquip={handleEquip} />
        </View>
        <View style={styles.footer}>
          <EquipmentActions onUnequip={() => router.back()} onClose={() => router.back()} />
        </View>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ slotLabel, onBack }: { slotLabel: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{slotLabel}</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },

  body: {
    flex: 1,
    gap: spacing.base,
    paddingVertical: spacing.sm,
  },

  footer: {
    paddingTop: spacing.sm,
  },
});
