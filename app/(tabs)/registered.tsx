import { View, Text } from "react-native";

export default function RegisteredScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-maple-cream dark:bg-maple-cream-dark">
      <Text className="text-lg font-semibold text-maple-green dark:text-maple-cream">
        Registered Accounts
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        TFSA/RRSP tracking coming in Sprint 3
      </Text>
    </View>
  );
}
