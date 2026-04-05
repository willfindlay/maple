import { Text, type TextProps } from "react-native";
import { formatCurrency } from "../utils/currency";

interface CurrencyDisplayProps extends Omit<TextProps, "children"> {
  /** Amount in cents. */
  amount: number;
  /** Show sign for positive amounts (e.g., "+$5.00"). */
  showPositiveSign?: boolean;
  /** Color positive green, negative red. */
  colorize?: boolean;
}

export function CurrencyDisplay({
  amount,
  showPositiveSign = false,
  colorize = false,
  className = "",
  ...props
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount);
  const display = showPositiveSign && amount > 0 ? `+${formatted}` : formatted;

  let colorClass = "";
  if (colorize) {
    if (amount > 0) colorClass = "text-green-600 dark:text-green-400";
    else if (amount < 0) colorClass = "text-red-600 dark:text-red-400";
  }

  return (
    <Text
      className={`font-inter tabular-nums ${colorClass} ${className}`}
      {...props}
    >
      {display}
    </Text>
  );
}
