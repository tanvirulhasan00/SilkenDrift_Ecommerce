import React from "react";
import { cn } from "~/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-silk-200/80 bg-white p-5 shadow-card transition-all duration-200 dark:border-dark-border dark:bg-dark-surface",
        hoverEffect &&
          "hover:-translate-y-0.5 hover:shadow-soft hover:border-silk-300 dark:hover:border-dark-muted/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
