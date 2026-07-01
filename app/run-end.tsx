import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  useCodexStore,
  useDiscipleStore,
  useGameStore,
  useMasterStore,
  useSectStore,
  useTimeStore,
} from '@/stores';
import {
  evaluateGraduation,
  GRADE_LABEL,
  GRADE_STARS,
  mainArtSummary,
} from '@/systems/graduationSystem';
import { endRun } from '@/systems/runLifecycle';
import type { Disciple, Season } from '@/types';
import { colors, spacing, typography } from '@/theme';

// 회차 종결 화면 — docs/16_회차_다회차.md "다회차 — 사문은 영속, 사부는 한 일생"
// 사부 사망(timeSystem) → phase='ended' → (tabs)/index 에서 자동 진입.
// [다음 회차 시작] → endRun + phase='playing' + 메인 복귀 (master null 이라 StartSelectModal 자동).

const SEASON_LABEL: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

export default function RunEndScreen() {
  const sect = useSectStore((s) => s.sect);
  const master = useMasterStore((s) => s.master);
  const order = useDiscipleStore((s) => s.order);
  const disciples = useDiscipleStore((s) => s.disciples);
  const scrollCount = useCodexStore((s) => s.scrolls.length);
  const time = useTimeStore((s) => s.current);
  const confirm = useConfirm();

  const list: Disciple[] = order
    .map((id) => disciples[id])
    .filter((d): d is Disciple => d != null);

  const sectName = sect?.name ?? '무명산문';
  const masterName = master?.name ?? '?';
  const masterHanja = master?.hanjaName ?? '?';
  const tenureYears = master?.yearsAsMaster ?? 0;
  const insightStars = master?.stats.insight ?? 0;
  const endLabel = `${time.year}년차 ${SEASON_LABEL[time.season]}`;

  const onStartNextRun = async () => {
    const ok = await confirm({
      title: '다음 회차를 시작할까요?',
      message:
        '이 사부의 일생이 끝납니다. 비급만 다음 사부에게 인계되고, 연구·영약·금고·사부 스탯은 초기화됩니다.',
      confirmLabel: '다음 회차',
      tone: 'danger',
    });
    if (!ok) return;
    endRun();
    useGameStore.getState().setPhase('playing');
    router.replace('/(tabs)');
  };

  return (
    <SafetyZone variant="stack" background={colors.background}>
      <PaperCard>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <Text style={styles.sectMeta} numberOfLines={1}>
            {`${sectName} · ${endLabel} 사부의 마지막 날`}
          </Text>

          <MasterEpitaph
            name={masterName}
            hanjaName={masterHanja}
            insightStars={insightStars}
            tenureYears={tenureYears}
          />

          <DiscipleList list={list} />

          <CarryoverGrid scrollCount={scrollCount} />

          <Aphorism />
        </ScrollView>
        <FooterButtons onStartNextRun={onStartNextRun} />
      </PaperCard>
    </SafetyZone>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>輸{`\n`}轉</Text>
      </View>
      <View style={styles.titleWrap}>
        <Text style={styles.titleHanja}>一代</Text>
        <Text style={styles.title}>사문의 한 일생</Text>
      </View>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>傳{`\n`}記</Text>
      </View>
    </View>
  );
}

function MasterEpitaph({
  name,
  hanjaName,
  insightStars,
  tenureYears,
}: {
  name: string;
  hanjaName: string;
  insightStars: number;
  tenureYears: number;
}) {
  return (
    <View style={styles.epitaphPanel}>
      <View style={styles.epitaphRow}>
        <View style={styles.masterSilhouette}>
          <Text style={styles.placeholderLabel}>좌선{`\n`}사부</Text>
        </View>
        <View style={styles.epitaphInfo}>
          <View style={styles.epitaphNameRow}>
            <Text style={styles.masterName}>{name}</Text>
            <Text style={styles.masterHanja}>{`(${hanjaName})`}</Text>
          </View>
          <Text style={styles.epitaphMeta}>{`통찰 ${insightStars}/5`}</Text>
          <Text style={styles.epitaphMeta}>{`사부 재직 ${tenureYears}년`}</Text>
          <View style={styles.epitaphSeal} />
        </View>
      </View>
      <Text style={styles.epitaphLine}>
        말이 묻힌 두루마리, 마음 닿는 사람만 길어 마심.
      </Text>
    </View>
  );
}

