import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGameDateLabel } from '@/hooks/useGameDateLabel';
import { useInboxUnreadCount } from '@/hooks/useInboxBadgeCount';
import { useSectStore } from '@/stores/sectStore';
import { colors, spacing, typography } from '@/theme';

// 공용 상단 헤더 — 모든 탭 공통.
// 좌측: 사문 자금(금/은/동) · 중앙: 게임 날짜 · 우측: 서신함 봉투(미읽음 뱃지).
// 봉투 탭 → /inbox (스택 라우트). 서신함은 더 이상 탭이 아니다.
export const APP_HEADER_HEIGHT = 40;

const ICON_INBOX = require('../../../assets/images/icons/menu-inbox.png');

// 동화 총액 → 금/은/동 환산. 1금 = 10은 = 1000동 (docs/09).
function splitCoin(totalCopper: number): { gold: number; silver: number; copper: number } {
  const safe = Math.max(0, Math.floor(totalCopper));
  const gold = Math.floor(safe / 1000);
  const rest = safe - gold * 1000;
  const silver = Math.floor(rest / 100);
  const copper = rest - silver * 100;
  return { gold, silver, copper };
}

export function AppHeader() {
  const dateLabel = useGameDateLabel();
  const resources = useSectStore((s) => s.sect?.resources ?? 0);
  const unread = useInboxUnreadCount();
  const coin = splitCoin(resources);

  return (
    <View style={styles.row}>
      <View style={styles.money} accessibilityLabel={`사문 자금 ${coin.gold}금 ${coin.silver}은 ${coin.copper}동`}>
        <Coin value={coin.gold} unit="금" />
        <Coin value={coin.silver} unit="은" />
        <Coin value={coin.copper} unit="동" />
      </View>

      <Text style={styles.date} numberOfLines={1}>
        {dateLabel}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unread > 0 ? `서신함 — 새 서신 ${unread}건` : '서신함'}
        hitSlop={8}
        onPress={() => router.push('/inbox')}
        style={styles.inboxButton}
      >
        <Image source={ICON_INBOX} style={styles.inboxIcon} contentFit="contain" tintColor={colors.ink} transition={0} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function Coin({ value, unit }: { value: number; unit: string }) {
  return (
    <Text style={styles.coin}>
      <Text style={styles.coinValue}>{value.toLocaleString()}</Text>
      <Text style={styles.coinUnit}>{unit}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  row: {
    height: APP_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  money: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexShrink: 1,
  },
  coin: {
    fontFamily: typography.serif,
  },
  coinValue: {
    fontFamily: typography.serifMedium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  coinUnit: {
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkSoft,
  },
  date: {
    flexShrink: 1,
    fontFamily: typography.serif,
    fontSize: typography.sizes.xs,
    color: colors.inkLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  inboxButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxIcon: {
    width: 22,
    height: 22,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.seal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: typography.serifBold,
    fontSize: 9,
    color: colors.paperBright,
  },
});
