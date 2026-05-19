import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, spacing, typography } from '@/theme';

export const DISCIPLE_CARD_WIDTH = 96;

// Placeholder data. Replace with discipleStore lookups when wiring up.
interface DisciplePlaceholder {
  id: string;
  name: string;
  year: number;
  skill: string;
  state: string;
  trust: string;
}

const DISCIPLES: DisciplePlaceholder[] = [
  { id: 'dukgo-yeon', name: '독고연', year: 2, skill: '대검술 3/5', state: '수련중', trust: '신뢰 3/5' },
  { id: 'i-cheongha', name: '이청하', year: 1, skill: '검법 2/5', state: '면담대기', trust: '신뢰 2/5' },
  { id: 'gang-soyul', name: '강소율', year: 3, skill: '장법 4/5', state: '수련중', trust: '신뢰 3/5' },
];
const CAPACITY = 8;

export function DiscipleRoster() {
  const hasOpenSlot = DISCIPLES.length < CAPACITY;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <SectionLabel>제자 현황</SectionLabel>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push('/schedule')}
          accessibilityRole="button"
          accessibilityLabel="일정 변경"
        >
          <Text style={styles.editLabel}>일정 변경 ▶</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {DISCIPLES.map((d) => (
          <DiscipleCard key={d.id} {...d} />
        ))}
        {hasOpenSlot && <EmptyCard />}
      </ScrollView>
    </View>
  );
}

function DiscipleCard({ id, name, year, skill, state, trust }: DisciplePlaceholder) {
  return (
    <Pressable
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${name} 상세`}
      onPress={() => router.push(`/disciple/${id}`)}
    >
      <View style={styles.portrait} />
      <Text style={styles.cardName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        입문 {year}년차
      </Text>
      <Text style={styles.cardLine} numberOfLines={1}>
        {skill}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        {state}
      </Text>
      <Text style={styles.cardLine} numberOfLines={1}>
        {trust}
      </Text>
    </Pressable>
  );
}

function EmptyCard() {
  return (
    <Pressable
      onPress={() => router.push('/village' as Href)}
      accessibilityRole="button"
      accessibilityLabel="마을 방문하여 새 제자 영입"
      style={[styles.card, styles.cardEmpty]}
    >
      <Text style={styles.emptyLabel}>+ 영입</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  editLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  card: {
    width: DISCIPLE_CARD_WIDTH,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
  },
  cardEmpty: {
    opacity: 0.6,
    justifyContent: 'center',
    minHeight: 140,
  },
  portrait: {
    width: '70%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    marginBottom: 2,
  },
  cardName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
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
  emptyLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
