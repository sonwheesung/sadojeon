import { Image } from 'expo-image';
import { ScrollView, StyleSheet } from 'react-native';

import { PaperCard } from '@/components/common/PaperCard';
import { SafetyZone } from '@/components/common/SafetyZone';
import { DiscipleRoster } from '@/components/sect/DiscipleRoster';
import { SectHeader } from '@/components/sect/SectHeader';
import { SectProgressBar } from '@/components/sect/SectProgressBar';
import { SectStatus } from '@/components/sect/SectStatus';
import { colors, spacing } from '@/theme';

export default function SectScreen() {
  return (
    <SafetyZone variant="tab" background={colors.background}>
      <PaperCard>
        <SectHeader />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../assets/images/backgrounds/sect-main-banner.png')}
            style={styles.hero}
            contentFit="cover"
            transition={0}
          />
          <DiscipleRoster />
          <SectStatus />
        </ScrollView>
        <SectProgressBar />
      </PaperCard>
    </SafetyZone>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  hero: {
    width: '100%',
    aspectRatio: 1672 / 941,
  },
});
