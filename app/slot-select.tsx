import { Redirect, router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDevAccess } from '@/systems/dev/devAccess';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { useBackConfirm } from '@/hooks/useBackConfirm';
import { runs as runsRepo, type RunRecord } from '@/data/repositories';
import {
  useDiscipleStore,
  useGameStore,
  useMasterStore,
  useScheduleStore,
  useSectStore,
  useTimeStore,
} from '@/stores';
import { loadRun } from '@/systems/runSync';
import { RUN_CHILD_SLICES } from '@/systems/runSlices';
import { colors, spacing, typography } from '@/theme';

// 시안: docs/references/slot-select-mockup.png
// 사양: docs/16_회차_다회차.md "사부 슬롯 — 평행 2슬롯"
// 그레이박스 단계 — 일러스트·산수화는 dashed placeholder, 데이터는 임시값.

const SLOTS = [1, 2] as const;
const SLOT_SEAL_LABEL: Record<number, string> = { 1: '壹', 2: '貳' };
const SEASON_KR: Record<string, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

function timeLabelOf(run: RunRecord): string {
  const c = (run.gameTime as { current?: { year?: number; season?: string; week?: number } })
    .current;
  if (!c?.year) return '진행 전';
  return `${c.year}년차 ${SEASON_KR[c.season ?? ''] ?? ''} ${c.week ?? 1}주차`;
}

function field(obj: Record<string, unknown> | null, key: string, fallback: string): string {
  const v = obj?.[key];
  return typeof v === 'string' && v ? v : fallback;
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function SlotSelectScreen() {
  const setSaveSlot = useGameStore((s) => s.setSaveSlot);
  const [loading, setLoading] = useState(true);
  const [bySlot, setBySlot] = useState<Record<number, RunRecord>>({});
  // 개발/테스트 환경은 사문 선택 대신 시뮬레이션 실험실로 — ?game=1 이면 일반 게임 진입 허용.
  const devAccess = useDevAccess();
  const { game } = useLocalSearchParams<{ game?: string }>();
  const confirm = useConfirm();

  // 뒤로가기 → 게임 종료 확인.
  useBackConfirm(
    {
      title: '게임 종료',
      message: '게임을 종료하시겠습니까?',
      confirmLabel: '종료',
      tone: 'danger',
    },
    () => BackHandler.exitApp(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await runsRepo.listForUser();
      const map: Record<number, RunRecord> = {};
      for (const r of list) map[r.slot] = r;
      setBySlot(map);
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[slot-select] 회차 로드 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // 빈 슬롯 → 새 회차: 로컬 상태 비우고 메인으로(시작 선택 모달 표시).
  const startNew = (slot: number) => {
    setSaveSlot(slot);
    useMasterStore.getState().reset();
    useSectStore.getState().reset();
    useDiscipleStore.getState().reset();
    useTimeStore.getState().reset();
    useScheduleStore.getState().reset();
    RUN_CHILD_SLICES.forEach((slice) => slice.reset());
    router.replace('/(tabs)');
  };

  // 사용 슬롯 → 이어 진행: DB 회차를 로드해 스토어 복원.
  const resume = async (run: RunRecord) => {
    setSaveSlot(run.slot);
    try {
      await loadRun(run.id);
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[slot-select] 회차 로드 실패', e);
    }
    router.replace('/(tabs)');
  };

  const onPick = (slot: number) => {
    const run = bySlot[slot];
    if (run) resume(run);
    else startNew(slot);
  };

  // 사문 삭제 — 영구 삭제(되돌릴 수 없음). 확인창 필수(파괴적 → danger).
  const removeRun = useCallback(
    async (run: RunRecord) => {
      const sectName = field(run.sect, 'name', '무명산문');
      const ok = await confirm({
        title: '사문 삭제',
        message: `${sectName} 사문을 영구히 지웁니다. 졸업 제자·비급 누적 등 이 사문의 모든 기록이 사라지며 되돌릴 수 없습니다.`,
        confirmLabel: '삭제',
        tone: 'danger',
      });
      if (!ok) return;
      try {
        await runsRepo.delete(run.id);
        await load();
      } catch (e) {
        if (typeof console !== 'undefined') console.warn('[slot-select] 사문 삭제 실패', e);
      }
    },
    [confirm, load],
  );

  // 개발/테스트 환경 — 시뮬레이션 실험실로. (훅 호출 뒤의 분기라 훅 순서 안전.)
  if (devAccess && game !== '1') return <Redirect href={'/simlab' as Href} />;

  return (
    <SafetyZone variant="stack" background={colors.background}>
      <PaperCard>
        <Header />
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.ink} />
          </View>
        ) : (
          <View style={styles.slotsRow}>
            {SLOTS.map((slot) => (
              <SlotCard key={slot} slot={slot} run={bySlot[slot]} onPick={onPick} onDelete={removeRun} />
            ))}
          </View>
        )}
        <Footer />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>齒</Text>
      </View>
      <View style={styles.titleWrap}>
        <Text style={styles.titleHanja}>師席</Text>
        <Text style={styles.title}>사부의 자리</Text>
      </View>
      <View style={styles.headerSeal}>
        <Text style={styles.headerSealLabel}>關</Text>
      </View>
    </View>
  );
}

