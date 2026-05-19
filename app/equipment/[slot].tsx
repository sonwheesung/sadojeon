import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

// ─── Slot keys / labels ────────────────────────────────────────────────────

const SLOT_KEYS = ['weapon', 'top', 'bottom', 'talisman', 'potion', 'pouch'] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

const SLOT_LABEL: Record<SlotKey, string> = {
  weapon: '무구',
  top: '상의',
  bottom: '하의',
  talisman: '호신부',
  potion: '단약',
  pouch: '호신낭',
};

function isSlotKey(v: string | undefined): v is SlotKey {
  return v != null && (SLOT_KEYS as readonly string[]).includes(v);
}

// ─── Placeholder data ──────────────────────────────────────────────────────

const DISCIPLE = { name: '독고연', hanja: '獨孤衍' };
const RATING_MAX = 5;

const EQUIPPED = {
  name: '청룡검',
  hanja: '青龍劍',
  rating: 4,
  effects: ['검술 진전 속도 ↑', '위엄 +1', '기력 소모 -5%'],
};

interface InventoryItem {
  id: string;
  name: string;
  hanja: string;
  rating: number;
  summary: string;
  equipped?: boolean;
}

const INVENTORY: InventoryItem[] = [
  { id: 'cheongryong', name: '청룡검', hanja: '青龍劍', rating: 3, summary: '검술 진전 속도 ↑, 위엄 +1', equipped: true },
  { id: 'baekyeong', name: '백영도', hanja: '白影刀', rating: 3, summary: '기력 +10, 치명 +3%' },
  { id: 'pacheon', name: '파천창', hanja: '破天槍', rating: 3, summary: '공격력 +5, 방어력 -3%' },
  { id: 'hyunmu', name: '현무검', hanja: '玄武劍', rating: 2, summary: '내공 회복 속도 ↑' },
  { id: 'cheolmok', name: '철목검', hanja: '鐵木劍', rating: 2, summary: '내구도 회복 속도 ↑' },
  { id: 'cheonggang', name: '청강검', hanja: '青鋼劍', rating: 1, summary: '검법 숙련 속도 ↑' },
];

const DETAIL = {
  name: '청룡검',
  hanja: '青龍劍',
  equipEffects: ['검술 진전 속도 +15%', '위엄 +1', '기력 소모 -5%'],
  useEffect: '3초간 공격력 +10 (재사용 대기 30초)',
  specialEffect: '사부 신뢰도가 높을수록 위엄 효과 증가',
  source: '의뢰 보상 - 「강호인연」 완료',
  condition: '검법 수련 입문 이상',
};

// ─── Screen ────────────────────────────────────────────────────────────────

export default function EquipmentScreen() {
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const initial: SlotKey = isSlotKey(slot) ? slot : 'weapon';
  const [active, setActive] = useState<SlotKey>(initial);

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <CategoryTabs active={active} onChange={setActive} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <EquippedPanel />
          <InventorySection />
          <DetailSection />
        </ScrollView>
        <ActionRow />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.titleKr} numberOfLines={1}>
          {DISCIPLE.name}
        </Text>
        <Text style={styles.titleHanja} numberOfLines={1}>
          ({DISCIPLE.hanja})
        </Text>
      </View>
      <View style={styles.headerSeal} />
    </View>
  );
}

// ─── Category tabs ─────────────────────────────────────────────────────────

