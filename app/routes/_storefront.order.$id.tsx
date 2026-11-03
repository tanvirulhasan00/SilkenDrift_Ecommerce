import React from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { OrderInvoice } from "~/components/orders/OrderInvoice";
import {
  CheckCircle2,
  Printer,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export async function clientLoader({ params }: { params: { id: string } }) {
  const orderId = decodeURIComponent(params.id || "").trim();
  const order = await firestoreService.getOrderById(orderId);
  if (!order) {
    throw new Response("Order Not Found", { status: 404 });
  }
  return { order };
}

export default function OrderSuccessPage() {
  const { order } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success banner (hidden in print) */}
      <div className="no-print bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3 dark:bg-emerald-950/20 dark:border-emerald-800">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950 dark:text-emerald-200">
          {t.orderSuccess.title}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
          {t.orderSuccess.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1" />
            <span>{t.orderSuccess.printInvoice}</span>
          </Button>

          <Link to={`/track?order=${order.orderNumber}`}>
            <Button variant="gold" size="sm">
              <Truck className="w-4 h-4 mr-1" />
              <span>{t.nav.trackOrder}</span>
            </Button>
          </Link>

          <Link to="/">
            <Button variant="primary" size="sm">
              <span>{t.orderSuccess.backToHome}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Printable Invoice Component */}
      <OrderInvoice order={order} showTimeline={true} />

      {/* Guest registration prompt */}
      {!user && (
        <div className="no-print p-4 sm:p-5 rounded-2xl bg-gold-50/70 border border-gold-300 dark:bg-gold-950/20 dark:border-gold-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-silk-900 dark:text-silk-100">
                {language === "bn"
                  ? "লাইভ কুরিয়ার ট্র্যাকিং ও এসএমএস নোটিফিকেশন"
                  : "Live Courier Tracking & SMS Alerts"}
              </p>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "রিয়েল-টাইম কুরিয়ার মুভমেন্ট দেখতে এবং অর্ডার ট্র্যাক করতে একটি ফ্রি অ্যাকাউন্ট খুলুন।"
                  : "Create a free account with your checkout mobile number to unlock live order tracking and dispatch alerts."}
              </p>
            </div>
          </div>
          <Link to={`/register?redirect=${encodeURIComponent(`/track?order=${order.orderNumber}`)}`}>
            <Button variant="gold" size="sm" className="shrink-0">
              <span>{language === "bn" ? "অ্যাকাউন্ট খুলুন" : "Register to Track"}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const { language, t } = useLanguage();
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-silk-100 flex items-center justify-center mx-auto text-gold-600 dark:bg-dark-elevated">
        <Package className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
        {language === "bn" ? "অর্ডার খুঁজে পাওয়া যায়নি" : "Order Not Found"}
      </h2>
      <p className="text-xs text-silk-600 dark:text-silk-400 max-w-sm mx-auto">
        {language === "bn"
          ? "দুঃখিত, এই অর্ডারের তথ্য পাওয়া যায়নি। অনুগ্রহ করে আপনার অর্ডার নম্বর দিয়ে ট্র্যাক করুন।"
          : "We could not find the requested order. You can track using your order number or continue shopping."}
      </p>
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link to="/track">
          <Button variant="gold" size="sm">
            <Truck className="w-4 h-4 mr-1.5" />
            <span>{t.nav.trackOrder}</span>
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="sm">
            <span>{t.cart.continueShopping}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
