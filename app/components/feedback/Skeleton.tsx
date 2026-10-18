import React from "react";
import { cn } from "~/lib/utils";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-silk-200/70 dark:bg-dark-elevated",
        className
      )}
      {...props}
    />
  );
};
