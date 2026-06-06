import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import {
  MartialArtHeader,
  NextRequirement,
  ProgressBar,
  StageTree,
} from '@/components/martial-art';
import { TRAIN_ACTION_LABEL } from '@/data/labels';
import {
  findMartialArt,
  expToNextSeong,
  seongCap,
  seongToStage,
} from '@/data/martialArts';
import { useDiscipleStore } from '@/stores/discipleStore';
import { colors, spacing, typography } from '@/theme';
import type {
  MartialArtGrade,
  MartialArtInstance,
  MartialArtSchool,
  MartialStage,
} from '@/types';

const SCHOOL_LABEL: Record<MartialArtSchool, string> = {
  sword: '검법',
  fist: '권법',
  palm: '장법',
  staff: '봉술',
  qigong: '내공',
  lightness: '보법',
  medical: '의술',
  darkArts: '마공',
};

const GRADE_TO_STAR: Record<MartialArtGrade, number> = {
  novice: 1,
  apprentice: 2,
  master: 3,
  grandmaster: 4,
  legendary: 5,
};

// 밴드별 다음 요건 — docs/26_무공_숙련도.md. 그레이박스 텍스트.
const NEXT_REQ: Record<MartialStage, string> = {
  introduction: '꾸준한 초식 수련으로 성을 쌓는다',
  small_completion: '실전 경험을 더해 성을 깊인다',
  great_completion: '깨달음과 정진으로 극의에 다가간다',
  ultimate: '극성 — 이 무공의 끝에 닿았다',
};

// 현재 성 + 성 안 EXP 막대 + 다음 요건. 상한 도달 시 "(최대)". docs/26.
function SeongProgress({
  instance,
  grade,
}: {
  instance: MartialArtInstance;
  grade: MartialArtGrade;
}) {
  const cap = seongCap(grade);
  const atCap = instance.seong >= cap;
  const need = expToNextSeong(instance.seong);
  const frac = atCap ? 100 : Math.min(100, (instance.exp / need) * 100);
  return (
    <>
      <ProgressBar
        label="숙련"
        progress={frac}
        rightLabel={atCap ? `${cap}성 (최대)` : `${instance.seong}성`}
      />
      <NextRequirement
        text={
          atCap
            ? `이 비급의 한계 ${cap}성에 이르렀다.`
            : NEXT_REQ[seongToStage(instance.seong)]
        }
      />
    </>
  );
}

export default function MartialArtScreen() {
  const { target } = useLocalSearchParams<{ target: string }>();
  const disciple = useDiscipleStore((s) =>
    target ? s.disciples[target] : undefined,
  );

  const mainInstance = disciple
    ? disciple.mainMartialArtId
      ? disciple.martialArts.find((a) => a.artId === disciple.mainMartialArtId)
      : disciple.martialArts[0]
    : undefined;

  const art = mainInstance ? findMartialArt(mainInstance.artId) : undefined;

  return (
    <SafetyZone variant="modal" background={colors.background}>
      <PaperCard>
        <Header onBack={() => router.back()} />
        {art && mainInstance ? (
          <View style={styles.body}>
            <MartialArtHeader
              name={art.name}
              hanjaName={art.hanjaName}
              school={SCHOOL_LABEL[art.school]}
              grade={GRADE_TO_STAR[art.grade]}
            />
            <View style={styles.progressPanel}>
              <StageTree current={seongToStage(mainInstance.seong)} />
              <SeongProgress instance={mainInstance} grade={art.grade} />
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {disciple ? '익히는 무공이 없다.' : '제자를 찾을 수 없다.'}
            </Text>
          </View>
        )}
        <Footer onStart={() => router.back()} onCancel={() => router.back()} />
      </PaperCard>
    </SafetyZone>
  );
}

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
        <Text style={styles.title}>무공 수련</Text>
      </View>
      <View style={{ width: 32 }} />
    </View>
  );
}

function Footer({ onStart, onCancel }: { onStart: () => void; onCancel: () => void }) {
  return (
    <View style={styles.footer}>
      <Pressable
        style={styles.startButton}
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={TRAIN_ACTION_LABEL.start}
      >
        <Text style={styles.startLabel}>{TRAIN_ACTION_LABEL.start}</Text>
      </Pressable>
      <Pressable
        style={styles.cancelButton}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={TRAIN_ACTION_LABEL.cancel}
      >
        <Text style={styles.cancelLabel}>{TRAIN_ACTION_LABEL.cancel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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

  body: {
    flex: 1,
    gap: spacing.base,
    paddingVertical: spacing.sm,
  },

  progressPanel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 8,
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.paperLight,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.md,
    color: colors.inkSoft,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  startButton: {
    flex: 2,
    height: 48,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.seal,
    letterSpacing: typography.letterSpacing.wider,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
});
