import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BusinessSettings } from "~/types";
import { SEED_SETTINGS } from "~/services/mock/seedData";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { normalizeImageUrl } from "~/lib/imageUrl";

interface SettingsContextType {
  settings: BusinessSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<BusinessSettings>;
  refreshSettings: () => Promise<BusinessSettings>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: SEED_SETTINGS,
  isLoading: false,
  updateSettings: async () => SEED_SETTINGS,
  refreshSettings: async () => SEED_SETTINGS,
});

export const SettingsProvider: React.FC<{
  children: React.ReactNode;
  initialSettings?: BusinessSettings;
}> = ({ children, initialSettings }) => {
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    if (initialSettings) return initialSettings;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sd_mock_settings");
        if (stored) {
          return { ...SEED_SETTINGS, ...JSON.parse(stored) };
        }
      } catch {}
    }
    return SEED_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize dynamic favicon with document head
  useEffect(() => {
    if (typeof document === "undefined") return;
    const faviconUrl = settings.faviconUrl || "/favicon.ico";

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = normalizeImageUrl(faviconUrl);
  }, [settings.faviconUrl]);

  // Subscribe to realtime updates across tabs and Firestore
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const live = await firestoreService.getSettings();
      setSettings(live);
      return live;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<BusinessSettings>) => {
      setIsLoading(true);
      try {
        const updated = await firestoreService.saveSettings(newSettings);
        setSettings(updated);
        return updated;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
