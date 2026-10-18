import React from "react";
import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-silk-950 text-white hover:bg-gold-500 hover:text-silk-950 hover:border-gold-500 focus:ring-gold-500 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950 font-bold shadow-sm transition-all duration-200",
      secondary:
        "bg-silk-100 text-silk-950 hover:bg-silk-200 hover:text-silk-950 border border-silk-300 hover:border-silk-400 focus:ring-silk-400 dark:bg-dark-elevated dark:text-silk-50 dark:border-dark-border dark:hover:bg-dark-border font-semibold transition-all duration-200",
      outline:
        "border-2 border-silk-950 text-silk-950 bg-transparent hover:bg-silk-950 hover:text-white focus:ring-silk-400 dark:border-gold-500 dark:text-gold-400 dark:hover:bg-gold-500 dark:hover:text-silk-950 font-semibold transition-all duration-200",
      ghost:
        "text-silk-900 hover:bg-gold-50 hover:text-gold-950 focus:ring-silk-300 dark:text-silk-100 dark:hover:bg-dark-elevated dark:hover:text-gold-400 font-medium transition-all duration-200",
      danger:
        "bg-red-600 text-white hover:bg-red-700 hover:text-white focus:ring-red-500 font-bold shadow-sm transition-all duration-200",
      gold:
        "bg-gold-500 text-silk-950 hover:bg-gold-400 hover:text-silk-950 font-bold shadow-luxury hover:shadow-xl focus:ring-gold-400 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950 transition-all duration-200",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
