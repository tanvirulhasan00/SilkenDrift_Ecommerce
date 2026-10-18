import React, { createContext, useContext, useEffect, useState } from "react";
import { bn } from "./bn";
import { en } from "./en";

export type Language = "bn" | "en";
export type LocaleDictionary = typeof bn;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: LocaleDictionary;
  interpolate: (template: string, values: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "bn",
  setLanguage: () => {},
  t: bn,
  interpolate: (tpl) => tpl,
});

const STORAGE_KEY = "silkendrift_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "bn" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // LocalStorage unavailable
    }
  };

  const currentDict = language === "en" ? en : bn;

  const interpolate = (template: string, values: Record<string, string | number>): string => {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return values[key] !== undefined ? String(values[key]) : `{${key}}`;
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentDict,
        interpolate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
