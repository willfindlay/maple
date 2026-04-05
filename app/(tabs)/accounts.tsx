import { useEffect } from "react";
import { View, Text, SectionList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/src/stores/account-store";
import { CurrencyDisplay } from "@/src/components/currency-display";
import { AccountTypeIcon } from "@/src/components/account-type-icon";
import { EmptyState } from "@/src/components/empty-state";
import { ACCOUNT_TYPE_GROUPS, type AccountType } from "@/src/models/account";
import { Plus } from "lucide-react-native";

export default function AccountsScreen() {
  const { accounts, refresh } = useAccountStore();
  const router = useRouter();

  useEffect(() => {
    refresh();
  }, []);

  const sections = Object.entries(ACCOUNT_TYPE_GROUPS)
    .map(([group, types]) => ({
      title: group,
      data: accounts.filter((a) =>
        (types as readonly string[]).includes(a.type),
      ),
    }))
    .filter((s) => s.data.length > 0);

  if (accounts.length === 0) {
    return (
      <View className="flex-1 bg-maple-cream dark:bg-maple-cream-dark">
        <EmptyState
          title="No accounts yet"
          description="Add your bank accounts, credit cards, and investment accounts to see your full financial picture."
          actionLabel="Add Account"
          onAction={() => router.push("/account/new")}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-maple-cream dark:bg-maple-cream-dark">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => {
          const total = section.data.reduce(
            (sum, a) => sum + (a.balance ?? 0),
            0,
          );
          return (
            <View className="flex-row items-center justify-between bg-maple-cream px-4 pb-1 pt-4 dark:bg-maple-cream-dark">
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.title}
              </Text>
              <CurrencyDisplay
                amount={total}
                className="text-sm text-gray-500 dark:text-gray-400"
              />
            </View>
          );
        }}
        renderItem={({ item, index, section }) => (
          <Pressable
            onPress={() => router.push(`/account/${item.id}`)}
            className={`mx-4 flex-row items-center justify-between bg-white px-4 py-3 active:bg-gray-50 dark:bg-gray-800 dark:active:bg-gray-700 ${
              index === 0 ? "rounded-t-xl" : ""
            } ${index === section.data.length - 1 ? "rounded-b-xl" : ""} ${
              index > 0
                ? "border-t border-gray-100 dark:border-gray-700"
                : ""
            }`}
          >
            <View className="flex-row items-center gap-3">
              <AccountTypeIcon type={item.type as AccountType} />
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {item.name}
                </Text>
                {item.institution && (
                  <Text className="text-xs text-gray-400">
                    {item.institution}
                  </Text>
                )}
              </View>
            </View>
            <CurrencyDisplay
              amount={item.balance ?? 0}
              className="text-base font-medium text-gray-900 dark:text-gray-100"
            />
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            onPress={() => router.push("/account/new")}
            className="mx-4 mb-8 mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-4 active:bg-gray-50 dark:border-gray-600 dark:active:bg-gray-700"
          >
            <Plus size={18} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400">
              Add Account
            </Text>
          </Pressable>
        }
      />
    </View>
  );
}
