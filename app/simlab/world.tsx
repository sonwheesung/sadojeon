// [DEV] 강호 정세 시뮬레이션 — 순수 정세 엔진(worldSystem)을 N년 돌려 사건·세력·기조 흐름을 본다.
// 전체 게임 불필요(코어만) → 고속. 계절 타임라인 + 전쟁 발발률 + 사건 분포 + 15년 후 세력 기조. docs/08·36.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafetyZone } from '@/components/common/SafetyZone';
import { BLOC_LABEL, STANCE_LABEL } from '@/data/worldPowers';
import { useDevAccess } from '@/systems/dev/devAccess';
import { seedWorldState, tickWorldState } from '@/systems/worldSystem';
import type { WorldBloc } from '@/types/world';
import { colors, spacing, typography } from '@/theme';

const SEASON_LABEL = ['봄', '여름', '가을', '겨울'];
const DIST_RUNS = 80; // 분포 표본(인앱 — 가볍게)

interface SimResult {
  years: number;
  warRate: number; //        전쟁 발발 회차 비율
  floorBreak: number; //     정통 멸문(0이어야 정상)
  rumorsPerRun: number;
  kindCounts: [string, number][]; // 회차당 평균 발발
  finalPowers: { bloc: WorldBloc; label: string; power: number; stance: string }[];
  timeline: string[]; //     상세 회차 1개의 계절별 사건
}

export default function WorldSimScreen() {
  const dev = useDevAccess();
  const [years, setYears] = useState(15);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  if (!dev) {
    return (
      <SafetyZone variant="modal" background={colors.paper}>
        <Text style={styles.blocked}>개발 계정 전용 화면입니다.</Text>
      </SafetyZone>
    );
  }

  const run = () => {
    if (running) return;
    setRunning(true);
    const seasons = years * 4;

    // 1) 상세 회차 — 타임라인.
    const detail = seedWorldState();
    const timeline: string[] = [];
    for (let s = 0; s < seasons; s += 1) {
      const rep = tickWorldState(detail);
      if (rep.rumors.length > 0) {
        const yr = Math.floor(s / 4) + 1;
        timeline.push(`${yr}년 ${SEASON_LABEL[s % 4]} — ${rep.rumors.map((r) => r.title).join(' / ')}`);
      }
    }
    const finalPowers = (Object.keys(detail.powers) as WorldBloc[]).map((b) => ({
      bloc: b,
      label: BLOC_LABEL[b],
      power: Math.round(detail.powers[b].power),
      stance: STANCE_LABEL[detail.powers[b].stance],
    }));

    // 2) 분포 — DIST_RUNS 회차.
    const kindCount: Record<string, number> = {};
    let warRuns = 0;
    let floorBreak = 0;
    let totalRumors = 0;
    for (let run2 = 0; run2 < DIST_RUNS; run2 += 1) {
      const s2 = seedWorldState();
      let warred = false;
      for (let s = 0; s < seasons; s += 1) {
        const rep = tickWorldState(s2);
        for (const k of rep.ignited) kindCount[k] = (kindCount[k] ?? 0) + 1;
        if (rep.ignited.includes('war')) warred = true;
        totalRumors += rep.rumors.length;
        if (s2.powers.orthodox.power < 49.9) floorBreak += 1;
      }
      if (warred) warRuns += 1;
    }
    const kindCounts = Object.entries(kindCount)
      .map(([k, v]) => [k, Math.round((v / DIST_RUNS) * 10) / 10] as [string, number])
      .sort((a, b) => b[1] - a[1]);

    setResult({
      years,
      warRate: Math.round((warRuns / DIST_RUNS) * 100),
      floorBreak,
      rumorsPerRun: Math.round((totalRumors / DIST_RUNS) * 10) / 10,
      kindCounts,
      finalPowers,
      timeline,
    });
    setRunning(false);
  };

  return (
    <SafetyZone variant="modal" background={colors.paper}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>강호 정세 시뮬레이션</Text>
          <Text style={styles.sub}>
            정세 엔진 코어를 {DIST_RUNS}회차 돌려 사건·세력·전쟁 흐름 — 게임 세이브 안 건드림(코어만)
          </Text>
        </View>

        <View style={styles.row}>
          {[5, 15, 30].map((y) => (
            <Chip key={y} label={`${y}년`} on={years === y} onPress={() => setYears(y)} />
          ))}
          <Pressable style={[styles.runBtn, running && styles.off]} disabled={running} onPress={run}>
            <Text style={styles.runText}>{running ? '…' : '실행'}</Text>
          </Pressable>
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.resultHead}>
              {result.years}년 · 전쟁 발발 {result.warRate}% · 정통 멸문 {result.floorBreak}건 · 풍문 {result.rumorsPerRun}/회차
            </Text>

            <Text style={styles.sampleHead}>15년 후 세력 기조</Text>
            {result.finalPowers.map((p) => (
              <Text key={p.bloc} style={styles.resultLine}>
                {p.label} — {p.stance} (세력 {p.power})
              </Text>
            ))}

            <Text style={styles.sampleHead}>사건 분포 (회차당 평균)</Text>
            <Text style={styles.sample}>
              {result.kindCounts.map(([k, v]) => `${k} ${v}`).join(' · ')}
            </Text>

            <Text style={styles.sampleHead}>샘플 타임라인 (한 회차)</Text>
            {result.timeline.length === 0 ? (
              <Text style={styles.sample}>이 회차는 강호가 잠잠했다.</Text>
            ) : (
              result.timeline.map((t, i) => (
                <Text key={i} style={styles.sample}>
                  {t}
                </Text>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafetyZone>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, on && styles.chipOn]} onPress={onPress}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: 2 },
  title: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  sub: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    alignItems: 'center',
  },
  chip: { borderWidth: 1, borderColor: colors.inkSoft, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  chipTextOn: { color: colors.paper },
  runBtn: { borderWidth: 1, borderColor: colors.brown, borderRadius: 4, paddingVertical: 6, paddingHorizontal: spacing.lg },
  off: { opacity: 0.4 },
  runText: { fontFamily: typography.serifBold, fontSize: typography.sizes.sm, color: colors.brown },
  result: { margin: spacing.base, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkSoft, borderRadius: 6, padding: spacing.base, gap: 4 },
  resultHead: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.ink },
  resultLine: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.ink },
  sampleHead: { paddingTop: spacing.xs, fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.brown },
  sample: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft, lineHeight: 18 },
  blocked: { margin: spacing.lg, fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkSoft },
});
