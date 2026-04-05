import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAccountStore } from "@/src/stores/account-store";
import { useTransactionStore } from "@/src/stores/transaction-store";
import { CurrencyInput } from "@/src/components/currency-input";
import { today } from "@/src/utils/date";

export default function NewTransactionScreen() {
  const router = useRouter();
  const { accounts, selectedAccountId } = useAccountStore();
  const createTransaction = useTransactionStore((s) => s.create);

  const [accountId, setAccountId] = useState(selectedAccountId ?? "");
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState(0);
  const [payee, setPayee] = useState("");
  const [memo, setMemo] = useState("");
  const [isExpense, setIsExpense] = useState(true);

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleSave = () => {
    if (!accountId) {
      Alert.alert("Account required", "Please select an account.");
      return;
    }
    if (amount === 0) {
      Alert.alert("Amount required", "Please enter a non-zero amount.");
      return;
    }

    const finalAmount = isExpense ? -Math.abs(amount) : Math.abs(amount);
    createTransaction({
      accountId,
      date,
      amount: finalAmount,
      payee: payee.trim() || undefined,
      memo: memo.trim() || undefined,
      importSource: "manual",
    });
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-maple-cream dark:bg-maple-cream-dark"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4">
        {/* Expense / Income Toggle */}
        <View className="mb-4 flex-row overflow-hidden rounded-lg">
          <Pressable
            onPress={() => setIsExpense(true)}
            className={`flex-1 items-center py-3 ${
              isExpense ? "bg-red-500" : "bg-white dark:bg-gray-800"
            }`}
          >
            <Text
              className={`font-semibold ${
                isExpense ? "text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsExpense(false)}
            className={`flex-1 items-center py-3 ${
              !isExpense ? "bg-green-600" : "bg-white dark:bg-gray-800"
            }`}
          >
            <Text
              className={`font-semibold ${
                !isExpense ? "text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Account Picker */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Account
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accounts.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAccountId(a.id)}
                className={`rounded-lg px-3 py-2 ${
                  accountId === a.id
                    ? "bg-maple-green"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    accountId === a.id
                      ? "font-semibold text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {a.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Amount */}
        <CurrencyInput
          label="Amount"
          value={Math.abs(amount)}
          onChangeValue={(v) => setAmount(v)}
          className="mb-4"
        />

        {/* Date */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Date
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Payee */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Payee
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={payee}
            onChangeText={setPayee}
            placeholder="e.g. Loblaws, Shopify"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Memo */}
        <View className="mb-6">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Memo (optional)
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={memo}
            onChangeText={setMemo}
            placeholder="Notes about this transaction"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          className="items-center rounded-xl bg-maple-green py-4 active:opacity-80"
        >
          <Text className="text-lg font-semibold text-white">
            Save Transaction
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
