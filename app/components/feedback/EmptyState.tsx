import React from "react";
import { LucideIcon, PackageOpen } from "lucide-react";
import { Button } from "~/components/ui/Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-silk-100 text-silk-700 mb-4 dark:bg-dark-elevated dark:text-silk-300">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-silk-900 dark:text-silk-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-silk-700 dark:text-silk-300 font-medium max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5" size="sm" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
