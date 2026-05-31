import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import {
  TAKE_IN_THRESHOLD,
  useEncounterStore,
  type Encounter,
} from '@/stores/encounterStore';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ───────────────────────────────────────────────────────

const VILLAGE = { kr: '산하촌', cn: '山下村' };
const MASTER_INSIGHT = 3; // 사부 통찰 ★. 1~5
const STAY_DAYS = 3;

// 재능 5축은 내부에 결정되어 있으나 그레이박스 단계에선 UI에 노출 X.
// (docs/03_제자_시스템.md — "그레이박스 단계의 정보 노출 정책")
const INITIAL_ENCOUNTER: Encounter = {
  name: '강가아이',
  realName: null,
  ageEstimate: 13,
  talents: { 체능: 3, 기력: null, 민첩: 2, 오성: null, 심성: 2 },
  personality: '과묵 · 호기심 적음',
  origin: '부모 없음, 강가에서 발견',
  affinity: 50,
};

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function VillageScreen() {
  const dateLabel = useGameDateLabel();
  const current = useEncounterStore((s) => s.current);
  const setCurrent = useEncounterStore((s) => s.setCurrent);
  const reset = useEncounterStore((s) => s.reset);
  const confirm = useConfirm();

  useEffect(() => {
    if (!current) setCurrent(INITIAL_ENCOUNTER);
  }, [current, setCurrent]);

  const encounter = current ?? INITIAL_ENCOUNTER;

  const onLeave = async () => {
    const ok = await confirm({
      title: '이 만남을 떠날까요?',
      message: `${encounter.name}와(과)의 만남을 정리하고 마을을 떠납니다.`,
      confirmLabel: '떠나기',
      tone: 'danger',
    });
    if (!ok) return;
    reset();
    router.back();
  };
  const onTakeIn = async () => {
    const ok = await confirm({
      title: '제자로 거둘까요?',
      message: `${encounter.name}을(를) 사문에 거둡니다.`,
      confirmLabel: '거두기',
    });
    if (!ok) return;
    if (encounter.affinity >= TAKE_IN_THRESHOLD) {
      // TODO: discipleStore.addFromEncounter(encounter) — 슬롯 합류 처리
      Alert.alert(
        '거두기 성공',
        `${encounter.name}이(가) 사부를 따른다.`,
        [{ text: '확인', onPress: () => { reset(); router.back(); } }],
      );
    } else {
      Alert.alert(
        '거두기 실패',
        '아이는 사부를 따르지 않았다.\n호감을 더 쌓아야 한다.',
      );
    }
  };
  const onTalk = () => {
    router.push('/dialogue' as Href);
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header insight={MASTER_INSIGHT} date={dateLabel} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <BannerSlot />
          <View style={styles.sectionHead}>
            <SectionLabel>오늘의 만남</SectionLabel>
            <Text style={styles.subText}>{STAY_DAYS}일째 머무는 중</Text>
          </View>
          <EncounterPanel encounter={encounter} />
        </ScrollView>
        <ActionFooter onLeave={onLeave} onTakeIn={onTakeIn} onTalk={onTalk} />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({ insight, date }: { insight: number; date: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backLabel}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {VILLAGE.kr}
        </Text>
        <Text style={styles.headerTitleCn} numberOfLines={1}>
          ({VILLAGE.cn})
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerMeta}>사부 통찰 {insight}/5</Text>
        <Text style={styles.headerMeta}>{date}</Text>
      </View>
    </View>
  );
}

function BannerSlot() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerLabel}>마을 풍경 베너 자리</Text>
    </View>
  );
}

function EncounterPanel({ encounter }: { encounter: Encounter }) {
  return (
    <View style={styles.panel}>
      <View style={styles.encounterRow}>
        <View style={styles.portrait}>
          <Text style={styles.slotHint}>초상</Text>
        </View>
        <View style={styles.encounterInfo}>
          <Text style={styles.encounterName} numberOfLines={1}>
            {encounter.name}
          </Text>
          <Text style={styles.encounterSub} numberOfLines={1}>
            {encounter.realName ? encounter.realName : '본명 모름'} ·{' '}
            {encounter.ageEstimate}세 추정
          </Text>

          <Text style={styles.subLabel}>성격 (관찰 기록)</Text>
          <Text style={styles.bodyText}>{encounter.personality}</Text>

          <Text style={styles.subLabel}>출신 메모</Text>
          <Text style={styles.bodyText}>{encounter.origin}</Text>
        </View>
      </View>
    </View>
  );
}

function ActionFooter({
  onLeave,
  onTakeIn,
  onTalk,
}: {
  onLeave: () => void;
  onTakeIn: () => void;
  onTalk: () => void;
}) {
  // 거두기 버튼은 항상 활성. 호감도 임계값은 UI에 노출하지 않고
  // 시도 결과(Alert)로만 사부에게 드러난다. (docs/03_제자_시스템.md)
  return (
    <View style={styles.footer}>
      <ActionButton label="떠나기" onPress={onLeave} />
      <ActionButton label="거두기" onPress={onTakeIn} big />
      <ActionButton label="대화하기" onPress={onTalk} />
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  big,
  disabled,
}: {
  label: string;
  onPress: () => void;
  big?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.actionButton,
        big && styles.actionButtonBig,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.actionLabel,
          big && styles.actionLabelBig,
          disabled && styles.actionLabelDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const PORTRAIT_SIZE = 96;
const BANNER_ASPECT = 16 / 9;

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
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  backButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  backLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  headerTitle: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerTitleCn: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
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
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  // Banner placeholder
  banner: {
    width: '100%',
    aspectRatio: BANNER_ASPECT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Section
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },

  // Encounter panel
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    padding: spacing.sm,
  },
  encounterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  portrait: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotHint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  encounterInfo: {
    flex: 1,
    gap: 2,
  },
  encounterName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  encounterSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    marginBottom: 4,
  },
  subLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    marginTop: 6,
  },
  bodyText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Footer actions
  footer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonBig: {
    height: 72,
    borderRadius: 36,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonMuted: {
    opacity: 0.55,
  },
  actionLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  actionLabelBig: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    letterSpacing: typography.letterSpacing.wide,
  },
  actionLabelDisabled: {
    color: colors.inkSoft,
  },
  actionLabelMuted: {
    color: colors.inkSoft,
  },
});
