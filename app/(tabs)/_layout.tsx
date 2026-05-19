import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useTabBarScreenOptions } from '@/components/navigation/useTabBarScreenOptions';
import { useInboxBadgeCount } from '@/hooks/useInboxBadgeCount';

// Canvas dimensions output by scripts/icon-alpha.mjs. Update these if the
// source artwork is reprocessed and the canvas size changes.
const ICON_ASPECT = {
  sect: 419 / 512,
  inbox: 795 / 512,
  manual: 436 / 512,
  world: 957 / 512,
  quest: 301 / 512,
} as const;

export default function TabLayout() {
  const screenOptions = useTabBarScreenOptions();
  const inboxBadge = useInboxBadgeCount();

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: '사문',
          tabBarAccessibilityLabel: '사문 — 메인 화면',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('../../assets/images/icons/menu-sect.png')}
              aspectRatio={ICON_ASPECT.sect}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: '서신함',
          tabBarAccessibilityLabel: '서신함 — 알림과 결정',
          tabBarBadge: inboxBadge > 0 ? inboxBadge : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('../../assets/images/icons/menu-inbox.png')}
              aspectRatio={ICON_ASPECT.inbox}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="manual"
        options={{
          title: '물품',
          tabBarAccessibilityLabel: '물품 — 내 물건과 도감',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('../../assets/images/icons/menu-manual.png')}
              aspectRatio={ICON_ASPECT.manual}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: '강호',
          tabBarAccessibilityLabel: '강호 — 외부 세계',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('../../assets/images/icons/menu-world.png')}
              aspectRatio={ICON_ASPECT.world}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          title: '의뢰',
          tabBarAccessibilityLabel: '의뢰',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              source={require('../../assets/images/icons/menu-quest.png')}
              aspectRatio={ICON_ASPECT.quest}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
