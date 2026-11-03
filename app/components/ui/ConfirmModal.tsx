import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "~/locales";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
  itemPreview?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  isLoading = false,
  itemPreview,
}) => {
  const { language, t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title={title || (language === "bn" ? "মুছে ফেলার নিশ্চিতকরণ" : "Confirm Deletion")}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
            <p className="font-bold">
              {language === "bn"
                ? "সতর্কতা: এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!"
                : "Warning: Irreversible action!"}
            </p>
            <div className="leading-relaxed">{message}</div>
          </div>
        </div>

        {itemPreview && (
          <div className="border border-silk-200 dark:border-dark-border rounded-xl p-3 bg-silk-50/50 dark:bg-dark-elevated/40 text-xs">
            {itemPreview}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel || t.common.cancel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "gold"}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>
              {confirmLabel ||
                (language === "bn" ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete")}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

