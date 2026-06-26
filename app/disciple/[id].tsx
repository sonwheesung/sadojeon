import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { SectionLabel } from '@/components/common/SectionLabel';
import {
  ArcChroniclePanel,
  DiscipleHeader,
  DiscipleStatusPanel,
  DiscipleTodayLog,
  MartialTrainingPanel,
  MoodPanel,
  StatGrowthPanel,
} from '@/components/disciple';
import { DiscipleArt } from '@/components/dialogue/DiscipleArt';
import { STARTING_DISCIPLE_POOL } from '@/data/disciples/startingPool';
import { currentAge } from '@/systems/discipleCtx';
import { useDiscipleStore } from '@/stores';
import { colors, spacing, typography } from '@/theme';

// 사용자 시안 결 (image-cache/2.png) + 기존 풍부 정보 통합.
// - 시안 결: 헤더·재능 5축·풍경 텍스트·활동 4버튼
// - 기존 유지: 무공 트리·장비 슬롯·의뢰 기록·기타 스탯

// ─── Placeholder data ──────────────────────────────────────────────────────

const PLACEHOLDER_MOODS = [
  '마음이 따뜻하다',
  '사형과 친하다',
  '약초를 잘 다룬다',
] as const;

const EQUIPMENT: { key: string; label: string }[] = [
  { key: 'weapon', label: '무구' },
  { key: 'top', label: '상의' },
  { key: 'bottom', label: '하의' },
  { key: 'talisman', label: '호신부' },
  { key: 'potion', label: '단약' },
  { key: 'pouch', label: '호신낭' },
];

// ─── Screen ────────────────────────────────────────────────────────────────

// 제자 상세는 관찰 화면 — 활동 선택(면담·수련·파견·폐관) 셀렉터는 제거됨.
//   면담 → 일상 이벤트(한 마디·희망·상담)로 대체
//   수련 → 일정 변경(주간 패턴·세부 종목)으로 대체
//   파견 → 의뢰 화면에서 제자 선택
//   폐관 → 이벤트성(벌 선택 / 제자의 폐관 청원)
export default function DiscipleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const fromStore = useDiscipleStore((s) => (id ? s.disciples[id] : undefined));
  const starting = STARTING_DISCIPLE_POOL.find((d) => d.id === id);

  const name = fromStore?.name ?? starting?.name ?? '제자';
  const hanjaName = fromStore?.hanjaName ?? starting?.hanjaName ?? '?';
  // 나이 따라 초상 단계 — 어릴 땐 유년, 자라면 청소년→성년(양육 10→25세). 자산 없으면 그레이박스 폴백.
  // 나이는 입문나이+경과연차(currentAge) — 정적 d.age(=입문 10세)가 아니라 실제 나이로.
  const age = fromStore ? currentAge(fromStore) : 15;
  const artStage: 'child' | 'teen' | 'adult' = age < 13 ? 'child' : age >= 20 ? 'adult' : 'teen';
  // 풍경 텍스트 — 추후 통찰 차등 + 시나리오 풀에서. 그레이박스: 고정 placeholder.
  const moods = PLACEHOLDER_MOODS;

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 제자 초상 — 나이 단계별 일러스트(자산 있는 캐릭터만, 없으면 그레이박스) */}
          {id && (
            <View style={styles.portrait}>
              <DiscipleArt poolId={id} name={name} active stage={artStage} crop="upper" size={200} height={240} />
            </View>
          )}

          {/* 시안 결 */}
          <DiscipleHeader name={name} hanjaName={hanjaName} />
          {fromStore && <DiscipleStatusPanel disciple={fromStore} />}
          {id && <DiscipleTodayLog discipleId={id} />}
          {fromStore && <StatGrowthPanel disciple={fromStore} />}
          <MoodPanel lines={moods} />

          {/* 걸어온 길 — 필수 이벤트 아크 회고(두루마리 연대기). 선택 기록 있을 때만. docs/47 */}
          {fromStore && <ArcChroniclePanel disciple={fromStore} />}

          {/* 무공 수련 — 보유 무공 + 무공서 선택(전수→주력) */}
          {fromStore && <MartialTrainingPanel disciple={fromStore} />}
          <EquipmentSection />
          <MiscSection />
        </ScrollView>
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        hitSlop={8}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="뒤로"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>제자 상세</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

// ─── Equipment ─────────────────────────────────────────────────────────────

function EquipmentSection() {
  return (
    <View style={styles.section}>
      <SectionLabel>장비·소지품</SectionLabel>
      <View style={styles.equipmentRow}>
        {EQUIPMENT.map((slot) => (
          <Pressable
            key={slot.key}
            style={styles.equipmentCol}
            onPress={() => router.push(`/equipment/${slot.key}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${slot.label} 슬롯`}
          >
            <View style={styles.equipmentSlot} />
            <Text style={styles.equipmentLabel} numberOfLines={1}>
              {slot.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Misc info ─────────────────────────────────────────────────────────────

function MiscSection() {
  return (
    <View style={styles.section}>
      <SectionLabel>기타 정보</SectionLabel>
      <View style={styles.miscCol}>
        <Text style={styles.miscColLabel}>최근 의뢰 기록</Text>
        <Text style={styles.miscEmpty}>아직 의뢰 기록이 없다.</Text>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const EQUIP_SLOT = 44;

const styles = StyleSheet.create({
  // Header ---------------------------------------------------------------
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
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Body -----------------------------------------------------------------
  body: { flex: 1 },
  bodyContent: { paddingBottom: spacing.sm, gap: spacing.base },
  portrait: { alignItems: 'center', paddingTop: spacing.xs },

  // Section --------------------------------------------------------------
  section: { gap: spacing.sm },

  // Equipment ------------------------------------------------------------
  equipmentRow: { flexDirection: 'row', gap: spacing.xs },
  equipmentCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  equipmentSlot: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: EQUIP_SLOT,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
  },
  equipmentLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.ink,
  },

  // Misc -----------------------------------------------------------------
  miscCol: { flex: 1, gap: 4 },
  miscColLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  miscEmpty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
});
