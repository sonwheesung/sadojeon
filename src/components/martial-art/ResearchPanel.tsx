// 비급 연구 패널 — 도감 상단. 보유했지만 풀이 못 한 비급을 사부가 연구한다(실시간 타이머).
// 동시 1권 · 등급별 5분~12시간 · 다이아 즉시 완료. 연구를 마쳐야 제자에게 가르칠 수 있다. docs/05.

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { findMartialArt } from '@/data/martialArts';
import { useCodexStore } from '@/stores/codexStore';
import { useGameStore } from '@/stores/gameStore';
import {
  diamondCostFor,
  formatRemaining,
  researchDurationFor,
  researchProgressPct,
  skipResearchWithDiamonds,
  startResearch,
  syncResearch,
} from '@/systems/researchSystem';
import { colors, radius, spacing, typography } from '@/theme';
import { MARTIAL_ART_GRADE_LABEL } from '@/types/martialArt';

export function ResearchPanel() {
  const confirm = useConfirm();
  const scrolls = useCodexStore((s) => s.scrolls);
  const diamonds = useGameStore((s) => s.diamonds);
  const [now, setNow] = useState(() => Date.now());

  // 실시간 타이머 — 1초 갱신 + 기한 도래분 자동 완료.
  useEffect(() => {
    const t = setInterval(() => {
      syncResearch();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const researching = scrolls.find((s) => s.status === 'researching');
  const pending = scrolls.filter((s) => s.status !== 'complete' && s.status !== 'researching');
  if (!researching && pending.length === 0) return null; // 풀 것이 없으면 침묵

  const remain = researching ? Math.max(0, (researching.researchEndAt ?? now) - now) : 0;
  const pct = researching ? researchProgressPct(researching.artId) : 0;
  const cost = researching ? diamondCostFor(researching.artId) : 0;

  async function onSkip(artId: string, artName: string) {
    const ok = await confirm({
      title: '연구 즉시 완료',
      message: `다이아 ${cost}개를 들여 「${artName}」 연구를 지금 끝낼까요?`,
    });
    if (!ok) return;
    skipResearchWithDiamonds(artId);
    setNow(Date.now());
  }

  return (
    <View style={styles.panel}>
      <View style={styles.headRow}>
        <Text style={styles.head}>비급 연구</Text>
        <Text style={styles.diamond}>다이아 {diamonds}</Text>
      </View>
      <Text style={styles.hint}>연구를 마친 비급만 제자에게 가르칠 수 있다 — 사문 공유, 비급당 한 번.</Text>

      {researching && (
        <View style={styles.activeRow}>
          <View style={styles.activeMain}>
            <Text style={styles.activeName}>{findMartialArt(researching.artId)?.name ?? researching.artId}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.activeTime}>풀이 중 {pct}% — {formatRemaining(remain)} 남음</Text>
          </View>
          <Pressable
            style={[styles.skipBtn, diamonds < cost && styles.btnOff]}
            disabled={diamonds < cost}
            onPress={() => onSkip(researching.artId, findMartialArt(researching.artId)?.name ?? '')}
            accessibilityRole="button"
            accessibilityLabel="다이아로 즉시 완료"
          >
            <Text style={styles.skipText}>다이아 {cost} 즉시 완료</Text>
          </Pressable>
        </View>
      )}

      {pending.map((s) => {
        const art = findMartialArt(s.artId);
        if (!art) return null;
        return (
          <View key={s.artId} style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.rowName} numberOfLines={1}>{art.name}</Text>
              <Text style={styles.rowMeta}>
                {MARTIAL_ART_GRADE_LABEL[art.grade]} · 연구 {formatRemaining(researchDurationFor(s.artId))}
              </Text>
            </View>
            <Pressable
              style={[styles.startBtn, researching != null && styles.btnOff]}
              disabled={researching != null}
              onPress={() => startResearch(s.artId)}
              accessibilityRole="button"
              accessibilityLabel={`${art.name} 연구 시작`}
            >
              <Text style={styles.startText}>{researching ? '연구 중…' : '연구 시작하기'}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brown,
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  head: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.brown },
  diamond: { fontFamily: typography.serifBold, fontSize: typography.sizes.xs, color: colors.seal },
  hint: { fontFamily: typography.serif, fontSize: 10, color: colors.inkSoft },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  activeMain: { flex: 1, gap: 2 },
  activeName: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.ink },
  activeTime: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.brown },
  // 진행 바(그레이박스) — track 위에 brown fill, 너비 = 진행률%.
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkSoft,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.brown },
  skipBtn: {
    borderWidth: 1,
    borderColor: colors.seal,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  skipText: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.seal },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 3,
  },
  rowMain: { flex: 1, gap: 1 },
  rowName: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink },
  rowMeta: { fontFamily: typography.serif, fontSize: 10, color: colors.inkSoft },
  startBtn: {
    borderWidth: 1,
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  startText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  btnOff: { opacity: 0.4 },
});
