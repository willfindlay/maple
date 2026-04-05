import { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/src/stores/account-store";
import { useTransactionStore } from "@/src/stores/transaction-store";
import { CurrencyDisplay } from "@/src/components/currency-display";
import { AccountTypeIcon } from "@/src/components/account-type-icon";
import { ACCOUNT_TYPE_GROUPS, type AccountType } from "@/src/models/account";
import { currentMonth } from "@/src/utils/date";

export default function DashboardScreen() {
  const { accounts, netWorth, refresh } = useAccountStore();
  const { cashFlow, loadCashFlow } = useTransactionStore();
  const router = useRouter();

  useEffect(() => {
    refresh();
    loadCashFlow(currentMonth());
  }, []);

  const groupedAccounts = Object.entries(ACCOUNT_TYPE_GROUPS)
    .map(([group, types]) => ({
      group,
      accounts: accounts.filter((a) =>
        (types as readonly string[]).includes(a.type),
      ),
    }))
    .filter((g) => g.accounts.length > 0);

  return (
    <ScrollView className="flex-1 bg-maple-cream dark:bg-maple-cream-dark">
      {/* Net Worth Card */}
      <View className="mx-4 mt-4 rounded-xl bg-maple-green p-5">
        <Text className="text-sm font-medium text-green-200">Net Worth</Text>
        <CurrencyDisplay
          amount={netWorth.netWorth}
          className="mt-1 text-3xl font-bold text-white"
        />
        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-green-200">Assets</Text>
            <CurrencyDisplay
              amount={netWorth.totalAssets}
              className="text-sm font-medium text-green-100"
            />
          </View>
          <View>
            <Text className="text-xs text-green-200">Liabilities</Text>
            <CurrencyDisplay
              amount={netWorth.totalLiabilities}
              className="text-sm font-medium text-green-100"
            />
          </View>
        </View>
      </View>

      {/* Cash Flow */}
      <View className="mx-4 mt-4 rounded-xl bg-white p-4 dark:bg-gray-800">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
          This Month
        </Text>
        <View className="mt-2 flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-400">Income</Text>
            <CurrencyDisplay
              amount={cashFlow.income}
              colorize
              className="text-base font-semibold"
            />
          </View>
          <View>
            <Text className="text-xs text-gray-400">Expenses</Text>
            <CurrencyDisplay
              amount={-cashFlow.expenses}
              colorize
              className="text-base font-semibold"
            />
          </View>
          <View>
            <Text className="text-xs text-gray-400">Net</Text>
            <CurrencyDisplay
              amount={cashFlow.net}
              colorize
              showPositiveSign
              className="text-base font-semibold"
            />
          </View>
        </View>
      </View>

      {/* Account Groups */}
      {groupedAccounts.map(({ group, accounts: groupAccounts }) => {
        const total = groupAccounts.reduce(
          (sum, a) => sum + (a.balance ?? 0),
          0,
        );
        return (
          <View key={group} className="mx-4 mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {group}
              </Text>
              <CurrencyDisplay
                amount={total}
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              />
            </View>
            <View className="mt-2 rounded-xl bg-white dark:bg-gray-800">
              {groupAccounts.map((account, i) => (
                <Pressable
                  key={account.id}
                  onPress={() => router.push(`/account/${account.id}`)}
                  className={`flex-row items-center justify-between px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 ${
                    i > 0
                      ? "border-t border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <AccountTypeIcon type={account.type as AccountType} />
                    <View>
                      <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {account.name}
                      </Text>
                      {account.institution && (
                        <Text className="text-xs text-gray-400">
                          {account.institution}
                        </Text>
                      )}
                    </View>
                  </View>
                  <CurrencyDisplay
                    amount={account.balance ?? 0}
                    className="text-base font-medium text-gray-900 dark:text-gray-100"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      {/* Quick Actions */}
      <View className="mx-4 mb-8 mt-6 flex-row gap-3">
        <Pressable
          onPress={() => router.push("/transaction/new")}
          className="flex-1 items-center rounded-xl bg-maple-green py-3 active:opacity-80"
        >
          <Text className="font-semibold text-white">Add Transaction</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/transfer/new")}
          className="flex-1 items-center rounded-xl border border-maple-green py-3 active:opacity-80"
        >
          <Text className="font-semibold text-maple-green dark:text-maple-gold">
            Transfer
          </Text>
        </Pressable>
      </View>

      {/* Empty state */}
      {accounts.length === 0 && (
        <View className="items-center px-8 pb-8">
          <Text className="text-center text-gray-500 dark:text-gray-400">
            Add your first account to get started.
          </Text>
          <Pressable
            onPress={() => router.push("/account/new")}
            className="mt-4 rounded-lg bg-maple-green px-6 py-3 active:opacity-80"
          >
            <Text className="font-semibold text-white">Add Account</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
