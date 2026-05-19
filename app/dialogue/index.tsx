import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  TONE_AFFINITY_DELTA,
  useEncounterStore,
  type Tone,
} from '@/stores/encounterStore';
import { colors, spacing, typography } from '@/theme';

// ─── Placeholder data ───────────────────────────────────────────────────────

const MASTER_INSIGHT = 3;
const FALLBACK_SUBTITLE = '본명 모름 · 13세 추정';

type Speaker = 'master' | 'child';

interface Turn {
  speaker: Speaker;
  text: string;
  description?: string;
}

interface Option {
  tone: Tone;
  text: string;
}

const LOG: Turn[] = [
  {
    speaker: 'master',
    text: '이름이 무엇이냐?',
    description: '아이는 사부의 얼굴을 잠시 본다.',
  },
  {
    speaker: 'child',
    text: '...강가에서 왔습니다.',
    description: '아이는 시선을 낮춘 채 작은 목소리로 말한다.',
  },
  {
    speaker: 'master',
    text: '그러면 너의 이름은 강가아이라 부르마. 괜찮으냐?',
    description: '사부는 아이의 대답을 기다린다.',
  },
  {
    speaker: 'child',
    text: '...괜찮습니다.',
    description: '아이는 잠시 망설인 뒤 고개를 끄덕인다.',
  },
];

const OPTIONS: Option[] = [
  { tone: '다정', text: '무서울 것 없다. 천천히 말해도 좋다.' },
  { tone: '시험', text: '너는 왜 이 길에 서 있느냐?' },
  { tone: '엄격', text: '답하지 않으면 나는 떠난다.' },
  { tone: '침묵', text: '(말없이 아이를 본다.)' },
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function DialogueScreen() {
  const current = useEncounterStore((s) => s.current);
  const adjustAffinity = useEncounterStore((s) => s.adjustAffinity);

  const targetName = current?.name ?? '강가아이';
  const targetSub = current
    ? `${current.realName ?? '본명 모름'} · ${current.ageEstimate}세 추정`
    : FALLBACK_SUBTITLE;

  const speakerLabel: Record<Speaker, string> = {
    master: '사부',
    child: targetName,
  };

  const onChoose = (tone: Tone) => {
    adjustAffinity(TONE_AFFINITY_DELTA[tone]);
    // TODO: 시나리오 풀 연결 시 어조별 후속 turn(사부 발화 + 아이 응답) 누적.
  };

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header
          name={targetName}
          subtitle={targetSub}
          insight={MASTER_INSIGHT}
        />
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <SceneBanner />
          <DialogueLog turns={LOG} speakerLabel={speakerLabel} />
        </ScrollView>
        <ResponseOptions options={OPTIONS} onChoose={onChoose} />
        <Footer />
      </PaperCard>
    </SafetyZone>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Header({
  name,
  subtitle,
  insight,
}: {
  name: string;
  subtitle: string;
  insight: number;
}) {
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
        <View style={styles.headerTitle}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text style={styles.headerMeta}>사부 통찰 {insight}/5</Text>
    </View>
  );
}

function SceneBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerLabel}>대화 장면 베너 자리</Text>
    </View>
  );
}

function DialogueLog({
  turns,
  speakerLabel,
}: {
  turns: Turn[];
  speakerLabel: Record<Speaker, string>;
}) {
  return (
    <View style={styles.log}>
      {turns.map((turn, idx) => (
        <TurnView key={idx} turn={turn} speakerLabel={speakerLabel} />
      ))}
    </View>
  );
}

function TurnView({
  turn,
  speakerLabel,
}: {
  turn: Turn;
  speakerLabel: Record<Speaker, string>;
}) {
  return (
    <View style={styles.turn}>
      <Text style={styles.speaker}>{speakerLabel[turn.speaker]} ─</Text>
      <Text style={styles.speech}>{turn.text}</Text>
      {turn.description && (
        <Text style={styles.description}>({turn.description})</Text>
      )}
    </View>
  );
}

function ResponseOptions({
  options,
  onChoose,
}: {
  options: Option[];
  onChoose: (tone: Tone) => void;
}) {
  return (
    <View style={styles.options}>
      {options.map((o) => (
        <Pressable
          key={o.tone}
          onPress={() => onChoose(o.tone)}
          style={styles.option}
          accessibilityRole="button"
          accessibilityLabel={`${o.tone}으로 답하기: ${o.text}`}
        >
          <Text style={styles.optionTone}>[{o.tone}]</Text>
          <Text style={styles.optionText}>{o.text}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="대화 끝내기"
        style={styles.endButton}
      >
        <Text style={styles.endLabel}>대화 끝내기</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
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
    gap: 0,
    flexShrink: 1,
  },
  headerName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
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
    gap: spacing.md,
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

  // Dialogue log
  log: {
    gap: spacing.md,
  },
  turn: {
    gap: 2,
  },
  speaker: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    letterSpacing: typography.letterSpacing.wide,
  },
  speech: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
    lineHeight: 24,
  },
  description: {
    fontFamily: typography.serif,
    fontStyle: 'italic',
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    paddingLeft: spacing.sm,
    marginTop: 2,
  },

  // Response options
  options: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  optionTone: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  optionText: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    lineHeight: 20,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
  },
  endButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  endLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
});
