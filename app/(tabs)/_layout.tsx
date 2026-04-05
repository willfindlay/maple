import { Tabs } from "expo-router";
import { Home, Wallet, Landmark, Settings } from "lucide-react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeTint = colorScheme === "dark" ? "#D4A843" : "#1B4332";
  const inactiveTint = colorScheme === "dark" ? "#6B7280" : "#9CA3AF";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FAF8F5",
        },
        headerTintColor: colorScheme === "dark" ? "#FAF8F5" : "#1B4332",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
          borderTopColor: colorScheme === "dark" ? "#333" : "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registered"
        options={{
          title: "Registered",
          tabBarIcon: ({ color, size }) => (
            <Landmark size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
