// [DEV] 자동 랜덤 플레이 — QA 하네스 화면.
// "N년 자동 진행" → 매 턴 랜덤 선택으로 진행, 발동 이벤트·면담·사문이벤트 + 실제 LLM 응답을 로그로.
// 실기기에서 실행하면 온디바이스 LLM(Qwen3)이 실제 호출됨(응답 대기 있음).

import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafetyZone } from '@/components/common/SafetyZone';
import { autoPlayRun, type AutoPlayEvent } from '@/systems/dev/autoPlay';
import { colors, spacing, typography } from '@/theme';

const DOMAIN_LABEL: Record<string, string> = {
  oneLiner: '한마디',
  wish: '희망',
  moral: '도덕갈등',
  meeting: '면담',
  quest_event: '의뢰돌발',
  graduation: '졸업진로',
  seclusion_petition: '폐관청원',
  jianghu_news: '강호소식',
  rumor: '풍문',
  report: '보고',
  spar: '동문비무',
};

export default function AutoPlayScreen() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<AutoPlayEvent[]>([]);
  const [onlyLlm, setOnlyLlm] = useState(false);
  const bufRef = useRef<AutoPlayEvent[]>([]);
  const stopRef = useRef(false);

  const run = async (years: number) => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    setEvents([]);
    bufRef.current = [];
    stopRef.current = false;
    const emit = (e: AutoPlayEvent) => {
      bufRef.current.push(e);
    };
    await autoPlayRun(
      years * 336,
      emit,
      (done, total) => {
        setProgress(Math.round((done / total) * 100));
        setEvents([...bufRef.current]); // 주기적 반영
      },
      () => stopRef.current,
    );
    setEvents([...bufRef.current]);
    setRunning(false);
  };

  const shown = (onlyLlm ? events.filter((e) => e.llmCalled || e.llmPrompt) : events).slice(-300);
  const summary = buildSummary(events);

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <View style={styles.header}>
        <Text style={styles.title}>자동 플레이 QA</Text>
        <Text style={styles.sub}>랜덤 선택 · 실제 LLM 호출(대기 있음)</Text>
      </View>

      <View style={styles.row}>
        {[5, 10, 15].map((y) => (
          <Pressable
            key={y}
            style={[styles.btn, running && styles.btnOff]}
            disabled={running}
            onPress={() => run(y)}
          >
            <Text style={styles.btnText}>{y}년 진행</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.btn, !running && styles.btnOff]}
          disabled={!running}
          onPress={() => {
            stopRef.current = true;
          }}
        >
          <Text style={styles.btnText}>중단</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.prog}>{running ? `진행 ${progress}%` : `완료 ${progress}%`}</Text>
        <Pressable style={styles.filter} onPress={() => setOnlyLlm((v) => !v)}>
          <Text style={styles.filterText}>{onlyLlm ? '☑ LLM만' : '☐ LLM만'}</Text>
        </Pressable>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <ScrollView style={styles.log} contentContainerStyle={{ paddingBottom: spacing.lg }}>
        {shown.map((e, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.entryHead}>
              [{e.date}] {DOMAIN_LABEL[e.domain] ?? e.domain} · {e.title}
            </Text>
            {e.ctx && (
              <Text style={styles.ctx}>
                {e.ctx.name} {e.ctx.age}세 · {e.ctx.realm} · 스트레스 {e.ctx.stress} · 신뢰{' '}
                {e.ctx.trust} · 흑화 {e.ctx.darkness} · {e.ctx.status}
              </Text>
            )}
            {e.choiceLabel && <Text style={styles.choice}>→ 선택: {e.choiceLabel}</Text>}
            {(e.llmPrompt || e.llmRaw) && (
              <View style={styles.llm}>
                <Text style={styles.llmTag}>
                  LLM {e.llmCalled ? '✓적용' : '✗폴백'} ({e.llmSource})
                </Text>
                {e.llmRaw && <Text style={styles.llmRaw}>raw: {e.llmRaw}</Text>}
              </View>
            )}
          </View>
        ))}
        {shown.length === 0 && <Text style={styles.empty}>아직 로그 없음. 위 버튼으로 시작.</Text>}
      </ScrollView>
    </SafetyZone>
  );
}

function buildSummary(events: AutoPlayEvent[]): string {
  const byDomain: Record<string, number> = {};
  let llm = 0;
  let llmOk = 0;
  for (const e of events) {
    byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
    if (e.llmPrompt || e.llmRaw) llm += 1;
    if (e.llmCalled) llmOk += 1;
  }
  const parts = Object.entries(byDomain)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${DOMAIN_LABEL[k] ?? k} ${v}`);
  return `총 ${events.length}건 · LLM 호출 ${llm}(적용 ${llmOk}) · ${parts.join(' / ')}`;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.base, paddingTop: spacing.sm, gap: 2 },
  title: { fontFamily: typography.serifBold, fontSize: typography.sizes.lg, color: colors.ink },
  sub: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.inkSoft },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  btn: {
    borderWidth: 1,
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  btnOff: { opacity: 0.4 },
  btnText: { fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.ink },
  prog: { flex: 1, fontFamily: typography.serifMedium, fontSize: typography.sizes.sm, color: colors.brown },
  filter: { borderWidth: 1, borderColor: colors.inkSoft, borderRadius: 4, paddingVertical: 4, paddingHorizontal: spacing.sm },
  filterText: { fontFamily: typography.serif, fontSize: typography.sizes.xs, color: colors.ink },
  summary: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
  },
  log: { flex: 1, paddingHorizontal: spacing.base },
  entry: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
    paddingVertical: 6,
    gap: 2,
  },
  entryHead: { fontFamily: typography.serifMedium, fontSize: typography.sizes.xs, color: colors.ink },
  ctx: { fontFamily: typography.serif, fontSize: 10, color: colors.inkSoft },
  choice: { fontFamily: typography.serif, fontSize: 10, color: colors.brown },
  llm: { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: 4, marginTop: 2 },
  llmTag: { fontFamily: typography.serifMedium, fontSize: 10, color: colors.seal },
  llmRaw: { fontFamily: typography.serif, fontSize: 9, color: colors.inkLight },
  empty: { fontFamily: typography.serif, fontSize: typography.sizes.sm, color: colors.inkSoft, padding: spacing.base },
});
