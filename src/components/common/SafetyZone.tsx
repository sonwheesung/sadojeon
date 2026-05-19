import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme';

export type SafetyZoneVariant = 'tab' | 'modal' | 'stack';

interface Props {
  children: ReactNode;
  variant?: SafetyZoneVariant;
  edges?: Edge[];
  background?: string;
}

const EDGES_BY_VARIANT: Record<SafetyZoneVariant, Edge[]> = {
  tab: ['top', 'left', 'right'],
  modal: ['top', 'left', 'right', 'bottom'],
  stack: ['top', 'left', 'right'],
};

export function SafetyZone({
  children,
  variant = 'tab',
  edges,
  background = colors.paper,
}: Props) {
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: background }]}
      edges={edges ?? EDGES_BY_VARIANT[variant]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
