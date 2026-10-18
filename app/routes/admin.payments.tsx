import React from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Badge } from "~/components/ui/Badge";
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export async function clientLoader() {
  const orders = mockRepository.getOrders();
  return { orders };
}

export default function AdminPaymentsPage() {
  const { orders } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();

  const totalPaid = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod_collected")
    .reduce((acc, o) => acc + o.totalBDT, 0);

  const totalPendingCod = orders
    .filter((o) => o.paymentStatus === "cod_pending")
    .reduce((acc, o) => acc + o.totalBDT, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.admin.payments}
        </h1>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
          {language === "bn"
            ? "বিকাশ, এসএসএলকমার্জ ও ক্যাশ অন ডেলিভারি লেনদেন লেজার ও রিকনসিলিয়েশন"
            : "bKash, SSLCOMMERZ, and Cash on Delivery transaction settlement ledger"}
        </p>
      </div>

      {/* Payment Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            Settled Online Revenue
          </span>
          <h3 className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatPriceBDT(totalPaid, language)}
          </h3>
          <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1 block">
            bKash & SSLCOMMERZ verified settlements
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            COD Cash in Transit
          </span>
          <h3 className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-2">
            {formatPriceBDT(totalPendingCod, language)}
          </h3>
          <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1 block">
            With courier riders (Pathao / Steadfast)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            Payment Gateways
          </span>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 rounded bg-pink-50 text-pink-700 text-xs font-bold dark:bg-pink-950/40 dark:text-pink-300">
              bKash Live
            </span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold dark:bg-blue-950/40 dark:text-blue-300">
              SSLCOMMERZ
            </span>
          </div>
          <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1 block">
            Secure Cloud Function boundaries active
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-silk-200 overflow-hidden shadow-card dark:bg-dark-surface dark:border-dark-border">
        <div className="p-4 border-b border-silk-100 dark:border-dark-border flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-silk-950 dark:text-silk-50 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold-600" />
            <span>Master Transactions Ledger</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-silk-100/90 border-b border-silk-200 dark:bg-dark-elevated dark:border-dark-border text-silk-900 dark:text-silk-200 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction / TrxID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount (BDT)</th>
                <th className="py-3 px-4">Settlement Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-silk-50/50 dark:hover:bg-dark-elevated/40">
                  <td className="py-3 px-4 font-mono font-bold text-silk-950 dark:text-silk-100">
                    {order.paymentId || `COD-COL-${order.orderNumber.slice(-4)}`}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-silk-700 dark:text-silk-300">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-silk-800 dark:text-silk-200">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3 px-4 font-serif font-bold text-silk-950 dark:text-silk-100">
                    {formatPriceBDT(order.totalBDT, language)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        order.paymentStatus === "paid" || order.paymentStatus === "cod_collected"
                          ? "success"
                          : "warning"
                      }
                      size="sm"
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-silk-700 dark:text-silk-300">
                    {formatDate(order.createdAt, language)}
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
