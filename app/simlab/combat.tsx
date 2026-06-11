// [DEV] 전투 시뮬레이션 — docs/35 엔진을 N판 돌려 승률·합·사망 분포를 본다. 개발 계정 전용.
// 설정(모드·양측 경지/결/인원/영글기·판수) → 실행 → 결과 통계 + 서사 샘플(과정).

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafetyZone } from '@/components/common/SafetyZone';
import { makeNpcCombatant, narrateCombat, simulateCombat, type NpcArchetype } from '@/systems/combat';
import type { Combatant, CombatMode, CombatResult } from '@/types/combat';
import { REALM_LABEL, REALM_ORDER, type Realm } from '@/types/realm';
import { useDevAccess } from '@/systems/dev/devAccess';
import { colors, spacing, typography } from '@/theme';

const REALMS = REALM_ORDER.filter((r) => r !== 'none');
const ARCHETYPES: { id: NpcArchetype; label: string }[] = [
  { id: 'orthodox', label: '정파' },
  { id: 'bandit', label: '산적' },
  { id: 'soldier', label: '표사' },
  { id: 'rogue', label: '사파' },
  { id: 'assassin', label: '살수' },
  { id: 'cultist', label: '마교도' },
  { id: 'beast', label: '맹수' },
];
const QUALITIES = [
  { v: 0.25, label: '풋내기' },
  { v: 0.5, label: '보통' },
  { v: 0.8, label: '노련' },
];
const BATCHES = [100, 500, 2000];

interface SideCfg {
  realm: Realm;
  archetype: NpcArchetype;
  count: number;
  quality: number;
}

const DEFAULT_A: SideCfg = { realm: 'jeoljeong', archetype: 'orthodox', count: 1, quality: 0.5 };
const DEFAULT_B: SideCfg = { realm: 'samryu', archetype: 'bandit', count: 3, quality: 0.5 };

interface BatchStats {
  n: number;
  winA: number;
  winB: number;
  draw: number;
  rounds: number;
  tiers: Record<string, number>;
  deadA: number;
  deadB: number;
  fled: number;
  woundA: number;
  woundB: number;
  samples: string[];
}

function makeSide(cfg: SideCfg, side: 'A' | 'B'): Combatant[] {
  return Array.from({ length: cfg.count }, (_, i) =>
    makeNpcCombatant({
      id: `${side}${i}`,
      name: `${ARCHETYPES.find((a) => a.id === cfg.archetype)?.label ?? ''}${cfg.count > 1 ? i + 1 : ''}`,
      realm: cfg.realm,
      archetype: cfg.archetype,
      quality: cfg.quality,
    }),
  );
}

