import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { LlmToggleCard } from '@/components/sect/LlmToggleCard';
import { useAuthStore } from '@/stores/authStore';
import { useMasterStore } from '@/stores/masterStore';
import { useSectStore } from '@/stores/sectStore';
import { colors, radius, spacing, typography } from '@/theme';

// 사문 탭 — 사문·스승에 대한 정보. (구 서신함 탭 자리)
// 사부 카드(→ 사부 상세), 사문 등급, 실험 기능(LLM), 설정(로그아웃).
// 사문 분위기(도의·결속)는 숨김 변수 — 여기에도 노출하지 않는다 (feedback_hidden_game_state).

// 사문 등급 — 평판 0~100 → 6단계.
function sectRankLabel(reputation: number): string {
  if (reputation >= 90) return '명문 사문';
  if (reputation >= 70) return '일류 사문';
  if (reputation >= 50) return '이류 사문';
  if (reputation >= 30) return '삼류 사문';
  if (reputation >= 10) return '무명 사문';
  return '신생 사문';
}

export default function SectScreen() {
  const sect = useSectStore((s) => s.sect);
  const master = useMasterStore((s) => s.master);
  const confirm = useConfirm();
  const signOut = useAuthStore((s) => s.signOut);

  const rank = sectRankLabel(sect?.reputation ?? 0);

  const onLogout = async () => {
    const ok = await confirm({
      title: '로그아웃',
      message: '로그아웃하시겠습니까? 다음에 아이디·비밀번호로 다시 로그인해야 합니다.',
      confirmLabel: '로그아웃',
      tone: 'danger',
    });
    if (ok) signOut();
  };

  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <AppHeader />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.identity}>
            <Text style={styles.sectName}>{sect?.name ?? '무명산'}</Text>
            <Text style={styles.sectHanja}>({sect?.hanjaName ?? '無名山'})</Text>
            <Text style={styles.rank}>{rank}</Text>
          </View>

          <View style={styles.section}>
            <SectionLabel>사부</SectionLabel>
            <Pressable
              style={({ pressed }) => [styles.masterCard, pressed && styles.pressed]}
              onPress={() => router.push('/master' as Href)}
              accessibilityRole="button"
              accessibilityLabel="사부 상세"
            >
              <View style={styles.masterPortrait} />
              <View style={styles.masterInfo}>
                <Text style={styles.masterName}>{master?.name ?? '사부'}</Text>
                <Text style={styles.masterSub} numberOfLines={1}>
                  통찰·연륜·위엄·인망을 닦는다
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <SectionLabel>사문 시설</SectionLabel>
            <Pressable
              style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
              onPress={() => router.push('/alchemy' as Href)}
              accessibilityRole="button"
              accessibilityLabel="연단실"
            >
              <Text style={styles.settingLabel}>연단실 — 영약 제조</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <SectionLabel>실험 기능</SectionLabel>
            <LlmToggleCard />
          </View>

          <View style={styles.section}>
            <SectionLabel>설정</SectionLabel>
            <Pressable
              style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
              onPress={onLogout}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
            >
              <Text style={styles.settingLabel}>로그아웃</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.base },

  identity: { alignItems: 'center', gap: 2, paddingVertical: spacing.sm },
  sectName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  sectHanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  rank: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.brown,
    marginTop: 4,
  },

  section: { gap: spacing.sm },

  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  masterPortrait: {
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
  },
  masterInfo: { flex: 1, gap: 2 },
  masterName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  masterSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.base,
  },
  settingLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },

  chevron: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.lg,
    color: colors.inkSoft,
  },
  pressed: { opacity: 0.7 },
});
