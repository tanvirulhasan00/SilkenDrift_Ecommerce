import React from "react";
import { cn } from "~/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "gold" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    neutral:
      "bg-silk-100 text-silk-950 font-bold border-silk-300 dark:bg-dark-elevated dark:text-silk-100 dark:border-dark-border",
    success:
      "bg-emerald-100 text-emerald-950 font-bold border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-100 text-amber-950 font-bold border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    danger:
      "bg-rose-100 text-rose-950 font-bold border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    info: "bg-blue-100 text-blue-950 font-bold border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    gold: "bg-gold-100 text-gold-950 font-bold border-gold-300 dark:bg-gold-500/20 dark:text-gold-200 dark:border-gold-500/50",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide uppercase",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
