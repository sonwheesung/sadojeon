import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { MARTIAL_STAGE_LABEL, MARTIAL_STAGE_ORDER, type MartialStage } from '@/types';

interface StageTreeProps {
  current: MartialStage; // 현재 도달 단계
  reachedIndex?: number; // 도달한 최대 단계 (default: current 인덱스)
}

// 무공 학습 — 5단계 노드 트리. 시안 결 (입문→소성→대성→화경→초절정).
// 도달한 노드 = 진한 채움, 미도달 = 점선 빈 원, 현재 = 위에 붉은 인장 점.
export function StageTree({ current, reachedIndex }: StageTreeProps) {
  const currentIdx = MARTIAL_STAGE_ORDER.indexOf(current);
  const reached = reachedIndex ?? currentIdx;

  return (
    <View style={styles.tree}>
      {MARTIAL_STAGE_ORDER.map((stage, idx) => {
        const isReached = idx <= reached;
        const isCurrent = idx === currentIdx;
        const leftFilled = idx <= reached && idx > 0;
        const rightFilled = idx < reached;

        return (
          <View key={stage} style={styles.col}>
            <View style={[styles.dot, !isCurrent && styles.dotHidden]} />
            <View style={styles.nodeRow}>
              {idx > 0 ? (
                <View style={[styles.line, !leftFilled && styles.lineMuted]} />
              ) : (
                <View style={styles.lineSpacer} />
              )}
              <View style={[styles.node, !isReached && styles.nodeUnreached]}>
                {isReached ? <View style={styles.nodeFill} /> : null}
              </View>
              {idx < MARTIAL_STAGE_ORDER.length - 1 ? (
                <View style={[styles.line, !rightFilled && styles.lineMuted]} />
              ) : (
                <View style={styles.lineSpacer} />
              )}
            </View>
            <Text style={[styles.label, !isReached && styles.labelMuted]}>
              {MARTIAL_STAGE_LABEL[stage]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const NODE_SIZE = 18;
const NODE_FILL = 8;
const DOT_SIZE = 6;

const styles = StyleSheet.create({
  tree: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.seal,
    marginBottom: 4,
  },
  dotHidden: {
    backgroundColor: 'transparent',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ink,
  },
  lineMuted: {
    backgroundColor: colors.inkSoft,
    opacity: 0.4,
  },
  lineSpacer: { flex: 1 },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeUnreached: {
    borderStyle: 'dashed',
    borderColor: colors.inkSoft,
    borderWidth: 1,
  },
  nodeFill: {
    width: NODE_FILL,
    height: NODE_FILL,
    borderRadius: NODE_FILL / 2,
    backgroundColor: colors.ink,
  },
  label: {
    marginTop: 4,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  labelMuted: {
    color: colors.inkSoft,
    opacity: 0.5,
  },
});
