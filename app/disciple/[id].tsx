import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ──────────────────────────────────────────────────────

interface Profile {
  name: string;
  hanja: string;
  yearLabel: string;
  personality: string;
  talent: string;
  trust: number;
  trustMax: number;
}

const PROFILE: Profile = {
  name: '독고연',
  hanja: '獨孤衍',
  yearLabel: '2년차',
  personality: '과묵·신중',
  talent: '검술 특화',
  trust: 5,
  trustMax: 5,
};

interface Skill {
  name: string;
  current: number; // index into STAGES (0..3); also doubles as max reached when 'reached' is current
  reached: number; // max stage index reached
}

const SKILLS: Skill[] = [
  { name: '기본 검법', current: 0, reached: 3 },
  { name: '신검결', current: 1, reached: 3 },
  { name: '경신보법', current: 0, reached: 1 },
];

const STAGES = [
  { hanja: '入門', kr: '입문' },
  { hanja: '小成', kr: '소성' },
  { hanja: '大成', kr: '대성' },
  { hanja: '化境', kr: '화경' },
] as const;

const EQUIPMENT: { key: string; label: string }[] = [
  { key: 'weapon', label: '무구' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'talisman', label: '호신부' },
  { key: 'potion', label: '단약' },
  { key: 'pouch', label: '호신낭' },
];

const QUESTS = [
  { title: '산적 소탕', result: '성공', when: '3주 전' },
  { title: '실종된 상인 수색', result: '성공', when: '1달 전' },
  { title: '약초 채집', result: '성공', when: '1달 전' },
];

const STATS = [
  { label: '사문 분위기 영향', value: '명운 +5' },
  { label: '깨달음 진척', value: '42 / 100' },
];

const ACTIONS = ['면담', '훈시', '폐관', '일정 변경', '하산 검토'];

// ─── Screen ────────────────────────────────────────────────────────────────

