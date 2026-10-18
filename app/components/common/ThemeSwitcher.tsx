import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "~/hooks/useTheme";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "~/lib/utils";

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "light", label: "Light", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { mode: "dark", label: "Dark", icon: <Moon className="w-4 h-4 text-indigo-400" /> },
    { mode: "system", label: "System", icon: <Laptop className="w-4 h-4 text-silk-500" /> },
  ];

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-silk-200 bg-white text-silk-700 hover:bg-gold-50 hover:text-gold-950 hover:border-gold-400 transition dark:border-dark-border dark:bg-dark-elevated dark:text-silk-300 dark:hover:bg-dark-border dark:hover:text-gold-400 dark:hover:border-gold-500"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-gold-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-silk-200 bg-white p-1 shadow-lg dark:border-dark-border dark:bg-dark-surface z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => {
                setTheme(opt.mode);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition",
                theme === opt.mode
                  ? "bg-silk-950 text-white font-bold dark:bg-gold-500 dark:text-silk-950"
                  : "text-silk-700 hover:bg-gold-50 hover:text-gold-950 dark:text-silk-300 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
