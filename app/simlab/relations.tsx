// [DEV] 관계 시뮬레이션 — 실제 게임 시스템(대련·비무·중재·이벤트)을 N년 자동 구동해
// 관계(원수~의형제)가 어떻게 흐르는지 본다. 개발 계정 전용.
// ⚠️ 이 계정의 현재 세이브 위에 새 회차를 시드한다(개발 샌드박스 전제).

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafetyZone } from '@/components/common/SafetyZone';
import { seedNewRun } from '@/systems/newRun';
import { advanceTurn } from '@/systems/timeSystem';
import { setAutoSaveEnabled } from '@/systems/runSync';
import { setResearchInstant } from '@/systems/researchSystem';
import { configureOptimal } from '@/systems/dev/policyHelpers';
import { daeryeonChoiceValue } from '@/systems/daeryeonSystem';
import { isRespondable, resolveInboxItem, responseOptionsFor } from '@/systems/inboxResolve';
import { useDiscipleStore } from '@/stores/discipleStore';
import { useGameStore } from '@/stores/gameStore';
import { useInboxStore } from '@/stores/inboxStore';
import { usePendingStore } from '@/stores/pendingStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import type { RelationLevel } from '@/types';
import { useDevAccess } from '@/systems/dev/devAccess';
import { colors, spacing, typography } from '@/theme';

