import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { Modal } from "~/components/ui/Modal";
import { ConfirmModal } from "~/components/ui/ConfirmModal";
import { useToast } from "~/components/feedback/ToastContext";
import { Star, CheckCircle2, XCircle, MessageSquare, Trash2, AlertTriangle, X } from "lucide-react";
import type { ReviewItem } from "~/types";
import { firestoreService } from "~/services/firebase/firestoreService";

export async function clientLoader() {
  const reviews = await firestoreService.getReviews();
  return { reviews };
}

export default function AdminReviewsPage() {
  const { reviews: initialReviews } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Single review delete modal state
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  const isAllReviewsSelected =
    reviews.length > 0 && reviews.every((r) => selectedReviewIds.includes(r.id));

  const isSomeReviewsSelected =
    reviews.some((r) => selectedReviewIds.includes(r.id)) && !isAllReviewsSelected;

  const handleToggleSelectAll = () => {
    if (isAllReviewsSelected) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(reviews.map((r) => r.id));
    }
  };

  const handleToggleSelectReview = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = (id: string, newStatus: ReviewItem["status"]) => {
    firestoreService.updateReviewStatus(id, newStatus);
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Review marked as ${newStatus}`, "success");
  };

  const handleConfirmDeleteSingleReview = () => {
    if (!reviewToDelete) return;
    const id = reviewToDelete.id;
    firestoreService.deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setSelectedReviewIds((prev) => prev.filter((item) => item !== id));
    showToast(
      language === "bn" ? "রিভিউ মুছে ফেলা হয়েছে" : "Review deleted",
      "info"
    );
    setReviewToDelete(null);
  };

  const handleConfirmBulkDeleteReviews = () => {
    firestoreService.deleteReviews(selectedReviewIds);
    const idSet = new Set(selectedReviewIds);
    setReviews((prev) => prev.filter((r) => !idSet.has(r.id)));
    showToast(
      language === "bn"
        ? `${selectedReviewIds.length} টি রিভিউ মুছে ফেলা হয়েছে`
        : `Successfully deleted ${selectedReviewIds.length} review(s)`,
      "success"
    );
    setSelectedReviewIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.admin.reviews}
        </h1>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
          {language === "bn"
            ? "গ্রাহক রিভিউ যাচাইকরণ, অনুমোদন ও প্রশ্নোত্তর মডারেশন"
            : "Customer feedback moderation, product ratings approval, and Q&A"}
        </p>
      </div>

      {/* Bulk Selection Actions Bar */}
      {selectedReviewIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {selectedReviewIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-silk-950 dark:text-silk-100">
                {language === "bn"
                  ? `${selectedReviewIds.length} টি রিভিউ নির্বাচন করা হয়েছে`
                  : `${selectedReviewIds.length} review${selectedReviewIds.length > 1 ? "s" : ""} selected`}
              </p>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "নির্বাচিত রিভিউগুলো এক ক্লিকে মুছে ফেলতে পাশের লাল বাটনে চাপ দিন"
                  : "Perform bulk deletion on selected customer feedback"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedReviewIds([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-silk-300 bg-white hover:bg-silk-100 text-silk-700 dark:bg-dark-surface dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.common.deselectAll}</span>
            </button>

            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>
                {language === "bn"
                  ? `নির্বাচিত ${selectedReviewIds.length} টি মুছুন`
                  : `Delete Selected (${selectedReviewIds.length})`}
              </span>
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllReviewsSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeReviewsSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    title={isAllReviewsSelected ? t.common.deselectAll : t.common.selectAll}
                    className="w-4 h-4 rounded border-silk-300 text-gold-600 focus:ring-gold-500 cursor-pointer dark:bg-dark-elevated dark:border-dark-border accent-gold-600"
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {reviews.map((r) => {
                const isSelected = selectedReviewIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`transition ${
                      isSelected
                        ? "bg-gold-50/70 dark:bg-gold-950/25"
                        : "hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40"
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectReview(r.id)}
                        className="w-4 h-4 rounded border-silk-300 text-gold-600 focus:ring-gold-500 cursor-pointer dark:bg-dark-elevated dark:border-dark-border accent-gold-600"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-silk-900 dark:text-silk-100">
                      {r.productName}
                    </td>
                    <td className="py-3 px-4 font-medium text-silk-700 dark:text-silk-300">
                      {r.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gold-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-silk-700 dark:text-silk-300 font-medium max-w-xs">
                      "{r.comment}"
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "success"
                            : r.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusChange(r.id, "approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {r.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(r.id, "rejected")}
                          >
                            Reject
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(r)}
                          className="p-1.5 rounded-lg border border-silk-200 hover:border-rose-400 hover:bg-rose-50 text-silk-400 hover:text-rose-600 dark:border-dark-border dark:hover:bg-rose-950/30 transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Delete Reviews Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title={
          language === "bn"
            ? `নির্বাচিত ${selectedReviewIds.length} টি রিভিউ মুছে ফেলা`
            : `Delete ${selectedReviewIds.length} Selected Review(s)?`
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-bold">
                {language === "bn"
                  ? "সতর্কতা: রিভিউগুলো মুছে ফেলা হবে!"
                  : "Warning: Reviews will be deleted!"}
              </p>
              <p>
                {language === "bn"
                  ? `আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedReviewIds.length} টি গ্রাহক রিভিউ মুছে ফেলতে চান?`
                  : `Are you sure you want to permanently delete these ${selectedReviewIds.length} selected review(s)?`}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-silk-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmBulkDeleteReviews}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>
                {language === "bn"
                  ? `হ্যাঁ, ${selectedReviewIds.length} টি রিভিউ মুছুন`
                  : `Yes, Delete ${selectedReviewIds.length} Reviews`}
              </span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Single Review Deletion Modal */}
      {reviewToDelete && (
        <ConfirmModal
          isOpen={Boolean(reviewToDelete)}
          onClose={() => setReviewToDelete(null)}
          onConfirm={handleConfirmDeleteSingleReview}
          title={language === "bn" ? "রিভিউ মুছে ফেলবেন?" : "Delete Review?"}
          message={
            language === "bn"
              ? `আপনি কি নিশ্চিতভাবে "${reviewToDelete.customerName}"-এর দেওয়া এই রিভিউটি মুছে ফেলতে চান?`
              : `Are you sure you want to permanently delete this review by "${reviewToDelete.customerName}"?`
          }
          itemPreview={
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>{reviewToDelete.productName}</span>
                <span className="text-amber-500 font-mono">★ {reviewToDelete.rating}/5</span>
              </div>
              <p className="text-silk-600 dark:text-silk-400 italic">"{reviewToDelete.comment}"</p>
            </div>
          }
        />
      )}
    </div>
  );
}
