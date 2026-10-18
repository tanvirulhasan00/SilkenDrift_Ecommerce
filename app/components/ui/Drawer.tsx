import React, { useEffect } from "react";
import { cn } from "~/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "right" | "left";
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = "right",
  children,
  width = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-silk-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 flex flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-dark-surface dark:border-l dark:border-dark-border w-full",
          widthClasses[width],
          side === "right" ? "right-0" : "left-0"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-silk-100 dark:border-dark-border">
          {title ? (
            <h3 className="text-base font-semibold text-silk-900 dark:text-silk-100">
              {title}
            </h3>
          ) : <div />}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-silk-500 hover:bg-rose-50 hover:text-rose-600 dark:text-silk-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};
