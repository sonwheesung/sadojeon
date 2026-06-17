import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfirm } from '@/components/common/ConfirmDialog';
import { ROUTE_LABEL } from '@/data/careers';
import { useGraduateStore } from '@/stores/graduateStore';
import { useOutreachStore } from '@/stores/outreachStore';
import { useTimeStore } from '@/stores/timeStore';
import { canOutreach, pendingFor, sendLetter, sendSummon } from '@/systems/masterOutreachSystem';
import type { LetterTone } from '@/stores/outreachStore';
import { colors, radius, spacing, typography } from '@/theme';

// 사부 개입 모달 — 하산 제자에게 서신(격려·충고·경고)·호출. docs/08.
// 전갈은 1계절 뒤 닿고, 들을지는 제자 몫(신뢰·노선). 결과는 풍문 서신. 효과 직접 노출 X(feedback_hidden_game_state).

const ACTIONS: { key: 'summon' | LetterTone; label: string; desc: string }[] = [
  { key: 'encourage', label: '격려 서신', desc: '강호의 분투를 북돋운다.' },
  { key: 'advise', label: '충고 서신', desc: '나아갈 길에 가르침을 전한다.' },
  { key: 'warn', label: '경고 서신', desc: '그릇된 길을 꾸짖어 돌이키려 한다.' },
  { key: 'summon', label: '산문으로 부른다', desc: '제자를 불러 직접 돌본다. 응함은 제자의 몫.' },
];

export function MasterOutreachModal({
  graduateId,
  onClose,
}: {
  graduateId: string | null;
  onClose: () => void;
}) {
  const confirm = useConfirm();
  // 발신 후 pending 갱신이 화면에 반영되도록 구독.
  useOutreachStore((s) => s.pending);
  const today = useTimeStore((s) => s.totalDay);
  const g = useGraduateStore((s) => s.records.find((r) => r.id === graduateId));

  if (!graduateId || !g) return <Modal visible={false} transparent />;

  const pending = pendingFor(g.id);
  const gate = canOutreach(g);

  const onAct = async (key: 'summon' | LetterTone) => {
    const label = ACTIONS.find((a) => a.key === key)?.label ?? '전갈';
    const ok = await confirm({
      title: label,
      message: `${g.name}에게 ${label}을(를) 보냅니다. 전갈이 닿는 데 한 계절이 걸리고, 들을지는 제자의 몫입니다.`,
      confirmLabel: '보낸다',
    });
    if (!ok) return;
    if (key === 'summon') sendSummon(g.id);
    else sendLetter(g.id, key);
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{g.name}</Text>
          <Text style={styles.sub}>
            {ROUTE_LABEL[g.route]} · {g.title}
          </Text>
          <View style={styles.divider} />

          {pending ? (
            <Text style={styles.pending}>
              전갈이 가는 중이다 — 남은 {Math.max(0, pending.dueDay - today)}일.
            </Text>
          ) : !gate.ok ? (
            <Text style={styles.pending}>{gate.reason}</Text>
          ) : (
            <View style={styles.actions}>
              {ACTIONS.map((a) => (
                <Pressable
                  key={a.key}
                  onPress={() => onAct(a.key)}
                  style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                >
                  <Text style={styles.actionLabel}>{a.label}</Text>
                  <Text style={styles.actionDesc}>{a.desc}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.actionPressed]}>
            <Text style={styles.closeLabel}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.brown,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.inkSoft, opacity: 0.4, marginVertical: spacing.xs },
  pending: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  actions: { gap: spacing.sm },
  action: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.brown,
    backgroundColor: colors.paperBright,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: 2,
  },
  actionPressed: { opacity: 0.85 },
  actionLabel: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  actionDesc: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  close: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.paperLight,
  },
  closeLabel: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.inkSoft,
  },
});