// 시드 — 시작 적대 페어(윤소소↔이청하) 포함 4인: 관계 콘텐츠가 다 발화되는 조합.
const SEED = ['yun-soso', 'i-cheongha', 'jin-sohwa', 'jang-cheol'];
const REL_LABEL: Record<RelationLevel, string> = {
  enemy: '원수',
  distant: '소원',
  neutral: '무관',
  friend: '우호',
  sworn: '의형제',
};
const REL_SCORE: Record<RelationLevel, number> = { enemy: -2, distant: -1, neutral: 0, friend: 1, sworn: 2 };
// 대련 짝 로테이션 — 주마다 짝을 바꿔 전 페어가 손을 섞는다.
const PAIRINGS: [number, number][][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

interface PairLine {
  label: string;
  start: string;
  end: string;
  delta: number;
}
interface RelResult {
  years: number;
  pairs: PairLine[];
  swornPairs: number;
  feudHealedYear: number | null; // 시드 적대 페어가 무관 이상이 된 해
  events: Record<string, number>;
  timeline: string[]; // 연 단위 한 줄 풍경
}

export default function RelationsSimScreen() {
  const dev = useDevAccess();
  const [years, setYears] = useState(5);
  const [daeryeonOn, setDaeryeonOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RelResult | null>(null);

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
    setAutoSaveEnabled(false); // 고속 진행 쓰기 증폭 방지 — 시뮬 동안 자동 저장 OFF
    setResearchInstant(true); // 실시간 연구 타이머는 시뮬과 양립 불가 — 즉시 완료
    try {
      seedNewRun(SEED);
      useGameStore.getState().setPhase('playing');
      const ds = () => useDiscipleStore.getState();
      const ids = ds().order.slice(0, 4);
      const nameOf = (id: string) => ds().disciples[id]?.name ?? id;
      const relOf = (x: string, y: string): RelationLevel => ds().disciples[x]?.relationships[y] ?? 'neutral';
      const pairKeys: [string, string][] = [];
      for (let i = 0; i < ids.length; i += 1)
        for (let j = i + 1; j < ids.length; j += 1) pairKeys.push([ids[i], ids[j]]);
      const startRel = pairKeys.map(([x, y]) => relOf(x, y));

      const events: Record<string, number> = {};
      const timeline: string[] = [];
      let feudHealedYear: number | null = null;
      const days = years * 336;
      const prevYearRel: string[] = pairKeys.map(([x, y]) => relOf(x, y));

      for (let d = 0; d < days; d += 1) {
        configureOptimal();
        if (daeryeonOn) {
          const t = useTimeStore.getState().current;
          const upcoming = (t.day % 7) + 1;
          if (upcoming === 1 || upcoming === 5) {
            const week = Math.floor(d / 7);
            const pairs = PAIRINGS[week % PAIRINGS.length];
            const sch = useScheduleStore.getState();
            for (const [i, j] of pairs) {
              if (!ids[i] || !ids[j]) continue;
              sch.setDailyChoice(ids[i], 'martial', daeryeonChoiceValue(ids[j]));
              sch.setDailyChoice(ids[j], 'martial', daeryeonChoiceValue(ids[i]));
            }
          }
        }
        advanceTurn();
        const s = useScheduleStore.getState();
        if (s.pendingReport) s.resolveMonthlyReport();
        if (s.pendingSetup) s.resolveMonthlySetup();
        if (usePendingStore.getState().settlement) usePendingStore.getState().clearSettlement();
        const inbox = useInboxStore.getState();
        for (const item of [...inbox.items]) {
          const dom = (item.payload as { domain?: string } | undefined)?.domain ?? item.kind;
          events[dom] = (events[dom] ?? 0) + 1;
          if (isRespondable(item)) {
            const key = dom === 'seclusion_petition' ? 'allow' : responseOptionsFor(item).filter((o) => !o.disabled)[0]?.key;
            if (key) await resolveInboxItem(item, key);
          }
        }
        useInboxStore.getState().reset();

        // 연 경계 — 관계 변화 한 줄 + 적대 페어 화해 시점.
        if ((d + 1) % 336 === 0) {
          const yearNo = Math.floor((d + 1) / 336);
          const changes: string[] = [];
          pairKeys.forEach(([x, y], k) => {
            const now = relOf(x, y);
            if (now !== prevYearRel[k]) {
              changes.push(`${nameOf(x)}↔${nameOf(y)} ${REL_LABEL[prevYearRel[k] as RelationLevel]}→${REL_LABEL[now]}`);
              prevYearRel[k] = now;
            }
          });
          timeline.push(`${yearNo}년차: ${changes.length > 0 ? changes.join(' · ') : '변화 없음'}`);
          if (feudHealedYear == null) {
            const a = relOf(ids[0], ids[1]);
            const b = relOf(ids[1], ids[0]);
            if (REL_SCORE[a] >= 0 && REL_SCORE[b] >= 0) feudHealedYear = yearNo;
          }
          setProgress(Math.round(((d + 1) / days) * 100));
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      const pairs: PairLine[] = pairKeys.map(([x, y], k) => {
        const end = relOf(x, y);
        return {
          label: `${nameOf(x)} ↔ ${nameOf(y)}`,
          start: REL_LABEL[startRel[k]],
          end: REL_LABEL[end],
          delta: REL_SCORE[end] - REL_SCORE[startRel[k]],
        };
      });
      const swornPairs = pairKeys.filter(([x, y]) => relOf(x, y) === 'sworn' && relOf(y, x) === 'sworn').length;
      setResult({ years, pairs, swornPairs, feudHealedYear, events, timeline });
    } finally {
      setAutoSaveEnabled(true);
      setResearchInstant(false);
      setRunning(false);
      setProgress(100);
    }
  };

  return (
    <SafetyZone variant="modal" background={colors.paper}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
        <View style={styles.header}>
          <Text style={styles.title}>관계 시뮬레이션</Text>
          <Text style={styles.sub}>적대 시드 4인 · 실제 시스템(대련·비무·중재) 구동 — 세이브를 새 회차로 덮음</Text>
        </View>

        <View style={styles.row}>
          {[1, 3, 5, 10].map((y) => (
            <Chip key={y} label={`${y}년`} on={years === y} onPress={() => setYears(y)} />
          ))}
          <Chip label={daeryeonOn ? '대련 주2회' : '대련 없음'} on={daeryeonOn} onPress={() => setDaeryeonOn((v) => !v)} />
          <Pressable style={[styles.runBtn, running && styles.off]} disabled={running} onPress={run}>
            <Text style={styles.runText}>{running ? `${progress}%` : '실행'}</Text>
          </Pressable>
        </View>

        {result && (
          <View style={styles.result}>
            <Text style={styles.resultHead}>
              {result.years}년 결과 — 의형제 {result.swornPairs}쌍 · 적대 페어 화해{' '}
              {result.feudHealedYear ? `${result.feudHealedYear}년차` : '실패'}
            </Text>
            {result.pairs.map((p) => (
              <Text key={p.label} style={styles.resultLine}>
                {p.label}: {p.start} → {p.end} {p.delta > 0 ? `(+${p.delta})` : p.delta < 0 ? `(${p.delta})` : ''}
              </Text>
            ))}
            <Text style={styles.sampleHead}>이벤트</Text>
            <Text style={styles.sample}>
              {Object.entries(result.events)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([k, v]) => `${k} ${v}`)
                .join(' · ')}
            </Text>
            <Text style={styles.sampleHead}>과정 (연 단위)</Text>
            {result.timeline.map((t) => (
              <Text key={t} style={styles.sample}>{t}</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.base, paddingTop: spacing.base, alignItems: 'center' },
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
