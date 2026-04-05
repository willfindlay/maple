import { View, Text } from "react-native";

export default function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-maple-cream dark:bg-maple-cream-dark">
      <Text className="text-2xl font-bold text-maple-green dark:text-maple-cream">
        Maple
      </Text>
      <Text className="mt-2 text-base text-gray-500">
        Dashboard coming soon
      </Text>
    </View>
  );
}
