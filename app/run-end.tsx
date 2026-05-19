import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { endRun } from '@/systems/runLifecycle';
import { colors, spacing, typography } from '@/theme';

// 시안: docs/references/run-end-mockup.png
// 사양: docs/16_회차_다회차.md "다회차 — 사문은 영속, 사부는 한 일생"
// 그레이박스 단계 — 데이터는 placeholder, 일러스트는 dashed.

// ─── Placeholder data ─────────────────────────────────────────────────────

const SECT_META = {
  sectName: '운림산문',
  runLabel: '제3회차',
  endLabel: '18년 마지막 겨울',
};

const MASTER_EPITAPH = {
  name: '임청허',
  hanjaName: '林淸虛',
  insightStars: 4,
  tenureYears: 18,
  line: '말이 묻힌 두루마리, 마음 닿는 사람만 길어 마심.',
};

interface DiscipleRecord {
  id: string;
  name: string;
  stage: string;
  route: string;
  region: string;
  grade: number; // 0~5
}

const DISCIPLES: DiscipleRecord[] = [
  { id: 'd1', name: '진백호', stage: '화경', route: '의적', region: '강남 일대', grade: 5 },
  { id: 'd2', name: '장철강', stage: '대성', route: '정파 협객', region: '하북 표국', grade: 4 },
  { id: 'd3', name: '윤소소', stage: '소성', route: '서원', region: '강남 어른', grade: 3 },
  { id: 'd4', name: '독고연', stage: '대성', route: '의적', region: '천하 외전', grade: 4 },
  { id: 'd5', name: '옥향', stage: '입문', route: '회색', region: '낙척 강호', grade: 2 },
  { id: 'd6', name: '서윤우', stage: '입문', route: '미정', region: '행방 묘연', grade: 1 },
  { id: 'd7', name: '아화', stage: '미도달', route: '하산 거부', region: '소식 없음', grade: 0 },
];

const REPLIED = ['진백호', '장철강', '독고연'];
const UNREPLIED = ['서윤우', '아화', '기타 3명'];

const CARRYOVER = [
  '누적 비급 23권',
  '도감 발견 42 / 250',
  '사문 건물 일부 유지',
  '거두지 못한 인연 기록',
];

const LOST = [
  '영약 잔량',
  '금고 은 24냥',
  '사문 등급',
  '사부 4스탯 (모두 초기화)',
  '후원자 채널 3종',
];

// ─── Screen ────────────────────────────────────────────────────────────────

