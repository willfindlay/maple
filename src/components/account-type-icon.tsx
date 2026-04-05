import {
  Landmark,
  CreditCard,
  Home,
  TrendingUp,
  Car,
  Wallet,
  PiggyBank,
  Building,
  CircleDollarSign,
  HelpCircle,
} from "lucide-react-native";
import type { AccountType } from "../models/account";

const ICON_MAP: Record<AccountType, typeof Landmark> = {
  chequing: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  loan: CircleDollarSign,
  mortgage: Home,
  investment: TrendingUp,
  tfsa: Landmark,
  rrsp: Landmark,
  fhsa: Landmark,
  resp: Landmark,
  lira: Landmark,
  rrif: Landmark,
  rdsp: Landmark,
  non_registered: TrendingUp,
  crypto: CircleDollarSign,
  property: Building,
  vehicle: Car,
  other_asset: HelpCircle,
  other_liability: HelpCircle,
};

interface AccountTypeIconProps {
  type: AccountType;
  size?: number;
  color?: string;
}

export function AccountTypeIcon({
  type,
  size = 20,
  color = "#1B4332",
}: AccountTypeIconProps) {
  const Icon = ICON_MAP[type] ?? HelpCircle;
  return <Icon size={size} color={color} />;
}
