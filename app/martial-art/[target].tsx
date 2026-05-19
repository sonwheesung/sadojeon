import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ──────────────────────────────────────────────────────

type Fit = '천부' | '상성' | '무난' | '불상' | '상극';

interface Art {
  key: string;
  name: string;
  rating: number;
  ratingMax: number;
  stage: number;
  stageMax: number;
  progress: number; // 0-100
  fit: Fit;
  kind: string;
  feature: string;
  effect: string;
}

const ARTS: Art[] = [
  {
    key: 'cheongsan',
    name: '청산검법',
    rating: 3,
    ratingMax: 5,
    stage: 3,
    stageMax: 5,
    progress: 65,
    fit: '천부',
    kind: '검법 (외공)',
    feature: '검기 날카로움, 빠른 연마에 특화',
    effect: '외공 공격 ↑, 치명 확률 ↑',
  },
  {
    key: 'undae',
    name: '운대검법',
    rating: 2,
    ratingMax: 5,
    stage: 2,
    stageMax: 5,
    progress: 40,
    fit: '상성',
    kind: '검법',
    feature: '균형 잡힌 검술, 다재다능',
    effect: '공격 +, 방어 +',
  },
  {
    key: 'baekosim',
    name: '백오심법',
    rating: 3,
    ratingMax: 5,
    stage: 3,
    stageMax: 5,
    progress: 20,
    fit: '무난',
    kind: '심법 (내공)',
    feature: '내공 누적에 안정적',
    effect: '내공 +, 회복 ↑',
  },
  {
    key: 'daedeungpa',
    name: '대등파공법',
    rating: 1,
    ratingMax: 5,
    stage: 1,
    stageMax: 5,
    progress: 10,
    fit: '불상',
    kind: '권법',
    feature: '강력하나 신체 적성 필요',
    effect: '근접 공격 ↑↑, 기력 소모 ↑',
  },
  {
    key: 'hyunmu',
    name: '현무도',
    rating: 2,
    ratingMax: 5,
    stage: 2,
    stageMax: 5,
    progress: 5,
    fit: '상극',
    kind: '도법',
    feature: '제자 적성과 충돌',
    effect: '효율 ↓ — 권장하지 않음',
  },
];

const FIT_COLOR: Record<Fit, string> = {
  천부: colors.seal,
  상성: colors.green,
  무난: colors.inkLight,
  불상: colors.inkSoft,
  상극: colors.red,
};

// ─── Screen ────────────────────────────────────────────────────────────────

export default function MartialArtScreen() {
  const { target } = useLocalSearchParams<{ target: string; slot?: string }>();
  const [selected, setSelected] = useState<Art>(ARTS[0]);

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <Text style={styles.subtitle}>
          {target ?? '제자'}가 수련할 무공을 선택하세요.
        </Text>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <TableHead />
          {ARTS.map((a) => (
            <ArtRow
              key={a.key}
              art={a}
              selected={a.key === selected.key}
              onPress={() => setSelected(a)}
            />
          ))}
          <View style={styles.detailPanel}>
            <Text style={styles.detailHeadline}>{selected.name}</Text>
            <DetailRow label="종류" value={selected.kind} />
            <DetailRow label="특징" value={selected.feature} />
            <DetailRow label="효과" value={selected.effect} />
          </View>
        </ScrollView>
        <Footer />
      </PaperCard>
    </SafetyZone>
  );
}

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
          무공 수련 — 무공 선택
        </Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function TableHead() {
  return (
    <View style={styles.tableHead}>
      <Text style={[styles.headText, styles.colName]}>무공</Text>
      <Text style={[styles.headText, styles.colStage]}>단계</Text>
      <Text style={[styles.headText, styles.colProg]}>진행도</Text>
      <Text style={[styles.headText, styles.colFit]}>배합</Text>
    </View>
  );
}

function ArtRow({
  art,
  selected,
  onPress,
}: {
  art: Art;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.colName}>
        <Text style={styles.rowName} numberOfLines={1}>
          {art.name}
        </Text>
        <Text style={styles.rowRating}>
          {art.rating}/{art.ratingMax}
        </Text>
      </View>
      <Text style={[styles.rowText, styles.colStage]}>
        {art.stage}단
      </Text>
      <Text style={[styles.rowText, styles.colProg]}>{art.progress}%</Text>
      <View style={[styles.fitTag, { borderColor: FIT_COLOR[art.fit] }, styles.colFit]}>
        <Text style={[styles.fitLabel, { color: FIT_COLOR[art.fit] }]} numberOfLines={1}>
          {art.fit}
        </Text>
      </View>
    </Pressable>
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

function Footer() {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.cancelButton} onPress={() => router.back()} accessibilityRole="button">
        <Text style={styles.cancelLabel}>취소</Text>
      </Pressable>
      <Pressable
        style={styles.confirmButton}
        onPress={() => router.back()}
        accessibilityRole="button"
      >
        <Text style={styles.confirmLabel}>확인</Text>
      </Pressable>
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
  titleKr: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    paddingBottom: spacing.xs,
  },
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm },

  tableHead: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  headText: {
    fontFamily: typography.serifMedium,
    fontSize: 10,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  colName: { flex: 2 },
  colStage: { flex: 1 },
  colProg: { flex: 1 },
  colFit: { flex: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  rowSelected: {
    backgroundColor: colors.paperBright,
  },
  rowName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  rowRating: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  rowText: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
    textAlign: 'center',
  },
  fitTag: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 36,
  },
  fitLabel: {
    fontFamily: typography.serifBold,
    fontSize: 10,
  },

  detailPanel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: 4,
  },
  detailHeadline: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginBottom: 4,
  },
  detailRow: { flexDirection: 'row', gap: spacing.xs },
  detailLabel: {
    width: 50,
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

  footer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  confirmButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.paperBright,
  },
});
