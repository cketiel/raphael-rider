import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer } from "../domain/types";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  setAuth: (customer: Customer, token: string) => Promise<void>; // Ahora es async
  logout: () => Promise<void>;
  updateCustomer: (data: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      setAuth: async (customer: Customer, token: string) => {
        // Guardamos el token en SecureStore (Cifrado)
        await SecureStore.setItemAsync("userToken", token);
        set({ customer, isAuthenticated: true });
      },
      logout: async () => {
        // Limpiamos SecureStore al salir
        await SecureStore.deleteItemAsync("userToken");
        set({ customer: null, isAuthenticated: false });
      },
      updateCustomer: (data) =>
        set((state) => ({
          customer: state.customer ? { ...state.customer, ...data } : null,
        })),
    }),
    {
      name: "raphael-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
