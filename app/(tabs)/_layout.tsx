import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 12);
  const tabBarHeight = 70 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 12,
          paddingBottom: bottomPadding,
          paddingHorizontal: 12,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        },
      }}
    >
      <Tabs.Screen
        name="envelopes"
        options={{
          title: "Envelopes",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="envelope.fill" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="cashbook"
        options={{
          title: "Cashbook",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="book.fill" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="chart.bar.fill" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
        }}
      />
    </Tabs>
  );
}
