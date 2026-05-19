import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { colors, spacing, typography } from '@/theme';

// ─── Activity catalogs (docs/06_훈련_일정.md) ──────────────────────────────

interface Activity {
  key: string;
  label: string;
  desc: string;
  effect: string;
  expect?: string;
  risk?: string;
}

const DISCIPLE_ACTIVITIES: Activity[] = [
  { key: 'martial', label: '무공 수련', desc: '지정 무공 진전', effect: '지정 무공 진전 +10~15%', expect: '천부 적성일 때 효과 ↑' },
  { key: 'basics', label: '기초 다지기', desc: '내공·체력 누적', effect: '내공·체력 +5', expect: '꾸준할수록 효과 ↑' },
  { key: 'meditation', label: '명상', desc: '깨달음 누적, 정체기 도움', effect: '깨달음 +5', expect: '정체기에 효과 큼' },
  { key: 'pair', label: '합공 수련', desc: '다른 제자와 합동, 친밀도 ↑', effect: '친밀도 ↑↑, 합공 경험 +', expect: '짝 제자 필요' },
  { key: 'fusion', label: '응용 수련', desc: '무공 결합 시도', effect: '응용 경험 +, 깨달음 가능', risk: '실패 시 정체' },
  { key: 'seclusion', label: '폐관 수련', desc: '단기 폭증, 위험 동반', effect: '단기 ↑↑', risk: '주화입마 위험' },
  { key: 'quest', label: '의뢰 파견', desc: '강호 실전 경험', effect: '실전 경험 +, 보수', risk: '부상 위험' },
  { key: 'rest', label: '휴식', desc: '회복, 친밀도, 성격 안정', effect: '체력 회복, 친밀도 ↑' },
];

const MASTER_ACTIVITIES: Activity[] = [
  { key: 'lecture', label: '공통 강의', desc: '모든 제자 약한 가르침', effect: '모든 제자 경험치 ↑', expect: '분위기 「도의」 소폭 상승' },
  { key: 'direct', label: '개별 직강', desc: '1명 집중 가르침', effect: '지정 제자 성장 ↑↑' },
  { key: 'admin', label: '사문 운영', desc: '비용 절감, 분위기 안정', effect: '비용 -10%, 분위기 안정' },
  { key: 'master-meditation', label: '사부 명상', desc: '사부 통찰·연륜 ↑', effect: '통찰 ↑, 연륜 ↑' },
  { key: 'visit', label: '마을 방문', desc: '정보·새 인연·의뢰 갱신', effect: '새 의뢰 / 정보 / 인연' },
  { key: 'reply', label: '서신 응대', desc: '졸업 제자 답신', effect: '신뢰도 유지' },
  { key: 'study', label: '비급 연구', desc: '연구 큐 가속', effect: '연구 진행 +' },
  { key: 'appraise', label: '비급 감별', desc: '입수 직후 정밀 감별', effect: '비급 등급 확인' },
  { key: 'copy', label: '사본 작성', desc: '거래용 사본 제작', effect: '거래용 사본 +1' },
];

const SLOT_LABEL: Record<string, string> = { am: '오전', pm: '오후' };

// ─── Screen ────────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const { target, slot, kind } = useLocalSearchParams<{
    target: string;
    slot?: string;
    kind?: string;
  }>();
  const isMaster = kind === 'master';
  const activities = isMaster ? MASTER_ACTIVITIES : DISCIPLE_ACTIVITIES;
  const [selected, setSelected] = useState<Activity>(activities[0]);

  const slotLabel = SLOT_LABEL[slot ?? 'am'] ?? '오전';
  const targetLabel = isMaster ? '사부' : target ?? '';

  const handleConfirm = () => {
    if (!isMaster && selected.key === 'martial') {
      router.replace(`/martial-art/${target}?slot=${slot ?? 'am'}` as Href);
    } else {
      router.back();
    }
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header title={`${targetLabel} — ${slotLabel} 일정`} />
        <Text style={styles.subtitle}>활동을 선택하세요.</Text>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {activities.map((a, idx) => (
              <Cell
                key={a.key}
                index={idx + 1}
                activity={a}
                selected={a.key === selected.key}
                onPress={() => setSelected(a)}
              />
            ))}
          </View>
          <View style={styles.detailPanel}>
            <Text style={styles.detailHeadline}>선택: {selected.label}</Text>
            {selected.expect ? <DetailRow label="진행 예상" value={selected.expect} /> : null}
            <DetailRow label="효과" value={selected.effect} />
            {selected.risk ? <DetailRow label="위험도" value={selected.risk} /> : null}
          </View>
        </ScrollView>
        <Footer onConfirm={handleConfirm} />
      </PaperCard>
    </SafetyZone>
  );
}

function Header({ title }: { title: string }) {
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
          {title}
        </Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function Cell({
  index,
  activity,
  selected,
  onPress,
}: {
  index: number;
  activity: Activity;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.cellWrap]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={activity.label}
      accessibilityState={{ selected }}
    >
      <View style={[styles.cell, selected && styles.cellSelected]}>
        <View style={styles.cellIcon} />
        <Text style={styles.cellLabel} numberOfLines={1}>
          {index}. {activity.label}
        </Text>
        <Text style={styles.cellDesc} numberOfLines={2}>
          {activity.desc}
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

function Footer({ onConfirm }: { onConfirm: () => void }) {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.cancelButton} onPress={() => router.back()} accessibilityRole="button">
        <Text style={styles.cancelLabel}>취소</Text>
      </Pressable>
      <Pressable style={styles.confirmButton} onPress={onConfirm} accessibilityRole="button">
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
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.sm },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: '25%',
    padding: 3,
  },
  cell: {
    aspectRatio: 0.85,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  cellSelected: {
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  cellIcon: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 2,
  },
  cellLabel: {
    fontFamily: typography.serifBold,
    fontSize: 11,
    color: colors.ink,
    textAlign: 'center',
  },
  cellDesc: {
    fontFamily: typography.serif,
    fontSize: 9,
    color: colors.inkSoft,
    textAlign: 'center',
  },

  detailPanel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    padding: spacing.sm,
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
