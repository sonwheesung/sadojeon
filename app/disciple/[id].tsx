import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import {
  DiscipleHeader,
  DiscipleStatusPanel,
  DiscipleTodayLog,
  MoodPanel,
  StatGrowthPanel,
  TalentPanel,
} from '@/components/disciple';
import { STARTING_DISCIPLE_POOL } from '@/data/disciples/startingPool';
import { useDiscipleStore } from '@/stores';
import { colors, spacing, typography } from '@/theme';
import type { Talents } from '@/types';

// 사용자 시안 결 (image-cache/2.png) + 기존 풍부 정보 통합.
// - 시안 결: 헤더·재능 5축·풍경 텍스트·활동 4버튼
// - 기존 유지: 무공 트리·장비 슬롯·의뢰 기록·기타 스탯

// ─── Placeholder data ──────────────────────────────────────────────────────

const PLACEHOLDER_TALENTS: Talents = {
  body: 3,
  qi: 4,
  agility: 3,
  insight: 5,
  mind: 5,
};

const PLACEHOLDER_MOODS = [
  '마음이 따뜻하다',
  '사형과 친하다',
  '약초를 잘 다룬다',
] as const;

interface Skill {
  name: string;
  current: number; // index into STAGES (0..3)
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

// ─── Screen ────────────────────────────────────────────────────────────────

// 제자 상세는 관찰 화면 — 활동 선택(면담·수련·파견·폐관) 셀렉터는 제거됨.
//   면담 → 일상 이벤트(한 마디·희망·상담)로 대체
//   수련 → 일정 변경(주간 패턴·세부 종목)으로 대체
//   파견 → 의뢰 화면에서 제자 선택
//   폐관 → 이벤트성(벌 선택 / 제자의 폐관 청원)
export default function DiscipleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const fromStore = useDiscipleStore((s) => (id ? s.disciples[id] : undefined));
  const starting = STARTING_DISCIPLE_POOL.find((d) => d.id === id);

  const name = fromStore?.name ?? starting?.name ?? '제자';
  const hanjaName = fromStore?.hanjaName ?? starting?.hanjaName ?? '?';
  const starRank = starting?.starRank ?? 1;
  const talents = fromStore?.talents ?? PLACEHOLDER_TALENTS;
  // 풍경 텍스트 — 추후 통찰 차등 + 시나리오 풀에서. 그레이박스: 고정 placeholder.
  const moods = PLACEHOLDER_MOODS;

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 시안 결 */}
          <DiscipleHeader name={name} hanjaName={hanjaName} starRank={starRank} />
          {fromStore && <DiscipleStatusPanel disciple={fromStore} />}
          {id && <DiscipleTodayLog discipleId={id} />}
          <TalentPanel talents={talents} />
          {fromStore && <StatGrowthPanel disciple={fromStore} />}
          <MoodPanel lines={moods} />

          {/* 기존 그레이박스 유지 */}
          <SkillSection />
          <EquipmentSection />
          <MiscSection />
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
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
        <Text style={styles.title}>제자 상세</Text>
      </View>
      <View style={{ width: 32 }} />
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
              <Text style={[styles.stageKr, !isReached && styles.stageMuted]}>
                {stage.kr}
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

// ─── Styles ────────────────────────────────────────────────────────────────

const NODE_SIZE = 14;
const NODE_FILL = 6;
const EQUIP_SLOT = 44;

const styles = StyleSheet.create({
  // Header ---------------------------------------------------------------
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

  // Body -----------------------------------------------------------------
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.base },

  // Section --------------------------------------------------------------
  section: { gap: spacing.sm },

  // Skill ----------------------------------------------------------------
  skillList: { gap: spacing.sm },
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
  skillLineSpacer: { flex: 1 },
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
  stageKr: {
    marginTop: 2,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
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
  equipmentRow: { flexDirection: 'row', gap: spacing.xs },
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
  miscRow: { flexDirection: 'row', gap: spacing.sm },
  miscCol: { flex: 1, gap: 4 },
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
});
