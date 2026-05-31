import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useMasterStore } from '@/stores/masterStore';
import { useSectStore } from '@/stores/sectStore';
import { colors, spacing, typography } from '@/theme';

export const SECT_STATUS_MIN_HEIGHT = 130;

// 사문 등급 — 사문 평판 0~100 → 6단계
function sectRankLabel(reputation: number): string {
  if (reputation >= 90) return '명문 사문';
  if (reputation >= 70) return '일류 사문';
  if (reputation >= 50) return '이류 사문';
  if (reputation >= 30) return '삼류 사문';
  if (reputation >= 10) return '무명 사문';
  return '신생 사문';
}

// 자산 (동화) → 금/은/동화 환산. 1금화 = 10은화 = 1000동화. docs/09.
function splitCoin(totalCopper: number): { gold: number; silver: number; copper: number } {
  const gold = Math.floor(totalCopper / 1000);
  const rest = totalCopper - gold * 1000;
  const silver = Math.floor(rest / 100);
  const copper = rest - silver * 100;
  return { gold, silver, copper };
}

export function SectStatus() {
  const master = useMasterStore((s) => s.master);
  const sect = useSectStore((s) => s.sect);
  const discipleCount = useDiscipleStore((s) => s.order.length);

  const stats = master?.stats;
  const coin = splitCoin(sect?.resources ?? 0);
  const rank = sectRankLabel(sect?.reputation ?? 0);

  const discipline = [
    { name: '통찰', value: stats ? `${stats.insight}/5` : '-' },
    { name: '연륜', value: stats ? `${stats.experience}/5` : '-' },
    { name: '위엄', value: stats ? `${stats.authority}/5` : '-' },
    { name: '인망', value: stats ? `${stats.prestige}/5` : '-' },
  ];

  const mood = [
    { name: '제자', value: `${discipleCount}명` },
    { name: '결속', value: '-' },
    { name: '도의', value: '-' },
    { name: '균열', value: '-' },
  ];

  const assets = [
    { name: '금화', value: coin.gold.toLocaleString() },
    { name: '은화', value: coin.silver.toLocaleString() },
    { name: '동화', value: coin.copper.toLocaleString() },
  ];

  return (
    <View style={styles.section}>
      <SectionLabel>사문 상태</SectionLabel>
      <View style={styles.columns}>
        <Column label="사부 수양">
          {discipline.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 분위기">
          {mood.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 자산">
          {assets.map((r) => (
            <StatRow key={r.name} {...r} />
          ))}
        </Column>
        <Column label="사문 등급">
          <Text style={styles.rank} numberOfLines={2}>
            {rank}
          </Text>
        </Column>
      </View>
    </View>
  );
}

function Column({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.columnBody}>{children}</View>
    </View>
  );
}

function StatRow({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: SECT_STATUS_MIN_HEIGHT,
  },
  column: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  columnLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    textAlign: 'center',
  },
  columnBody: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statName: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  statValue: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  rank: {
    flex: 1,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
