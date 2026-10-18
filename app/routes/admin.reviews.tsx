import React, { useState } from "react";
import { useLoaderData } from "react-router";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { useToast } from "~/components/feedback/ToastContext";
import { Star, CheckCircle2, XCircle, MessageSquare } from "lucide-react";

interface ReviewItem {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "rejected";
}

export async function clientLoader() {
  const reviews: ReviewItem[] = [
    {
      id: "rev_01",
      productName: "Padma Gold Zari Rajshahi Mulberry Silk Saree",
      customerName: "Dr. Sadia Afrin",
      rating: 5,
      comment: "Received in Dhaka within 48 hours. Beautiful genuine silk fabric, looks exactly as pictured.",
      date: "2026-02-14",
      status: "approved",
    },
    {
      id: "rev_02",
      productName: "Bespoke Royal Endi Silk Embroidered Panjabi",
      customerName: "Kamal Hossain",
      rating: 5,
      comment: "Bought this as a wedding gift. Packaging was premium and luxurious. Highly recommended!",
      date: "2026-02-15",
      status: "approved",
    },
    {
      id: "rev_03",
      productName: "Tangail Jacquard Soft Silk Festive Saree",
      customerName: "Nusrat Jahan",
      rating: 4,
      comment: "Color fastness is good, though delivery to Sylhet took 3 days instead of 2.",
      date: "2026-02-16",
      status: "pending",
    },
  ];

  return { reviews };
}

export default function AdminReviewsPage() {
  const { reviews: initialReviews } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const handleStatusChange = (id: string, newStatus: ReviewItem["status"]) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast(`Review marked as ${newStatus}`, "success");
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

      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
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
                  <td className="py-3 px-4 text-right space-x-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
