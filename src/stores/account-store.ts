import { create } from "zustand";
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getNetWorth,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "../services/account-repository";
import type { accounts } from "../db/schema";

type Account = typeof accounts.$inferSelect;

interface AccountStore {
  accounts: Account[];
  selectedAccountId: string | null;
  netWorth: { totalAssets: number; totalLiabilities: number; netWorth: number };

  refresh: () => void;
  select: (id: string | null) => void;
  create: (input: CreateAccountInput) => Account | undefined;
  update: (id: string, input: UpdateAccountInput) => Account | undefined;
  remove: (id: string) => void;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
  accounts: [],
  selectedAccountId: null,
  netWorth: { totalAssets: 0, totalLiabilities: 0, netWorth: 0 },

  refresh: () => {
    set({
      accounts: getAllAccounts(),
      netWorth: getNetWorth(),
    });
  },

  select: (id) => {
    set({ selectedAccountId: id });
  },

  create: (input) => {
    const account = createAccount(input);
    get().refresh();
    return account;
  },

  update: (id, input) => {
    const account = updateAccount(id, input);
    get().refresh();
    return account;
  },

  remove: (id) => {
    deleteAccount(id);
    const state = get();
    if (state.selectedAccountId === id) {
      set({ selectedAccountId: null });
    }
    get().refresh();
  },
}));