export default function CombatSimScreen() {
  const dev = useDevAccess();
  const [mode, setMode] = useState<CombatMode>('real');
  const [a, setA] = useState<SideCfg>(DEFAULT_A);
  const [b, setB] = useState<SideCfg>(DEFAULT_B);
  const [batch, setBatch] = useState(500);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<BatchStats | null>(null);

  if (!dev) {
    return (
      <SafetyZone variant="modal" background={colors.paper}>
        <Text style={styles.blocked}>개발 계정 전용 화면입니다.</Text>
      </SafetyZone>
    );
  }

  const run = async () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const s: BatchStats = {
      n: batch, winA: 0, winB: 0, draw: 0, rounds: 0,
      tiers: { close: 0, edge: 0, crush: 0 },
      deadA: 0, deadB: 0, fled: 0, woundA: 0, woundB: 0, samples: [],
    };
    const CHUNK = 100;
    for (let done = 0; done < batch; done += CHUNK) {
      const upTo = Math.min(batch, done + CHUNK);
      for (let i = done; i < upTo; i += 1) {
        const r: CombatResult = simulateCombat(makeSide(a, 'A'), makeSide(b, 'B'), { mode });
        if (r.winner === 'A') s.winA += 1;
        else if (r.winner === 'B') s.winB += 1;
        else s.draw += 1;
        s.rounds += r.rounds;
        s.tiers[r.tier] += 1;
        for (const c of r.combatants) {
          if (c.state === 'dead') {
            if (c.side === 'A') s.deadA += 1;
            else s.deadB += 1;
          }
          if (c.state === 'fled') s.fled += 1;
          if (c.wound) {
            if (c.side === 'A') s.woundA += 1;
            else s.woundB += 1;
          }
        }
        if (s.samples.length < 3 && i % Math.max(1, Math.floor(batch / 3)) === 0) {
          s.samples.push(narrateCombat(r));
        }
      }
      setProgress(Math.round((upTo / batch) * 100));
      // UI 양보 — 큰 배치도 화면이 멈추지 않게.
      await new Promise((res) => setTimeout(res, 0));
    }
    setStats(s);
    setRunning(false);
  };

  const pct = (v: number) => (stats ? `${((v / stats.n) * 100).toFixed(1)}%` : '');

  return (
    <SafetyZone variant="modal" background={colors.paper}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>전투 시뮬레이션</Text>
          <Text style={styles.sub}>엔진(docs/35) N판 — 순수 계산, 세이브에 영향 없음</Text>
        </View>

        <Text style={styles.section}>모드</Text>
        <View style={styles.row}>
          {(['spar', 'real'] as const).map((m) => (
            <Chip key={m} label={m === 'spar' ? '대련' : '실전'} on={mode === m} onPress={() => setMode(m)} />
          ))}
          {BATCHES.map((n) => (
            <Chip key={n} label={`${n}판`} on={batch === n} onPress={() => setBatch(n)} />
          ))}
        </View>

        {([['A측', a, setA], ['B측', b, setB]] as const).map(([label, cfg, setCfg]) => (
          <View key={label}>
            <Text style={styles.section}>{label}</Text>
            <View style={styles.rowWrap}>
              {REALMS.map((r) => (
                <Chip key={r} label={REALM_LABEL[r]} on={cfg.realm === r} onPress={() => setCfg({ ...cfg, realm: r })} />
              ))}
            </View>
            <View style={styles.rowWrap}>
              {ARCHETYPES.map((t) => (
                <Chip key={t.id} label={t.label} on={cfg.archetype === t.id} onPress={() => setCfg({ ...cfg, archetype: t.id })} />
              ))}
            </View>
            <View style={styles.rowWrap}>
              {[1, 2, 3, 4].map((n) => (
                <Chip key={n} label={`${n}인`} on={cfg.count === n} onPress={() => setCfg({ ...cfg, count: n })} />
              ))}
              {QUALITIES.map((q) => (
                <Chip key={q.v} label={q.label} on={cfg.quality === q.v} onPress={() => setCfg({ ...cfg, quality: q.v })} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.row}>
          <Pressable style={[styles.runBtn, running && styles.off]} disabled={running} onPress={run}>
            <Text style={styles.runText}>{running ? `실행 중 ${progress}%` : '실행'}</Text>
          </Pressable>
        </View>

        {stats && (
          <View style={styles.result}>
            <Text style={styles.resultHead}>
              A승 {pct(stats.winA)} · B승 {pct(stats.winB)} · 무 {pct(stats.draw)} | 평균 {(stats.rounds / stats.n).toFixed(1)}합
            </Text>
            <Text style={styles.resultLine}>
              박빙 {pct(stats.tiers.close)} · 우세 {pct(stats.tiers.edge)} · 압도 {pct(stats.tiers.crush)}
            </Text>
            {mode === 'real' && (
              <Text style={styles.resultLine}>
                사망 A {stats.deadA} / B {stats.deadB} · 패주 {stats.fled} · 부상 A {stats.woundA} / B {stats.woundB} (연인원, {stats.n}판)
              </Text>
            )}
            <Text style={styles.sampleHead}>과정 샘플</Text>
            {stats.samples.map((t, i) => (
              <Text key={i} style={styles.sample}>· {t}</Text>
            ))}
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
  section: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.brown,
  },
  row: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.base, paddingTop: spacing.xs, alignItems: 'center' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.base, paddingTop: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.inkSoft, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  chipTextOn: { color: colors.paper },
  runBtn: { borderWidth: 1, borderColor: colors.brown, borderRadius: 4, paddingVertical: 8, paddingHorizontal: spacing.lg, marginTop: spacing.base },
  off: { opacity: 0.4 },
  runText: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.brown },
  result: {
    margin: spacing.base,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 6,
    padding: spacing.base,
    gap: 4,
  },
  resultHead: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.ink },
  resultLine: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.ink },
  sampleHead: { paddingTop: spacing.xs, fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.brown },
  sample: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft, lineHeight: 18 },
  blocked: { margin: spacing.lg, fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkSoft },
});
