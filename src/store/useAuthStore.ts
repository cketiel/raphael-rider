import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Customer } from "../domain/types";
import * as SecureStore from "expo-secure-store";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants/storageKeys";

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  setAuth: (
    customer: Customer,
    token: string,
    refreshToken?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomer: (data: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      setAuth: async (
        customer: Customer,
        token: string,
        refreshToken?: string,
      ) => {
        // Guardamos los tokens en SecureStore (Cifrado)
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

        // El refresh token es lo que evita que una sesión caducada deje al paciente en una
        // pantalla que falla sin decir por qué. Ausente si el servidor es anterior a los
        // refresh tokens, y entonces la app se comporta como antes.
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        } else {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }

        set({ customer, isAuthenticated: true });
      },
      logout: async () => {
        // Los dos, o el que quedara serviría para volver a entrar.
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
