import { useState, useCallback } from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";

interface CurrencyInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText"
> {
  /** Current value in cents. */
  value: number;
  /** Called with the new value in cents. */
  onChangeValue: (cents: number) => void;
  /** Label shown above the input. */
  label?: string;
}

/**
 * A currency input that stores values as integer cents internally
 * but displays and accepts dollar amounts from the user.
 */
export function CurrencyInput({
  value,
  onChangeValue,
  label,
  className = "",
  ...props
}: CurrencyInputProps) {
  // Display the current value as a dollar string for editing
  const [displayValue, setDisplayValue] = useState(() =>
    value === 0 ? "" : (Math.abs(value) / 100).toFixed(2),
  );
  const [isNegative, setIsNegative] = useState(value < 0);

  const handleChangeText = useCallback(
    (text: string) => {
      // Allow negative sign toggle
      let negative = isNegative;
      if (text.startsWith("-")) {
        negative = true;
        text = text.slice(1);
      }

      // Strip everything except digits and one decimal point
      const cleaned = text.replace(/[^0-9.]/g, "");

      // Only allow one decimal point
      const parts = cleaned.split(".");
      let formatted: string;
      if (parts.length > 2) {
        formatted = parts[0] + "." + parts.slice(1).join("");
      } else {
        formatted = cleaned;
      }

      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        formatted = parts[0] + "." + parts[1].slice(0, 2);
      }

      setDisplayValue(formatted);
      setIsNegative(negative);

      // Convert to cents
      const dollars = parseFloat(formatted) || 0;
      const cents = Math.round(dollars * 100);
      onChangeValue(negative ? -cents : cents);
    },
    [isNegative, onChangeValue],
  );

  return (
    <View className={className}>
      {label && (
        <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </Text>
      )}
      <View className="flex-row items-center rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
        <Text className="mr-1 text-lg text-gray-500 dark:text-gray-400">
          {isNegative ? "-$" : "$"}
        </Text>
        <TextInput
          className="flex-1 text-lg text-gray-900 dark:text-gray-100"
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
    </View>
  );
}