// ─── Slot card ─────────────────────────────────────────────────────────────

function SlotCard({
  slot,
  run,
  onPick,
  onDelete,
}: {
  slot: number;
  run?: RunRecord;
  onPick: (slot: number) => void;
  onDelete: (run: RunRecord) => void;
}) {
  const isEmpty = !run;
  return (
    <Pressable
      style={[styles.card, isEmpty && styles.cardEmpty]}
      onPress={() => onPick(slot)}
      accessibilityRole="button"
      accessibilityLabel={isEmpty ? `슬롯 ${slot} 새로 시작` : `슬롯 ${slot} 이어 진행`}
    >
      <SlotSeal slot={slot} dim={isEmpty} />
      {run ? <ActiveBody run={run} /> : <EmptyBody />}
      {run && (
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          onPress={() => onDelete(run)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`슬롯 ${slot} 사문 삭제`}
        >
          <Text style={styles.deleteBtnLabel}>✕</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function SlotSeal({ slot, dim }: { slot: number; dim: boolean }) {
  return (
    <View style={[styles.slotSeal, dim && styles.slotSealDim]}>
      <Text style={[styles.slotSealLabel, dim && styles.slotSealLabelDim]}>
        {SLOT_SEAL_LABEL[slot]}
      </Text>
    </View>
  );
}

// ─── Active body ──────────────────────────────────────────────────────────

function ActiveBody({ run }: { run: RunRecord }) {
  return (
    <View style={styles.cardBody}>
      <Text style={styles.sectName} numberOfLines={1}>
        {field(run.sect, 'name', '무명산문')}
      </Text>
      <Text style={styles.sectHanja} numberOfLines={1}>
        {`(${field(run.sect, 'hanjaName', '無名山門')})`}
      </Text>
      <Text style={styles.runLabel} numberOfLines={1}>
        {timeLabelOf(run)}
      </Text>

      <View style={styles.metaList}>
        <MetaRow label="현재 사부" value={field(run.master, 'name', '—')} />
        <MetaRow label="상태" value={run.status === 'ended' ? '종료' : '진행 중'} />
      </View>

      <View style={styles.landscape}>
        <Text style={styles.placeholderLabel}>산수화</Text>
      </View>

      <View style={styles.actionSeal}>
        <Text style={styles.actionSealLabel}>이어{`\n`}진행</Text>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Empty body ───────────────────────────────────────────────────────────

function EmptyBody() {
  return (
    <View style={styles.cardBody}>
      <Text style={styles.emptyTitle}>비어 있는 사문</Text>
      <Text style={styles.emptySub}>새 사문을 개창하시겠습니까</Text>
      <View style={styles.emptyFlexSpacer} />
      <View style={styles.emptyAction}>
        <Text style={styles.emptyActionLabel}>{`+\n새로 시작`}</Text>
      </View>
      <View style={styles.emptyFlexSpacer} />
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerDivider} />
      <Text style={styles.footerLine}>사부의 일생은 한 회차, 사문은 영속</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  headerSeal: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSealLabel: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
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

  // Slots row
  slotsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card
  card: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    backgroundColor: colors.paperBright,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  cardEmpty: {
    opacity: 0.7,
  },

  // 삭제 버튼 — 사용 슬롯 우상단
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: { borderColor: colors.seal, opacity: 0.85 },
  deleteBtnLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    lineHeight: 16,
  },

  // Slot seal
  slotSeal: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSealDim: {
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
  },
  slotSealLabel: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  slotSealLabelDim: {
    color: colors.inkSoft,
  },

  // Card body (shared)
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },

  // Active card text
  sectName: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  sectHanja: {
    textAlign: 'center',
    fontFamily: typography.serifCN,
    fontSize: 11,
    color: colors.inkSoft,
  },
  runLabel: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },

  // Meta list
  metaList: {
    gap: 4,
    paddingVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  metaLabel: {
    width: 60,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  metaValue: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },

  // Landscape placeholder
  landscape: {
    flex: 1,
    minHeight: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  placeholderLabel: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },

  // Active action seal
  actionSeal: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.seal,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSealLabel: {
    textAlign: 'center',
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.paperBright,
    lineHeight: 16,
  },

  // Empty card
  emptyTitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.base,
    color: colors.inkSoft,
  },
  emptySub: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  emptyFlexSpacer: { flex: 1 },
  emptyAction: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionLabel: {
    textAlign: 'center',
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inkSoft,
  },
  footerLine: {
    textAlign: 'center',
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
});