export default function RunEndScreen() {
  const onStartNextRun = () => {
    endRun();
    router.replace('/slot-select');
  };

  const onViewRecord = () => {
    // 후속: 회차 기록 보기 화면. 그레이박스 단계에서는 동작 없음.
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
          <SectMeta />
          <MasterEpitaph />
          <DiscipleList />
          <DispatchPanel />
          <CarryoverGrid />
          <Aphorism />
        </ScrollView>
        <FooterButtons onViewRecord={onViewRecord} onStartNextRun={onStartNextRun} />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

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

function SectMeta() {
  return (
    <Text style={styles.sectMeta} numberOfLines={1}>
      {`${SECT_META.sectName} · ${SECT_META.runLabel} · ${SECT_META.endLabel}`}
    </Text>
  );
}

// ─── Master epitaph ───────────────────────────────────────────────────────

function MasterEpitaph() {
  return (
    <View style={styles.epitaphPanel}>
      <View style={styles.epitaphRow}>
        <View style={styles.masterSilhouette}>
          <Text style={styles.placeholderLabel}>좌선{`\n`}사부</Text>
        </View>
        <View style={styles.epitaphInfo}>
          <View style={styles.epitaphNameRow}>
            <Text style={styles.masterName}>{MASTER_EPITAPH.name}</Text>
            <Text style={styles.masterHanja}>{`(${MASTER_EPITAPH.hanjaName})`}</Text>
          </View>
          <Text style={styles.epitaphMeta}>{`통찰 단계 ${MASTER_EPITAPH.insightStars}단계`}</Text>
          <Text style={styles.epitaphMeta}>{`사부 재직 기간 ${MASTER_EPITAPH.tenureYears}년`}</Text>
          <View style={styles.epitaphSeal} />
        </View>
      </View>
      <Text style={styles.epitaphLine}>{MASTER_EPITAPH.line}</Text>
    </View>
  );
}

// ─── Disciple list ────────────────────────────────────────────────────────

function DiscipleList() {
  return (
    <View style={styles.discipleSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>거쳐간 제자</Text>
        <Text style={styles.sectionMeta}>{`총 ${DISCIPLES.length}명`}</Text>
      </View>
      <View style={styles.discipleList}>
        {DISCIPLES.map((d, idx) => (
          <DiscipleRow key={d.id} record={d} last={idx === DISCIPLES.length - 1} />
        ))}
      </View>
    </View>
  );
}

function DiscipleRow({ record, last }: { record: DiscipleRecord; last: boolean }) {
  const dim = record.grade <= 1;
  const highlight = record.grade >= 5;
  return (
    <View style={[styles.discipleRow, last && styles.discipleRowLast, dim && styles.discipleRowDim]}>
      <View style={[styles.discipleAvatar, dim && styles.discipleAvatarDim]} />
      <View style={styles.discipleBody}>
        <Text style={[styles.discipleName, dim && styles.discipleNameDim]} numberOfLines={1}>
          {record.name}
        </Text>
        <Text style={styles.discipleMeta} numberOfLines={1}>
          {`무공 도달 ${record.stage} · 노선 ${record.route} · 강호 좌표 ${record.region}`}
        </Text>
      </View>
      <View style={styles.gradeWrap}>
        {highlight ? <View style={styles.gradeSeal} /> : null}
        <Text style={[styles.gradeValue, dim && styles.gradeValueDim]}>{`${record.grade}/5`}</Text>
      </View>
    </View>
  );
}

// ─── Dispatch panel ───────────────────────────────────────────────────────

function DispatchPanel() {
  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>임종 직전 닿은 소식</Text>
      <View style={styles.dispatchRow}>
        <View style={styles.dispatchCard}>
          <Text style={styles.dispatchCardTitle}>답이 온 제자</Text>
          {REPLIED.map((name) => (
            <Text key={name} style={styles.dispatchItem} numberOfLines={1}>
              · {name}
            </Text>
          ))}
        </View>
        <View style={styles.dispatchCard}>
          <Text style={styles.dispatchCardTitle}>끝내 닿지 않은 이름</Text>
          {UNREPLIED.map((name) => (
            <Text key={name} style={styles.dispatchItem} numberOfLines={1}>
              · {name}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Carryover grid ───────────────────────────────────────────────────────

function CarryoverGrid() {
  return (
    <View style={styles.carryoverRow}>
      <View style={styles.carryoverCard}>
        <Text style={styles.carryoverCardTitle}>다음 사부에게 인계</Text>
        {CARRYOVER.map((line) => (
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
        {LOST.map((line) => (
          <Text key={line} style={styles.carryoverItem} numberOfLines={1}>
            · {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Aphorism ─────────────────────────────────────────────────────────────

function Aphorism() {
  return (
    <Text style={styles.aphorism}>
      비급은 남고, 사부는 간다. 같은 비급으로 다른 강호 미래를 그려 보십시오.
    </Text>
  );
}

// ─── Footer buttons ───────────────────────────────────────────────────────

function FooterButtons({
  onViewRecord,
  onStartNextRun,
}: {
  onViewRecord: () => void;
  onStartNextRun: () => void;
}) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={styles.footerRecord}
        onPress={onViewRecord}
        accessibilityRole="button"
        accessibilityLabel="회차 기록 보기"
      >
        <Text style={styles.footerRecordLabel}>회차 기록 보기</Text>
      </Pressable>
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

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Body
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  // Header
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

  // Sect meta
  sectMeta: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },

  // Epitaph
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

  // Disciple section
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

  // Sub-section (dispatch)
  subSection: { gap: spacing.xs },
  subSectionTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  dispatchRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dispatchCard: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    gap: 4,
  },
  dispatchCardTitle: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  dispatchItem: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkLight,
  },

  // Carryover grid
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

  // Aphorism
  aphorism: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },

  // Footer buttons
  placeholderLabel: {
    fontFamily: typography.serif,
    fontSize: 9,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerRecord: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRecordLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  footerStart: {
    flex: 1.4,
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