function CategoryTabs({
  active,
  onChange,
}: {
  active: SlotKey;
  onChange: (k: SlotKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {SLOT_KEYS.map((k) => {
        const isActive = k === active;
        return (
          <Pressable
            key={k}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              numberOfLines={1}
            >
              {SLOT_LABEL[k]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Equipped panel ────────────────────────────────────────────────────────

function EquippedPanel() {
  return (
    <View style={styles.equippedPanel}>
      <View style={styles.equippedIcon} />
      <View style={styles.equippedInfo}>
        <View style={styles.equippedTitle}>
          <Text style={styles.equippedName} numberOfLines={1}>
            {EQUIPPED.name}
          </Text>
          <Text style={styles.equippedHanja} numberOfLines={1}>
            ({EQUIPPED.hanja})
          </Text>
        </View>
        <Text style={styles.equippedRating}>
          등급 {EQUIPPED.rating}/{RATING_MAX}
        </Text>
        {EQUIPPED.effects.map((e) => (
          <Text key={e} style={styles.equippedEffect} numberOfLines={1}>
            {e}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────

function InventorySection() {
  return (
    <View style={styles.section}>
      <SectionLabel>보유 아이템</SectionLabel>
      <View style={styles.invList}>
        {INVENTORY.map((it) => (
          <InventoryRow key={it.id} {...it} />
        ))}
      </View>
    </View>
  );
}

function InventoryRow({ name, hanja, rating, summary, equipped }: InventoryItem) {
  return (
    <Pressable style={styles.invRow} accessibilityRole="button">
      <View style={styles.invIcon} />
      <View style={styles.invInfo}>
        <View style={styles.invTitleRow}>
          <Text style={styles.invName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.invHanja} numberOfLines={1}>
            ({hanja})
          </Text>
        </View>
        <Text style={styles.invSummary} numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <View style={styles.invMeta}>
        <Text style={styles.invRating}>
          {rating}/{RATING_MAX}
        </Text>
        {equipped ? <View style={styles.invEquippedSeal} /> : null}
      </View>
    </Pressable>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────

function DetailSection() {
  return (
    <View style={styles.detailPanel}>
      <View style={styles.detailHeadlineRow}>
        <Text style={styles.detailName}>{DETAIL.name}</Text>
        <Text style={styles.detailHanja}>({DETAIL.hanja})</Text>
      </View>
      <DetailRow label="장착 효과" value={DETAIL.equipEffects.join(', ')} />
      <DetailRow label="사용 효과" value={DETAIL.useEffect} />
      <DetailRow label="특수 효과" value={DETAIL.specialEffect} />
      <View style={styles.detailDivider} />
      <DetailRow label="획득처" value={DETAIL.source} />
      <DetailRow label="사용 조건" value={DETAIL.condition} />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ─── Action row ───────────────────────────────────────────────────────────

function ActionRow() {
  return (
    <View style={styles.actionRow}>
      <FooterButton label="편집" />
      <FooterButton label="장착" flex primary />
      <FooterButton label="비교" flex />
      <FooterButton label="해제" flex />
    </View>
  );
}

function FooterButton({
  label,
  flex,
  primary,
}: {
  label: string;
  flex?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        flex && styles.actionButtonFlex,
        primary && styles.actionButtonPrimary,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const ICON_SIZE = 56;
const INV_ICON = 32;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  titleKr: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  titleHanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.md,
    color: colors.inkLight,
  },
  headerSeal: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.seal,
    borderRadius: 2,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tabActive: {
    borderStyle: 'solid',
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
  tabLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    fontFamily: typography.serifBold,
    color: colors.paperBright,
  },

  // Body
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  // Equipped panel
  equippedPanel: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  equippedIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  equippedInfo: {
    flex: 1,
    gap: 2,
  },
  equippedTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  equippedName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  equippedHanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  equippedRating: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  equippedEffect: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Section
  section: {
    gap: spacing.xs,
  },

  // Inventory
  invList: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  invIcon: {
    width: INV_ICON,
    height: INV_ICON,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  invInfo: {
    flex: 1,
    gap: 1,
  },
  invTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  invName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  invHanja: {
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
  },
  invSummary: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  invMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invRating: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    width: 28,
    textAlign: 'right',
  },
  invEquippedSeal: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 2,
  },

  // Detail
  detailPanel: {
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    gap: 4,
  },
  detailHeadlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  detailName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  detailHanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  detailLabel: {
    width: 60,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  detailValue: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inkSoft,
    marginVertical: 4,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  actionButton: {
    minWidth: 48,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionButtonFlex: {
    flex: 1,
  },
  actionButtonPrimary: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
  },
  actionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  actionLabelPrimary: {
    color: colors.paperBright,
    fontFamily: typography.serifBold,
  },
});
