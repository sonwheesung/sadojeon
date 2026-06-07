import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { canLearnArt } from '@/data/martialArts';
import { colors, radius, typography } from '@/theme';
import type { Disciple, MartialArt } from '@/types';
import { MARTIAL_ART_GRADE_LABEL } from '@/types/martialArt';

// 무공 계보 스킬트리 — 한 문파(lineage)의 무공을 선행조건(prerequisites) DAG로 그린다.
// 계층 자동배치: 선행 깊이 = 행(위=입문, 아래=고급). svg 간선이 분기(1→N)·합류(N→1)를 그림.
// docs/26 §5-4 · docs/28 §5-2. 노드 탭 → onSelect. disciple 주면 보유/학습가능/잠금 상태 표시.

const NODE_W = 100;
const NODE_H = 48;
const COL_GAP = 16;
const ROW_GAP = 46;

interface NodePos {
  x: number;
  y: number;
}

function computeLayout(arts: MartialArt[]): {
  positions: Map<string, NodePos>;
  edges: { x1: number; y1: number; x2: number; y2: number; key: string }[];
  width: number;
  height: number;
} {
  const byId = new Map(arts.map((a) => [a.id, a]));
  const tierCache = new Map<string, number>();
  const tierOf = (a: MartialArt): number => {
    const cached = tierCache.get(a.id);
    if (cached != null) return cached;
    tierCache.set(a.id, 0); // 사이클 가드
    const inLineage = (a.prerequisites ?? []).filter((p) => byId.has(p.artId));
    const t = inLineage.length
      ? 1 + Math.max(...inLineage.map((p) => tierOf(byId.get(p.artId)!)))
      : 0;
    tierCache.set(a.id, t);
    return t;
  };

  const rows = new Map<number, MartialArt[]>();
  let maxTier = 0;
  for (const a of arts) {
    const t = tierOf(a);
    maxTier = Math.max(maxTier, t);
    const row = rows.get(t) ?? [];
    row.push(a);
    rows.set(t, row);
  }

  const maxCols = Math.max(1, ...[...rows.values()].map((r) => r.length));
  const width = maxCols * (NODE_W + COL_GAP) + COL_GAP;
  const height = (maxTier + 1) * (NODE_H + ROW_GAP);

  const positions = new Map<string, NodePos>();
  for (const [t, row] of rows) {
    const rowW = row.length * (NODE_W + COL_GAP);
    const startX = (width - rowW) / 2;
    row.forEach((a, i) => {
      positions.set(a.id, {
        x: startX + i * (NODE_W + COL_GAP) + COL_GAP / 2,
        y: t * (NODE_H + ROW_GAP) + ROW_GAP / 2,
      });
    });
  }

  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (const a of arts) {
    const to = positions.get(a.id);
    if (!to) continue;
    for (const p of a.prerequisites ?? []) {
      const from = positions.get(p.artId);
      if (!from) continue; // 계보 밖 선행은 간선 생략
      edges.push({
        x1: from.x + NODE_W / 2,
        y1: from.y + NODE_H,
        x2: to.x + NODE_W / 2,
        y2: to.y,
        key: `${p.artId}->${a.id}`,
      });
    }
  }

  return { positions, edges, width, height };
}

type NodeState = 'learned' | 'learnable' | 'locked' | 'owned' | 'missing' | 'neutral';

export function MartialTree({
  arts,
  disciple,
  ownedIds,
  highlightId,
  onSelect,
}: {
  arts: MartialArt[];
  disciple?: Disciple; // 주면 제자 학습 상태(보유 성·학습가능·잠금)
  ownedIds?: Set<string>; // 주면(제자 없을 때) 사문 보유 비급 = 활성 / 미보유 = 비활성. 도감용
  highlightId?: string;
  onSelect?: (art: MartialArt) => void;
}) {
  const { positions, edges, width, height } = useMemo(() => computeLayout(arts), [arts]);

  const stateOf = (a: MartialArt): NodeState => {
    if (disciple) {
      if (disciple.martialArts.some((m) => m.artId === a.id)) return 'learned';
      return canLearnArt(disciple, a) ? 'learnable' : 'locked';
    }
    if (ownedIds) return ownedIds.has(a.id) ? 'owned' : 'missing';
    return 'neutral';
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width, height }}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {edges.map((e) => (
            <Line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={colors.inkSoft}
              strokeWidth={1.5}
            />
          ))}
        </Svg>
        {arts.map((a) => {
          const pos = positions.get(a.id);
          if (!pos) return null;
          const st = stateOf(a);
          const inst = disciple?.martialArts.find((m) => m.artId === a.id);
          const meta =
            st === 'learned'
              ? `${inst?.seong ?? 1}성`
              : st === 'locked'
                ? '🔒'
                : MARTIAL_ART_GRADE_LABEL[a.grade];
          const muted = st === 'locked' || st === 'missing';
          return (
            <Pressable
              key={a.id}
              onPress={() => onSelect?.(a)}
              style={[
                styles.node,
                STATE_STYLE[st],
                a.id === highlightId && styles.nodeHighlight,
                { left: pos.x, top: pos.y, width: NODE_W, height: NODE_H },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${a.name} ${meta}`}
            >
              <Text style={[styles.nodeName, muted && styles.nodeNameMuted]} numberOfLines={1}>
                {a.name}
              </Text>
              <Text style={[styles.nodeMeta, st === 'learned' && styles.nodeMetaOn]} numberOfLines={1}>
                {meta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const STATE_STYLE: Record<NodeState, object> = {
  learned: { borderColor: colors.seal, borderStyle: 'solid', borderWidth: 2, backgroundColor: colors.paperBright },
  learnable: { borderColor: colors.ink, borderStyle: 'solid', borderWidth: 1.5, backgroundColor: colors.paper },
  locked: { borderColor: colors.inkSoft, borderStyle: 'dashed', borderWidth: 1, backgroundColor: colors.paperLight, opacity: 0.6 },
  // 도감: 보유 비급=또렷이, 미보유=흐리게(비활성)
  owned: { borderColor: colors.seal, borderStyle: 'solid', borderWidth: 2, backgroundColor: colors.paperBright },
  missing: { borderColor: colors.inkSoft, borderStyle: 'dashed', borderWidth: 1, backgroundColor: colors.paperLight, opacity: 0.38 },
  neutral: { borderColor: colors.inkSoft, borderStyle: 'solid', borderWidth: 1, backgroundColor: colors.paper },
};

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  nodeHighlight: {
    borderColor: colors.brown,
    borderWidth: 2,
    backgroundColor: colors.paperBright,
  },
  nodeName: {
    fontFamily: typography.serifBold,
    fontSize: typography.sizes.xs,
    color: colors.ink,
  },
  nodeNameMuted: { color: colors.inkSoft },
  nodeMeta: {
    fontFamily: typography.serif,
    fontSize: 10,
    color: colors.inkSoft,
  },
  nodeMetaOn: { color: colors.seal },
});