export default function DiscipleDetailScreen() {
  useLocalSearchParams<{ id: string }>(); // id 사용 시점 — store 연결 후

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSection />
          <SkillSection />
          <EquipmentSection />
          <MiscSection />
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
          {PROFILE.name}
        </Text>
        <Text style={styles.titleHanja} numberOfLines={1}>
          ({PROFILE.hanja})
        </Text>
      </View>
      <View style={styles.headerSeal} />
    </View>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────

function ProfileSection() {
  return (
    <View style={styles.profile}>
      <View style={styles.portrait} />
      <View style={styles.profileInfo}>
        <InfoRow label="입문" value={PROFILE.yearLabel} />
        <InfoRow label="성격" value={PROFILE.personality} />
        <InfoRow label="재능" value={PROFILE.talent} />
        <View style={styles.trustRow}>
          <Text style={styles.trustLabel}>사부 신뢰도</Text>
          <Text style={styles.trustValue}>
            {PROFILE.trust}/{PROFILE.trustMax}
          </Text>
          <View style={styles.smallSeal} />
        </View>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Skill tree ────────────────────────────────────────────────────────────

function SkillSection() {
  return (
    <View style={styles.section}>
      <SectionLabel>무공 수련</SectionLabel>
      <View style={styles.skillList}>
        {SKILLS.map((s) => (
          <SkillRow key={s.name} {...s} />
        ))}
      </View>
    </View>
  );
}

function SkillRow({ name, current, reached }: Skill) {
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillName} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.skillTree}>
        {STAGES.map((stage, idx) => {
          const isReached = idx <= reached;
          const isCurrent = idx === current;
          const leftLineFilled = idx <= reached;
          const rightLineFilled = idx < reached;
          return (
            <View key={stage.hanja} style={styles.skillCol}>
              <View style={styles.skillNodeRow}>
                {idx > 0 ? (
                  <View
                    style={[styles.skillLine, !leftLineFilled && styles.skillLineMuted]}
                  />
                ) : (
                  <View style={styles.skillLineSpacer} />
                )}
                <View style={[styles.node, !isReached && styles.nodeUnreached]}>
                  {isReached ? <View style={styles.nodeFill} /> : null}
                </View>
                {idx < STAGES.length - 1 ? (
                  <View
                    style={[styles.skillLine, !rightLineFilled && styles.skillLineMuted]}
                  />
                ) : (
                  <View style={styles.skillLineSpacer} />
                )}
              </View>
              <Text style={[styles.stageHanja, !isReached && styles.stageMuted]}>
                {stage.hanja}
              </Text>
              <Text style={[styles.stageKr, !isReached && styles.stageMuted]}>
                ({stage.kr})
              </Text>
              <View style={[styles.currentDot, !isCurrent && styles.currentDotHidden]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Equipment ─────────────────────────────────────────────────────────────

function EquipmentSection() {
  return (
    <View style={styles.section}>
      <SectionLabel>장비·소지품</SectionLabel>
      <View style={styles.equipmentRow}>
        {EQUIPMENT.map((slot) => (
          <Pressable
            key={slot.key}
            style={styles.equipmentCol}
            onPress={() => router.push(`/equipment/${slot.key}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${slot.label} 슬롯`}
          >
            <View style={styles.equipmentSlot} />
            <Text style={styles.equipmentLabel} numberOfLines={1}>
              {slot.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Misc info ─────────────────────────────────────────────────────────────

function MiscSection() {
  return (
    <View style={styles.section}>
      <SectionLabel>기타 정보</SectionLabel>
      <View style={styles.miscRow}>
        <View style={styles.miscCol}>
          <Text style={styles.miscColLabel}>최근 의뢰 기록</Text>
          {QUESTS.map((q, i) => (
            <View key={q.title} style={styles.questRow}>
              <Text style={styles.questIndex}>{i + 1}.</Text>
              <Text style={styles.questTitle} numberOfLines={1}>
                {q.title}
              </Text>
              <Text style={styles.questResult}>{q.result}</Text>
              <Text style={styles.questWhen}>{q.when}</Text>
            </View>
          ))}
        </View>
        <View style={styles.miscCol}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statRow}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Action row ────────────────────────────────────────────────────────────

function ActionRow() {
  return (
    <View style={styles.actionRow}>
      {ACTIONS.map((label) => (
        <Pressable
          key={label}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => {
            if (label === '일정 변경') router.push('/schedule');
          }}
        >
          <View style={styles.actionIcon} />
          <Text style={styles.actionLabel} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const NODE_SIZE = 14;
const NODE_FILL = 6;
const PORTRAIT_RATIO = 0.42;
const EQUIP_SLOT = 44;

const styles = StyleSheet.create({
  // Header ---------------------------------------------------------------
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

  // Body -----------------------------------------------------------------
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  // Profile --------------------------------------------------------------
  profile: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  portrait: {
    width: `${PORTRAIT_RATIO * 100}%`,
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
    paddingBottom: 2,
  },
  infoLabel: {
    width: 40,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  infoValue: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  trustLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  trustValue: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  smallSeal: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.seal,
    borderRadius: 2,
  },

  // Section --------------------------------------------------------------
  section: {
    gap: spacing.sm,
  },

  // Skill ----------------------------------------------------------------
  skillList: {
    gap: spacing.sm,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  skillName: {
    width: 64,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  skillTree: {
    flex: 1,
    flexDirection: 'row',
  },
  skillCol: {
    flex: 1,
    alignItems: 'center',
  },
  skillNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  skillLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ink,
  },
  skillLineMuted: {
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
  },
  skillLineSpacer: {
    flex: 1,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeUnreached: {
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderWidth: 1,
  },
  nodeFill: {
    width: NODE_FILL,
    height: NODE_FILL,
    borderRadius: NODE_FILL / 2,
    backgroundColor: colors.ink,
  },
  stageHanja: {
    marginTop: 2,
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  stageKr: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  stageMuted: {
    color: colors.inkSoft,
    opacity: 0.5,
  },
  currentDot: {
    marginTop: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.seal,
  },
  currentDotHidden: {
    backgroundColor: 'transparent',
  },

  // Equipment ------------------------------------------------------------
  equipmentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  equipmentCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  equipmentSlot: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: EQUIP_SLOT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  equipmentLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.ink,
  },

  // Misc -----------------------------------------------------------------
  miscRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miscCol: {
    flex: 1,
    gap: 4,
  },
  miscColLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  questIndex: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
    width: 14,
  },
  questTitle: {
    flex: 1,
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.ink,
  },
  questResult: {
    fontFamily: typography.serifMedium,
    fontSize: 10,
    color: colors.ink,
  },
  questWhen: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
    width: 40,
    textAlign: 'right',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
    paddingBottom: 2,
  },
  statLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  statValue: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Action row -----------------------------------------------------------
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  actionIcon: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  actionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: 10,
    color: colors.ink,
  },
});
