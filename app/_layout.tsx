import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDatabase, getDatabase } from "@/src/db/client";
import { seedCategories } from "@/src/db/seed";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";

export const unstable_settings = {
  anchor: "(tabs)",
};

function DatabaseGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        const db = getDatabase();
        await migrate(db, migrations);
        seedCategories();
        setReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Database initialization failed",
        );
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-maple-cream px-8">
        <Text className="text-lg font-bold text-red-600">Database Error</Text>
        <Text className="mt-2 text-center text-sm text-gray-600">{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-maple-cream dark:bg-maple-cream-dark">
        <ActivityIndicator size="large" color="#1B4332" />
        <Text className="mt-4 text-gray-500">Loading Maple...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const mapleLight = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#1B4332",
      background: "#FAF8F5",
      card: "#FFFFFF",
    },
  };

  const mapleDark = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "#D4A843",
      background: "#1A1A1A",
    },
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? mapleDark : mapleLight}>
      <DatabaseGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="account/[id]"
            options={{ title: "Account", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="transaction/new"
            options={{ presentation: "modal", title: "New Transaction" }}
          />
          <Stack.Screen
            name="transfer/new"
            options={{ presentation: "modal", title: "New Transfer" }}
          />
          <Stack.Screen
            name="account/new"
            options={{ presentation: "modal", title: "New Account" }}
          />
        </Stack>
      </DatabaseGate>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