function DiscipleList({ list }: { list: Disciple[] }) {
  return (
    <View style={styles.discipleSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>거쳐간 제자</Text>
        <Text style={styles.sectionMeta}>{`총 ${list.length}명`}</Text>
      </View>
      <View style={styles.discipleList}>
        {list.length === 0 ? (
          <Text style={styles.emptyText}>거두지 못한 회차였다.</Text>
        ) : (
          list.map((d, idx) => (
            <DiscipleRow key={d.id} disciple={d} last={idx === list.length - 1} />
          ))
        )}
      </View>
    </View>
  );
}

function DiscipleRow({ disciple, last }: { disciple: Disciple; last: boolean }) {
  // 몰래 하산한 제자 — 졸업 등급 없이 회수 한 줄(docs/51 R3). 선한 아이는 부고를 듣고 조용히 다녀간다
  // (docs/03 §응답 성향 ⑤ 카타르시스 — 라이브 귀환 불가라 엔딩 몽타주 비트로).
  if (disciple.status === 'runaway') {
    return (
      <View style={[styles.discipleRow, last && styles.discipleRowLast, styles.discipleRowDim]}>
        <View style={[styles.discipleAvatar, styles.discipleAvatarDim]} />
        <View style={styles.discipleBody}>
          <Text style={[styles.discipleName, styles.discipleNameDim]} numberOfLines={1}>
            {disciple.name}
          </Text>
          <Text style={styles.discipleMeta} numberOfLines={2}>
            몰래 산을 내려갔다. 훗날 사부의 부고를 듣고 조용히 다녀갔다더라.
          </Text>
        </View>
        <View style={styles.gradeWrap}>
          <Text style={[styles.gradeValue, styles.gradeValueDim]}>—</Text>
        </View>
      </View>
    );
  }
  const grade = evaluateGraduation(disciple);
  const stars = GRADE_STARS[grade];
  const dim = stars <= 1;
  const highlight = stars >= 5;
  return (
    <View
      style={[
        styles.discipleRow,
        last && styles.discipleRowLast,
        dim && styles.discipleRowDim,
      ]}
    >
      <View style={[styles.discipleAvatar, dim && styles.discipleAvatarDim]} />
      <View style={styles.discipleBody}>
        <Text
          style={[styles.discipleName, dim && styles.discipleNameDim]}
          numberOfLines={1}
        >
          {disciple.name}
        </Text>
        <Text style={styles.discipleMeta} numberOfLines={1}>
          {`${mainArtSummary(disciple)} · ${GRADE_LABEL[grade]}`}
        </Text>
      </View>
      <View style={styles.gradeWrap}>
        {highlight ? <View style={styles.gradeSeal} /> : null}
        <Text style={[styles.gradeValue, dim && styles.gradeValueDim]}>
          {`${stars}/5`}
        </Text>
      </View>
    </View>
  );
}

function CarryoverGrid({ scrollCount }: { scrollCount: number }) {
  const carryover = [
    `누적 비급 ${scrollCount}권`,
    '거두지 못한 인연 기록',
  ];
  const lost = [
    '연구 진행도 · 영약 잔량',
    '금고 · 사문 등급',
    '사부 4스탯 (모두 초기화)',
  ];

  return (
    <View style={styles.carryoverRow}>
      <View style={styles.carryoverCard}>
        <Text style={styles.carryoverCardTitle}>다음 사부에게 인계</Text>
        {carryover.map((line) => (
          <Text key={line} style={styles.carryoverItem} numberOfLines={1}>
            · {line}
          </Text>
        ))}
      </View>
      <View style={styles.carryoverDivider}>
        <Text style={styles.carryoverDividerLabel}>비급만{`\n`}영속</Text>
      </View>
      <View style={styles.carryoverCard}>
        <Text style={styles.carryoverCardTitle}>회차와 함께 사라짐</Text>
        {lost.map((line) => (
          <Text key={line} style={styles.carryoverItem} numberOfLines={1}>
            · {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Aphorism() {
  return (
    <Text style={styles.aphorism}>
      비급은 남고, 사부는 간다. 같은 비급으로 다른 강호 미래를 그려 보십시오.
    </Text>
  );
}

function FooterButtons({ onStartNextRun }: { onStartNextRun: () => void }) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={styles.footerStart}
        onPress={onStartNextRun}
        accessibilityRole="button"
        accessibilityLabel="다음 회차 시작"
      >
        <Text style={styles.footerStartLabel}>다음 회차 시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerSeal: {
    width: 36,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSealLabel: {
    textAlign: 'center',
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
    lineHeight: 12,
  },
  titleWrap: { flex: 1, alignItems: 'center', gap: 2 },
  titleHanja: {
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },

  sectMeta: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },

  epitaphPanel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  epitaphRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  masterSilhouette: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  epitaphInfo: { flex: 1, gap: 2, position: 'relative' },
  epitaphNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  masterName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  masterHanja: {
    fontFamily: typography.serifCN,
    fontSize: 11,
    color: colors.inkSoft,
  },
  epitaphMeta: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  epitaphSeal: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: 2,
  },
  epitaphLine: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    fontStyle: 'italic',
  },

  discipleSection: { gap: spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  sectionMeta: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  discipleList: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  emptyText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  discipleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  discipleRowLast: { borderBottomWidth: 0 },
  discipleRowDim: { opacity: 0.55 },
  discipleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
  },
  discipleAvatarDim: { borderColor: colors.inkSoft },
  discipleBody: { flex: 1, gap: 2 },
  discipleName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  discipleNameDim: { color: colors.inkSoft },
  discipleMeta: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  gradeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  gradeSeal: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.seal,
    opacity: 0.18,
  },
  gradeValue: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  gradeValueDim: { color: colors.inkSoft },

  carryoverRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'stretch',
  },
  carryoverCard: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    gap: 4,
  },
  carryoverCardTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  carryoverItem: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkLight,
  },
  carryoverDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  carryoverDividerLabel: {
    textAlign: 'center',
    fontFamily: typography.serifMedium,
    fontSize: 10,
    color: colors.seal,
    lineHeight: 12,
  },

  aphorism: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },

  placeholderLabel: {
    fontFamily: typography.serif,
    fontSize: 9,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.sm,
  },
  footerStart: {
    height: 44,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerStartLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.paperBright,
    letterSpacing: typography.letterSpacing.wide,
  },
});
