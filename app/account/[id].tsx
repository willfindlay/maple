import { useEffect } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAccountStore } from "@/src/stores/account-store";
import { useTransactionStore } from "@/src/stores/transaction-store";
import { CurrencyDisplay } from "@/src/components/currency-display";
import { AccountTypeIcon } from "@/src/components/account-type-icon";
import { EmptyState } from "@/src/components/empty-state";
import type { AccountType } from "@/src/models/account";
import { Trash2 } from "lucide-react-native";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accounts, select, remove, refresh } = useAccountStore();
  const { transactions, loadForAccount } = useTransactionStore();

  const account = accounts.find((a) => a.id === id);

  useEffect(() => {
    if (id) {
      select(id);
      loadForAccount(id);
      refresh();
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account?.name}"? This will hide the account and its transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (id) {
              remove(id);
              router.back();
            }
          },
        },
      ],
    );
  };

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-maple-cream dark:bg-maple-cream-dark">
        <Text className="text-gray-500">Account not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-maple-cream dark:bg-maple-cream-dark">
      <Stack.Screen
        options={{
          title: account.name,
          headerRight: () => (
            <Pressable onPress={handleDelete} className="p-2">
              <Trash2 size={20} color="#EF4444" />
            </Pressable>
          ),
        }}
      />

      {/* Account Header */}
      <View className="mx-4 mt-4 rounded-xl bg-white p-4 dark:bg-gray-800">
        <View className="flex-row items-center gap-3">
          <AccountTypeIcon type={account.type as AccountType} size={28} />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {account.name}
            </Text>
            {account.institution && (
              <Text className="text-sm text-gray-500">
                {account.institution}
              </Text>
            )}
          </View>
        </View>
        <CurrencyDisplay
          amount={account.balance ?? 0}
          className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100"
        />
      </View>

      {/* Add Transaction Button */}
      <Pressable
        onPress={() => router.push("/transaction/new")}
        className="mx-4 mt-3 items-center rounded-xl bg-maple-green py-3 active:opacity-80"
      >
        <Text className="font-semibold text-white">Add Transaction</Text>
      </Pressable>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions"
          description="Add your first transaction to start tracking."
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          className="mt-4"
          contentContainerClassName="px-4 pb-8"
          renderItem={({ item, index }) => (
            <View
              className={`bg-white px-4 py-3 dark:bg-gray-800 ${
                index === 0 ? "rounded-t-xl" : ""
              } ${index === transactions.length - 1 ? "rounded-b-xl" : ""} ${
                index > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {item.payee || "(no payee)"}
                  </Text>
                  <Text className="text-xs text-gray-400">{item.date}</Text>
                </View>
                <CurrencyDisplay
                  amount={item.amount}
                  colorize
                  showPositiveSign
                  className="text-base font-medium"
                />
              </View>
              {item.memo && (
                <Text className="mt-1 text-xs text-gray-400">{item.memo}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
