import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";

interface SettingsState {
  language: "es" | "en";
  preferredMapApp: "google" | "waze" | "apple";
  setLanguage: (lang: "es" | "en") => void;
  setPreferredMapApp: (app: "google" | "waze" | "apple") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "es",
      preferredMapApp: "google",
      setLanguage: (lang) => {
        i18n.changeLanguage(lang); // Sincroniza con el motor i18n
        set({ language: lang });
      },
      setPreferredMapApp: (preferredMapApp) => set({ preferredMapApp }),
    }),
    {
      name: "raphael-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
