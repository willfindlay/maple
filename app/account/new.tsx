import { useState } from "react";
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
import { CurrencyInput } from "@/src/components/currency-input";
import { ACCOUNT_TYPES, type AccountType } from "@/src/models/account";

const TYPE_LABELS: Record<AccountType, string> = {
  chequing: "Chequing",
  savings: "Savings",
  credit_card: "Credit Card",
  loan: "Loan",
  mortgage: "Mortgage",
  investment: "Investment",
  tfsa: "TFSA",
  rrsp: "RRSP",
  fhsa: "FHSA",
  resp: "RESP",
  lira: "LIRA",
  rrif: "RRIF",
  rdsp: "RDSP",
  non_registered: "Non-Registered",
  crypto: "Crypto",
  property: "Property",
  vehicle: "Vehicle",
  other_asset: "Other Asset",
  other_liability: "Other Liability",
};

export default function NewAccountScreen() {
  const router = useRouter();
  const createAccount = useAccountStore((s) => s.create);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("chequing");
  const [institution, setInstitution] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter an account name.");
      return;
    }
    createAccount({
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      initialBalance,
      notes: notes.trim() || undefined,
    });
    router.back();
  };

  return (
    <ScrollView
      className="flex-1 bg-maple-cream dark:bg-maple-cream-dark"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4">
        {/* Name */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Account Name
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={name}
            onChangeText={setName}
            placeholder="e.g. RBC Chequing"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
        </View>

        {/* Type Picker */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Account Type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                className={`rounded-lg px-3 py-2 ${
                  type === t ? "bg-maple-green" : "bg-white dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    type === t
                      ? "font-semibold text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Institution */}
        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Institution (optional)
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={institution}
            onChangeText={setInstitution}
            placeholder="e.g. RBC, Wealthsimple"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Initial Balance */}
        <CurrencyInput
          label="Initial Balance"
          value={initialBalance}
          onChangeValue={setInitialBalance}
          className="mb-4"
        />

        {/* Notes */}
        <View className="mb-6">
          <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Notes (optional)
          </Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes about this account"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          className="items-center rounded-xl bg-maple-green py-4 active:opacity-80"
        >
          <Text className="text-lg font-semibold text-white">
            Create Account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
