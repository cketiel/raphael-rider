import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      setLanguage: (language) => set({ language }),
      setPreferredMapApp: (preferredMapApp) => set({ preferredMapApp }),
    }),
    {
      name: "raphael-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
