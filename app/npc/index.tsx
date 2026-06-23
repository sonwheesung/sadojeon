import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  NPC_FACTIONS,
  NPC_FACTION_LABEL,
  type NpcFaction,
  type RunNpc,
} from '@/data/npcs';
import { useNpcStore } from '@/stores/npcStore';
import { useMetNpcStore } from '@/stores/metNpcStore';
import { meetAllNpcs } from '@/systems/npcEncounter';
import { colors, radius, spacing, typography } from '@/theme';

// 도감 공개 규칙(포켓몬 결) — 공개 인물(ageKnown)은 강호에 이름나 기본 공개,
// 베일 인물(사파·마교 핵심)은 강호에서 만나야(met) 실루엣이 벗겨진다. docs/24·38.
function isRevealed(npc: RunNpc, met: string[]): boolean {
  return npc.ageKnown || met.includes(npc.id);
}

// 네임드 도감 — 강호 화면 [도감] 진입. 회차별 살아있는 상태(npcStore) 기준.
// 세력 카테고리 탭 + 2열 그리드(직급순). 사망·멸망은 흐리게.
export default function NpcCodexScreen() {
  const [faction, setFaction] = useState<NpcFaction>('right');
  const npcs = useNpcStore((s) => s.npcs);
  const seedDefaults = useNpcStore((s) => s.seedDefaults);
  const met = useMetNpcStore((s) => s.met);

  // 비어 있으면(구 회차 등) 기본 시드 — 화면이 비지 않게.
  useEffect(() => {
    if (npcs.length === 0) seedDefaults();
  }, [npcs.length, seedDefaults]);

  const list = useMemo(
    () =>
      npcs
        .filter((n) => n.faction === faction)
        .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name)),
    [npcs, faction],
  );

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header />
        <View style={styles.tabs}>
          {NPC_FACTIONS.map((f) => {
            const active = f === faction;
            return (
              <Pressable
                key={f}
                onPress={() => setFaction(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {NPC_FACTION_LABEL[f]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <Text style={styles.empty}>아직 알려진 인물이 없다.</Text>
          ) : (
            <>
              <View style={styles.progressRow}>
                <Text style={styles.progress}>
                  만남 {list.filter((n) => isRevealed(n, met)).length} / {list.length}
                </Text>
                {__DEV__ ? (
                  <Pressable onPress={() => meetAllNpcs()} hitSlop={6} accessibilityRole="button">
                    <Text style={styles.devBtn}>전체 만남(개발)</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.grid}>
                {list.map((npc) => (
                  <NpcCard key={npc.id} npc={npc} revealed={isRevealed(npc, met)} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
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
        <Text style={styles.title}>강호 도감</Text>
        <Text style={styles.titleCn}>江湖圖鑑</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function NpcCard({ npc, revealed }: { npc: RunNpc; revealed: boolean }) {
  // 미발견(베일) — 실루엣 카드. 세력(탭)만 알 뿐 정체는 가린다.
  if (!revealed) {
    return (
      <Pressable
        style={[styles.card, styles.cardLocked]}
        onPress={() => router.push(`/npc/${npc.id}` as Href)}
        accessibilityRole="button"
        accessibilityLabel="아직 만나지 못한 인물"
      >
        <View style={styles.portrait}>
          <Text style={styles.silhouette}>?</Text>
        </View>
        <Text style={styles.affiliation} numberOfLines={1}>
          베일에 싸인 인물
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          ???
        </Text>
      </Pressable>
    );
  }
  const gone = npc.status !== 'active'; // 사망·멸망
  const statusLabel = npc.status === 'dead' ? '사망' : npc.status === 'fallen' ? '멸문' : null;
  return (
    <Pressable
      style={[styles.card, gone && styles.cardGone]}
      onPress={() => router.push(`/npc/${npc.id}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${npc.name} 상세`}
    >
      <View style={styles.portrait}>
        <Text style={styles.portraitLabel}>초상</Text>
      </View>
      <Text style={styles.affiliation} numberOfLines={1}>
        {npc.affiliation}
      </Text>
      <Text style={styles.npcTitle} numberOfLines={1}>
        {npc.title}
      </Text>
      <Text style={styles.name} numberOfLines={1}>
        {npc.name}
      </Text>
      {statusLabel ? <Text style={styles.statusLabel}>{statusLabel}</Text> : null}
    </Pressable>
  );
}

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
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  titleCn: {
    fontFamily: typography.serifCN,
    fontSize: 10,
    color: colors.inkSoft,
  },

  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.paperBright,
    borderStyle: 'solid',
    borderColor: colors.seal,
  },
  tabLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  tabLabelActive: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },

  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47.5%', // 2열
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  portrait: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  portraitLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  affiliation: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  npcTitle: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  cardGone: {
    opacity: 0.45,
  },
  cardLocked: {
    opacity: 0.6,
    backgroundColor: colors.paperLight,
  },
  silhouette: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.inkSoft,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  progress: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  devBtn: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.seal,
    textDecorationLine: 'underline',
  },
  statusLabel: {
    fontFamily: typography.serifBold,
    fontSize: 10,
    color: colors.seal,
  },
});
