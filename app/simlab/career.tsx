// [DEV] 미래 직업 시뮬레이션 — 졸업 스냅샷(노선·역량·명성)으로 평생 궤적(careerSystem)을
// N회 굴려 정점 직책·생존 분포를 본다. 개발 계정 전용.
// ⚠️ 졸업 기록·서신함을 시뮬이 사용한다(개발 샌드박스 전제 — 실행 시 새 회차 시드).

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafetyZone } from '@/components/common/SafetyZone';
import { ROUTE_LABEL, ROUTE_LADDER, type RouteId } from '@/data/careers';
import { seedNewRun } from '@/systems/newRun';
import { tickCareers } from '@/systems/careerSystem';
import { setAutoSaveEnabled } from '@/systems/runSync';
import { useGameStore } from '@/stores/gameStore';
import { useGraduateStore } from '@/stores/graduateStore';
import { useInboxStore } from '@/stores/inboxStore';
import { useTimeStore } from '@/stores/timeStore';
import { useDevAccess } from '@/systems/dev/devAccess';
import { colors, spacing, typography } from '@/theme';

const ROUTES = Object.keys(ROUTE_LABEL) as RouteId[];
const POWERS = [30, 55, 80, 95];
const FAMES = [10, 40, 80];
const REPS = [20, 100];
const MAX_YEARS = 40;

interface CareerResult {
  reps: number;
  route: RouteId;
  peakDist: Record<number, number>; // 정점 직책 레벨 → 횟수
  finals: Record<string, number>; // 최종 상태 → 횟수
  avgYears: number;
  newsSample: string[]; // 마지막 1회의 강호 풍문(과정)
}

export default function CareerSimScreen() {
  const dev = useDevAccess();
  const [route, setRoute] = useState<RouteId>('righteous');
  const [power, setPower] = useState(55);
  const [fame, setFame] = useState(40);
  const [reps, setReps] = useState(20);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CareerResult | null>(null);

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
    setResult(null);
    setAutoSaveEnabled(false);
    try {
      // 졸업 기록·서신은 회차 스코프 — 샌드박스 회차를 새로 깐다.
      seedNewRun(['yun-soso', 'jin-sohwa', 'jang-cheol', 'baek-yeon']);
      useGameStore.getState().setPhase('playing');

      const peakDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
      const finals: Record<string, number> = {};
      let sumYears = 0;
      let newsSample: string[] = [];

      for (let rep = 0; rep < reps; rep += 1) {
        const gs = useGraduateStore.getState();
        gs.reset();
        useInboxStore.getState().reset();
        gs.add({
          id: 'sim-grad',
          name: '시뮬제자',
          route,
          level: 0,
          title: ROUTE_LADDER[route][0],
          power,
          fame,
          status: 'active',
          graduatedYear: useTimeStore.getState().current.year,
        });

        let peak = 0;
        let years = 0;
        for (let y = 1; y <= MAX_YEARS; y += 1) {
          tickCareers();
          const rec = useGraduateStore.getState().records.find((r) => r.id === 'sim-grad');
          if (!rec) break;
          peak = Math.max(peak, rec.level);
          years = y;
          if (rec.status === 'dead' || rec.status === 'missing' || rec.status === 'retired') break;
        }
        const rec = useGraduateStore.getState().records.find((r) => r.id === 'sim-grad');
        peakDist[peak] = (peakDist[peak] ?? 0) + 1;
        const fin = rec?.status ?? 'active';
        finals[fin] = (finals[fin] ?? 0) + 1;
        sumYears += years;

        if (rep === reps - 1) {
          newsSample = useInboxStore
            .getState()
            .items.filter((i) => (i.payload as { domain?: string } | undefined)?.domain === 'jianghu_news')
            .slice(0, 14)
            .map((i) => i.preview ?? i.title);
        }
        if (rep % 5 === 4) {
          setProgress(Math.round(((rep + 1) / reps) * 100));
          await new Promise((res) => setTimeout(res, 0));
        }
      }
      useInboxStore.getState().reset();
      setResult({ reps, route, peakDist, finals, avgYears: sumYears / reps, newsSample });
    } finally {
      setAutoSaveEnabled(true);
      setRunning(false);
      setProgress(100);
    }
  };

  const STATUS_LABEL: Record<string, string> = {
    active: '활동 중(40년 생존)',
    injured: '부상',
    retired: '은거',
    dead: '사망',
    missing: '실종',
  };

  return (
    <SafetyZone variant="modal" background={colors.paper}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>미래 직업 시뮬레이션</Text>
          <Text style={styles.sub}>졸업 스냅샷 → 평생 궤적(careerSystem) N회 — 정점·생존 분포</Text>
        </View>

        <Text style={styles.section}>노선</Text>
        <View style={styles.rowWrap}>
          {ROUTES.map((r) => (
            <Chip key={r} label={ROUTE_LABEL[r]} on={route === r} onPress={() => setRoute(r)} />
          ))}
        </View>
        <Text style={styles.section}>역량(졸업 시점) / 명성 / 반복</Text>
        <View style={styles.rowWrap}>
          {POWERS.map((p) => (
            <Chip key={p} label={`역량 ${p}`} on={power === p} onPress={() => setPower(p)} />
          ))}
          {FAMES.map((f) => (
            <Chip key={f} label={`명성 ${f}`} on={fame === f} onPress={() => setFame(f)} />
          ))}
          {REPS.map((n) => (
            <Chip key={n} label={`${n}회`} on={reps === n} onPress={() => setReps(n)} />
          ))}
        </View>

        <View style={styles.rowWrap}>
          <Pressable style={[styles.runBtn, running && styles.off]} disabled={running} onPress={run}>
            <Text style={styles.runText}>{running ? `${progress}%` : '실행'}</Text>
          </Pressable>
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.resultHead}>
              {ROUTE_LABEL[result.route]} · {result.reps}회 — 평균 활동 {result.avgYears.toFixed(1)}년
            </Text>
            <Text style={styles.sampleHead}>정점 직책 분포</Text>
            {[3, 2, 1, 0].map((lv) => (
              <Text key={lv} style={styles.resultLine}>
                {ROUTE_LADDER[result.route][lv]}: {(((result.peakDist[lv] ?? 0) / result.reps) * 100).toFixed(0)}%
              </Text>
            ))}
            <Text style={styles.sampleHead}>최후</Text>
            <Text style={styles.resultLine}>
              {Object.entries(result.finals)
                .map(([k, v]) => `${STATUS_LABEL[k] ?? k} ${((v / result.reps) * 100).toFixed(0)}%`)
                .join(' · ')}
            </Text>
            <Text style={styles.sampleHead}>과정 — 마지막 1회의 강호 풍문</Text>
            {result.newsSample.map((t, i) => (
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
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.base, paddingTop: spacing.xs, alignItems: 'center' },
  chip: { borderWidth: 1, borderColor: colors.inkSoft, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  chipTextOn: { color: colors.paper },
  runBtn: { borderWidth: 1, borderColor: colors.brown, borderRadius: 4, paddingVertical: 8, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  off: { opacity: 0.4 },
  runText: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.brown },
  result: { margin: spacing.base, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.inkSoft, borderRadius: 6, padding: spacing.base, gap: 4 },
  resultHead: { fontFamily: typography.serifBold, fontSize: typography.sizes.base, color: colors.ink },
  resultLine: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.ink },
  sampleHead: { paddingTop: spacing.xs, fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.brown },
  sample: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft, lineHeight: 18 },
  blocked: { margin: spacing.lg, fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkSoft },
});
