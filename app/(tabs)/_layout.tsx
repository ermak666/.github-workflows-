import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.tint, tabBarButton: HapticTab, tabBarStyle: { height: 58 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border } }}>
      <Tabs.Screen name="index" options={{ title: "Главная", tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="learn" options={{ title: "Учебник", tabBarIcon: ({ color }) => <IconSymbol size={25} name="book.fill" color={color} /> }} />
      <Tabs.Screen name="cheatsheet" options={{ title: "Шпаргалка", tabBarIcon: ({ color }) => <IconSymbol size={25} name="doc.text.fill" color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Прогресс", tabBarIcon: ({ color }) => <IconSymbol size={25} name="chart.bar.fill" color={color} /> }} />
    </Tabs>
  );
}
