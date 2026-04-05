import { View, Text, Pressable } from "react-native";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-4 rounded-lg bg-maple-green px-6 py-3 active:opacity-80"
        >
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
