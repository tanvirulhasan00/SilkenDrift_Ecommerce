import React, { useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { getAdminPath } from "~/config/adminConfig";
import { OrderInvoice } from "~/components/orders/OrderInvoice";
import { Button } from "~/components/ui/Button";
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const orderId = decodeURIComponent(params.id || "").trim();
  let order = await firestoreService.getOrderById(orderId);
  if (!order) {
    order = mockRepository.getOrderById(orderId);
  }
  if (!order) {
    throw new Response("Order Not Found", { status: 404 });
  }
  return { order };
}

export default function AdminOrderInvoicePage() {
  const { order } = useLoaderData<typeof clientLoader>();
  const { language } = useLanguage();

  useEffect(() => {
    document.title = `Invoice #${order.orderNumber} - SilkenDrift`;
  }, [order.orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-silk-50/60 dark:bg-dark-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-silk-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-3">
            <Link to={getAdminPath("orders")}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>{language === "bn" ? "অর্ডারে ফিরে যান" : "Back to Orders"}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-silk-900 dark:text-silk-100 text-sm">
                #{order.orderNumber}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-950 dark:text-gold-300 dark:border-gold-800">
                <ShieldCheck className="w-3 h-3 text-gold-600" />
                <span>Admin Staff View</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} variant="gold" size="sm" className="w-full sm:w-auto shadow-luxury">
              <Printer className="w-4 h-4 mr-1.5" />
              <span>{language === "bn" ? "চালান প্রিন্ট করুন" : "Print Invoice"}</span>
            </Button>
          </div>
        </div>

        {/* The Printable Invoice */}
        <OrderInvoice order={order} />
      </div>
    </div>
  );
}

