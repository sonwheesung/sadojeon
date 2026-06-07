import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiscipleArt } from './DiscipleArt';
import { DiscipleProfile } from './DiscipleProfile';
import { RECRUIT_POOL, findRecruit, type RecruitCandidate } from '@/data/disciples/recruitPool';
import { STARTING_DISCIPLE_POOL, type StartingDisciple } from '@/data/disciples/startingPool';
import { SECT } from '@/data/constants';
import { seedNewRun } from '@/systems/newRun';
import { colors, radius, spacing, typography } from '@/theme';

// 시작 선택 모달 — 회차 첫 진입(master==null) 시 표시.
// 2단 흐름: ① 명부(세로 갤러리, 일러스트+이름) → 탭 → ② 상세(유년 신상) → 거두기.
// 선택된 제자는 일러스트 활성(인장 테두리), 나머지는 비활성(흐림). 최소 2 / 최대 4.
// 거두지 않은 후보는 강호로 흩어진다 (docs/08 NPC 시드).
interface Props {
  visible: boolean;
  onComplete: () => void;
}

function poolOf(poolId: string): StartingDisciple | undefined {
  return STARTING_DISCIPLE_POOL.find((d) => d.id === poolId);
}

export function StartSelectModal({ visible, onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<string | null>(null); // 상세 보는 poolId

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= SECT.CAPACITY) return prev;
      return [...prev, id];
    });
  };

  const onStart = () => {
    if (selected.length < SECT.MIN) return;
    seedNewRun(selected);
    setSelected([]);
    setViewing(null);
    onComplete();
  };

  const canStart = selected.length >= SECT.MIN;
  const atCapacity = selected.length >= SECT.CAPACITY;
  const viewingCandidate = viewing ? findRecruit(viewing) : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {viewingCandidate ? (
            <DetailView
              candidate={viewingCandidate}
              isSelected={selected.includes(viewingCandidate.poolId)}
              atCapacity={atCapacity}
              onToggle={() => toggle(viewingCandidate.poolId)}
              onBack={() => setViewing(null)}
            />
          ) : (
            <>
              <Text style={styles.title}>사문 개창</Text>
              <Text style={styles.subtitle}>
                거둘 제자를 고른다 — 최소 {SECT.MIN}명, 최대 {SECT.CAPACITY}명
              </Text>
              <Text style={styles.counter}>
                {selected.length} / {SECT.CAPACITY} 선택
              </Text>

              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {RECRUIT_POOL.map((c) => (
                  <GalleryRow
                    key={c.poolId}
                    candidate={c}
                    isSelected={selected.includes(c.poolId)}
                    onOpen={() => setViewing(c.poolId)}
                  />
                ))}
              </ScrollView>

              <Pressable
                style={({ pressed }) => [
                  styles.confirm,
                  !canStart && styles.confirmDisabled,
                  pressed && canStart && styles.pressed,
                ]}
                onPress={onStart}
                disabled={!canStart}
                accessibilityRole="button"
                accessibilityLabel="회차 시작"
              >
                <Text style={[styles.confirmLabel, !canStart && styles.confirmLabelDisabled]}>
                  {canStart ? '거두고 시작 ▶' : `${SECT.MIN}명 이상 선택`}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── 명부 한 줄 (일러스트 + 이름 + 첫인상) ─────────────────────────────────────
function GalleryRow({
  candidate,
  isSelected,
  onOpen,
}: {
  candidate: RecruitCandidate;
  isSelected: boolean;
  onOpen: () => void;
}) {
  const pool = poolOf(candidate.poolId);
  const name = pool?.name ?? candidate.poolId;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isSelected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${name} 상세 보기${isSelected ? ' (선택됨)' : ''}`}
    >
      <DiscipleArt poolId={candidate.poolId} name={name} active={isSelected} size={56} />
      <View style={styles.rowBody}>
        <View style={styles.rowHead}>
          <Text style={[styles.name, isSelected && styles.nameSelected]}>{name}</Text>
          <Text style={styles.hanja}>{pool?.hanjaName ?? '?'}</Text>
          {isSelected && (
            <View style={styles.check}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.story} numberOfLines={2}>
          {candidate.storyLine}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

// ─── 상세 (유년 신상 + 거두기) ─────────────────────────────────────────────────
function DetailView({
  candidate,
  isSelected,
  atCapacity,
  onToggle,
  onBack,
}: {
  candidate: RecruitCandidate;
  isSelected: boolean;
  atCapacity: boolean;
  onToggle: () => void;
  onBack: () => void;
}) {
  const pool = poolOf(candidate.poolId);
  const name = pool?.name ?? candidate.poolId;
  const lockedOut = !isSelected && atCapacity;

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="명부로 돌아가기"
      >
        <Text style={styles.backLabel}>‹ 명부로</Text>
      </Pressable>

      <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHead}>
          <DiscipleArt poolId={candidate.poolId} name={name} active={isSelected} size={120} />
          <Text style={[styles.detailName, isSelected && styles.nameSelected]}>{name}</Text>
          <Text style={styles.detailHanja}>{pool?.hanjaName ?? '?'}</Text>
        </View>

        <Text style={styles.detailStory}>{candidate.storyLine}</Text>

        <DiscipleProfile profile={candidate.childhood} />
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.confirm,
          isSelected && styles.deselect,
          lockedOut && styles.confirmDisabled,
          pressed && !lockedOut && styles.pressed,
        ]}
        onPress={onToggle}
        disabled={lockedOut}
        accessibilityRole="button"
        accessibilityLabel={isSelected ? `${name} 거둠 취소` : `${name} 거두기`}
      >
        <Text
          style={[
            styles.confirmLabel,
            isSelected && styles.deselectLabel,
            lockedOut && styles.confirmLabelDisabled,
          ]}
        >
          {isSelected ? '거둠 취소' : lockedOut ? '정원이 찼습니다' : '이 아이를 거두기'}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    height: '92%',
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  counter: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  pressed: { opacity: 0.85 },

  // 명부 갤러리
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.paperLight,
  },
  rowSelected: {
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: colors.seal,
    backgroundColor: colors.paperBright,
  },
  rowBody: { flex: 1, gap: 4 },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  name: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  nameSelected: { color: colors.seal },
  hanja: {
    flex: 1,
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.seal,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.sm,
    color: colors.seal,
  },
  story: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    lineHeight: typography.sizes.xs * 1.4,
  },
  chevron: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xl,
    color: colors.inkSoft,
  },

  // 상세
  back: { alignSelf: 'flex-start', paddingVertical: 2 },
  backLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.brown,
  },
  detailScroll: { flex: 1 },
  detailHead: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: spacing.sm,
  },
  detailName: {
    marginTop: spacing.xs,
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    letterSpacing: typography.letterSpacing.wide,
  },
  detailHanja: {
    fontFamily: typography.serifCN,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
  detailStory: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkLight,
    lineHeight: typography.sizes.sm * 1.5,
    textAlign: 'center',
    paddingBottom: spacing.xs,
  },

  // 버튼 (시작 / 거두기 공용)
  confirm: {
    marginTop: spacing.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
  },
  confirmDisabled: {
    borderColor: colors.inkSoft,
    backgroundColor: colors.paperLight,
    opacity: 0.55,
  },
  confirmLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.md,
    color: colors.brown,
    letterSpacing: typography.letterSpacing.wider,
  },
  confirmLabelDisabled: { color: colors.inkSoft },
  deselect: {
    borderColor: colors.seal,
    backgroundColor: colors.paper,
  },
  deselectLabel: { color: colors.seal },
});
