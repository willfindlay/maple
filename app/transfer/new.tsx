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

export default function NewTransferScreen() {
  const router = useRouter();
  const { accounts } = useAccountStore();
  const transfer = useTransactionStore((s) => s.transfer);

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
    } else if (accounts.length === 1) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleSave = () => {
    if (!fromAccountId || !toAccountId) {
      Alert.alert(
        "Accounts required",
        "Please select both a source and destination account.",
      );
      return;
    }
    if (fromAccountId === toAccountId) {
      Alert.alert(
        "Different accounts required",
        "Source and destination must be different accounts.",
      );
      return;
    }
    if (amount === 0) {
      Alert.alert("Amount required", "Please enter a non-zero amount.");
      return;
    }

    transfer({
      fromAccountId,
      toAccountId,
      date,
      amount: Math.abs(amount),
      memo: memo.trim() || undefined,
    });
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-maple-cream dark:bg-maple-cream-dark"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4">
        {/* From Account */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            From Account
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accounts.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setFromAccountId(a.id)}
                className={`rounded-lg px-3 py-2 ${
                  fromAccountId === a.id
                    ? "bg-maple-green"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    fromAccountId === a.id
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

        {/* To Account */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            To Account
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accounts.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setToAccountId(a.id)}
                className={`rounded-lg px-3 py-2 ${
                  toAccountId === a.id
                    ? "bg-maple-green"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    toAccountId === a.id
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

        {/* Memo */}
        <View className="mb-6">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Memo (optional)
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={memo}
            onChangeText={setMemo}
            placeholder="Notes about this transfer"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          className="items-center rounded-xl bg-maple-green py-4 active:opacity-80"
        >
          <Text className="text-lg font-semibold text-white">Transfer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
