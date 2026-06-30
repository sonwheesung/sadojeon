import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { useDiscipleStore } from '@/stores/discipleStore';
import { colors, spacing, typography } from '@/theme';
import type { Disciple, RelationLevel } from '@/types';

// 제자 상세 「인연」 패널 — 그 제자가 다른 동문을 어떻게 보는가(d.relationships, 본인 관점·비대칭).
// docs/33 §7. 단계 라벨만 노출(관찰 가능한 사회적 사실), 무관(neutral)은 숨김.

type RelKey = Exclude<RelationLevel, 'neutral'>;

const RELATION_LABEL: Record<RelKey, string> = {
  sworn: '의형제',
  friend: '친밀',
  distant: '소원',
  enemy: '원수',
};

// 정 깊은 순(노출 정렬).
const RELATION_ORDER: RelKey[] = ['sworn', 'friend', 'distant', 'enemy'];
const WARM: ReadonlySet<RelKey> = new Set<RelKey>(['sworn', 'friend']);

export function DiscipleRelationsPanel({ disciple }: { disciple: Disciple }) {
  const disciples = useDiscipleStore((s) => s.disciples);

  // 무관 제외 + 이름이 조회되는 상대만. (졸업·하산해도 이름이 남아 있으면 인연으로 보여준다.)
  const rels = Object.entries(disciple.relationships ?? {})
    .filter(([otherId, lvl]) => lvl !== 'neutral' && !!disciples[otherId])
    .map(([otherId, lvl]) => ({ otherId, name: disciples[otherId].name, level: lvl as RelKey }))
    .sort((a, b) => RELATION_ORDER.indexOf(a.level) - RELATION_ORDER.indexOf(b.level));

  return (
    <View style={styles.section}>
      <SectionLabel>인연</SectionLabel>
      {rels.length === 0 ? (
        <Text style={styles.empty}>아직 특별한 인연이 없다.</Text>
      ) : (
        <View style={styles.list}>
          {rels.map((r) => (
            <View key={r.otherId} style={styles.row}>
              <Text style={styles.name} numberOfLines={1}>
                {r.name}
              </Text>
              <Text
                style={[styles.level, WARM.has(r.level) ? styles.warm : styles.cold]}
                accessibilityLabel={`${r.name} — ${RELATION_LABEL[r.level]}`}
              >
                {RELATION_LABEL[r.level]}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
    paddingHorizontal: spacing.xs,
  },
  list: { gap: spacing.xs, paddingHorizontal: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  level: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  warm: { color: colors.ink },
  cold: { color: colors.seal },
});
