import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n"; // Importamos i18n directamente

interface SettingsState {
  language: "es" | "en";
  preferredMapApp: "google" | "waze" | "apple";
  setLanguage: (lang: "es" | "en") => void;
  setPreferredMapApp: (app: "google" | "waze" | "apple") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "en",
      preferredMapApp: "google",
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setPreferredMapApp: (app) => set({ preferredMapApp: app }),
    }),
    {
      name: "raphael-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),

      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (!error && state) {
            i18n.changeLanguage(state.language);
          }
        };
      },
    },
  ),
);
