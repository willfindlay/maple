import { create } from "zustand";
import {
  getTransactionsForAccount,
  getTransactionById,
  createTransaction,
  createTransfer,
  updateTransaction,
  deleteTransaction,
  getMonthlyCashFlow,
  type CreateTransactionInput,
  type CreateTransferInput,
  type UpdateTransactionInput,
} from "../services/transaction-repository";
import { useAccountStore } from "./account-store";
import type { transactions } from "../db/schema";

type Transaction = typeof transactions.$inferSelect;

interface TransactionStore {
  transactions: Transaction[];
  cashFlow: { income: number; expenses: number; net: number };

  loadForAccount: (accountId: string, opts?: { limit?: number }) => void;
  loadCashFlow: (month: string) => void;
  create: (input: CreateTransactionInput) => void;
  transfer: (input: CreateTransferInput) => void;
  update: (id: string, input: UpdateTransactionInput) => void;
  remove: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  cashFlow: { income: 0, expenses: 0, net: 0 },

  loadForAccount: (accountId, opts) => {
    set({ transactions: getTransactionsForAccount(accountId, opts) });
  },

  loadCashFlow: (month) => {
    set({ cashFlow: getMonthlyCashFlow(month) });
  },

  create: (input) => {
    createTransaction(input);
    // Reload transactions if viewing this account
    const accountId = useAccountStore.getState().selectedAccountId;
    if (accountId === input.accountId) {
      get().loadForAccount(accountId);
    }
    useAccountStore.getState().refresh();
  },

  transfer: (input) => {
    createTransfer(input);
    const accountId = useAccountStore.getState().selectedAccountId;
    if (accountId === input.fromAccountId || accountId === input.toAccountId) {
      get().loadForAccount(accountId);
    }
    useAccountStore.getState().refresh();
  },

  update: (id, input) => {
    updateTransaction(id, input);
    const accountId = useAccountStore.getState().selectedAccountId;
    if (accountId) {
      get().loadForAccount(accountId);
    }
    useAccountStore.getState().refresh();
  },

  remove: (id) => {
    deleteTransaction(id);
    const accountId = useAccountStore.getState().selectedAccountId;
    if (accountId) {
      get().loadForAccount(accountId);
    }
    useAccountStore.getState().refresh();
  },
}));
