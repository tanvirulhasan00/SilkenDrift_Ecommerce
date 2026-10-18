import React, { useState } from "react";
import { cn } from "~/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = true,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPasswordType = type === "password";
    const canTogglePassword = isPasswordType && showPasswordToggle;
    const [showPassword, setShowPassword] = useState(false);

    const effectiveType = isPasswordType
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-silk-800 dark:text-silk-200 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-silk-600 dark:text-silk-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={cn(
              "w-full rounded-lg border border-silk-300 bg-white px-3.5 py-2 text-sm text-silk-950 placeholder:text-silk-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 dark:border-dark-border dark:bg-dark-surface dark:text-silk-100 dark:placeholder:text-silk-400",
              leftIcon && "pl-10",
              (rightIcon || canTogglePassword) && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {canTogglePassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 p-1 rounded-md text-silk-500 hover:text-gold-600 dark:text-silk-400 dark:hover:text-gold-400 transition-colors focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-silk-600 dark:text-silk-400 pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-silk-700 dark:text-silk-300 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
