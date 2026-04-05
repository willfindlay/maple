import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-maple-cream dark:bg-maple-cream-dark">
      <Text className="text-lg font-semibold text-maple-green dark:text-maple-cream">
        Settings
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        Coming in Sprint 4
      </Text>
    </View>
  );
}
