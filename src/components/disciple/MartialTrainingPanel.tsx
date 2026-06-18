import { josa } from '@/utils/korean';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { starText } from '@/data/labels';
import {
  canLearnArt,
  evaluateArtConflict,
  findMartialArt,
  seongCap,
  seongToStage,
  talentMet,
  unmetPrerequisites,
} from '@/data/martialArts';
import { artGradeLearnRealm, artGradeRealmCeiling, realmIndex } from '@/data/realm';
import { useCodexStore } from '@/stores/codexStore';
import { useDiscipleStore } from '@/stores/discipleStore';
import { colors, radius, spacing, typography } from '@/theme';
import type { Disciple } from '@/types';
import {
  MARTIAL_ART_GRADE_LABEL,
  MARTIAL_PATH_LABEL,
  MARTIAL_STAGE_LABEL,
} from '@/types/martialArt';
import { REALM_LABEL } from '@/types/realm';

// 무공 수련 패널 — 보유 무공(성·주력) + 사문 무공서에서 골라 전수→주력 지정. docs/26 §5-1.
// 연구 게이트: 연구를 마친(complete) 비급만 전수 가능 — 미연구는 '연구 필요'(도감의 연구 패널에서). docs/05.
export function MartialTrainingPanel({ disciple }: { disciple: Disciple }) {
  const confirm = useConfirm();
  const assignMain = useDiscipleStore((s) => s.assignMainMartialArt);
  const scrolls = useCodexStore((s) => s.scrolls);
  const [picking, setPicking] = useState(false);

  const mainId = disciple.mainMartialArtId ?? disciple.martialArts[0]?.artId;

  async function onPick(artId: string) {
    const art = findMartialArt(artId);
    if (!art) return;
    const has = disciple.martialArts.some((a) => a.artId === artId);
    const conflict = evaluateArtConflict(disciple, art);

    // 충돌 경고는 차단이 아니라 사부의 결정 — danger 톤. docs/26 §5-3.
    let message: string;
    let tone: 'default' | 'danger' = 'default';
    if (conflict === 'ma') {
      tone = 'danger';
      message =
        '이 무공은 마공이다. 익히면 그 아이의 마음이 차츰 물든다 — 위력은 크나 인격이 위태롭다.';
    } else if (conflict === 'opposing') {
      tone = 'danger';
      message =
        '이 무공은 그 아이가 익힌 무공과 결이 정면으로 어긋난다 — 심법이 충돌해 주화입마의 화가 따를 수 있다.';
    } else {
      message = has
        ? '이 무공을 주력으로 삼아 수련합니다.'
        : '새 무공을 전수하고 주력으로 삼습니다. 지금 경지에 걸맞은 성에서 출발하며, 익히던 무공은 그대로 보존됩니다.';
    }

    const ok = await confirm({
      title: `${josa(art.name, '을', '를')} 주력으로 삼을까요?`,
      message,
      tone,
    });
    if (ok) {
      assignMain(disciple.id, artId);
      setPicking(false);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <SectionLabel>무공 수련</SectionLabel>
        <View style={styles.headerBtns}>
          <Pressable
            style={styles.pickButton}
            onPress={() => router.push(`/martial-codex?discipleId=${disciple.id}` as Href)}
            accessibilityRole="button"
            accessibilityLabel="무공 계보"
          >
            <Text style={styles.pickLabel}>계보 ▶</Text>
          </Pressable>
          <Pressable
            style={styles.pickButton}
            onPress={() => setPicking((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="무공서 고르기"
          >
            <Text style={styles.pickLabel}>{picking ? '닫기' : '무공서 고르기 ▾'}</Text>
          </Pressable>
        </View>
      </View>

      {/* 보유 무공 */}
      <View style={styles.list}>
        {disciple.martialArts.length === 0 ? (
          <Text style={styles.empty}>아직 익힌 무공이 없다.</Text>
        ) : (
          disciple.martialArts.map((inst) => {
            const art = findMartialArt(inst.artId);
            const isMain = inst.artId === mainId;
            const band = MARTIAL_STAGE_LABEL[seongToStage(inst.seong)];
            return (
              <View key={inst.artId} style={styles.learnedRow}>
                <Text style={[styles.artName, isMain && styles.artNameMain]} numberOfLines={1}>
                  {art?.name ?? inst.artId}
                </Text>
                <Text style={styles.seong}>
                  {band} {inst.seong}성
                </Text>
                {isMain && <Text style={styles.mainChip}>주력</Text>}
              </View>
            );
          })
        )}
      </View>

      {/* 무공서 선택 (사문 보유 비급) */}
      {picking && (
        <View style={styles.picker}>
          <Text style={styles.pickerHint}>사문 무공서 — 골라 주력으로 전수</Text>
          {scrolls.length === 0 ? (
            <Text style={styles.empty}>사문에 무공서가 없다.</Text>
          ) : (
            scrolls.map((sc) => {
              const art = findMartialArt(sc.artId);
              if (!art) return null;
              const learnable = canLearnArt(disciple, art);
              const has = disciple.martialArts.some((a) => a.artId === sc.artId);
              const researched = sc.status === 'complete';
              const isMain = sc.artId === mainId;
              const ceiling = REALM_LABEL[artGradeRealmCeiling(art.grade)];
              const needRealm = artGradeLearnRealm(art.grade);
              const realmOk = realmIndex(disciple.realm) >= realmIndex(needRealm);
              const unmet = unmetPrerequisites(disciple, art);
              const prereqLabel =
                unmet.length > 0
                  ? `${findMartialArt(unmet[0].artId)?.name ?? '선행 무공'} ${unmet[0].minSeong}성 필요`
                  : null;
              const disabled = isMain || (!has && (!learnable || !researched));
              const stateLabel = isMain
                ? '주력'
                : has
                  ? '보유'
                  : !researched
                    ? '연구 필요'
                    : learnable
                      ? '전수 ▶'
                      : !realmOk
                        ? `${REALM_LABEL[needRealm]} 필요`
                        : prereqLabel
                          ? prereqLabel
                          : !talentMet(disciple, art)
                            ? '재능 부족'
                            : '—';
              return (
                <Pressable
                  key={sc.artId}
                  style={[styles.scrollRow, disabled && styles.scrollRowDisabled]}
                  disabled={disabled}
                  onPress={() => onPick(sc.artId)}
                  accessibilityRole="button"
                  accessibilityLabel={`${art.name} 전수`}
                >
                  <View style={styles.scrollMain}>
                    <Text style={styles.scrollName} numberOfLines={1}>
                      {art.name}
                    </Text>
                    <Text style={styles.scrollMeta} numberOfLines={1}>
                      {MARTIAL_PATH_LABEL[art.path]} · {MARTIAL_ART_GRADE_LABEL[art.grade]} {starText(GRADE_STAR[art.grade])} · {ceiling}까지 · 최고 {seongCap(art.grade)}성
                    </Text>
                  </View>
                  <Text style={styles.scrollState}>{stateLabel}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const GRADE_STAR: Record<string, number> = {
  novice: 1,
  apprentice: 2,
  master: 3,
  grandmaster: 4,
  legendary: 5,
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pickButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pickLabel: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  list: { gap: 4 },
  empty: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  learnedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  artName: {
    flex: 1,
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  artNameMain: {
    fontFamily: typography.serifBold,
    color: colors.brown,
  },
  seong: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  mainChip: {
    fontFamily: typography.serifBold,
    fontSize: 10,
    color: colors.paper,
    backgroundColor: colors.brown,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  picker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
    backgroundColor: colors.paperLight,
  },
  pickerHint: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
    marginBottom: 2,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkSoft,
  },
  scrollRowDisabled: { opacity: 0.45 },
  scrollMain: { flex: 1, gap: 1 },
  scrollName: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  scrollMeta: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  scrollState: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.seal,
  },
});
