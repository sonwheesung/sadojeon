import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ───────────────────────────────────────────────────────

const MASTER_INFLUENCE = 3; // 사부 인망
const MASTER_INSIGHT = 3; // 사부 통찰

type QuestGrade = '잡일' | '소무' | '보통' | '위험' | '극험';
const GRADES: QuestGrade[] = ['잡일', '소무', '보통', '위험', '극험'];
const GRADE_SHORT: Record<QuestGrade, string> = {
  잡일: '잡',
  소무: '소',
  보통: '보',
  위험: '위',
  극험: '극',
};
const GRADE_DANGEROUS: Record<QuestGrade, boolean> = {
  잡일: false,
  소무: false,
  보통: false,
  위험: true,
  극험: true,
};

interface ActiveQuest {
  id: string;
  grade: QuestGrade;
  headline: string;
  assigned: string;
  progress: string;
}

interface Quest {
  id: string;
  grade: QuestGrade;
  headline: string;
  client: string;
  preview: string;
  reward: string;
  danger: string;
  deadline: string;
  recommended: string;
  gray?: boolean; // 도덕적 회색 의뢰
}

const ACTIVE_QUESTS: ActiveQuest[] = [
  {
    id: 'active-bandit',
    grade: '위험',
    headline: '산적 토벌 — 강북 산길',
    assigned: '백호 · 2주째 진행',
    progress: '3주차 / 4주 예정',
  },
  {
    id: 'active-missing',
    grade: '보통',
    headline: '실종자 수색 — 황도촌',
    assigned: '윤소소 · 1주째 진행',
    progress: '1주차 / 3주 예정',
  },
];

const NEW_QUESTS: Quest[] = [
  {
    id: 'q-market',
    grade: '잡일',
    headline: '시장 짐 운반',
    client: '마을 노점',
    preview: '사흘간 짐 옮길 일손이 필요합니다.',
    reward: '동 5냥',
    danger: '위험 없음',
    deadline: '3일 안',
    recommended: '추천 1명',
  },
  {
    id: 'q-hwanghwa',
    grade: '보통',
    headline: '황화촌 실종자 수색',
    client: '황화촌 촌장',
    preview: '사흘 전부터 행상이 돌아오지 않습니다.',
    reward: '은 8냥',
    danger: '부상 가능',
    deadline: '2주 안',
    recommended: '추천 1-2명',
  },
  {
    id: 'q-heuksa',
    grade: '위험',
    headline: '흑사파 거점 정찰',
    client: '익명',
    preview: '강남 봉기 정보. 정탐만 가능합니다.',
    reward: '은 30냥 + 비급',
    danger: '중상 가능',
    deadline: '1계절',
    recommended: '추천 2명',
  },
  {
    id: 'q-hyeolsu',
    grade: '극험',
    headline: '사파 거물 추적',
    client: '무림맹',
    preview: "악명 자객 '혈수'의 행적을 추적해 주시오.",
    reward: '금 2냥 + 비급 3/5',
    danger: '사망 가능',
    deadline: '1계절',
    recommended: '추천 2-3명',
  },
  {
    id: 'q-secret',
    grade: '위험',
    headline: '은밀한 처리',
    client: '도시 권력자',
    preview: '조용히 처리해 주시면 후사하겠습니다.',
    reward: '금 1냥',
    danger: '인망 ↓ 가능',
    deadline: '2주 안',
    recommended: '추천 1명',
    gray: true,
  },
];

type FilterKey = 'all' | QuestGrade;
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  ...GRADES.map((g) => ({ key: g as FilterKey, label: g })),
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function QuestScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const activeFiltered = useMemo(
    () => (filter === 'all' ? ACTIVE_QUESTS : ACTIVE_QUESTS.filter((q) => q.grade === filter)),
    [filter],
  );
  const newFiltered = useMemo(
    () => (filter === 'all' ? NEW_QUESTS : NEW_QUESTS.filter((q) => q.grade === filter)),
    [filter],
  );

  const onRefreshBoard = () => {
    // TODO: 마을 방문 → 게시판 갱신. /village 라우트 또는 별도 액션.
  };
  const onCleanExpired = () => {
    // TODO: 만료·거절 의뢰 일괄 정리.
  };
  const onPressActive = (_id: string) => {
    // TODO: 진행 중 의뢰 상세 (파견 제자 상태, 중간 보고).
  };
  const onPressNew = (_id: string) => {
    // TODO: 의뢰 상세 → 파견 결정 화면.
  };

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <Header influence={MASTER_INFLUENCE} insight={MASTER_INSIGHT} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <BannerSlot />
          <FilterTabs current={filter} onChange={setFilter} />

          {activeFiltered.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <SectionLabel>진행 중 의뢰</SectionLabel>
                <Text style={styles.subText}>{activeFiltered.length}건</Text>
              </View>
              {activeFiltered.map((q) => (
                <ActiveCard key={q.id} quest={q} onPress={() => onPressActive(q.id)} />
              ))}
            </>
          )}

          {newFiltered.length > 0 && (
            <>
              <View style={styles.sectionHead}>
                <SectionLabel>새 의뢰</SectionLabel>
                <Text style={styles.subText}>{newFiltered.length}건 신규</Text>
              </View>
              {newFiltered.map((q) => (
                <QuestCard key={q.id} quest={q} onPress={() => onPressNew(q.id)} />
              ))}
            </>
          )}

          {activeFiltered.length === 0 && newFiltered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>해당 등급의 의뢰가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
        <ActionRow onRefresh={onRefreshBoard} onClean={onCleanExpired} />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({ influence, insight }: { influence: number; insight: number }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          의뢰
        </Text>
        <Text style={styles.headerTitleCn} numberOfLines={1}>
          (依賴)
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerMeta}>사부 인망 {influence}/5</Text>
        <Text style={styles.headerMeta}>사부 통찰 {insight}/5</Text>
      </View>
    </View>
  );
}

