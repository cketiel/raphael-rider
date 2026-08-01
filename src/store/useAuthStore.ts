// src/store/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer } from "../domain/types";

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  setAuth: (customer: Customer) => void;
  logout: () => void;
  updateCustomer: (data: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      setAuth: (customer) => set({ customer, isAuthenticated: true }),
      logout: () => set({ customer: null, isAuthenticated: false }),
      updateCustomer: (data) =>
        set((state) => ({
          customer: state.customer ? { ...state.customer, ...data } : null,
        })),
    }),
    {
      name: "raphael-auth-storage", // Unique key in local storage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
