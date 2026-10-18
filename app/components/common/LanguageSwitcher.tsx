import React from "react";
import { useLanguage } from "~/locales";
import { Globe } from "lucide-react";
import { cn } from "~/lib/utils";

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-silk-200 bg-silk-50/80 p-0.5 text-xs dark:border-dark-border dark:bg-dark-elevated",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={cn(
          "flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors",
          language === "bn"
            ? "bg-silk-950 text-white shadow-sm dark:bg-gold-500 dark:text-silk-950 font-bold"
            : "text-silk-700 hover:text-silk-950 hover:bg-silk-200/70 dark:text-silk-300 dark:hover:text-gold-400 dark:hover:bg-dark-border"
        )}
      >
        <span className="text-[11px]">বাংলা</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors",
          language === "en"
            ? "bg-silk-950 text-white shadow-sm dark:bg-gold-500 dark:text-silk-950 font-bold"
            : "text-silk-700 hover:text-silk-950 hover:bg-silk-200/70 dark:text-silk-300 dark:hover:text-gold-400 dark:hover:bg-dark-border"
        )}
      >
        <Globe className="w-3 h-3" />
        <span className="text-[11px]">ENG</span>
      </button>
    </div>
  );
};