function BannerSlot() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerLabel}>의뢰 게시판 베너 자리</Text>
    </View>
  );
}

function FilterTabs({
  current,
  onChange,
}: {
  current: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {FILTERS.map((f) => {
        const active = f.key === current;
        const isDanger = f.key !== 'all' && GRADE_DANGEROUS[f.key as QuestGrade];
        return (
          <Pressable
            key={f.key}
            accessibilityRole="button"
            accessibilityLabel={f.label}
            onPress={() => onChange(f.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{f.label}</Text>
            {isDanger && <View style={styles.tabDot} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ActiveCard({ quest, onPress }: { quest: ActiveQuest; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`진행 중 의뢰 ${quest.headline}`}
      style={styles.card}
    >
      <GradeBox grade={quest.grade} />
      <View style={styles.cardBody}>
        <Text style={styles.cardHeadline} numberOfLines={1}>
          {quest.headline}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {quest.assigned}
        </Text>
        <Text style={styles.cardLine} numberOfLines={1}>
          {quest.progress}
        </Text>
      </View>
      <View style={styles.activeBadge}>
        <Text style={styles.activeBadgeLabel}>진행 중</Text>
      </View>
    </Pressable>
  );
}

function QuestCard({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  const dangerous = GRADE_DANGEROUS[quest.grade];
  const warn = dangerous || quest.gray;
  const tagLabel = quest.gray ? `${quest.grade}·회색` : quest.grade;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${quest.grade} 등급 의뢰 ${quest.headline}`}
      style={styles.card}
    >
      <GradeBox grade={quest.grade} warn={warn} />
      <View style={styles.cardBody}>
        <Text style={styles.cardHeadline} numberOfLines={1}>
          {quest.headline}
          <Text style={styles.cardHeadlineSub}> — {quest.client}</Text>
        </Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {quest.preview}
        </Text>
        <Text style={[styles.cardFooter, quest.gray && styles.cardFooterWarn]} numberOfLines={2}>
          {quest.reward} · {quest.danger} · {quest.deadline} · {quest.recommended}
        </Text>
      </View>
      <View style={[styles.gradeTag, warn && styles.gradeTagWarn]}>
        <Text style={[styles.gradeTagLabel, warn && styles.gradeTagLabelWarn]}>{tagLabel}</Text>
      </View>
    </Pressable>
  );
}

function GradeBox({ grade, warn }: { grade: QuestGrade; warn?: boolean }) {
  return (
    <View style={[styles.gradeBox, warn && styles.gradeBoxWarn]}>
      <Text style={[styles.gradeBoxChar, warn && styles.gradeBoxCharWarn]}>
        {GRADE_SHORT[grade]}
      </Text>
    </View>
  );
}

function ActionRow({ onRefresh, onClean }: { onRefresh: () => void; onClean: () => void }) {
  return (
    <View style={styles.actionRow}>
      <ActionButton label="마을 방문 — 게시판 갱신" onPress={onRefresh} />
      <ActionButton label="거절·만료 정리" onPress={onClean} />
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.actionButton}
    >
      <Text style={styles.actionLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const BANNER_ASPECT = 16 / 9;
const GRADE_BOX_SIZE = 36;

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexShrink: 1,
  },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerTitleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  headerMeta: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },

  // Body / scroll
  body: {
    flex: 1,
  },
  bodyContent: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },

  // Banner
  banner: {
    width: '100%',
    aspectRatio: BANNER_ASPECT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  bannerLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Filter tabs
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.inkSoft,
    borderStyle: 'dashed',
  },
  tabActive: {
    backgroundColor: colors.ink,
    borderStyle: 'solid',
    borderColor: colors.ink,
  },
  tabLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    color: colors.paperBright,
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.seal,
  },

  // Section head
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  subText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Card (공용 — 진행 중·새 의뢰)
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardHeadline: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  cardHeadlineSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  cardSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  cardLine: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  cardPreview: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    lineHeight: 16,
  },
  cardFooter: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    marginTop: 2,
  },
  cardFooterWarn: {
    color: colors.seal,
  },

  // Grade box
  gradeBox: {
    width: GRADE_BOX_SIZE,
    height: GRADE_BOX_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBoxWarn: {
    borderColor: colors.seal,
  },
  gradeBoxChar: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  gradeBoxCharWarn: {
    color: colors.seal,
  },

  // Grade tag
  gradeTag: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  gradeTagWarn: {
    borderColor: colors.seal,
  },
  gradeTagLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  gradeTagLabelWarn: {
    color: colors.seal,
  },

  // Active badge
  activeBadge: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  activeBadgeLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Empty
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
});
