import React from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
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
  const order = await firestoreService.getOrderById(params.id);
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

      {/* Printable Invoice Container */}
      <div className="printable-invoice bg-white rounded-3xl border border-silk-200 p-6 sm:p-10 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-silk-200 pb-6 dark:border-dark-border">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-silk-950 font-serif font-bold text-base">
                S
              </div>
              <span className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
                SilkenDrift
              </span>
            </div>
            <p className="text-[11px] text-silk-700 dark:text-silk-300 font-medium mt-1">
              Dhanmondi, Dhaka-1209, Bangladesh • Hotline: 09612-SILKEN
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs uppercase font-bold text-gold-600 tracking-wider">
              {language === "bn" ? "অফিসিয়াল চালান" : "Official Invoice"}
            </span>
            <h3 className="text-sm font-bold text-silk-950 dark:text-silk-50 mt-0.5">
              #{order.orderNumber}
            </h3>
            <span className="text-[11px] font-medium text-silk-600 dark:text-silk-400">
              {formatDate(order.createdAt, language)}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-silk-700 dark:text-silk-300 uppercase tracking-wider text-[10px]">
              {language === "bn" ? "গ্রাহকের তথ্য" : "Billed To"}
            </span>
            <p className="font-bold text-silk-900 dark:text-silk-100">{order.customerName}</p>
            <p className="text-silk-600 dark:text-silk-400">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-silk-600 dark:text-silk-400">{order.customerEmail}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-silk-700 dark:text-silk-300 uppercase tracking-wider text-[10px]">
              {language === "bn" ? "শিপিং ঠিকানা" : "Shipping Destination"}
            </span>
            <p className="font-medium text-silk-900 dark:text-silk-100">
              {order.shippingAddress.areaAddress}
            </p>
            <p className="text-silk-600 dark:text-silk-400">
              {order.shippingAddress.upazila}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.division} - {order.shippingAddress.postalCode}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-silk-700 dark:text-silk-300 uppercase tracking-wider text-[10px]">
              {language === "bn" ? "পেমেন্ট ও কুরিয়ার" : "Payment & Dispatch"}
            </span>
            <p className="font-semibold text-silk-900 dark:text-silk-100 uppercase">
              {order.paymentMethod} ({order.paymentStatus})
            </p>
            {order.courierTrackingId && (
              <p className="text-silk-600 dark:text-silk-400">
                Courier Tracking: <span className="font-mono">{order.courierTrackingId}</span>
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-silk-200 dark:border-dark-border text-silk-900 dark:text-silk-100 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">{language === "bn" ? "পণ্য" : "Item"}</th>
                <th className="py-2.5 text-center">{language === "bn" ? "পরিমাণ" : "Qty"}</th>
                <th className="py-2.5 text-right">{language === "bn" ? "একক মূল্য" : "Unit Price"}</th>
                <th className="py-2.5 text-right">{language === "bn" ? "মোট" : "Total"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
              {order.items.map((item) => (
                <tr key={item.id} className="py-2">
                  <td className="py-3 font-medium text-silk-900 dark:text-silk-100">
                    {language === "bn" ? item.productNameBn : item.productNameEn}
                    {item.attributes && (
                      <span className="block text-[10px] text-silk-700 dark:text-silk-300 font-medium">
                        {item.attributes.color && `${item.attributes.color} `}
                        {item.attributes.size && `/ ${item.attributes.size}`}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-silk-700 dark:text-silk-300">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-silk-700 dark:text-silk-300">
                    {formatPriceBDT(item.priceBDT, language)}
                  </td>
                  <td className="py-3 text-right font-bold text-silk-900 dark:text-silk-100">
                    {formatPriceBDT(item.subtotalBDT, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="border-t border-silk-200 dark:border-dark-border pt-4 flex justify-end">
          <div className="w-full sm:w-64 space-y-2 text-xs text-silk-600 dark:text-silk-400">
            <div className="flex justify-between">
              <span>{t.cart.subtotal}:</span>
              <span className="font-semibold text-silk-900 dark:text-silk-100">
                {formatPriceBDT(order.subtotalBDT, language)}
              </span>
            </div>
            {order.discountBDT > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t.cart.discount}:</span>
                <span>-{formatPriceBDT(order.discountBDT, language)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t.cart.deliveryCharge}:</span>
              <span className="font-semibold text-silk-900 dark:text-silk-100">
                {order.deliveryChargeBDT === 0
                  ? "FREE"
                  : formatPriceBDT(order.deliveryChargeBDT, language)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-silk-200 dark:border-dark-border text-sm font-bold text-silk-950 dark:text-silk-50">
              <span>{t.cart.total}:</span>
              <span className="text-base text-gold-600 font-serif">
                {formatPriceBDT(order.totalBDT, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="border-t border-silk-200 dark:border-dark-border pt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-silk-900 dark:text-silk-100">
            {t.orders.timeline}
          </h4>

          <div className="space-y-4 pl-2">
            {order.timeline.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-silk-900 dark:text-silk-100">
                    {language === "bn" ? event.labelBn : event.labelEn}
                  </p>
                  <p className="text-[10px] text-silk-400">
                    {formatDate(event.timestamp, language)}
                  </p>
                  {event.note && (
                    <p className="text-[11px] text-silk-600 italic dark:text-silk-300 mt-0.5">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!user && (
            <div className="mt-4 p-4 rounded-2xl bg-gold-50/70 border border-gold-300 dark:bg-gold-950/20 dark:border-gold-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
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
      </div>
    </div>
  );
}
