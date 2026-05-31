import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { findMartialArt } from '@/data/martialArts';
import { PLATEAU } from '@/data/constants';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTimeStore } from '@/stores/timeStore';
import { OVERRIDE_LABEL } from '@/systems/overrideSystem';
import { staminaSceneLabel } from '@/systems/staminaSystem';
import type { Disciple, DiscipleStatus } from '@/types';
import { MARTIAL_STAGE_LABEL } from '@/types/martialArt';
import { REALM_LABEL } from '@/types/realm';
import { colors, radius, spacing, typography } from '@/theme';

const STATUS_LABEL: Record<DiscipleStatus, string> = {
  training: '수련 중',
  resting: '휴식 중',
  injured: '치료 중',
  meditating: '폐관 중',
  questing: '의뢰 파견 중',
  graduated: '졸업',
  departed: '하산',
};

function trustLabel(value: number): string {
  // 0~100 → 0~5 단계
  const level = Math.min(5, Math.max(0, Math.round(value / 20)));
  return `신뢰 ${level}/5`;
}

// 메인 무공 한 줄 풍경 — "{무공명} {단계} — 손맛 풍경".
// 메인 무공 없으면 null (행 표시 X).
function mainArtScene(d: Disciple): { text: string; tone: 'normal' | 'doorstep' } | null {
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  if (!main) return null;
  const art = findMartialArt(main.artId);
  const name = art?.name ?? main.artId;
  const stage = MARTIAL_STAGE_LABEL[main.stage];
  if (main.progress >= PLATEAU.SECOND_START) {
    return { text: `${name} ${stage} — 다음 경지가 코앞이다`, tone: 'doorstep' };
  }
  if (main.progress >= PLATEAU.FIRST_START) {
    return { text: `${name} ${stage} — 손에 익어 간다`, tone: 'normal' };
  }
  if (main.progress >= 30) {
    return { text: `${name} ${stage} — 한결 다듬어졌다`, tone: 'normal' };
  }
  return { text: `${name} ${stage} — 형을 짚는 중`, tone: 'normal' };
}

// 마음 상태 — 정체기 진입 시만 한 줄. 평소엔 null.
// 메인 무공 진척이 정체 구간(>= 70)에 들어가면 표시.
function mindScene(d: Disciple): { text: string; tone: 'mild' | 'heavy' } | null {
  const main = d.mainMartialArtId
    ? d.martialArts.find((a) => a.artId === d.mainMartialArtId)
    : d.martialArts[0];
  if (!main) return null;
  if (main.progress >= PLATEAU.SECOND_START) {
    return { text: '벽 앞에 선 듯, 무언가 가로막혀 있다', tone: 'heavy' };
  }
  if (main.progress >= PLATEAU.FIRST_START) {
    return { text: '마음에 풀리지 않은 것이 있는 듯하다', tone: 'mild' };
  }
  return null;
}

interface Props {
  disciple: Disciple;
}

export function DiscipleStatusPanel({ disciple }: Props) {
  const currentYear = useTimeStore((s) => s.current.year);
  const totalDay = useTimeStore((s) => s.totalDay);
  const override = useScheduleStore((s) => s.overrides[disciple.id]);

  const remaining =
    override && totalDay < override.startedAtDay + override.durationDays
      ? override.startedAtDay + override.durationDays - totalDay
      : 0;
  const onLeave = !!override && remaining > 0 && override.command !== 'default';
  const orderLine = onLeave
    ? `${OVERRIDE_LABEL[override!.command]} (${remaining}일 남음)`
    : '사문 디폴트 일정';

  const yearsIn = Math.max(1, currentYear - disciple.entryYear + 1);
  const art = mainArtScene(disciple);
  const mind = mindScene(disciple);

  return (
    <View style={styles.section}>
      <SectionLabel>현재 상태</SectionLabel>
      <View style={styles.panel}>
        <Row label="입문" value={`${yearsIn}년차`} />
        <Row
          label="상태"
          value={onLeave ? `${OVERRIDE_LABEL[override!.command]} 중` : STATUS_LABEL[disciple.status]}
          valueStyle={onLeave ? styles.rowValueHeavy : undefined}
        />
        <Row label="명령" value={orderLine} valueStyle={onLeave ? styles.rowValueHeavy : undefined} />
        <Row label="기색" value={staminaSceneLabel(disciple.stamina, disciple.maxStamina)} />
        <Row label="신뢰" value={trustLabel(disciple.trustToMaster)} />
        <Row
          label="경지"
          value={REALM_LABEL[disciple.realm]}
          valueStyle={styles.rowValueDoorstep}
        />
        <Row
          label="경지 진척"
          value={`무공 ${disciple.realmProgress.martial}% · 내공 ${disciple.realmProgress.internal}`}
        />
        {art && (
          <Row
            label="무공"
            value={art.text}
            valueStyle={art.tone === 'doorstep' ? styles.rowValueDoorstep : undefined}
          />
        )}
        {mind && (
          <Row
            label="마음"
            value={mind.text}
            valueStyle={mind.tone === 'heavy' ? styles.rowValueHeavy : styles.rowValueMild}
          />
        )}
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  rowLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    width: 56,
  },
  rowValue: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'right',
  },
  rowValueDoorstep: {
    fontFamily: typography.serifBold,
    color: colors.brown,
  },
  rowValueMild: {
    color: colors.inkSoft,
    fontStyle: 'italic',
  },
  rowValueHeavy: {
    fontFamily: typography.serifBold,
    color: colors.seal,
  },
});
