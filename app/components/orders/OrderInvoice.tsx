import React from "react";
import { Order } from "~/types";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Badge } from "~/components/ui/Badge";
import { MapPin, Phone, Mail, Truck, CreditCard, ShieldCheck } from "lucide-react";

export interface OrderInvoiceProps {
  order: Order;
  showTimeline?: boolean;
  className?: string;
}

export const OrderInvoice: React.FC<OrderInvoiceProps> = ({
  order,
  showTimeline = false,
  className = "",
}) => {
  const { language, t } = useLanguage();

  return (
    <div
      className={`printable-invoice bg-white rounded-2xl border border-silk-200 p-6 sm:p-8 shadow-sm dark:bg-dark-surface dark:border-dark-border space-y-6 text-silk-900 dark:text-silk-100 ${className}`}
    >
      {/* 1. Invoice Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-silk-200 dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center text-silk-950 font-serif font-bold text-lg shadow-sm print:border print:border-silk-400">
              S
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50 tracking-tight">
                SilkenDrift
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest text-gold-600 bg-gold-50 dark:bg-gold-950/40 px-2 py-0.5 rounded border border-gold-200 dark:border-gold-800">
                Heritage Silks
              </span>
            </div>
          </div>
          <p className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1">
            House 42, Road 11, Dhanmondi, Dhaka-1209, Bangladesh • Hotline: 09612-SILKEN • support@silkendrift.com
          </p>
        </div>

        <div className="sm:text-right space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-100 dark:bg-gold-950/50 text-gold-900 dark:text-gold-300 border border-gold-300 dark:border-gold-700 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-gold-600" />
            <span>{language === "bn" ? "অফিসিয়াল চালান" : "Official Commercial Invoice"}</span>
          </div>
          <h3 className="text-base font-mono font-bold text-silk-950 dark:text-silk-50">
            #{order.orderNumber}
          </h3>
          <p className="text-[11px] text-silk-600 dark:text-silk-400">
            {language === "bn" ? "তারিখ: " : "Issue Date: "}
            {formatDate(order.createdAt, language)}
          </p>
        </div>
      </div>

      {/* 2. Customer, Shipping & Dispatch Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 rounded-xl bg-silk-50/70 dark:bg-dark-elevated/40 border border-silk-100 dark:border-dark-border text-xs">
        {/* Customer / Billed To */}
        <div className="space-y-1.5">
          <span className="font-extrabold text-[10px] uppercase tracking-wider text-silk-500">
            {language === "bn" ? "গ্রাহকের তথ্য" : "Billed To"}
          </span>
          <p className="font-bold text-sm text-silk-950 dark:text-silk-50">{order.customerName}</p>
          <p className="flex items-center gap-1 text-silk-700 dark:text-silk-300">
            <Phone className="w-3 h-3 text-silk-500" />
            <span>{order.customerPhone}</span>
          </p>
          {order.customerEmail && (
            <p className="flex items-center gap-1 text-silk-600 dark:text-silk-400">
              <Mail className="w-3 h-3 text-silk-500" />
              <span>{order.customerEmail}</span>
            </p>
          )}
        </div>

        {/* Shipping Destination */}
        <div className="space-y-1.5">
          <span className="font-extrabold text-[10px] uppercase tracking-wider text-silk-500">
            {language === "bn" ? "শিপিং ঠিকানা" : "Shipping Destination"}
          </span>
          <p className="font-semibold text-silk-900 dark:text-silk-100 flex items-start gap-1">
            <MapPin className="w-3 h-3 text-silk-500 shrink-0 mt-0.5" />
            <span>{order.shippingAddress.areaAddress}</span>
          </p>
          <p className="text-silk-600 dark:text-silk-400 pl-4 leading-relaxed">
            {order.shippingAddress.upazila}, {order.shippingAddress.district},{" "}
            {order.shippingAddress.division} - {order.shippingAddress.postalCode}
          </p>
          <p className="text-[11px] text-silk-500 pl-4 capitalize">
            Method: {order.deliveryMethod.replace("_", " ")}
          </p>
        </div>

        {/* Payment & Courier Dispatch */}
        <div className="space-y-1.5">
          <span className="font-extrabold text-[10px] uppercase tracking-wider text-silk-500">
            {language === "bn" ? "পেমেন্ট ও কুরিয়ার" : "Payment & Courier"}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-silk-900 dark:text-silk-100 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-silk-500" />
              <span>{order.paymentMethod}</span>
            </span>
            <Badge
              variant={order.paymentStatus === "paid" ? "success" : "gold"}
              size="sm"
            >
              {order.paymentStatus}
            </Badge>
          </div>
          {order.courierProvider && (
            <p className="flex items-center gap-1 text-silk-700 dark:text-silk-300">
              <Truck className="w-3 h-3 text-silk-500" />
              <span>Courier: <strong className="uppercase">{order.courierProvider}</strong></span>
            </p>
          )}
          {order.courierTrackingId ? (
            <p className="text-silk-600 dark:text-silk-400 font-mono text-[11px]">
              Tracking: <span className="font-bold text-silk-900 dark:text-silk-100">{order.courierTrackingId}</span>
            </p>
          ) : (
            <p className="text-[10px] text-silk-500 italic">No tracking code assigned</p>
          )}
        </div>
      </div>

      {/* 3. Itemized Products Table */}
      <div className="overflow-x-auto border border-silk-200 dark:border-dark-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-silk-50 dark:bg-dark-elevated border-b border-silk-200 dark:border-dark-border text-silk-700 dark:text-silk-300 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">{language === "bn" ? "পণ্য বিবরণী" : "Product & Variant"}</th>
              <th className="py-2.5 px-4 text-center">{language === "bn" ? "পরিমাণ" : "Qty"}</th>
              <th className="py-2.5 px-4 text-right">{language === "bn" ? "একক মূল্য" : "Unit Price"}</th>
              <th className="py-2.5 px-4 text-right">{language === "bn" ? "মোট মূল্য" : "Total"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silk-100 dark:divide-dark-border">
            {order.items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-silk-50/40 dark:hover:bg-dark-elevated/20">
                <td className="py-3 px-4 text-center font-mono text-silk-500">{idx + 1}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-silk-950 dark:text-silk-100">
                    {language === "bn" ? item.productNameBn : item.productNameEn}
                  </div>
                  {item.attributes && (
                    <div className="text-[11px] text-silk-600 dark:text-silk-400 mt-0.5">
                      {item.attributes.color && (
                        <span>Color: <strong>{item.attributes.color}</strong></span>
                      )}
                      {item.attributes.color && item.attributes.size && <span> • </span>}
                      {item.attributes.size && (
                        <span>Size: <strong>{item.attributes.size}</strong></span>
                      )}
                    </div>
                  )}
                  {item.variantId && (
                    <span className="font-mono text-[9px] text-silk-500 block mt-0.5">
                      SKU Ref: {item.variantId}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center font-bold text-silk-900 dark:text-silk-100">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 text-right font-medium text-silk-700 dark:text-silk-300 font-mono">
                  {formatPriceBDT(item.priceBDT, language)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-silk-950 dark:text-silk-50 font-mono">
                  {formatPriceBDT(item.subtotalBDT, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Calculation Summary & Payment Balance */}
      <div className="border-t border-silk-200 dark:border-dark-border pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs">
        {/* Left Side: Order notes & Guarantee */}
        <div className="max-w-md space-y-2 text-silk-600 dark:text-silk-400">
          {order.notes && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px]">
              <strong className="text-amber-900 dark:text-amber-300">Customer Note:</strong> {order.notes}
            </div>
          )}
          <p className="text-[11px] leading-relaxed">
            * 100% Genuine Handloom silk verified by Rajshahi Resham Silk Board standards. Please dry clean only.
          </p>
        </div>

        {/* Right Side: Totals Table */}
        <div className="w-full sm:w-72 space-y-2 border border-silk-200 dark:border-dark-border rounded-xl p-4 bg-silk-50/50 dark:bg-dark-elevated/30">
          <div className="flex justify-between text-silk-600 dark:text-silk-400">
            <span>{t.cart.subtotal}:</span>
            <span className="font-semibold text-silk-900 dark:text-silk-100 font-mono">
              {formatPriceBDT(order.subtotalBDT, language)}
            </span>
          </div>

          {order.discountBDT > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>{t.cart.discount} {order.couponCode ? `(${order.couponCode})` : ""}:</span>
              <span className="font-mono">-{formatPriceBDT(order.discountBDT, language)}</span>
            </div>
          )}

          <div className="flex justify-between text-silk-600 dark:text-silk-400">
            <span>{t.cart.deliveryCharge}:</span>
            <span className="font-semibold text-silk-900 dark:text-silk-100 font-mono">
              {order.deliveryChargeBDT === 0 ? "FREE" : formatPriceBDT(order.deliveryChargeBDT, language)}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-silk-200 dark:border-dark-border text-sm font-bold text-silk-950 dark:text-silk-50">
            <span>{t.cart.total}:</span>
            <span className="text-base text-gold-600 dark:text-gold-400 font-serif font-bold">
              {formatPriceBDT(order.totalBDT, language)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Verification Signatures for Official Warehouse Dispatch */}
      <div className="pt-8 border-t border-silk-200 dark:border-dark-border grid grid-cols-2 gap-8 text-center text-xs text-silk-500">
        <div className="space-y-1">
          <div className="border-b border-silk-300 dark:border-dark-border w-44 mx-auto pb-6" />
          <p className="font-semibold text-silk-700 dark:text-silk-300">Prepared & Inspected By</p>
          <p className="text-[10px]">SilkenDrift Central Hub</p>
        </div>
        <div className="space-y-1">
          <div className="border-b border-silk-300 dark:border-dark-border w-44 mx-auto pb-6" />
          <p className="font-semibold text-silk-700 dark:text-silk-300">Authorized Signatory / Seal</p>
          <p className="text-[10px]">Logistics Quality Assurance</p>
        </div>
      </div>

      {/* Optional Timeline (if requested) */}
      {showTimeline && order.timeline && order.timeline.length > 0 && (
        <div className="border-t border-silk-200 dark:border-dark-border pt-4 space-y-3 no-print">
          <h4 className="text-xs font-bold uppercase tracking-wider text-silk-900 dark:text-silk-100">
            {t.orders.timeline}
          </h4>
          <div className="space-y-2 pl-2">
            {order.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-gold-500 mt-1 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-silk-900 dark:text-silk-100">
                    {language === "bn" ? event.labelBn : event.labelEn}
                  </span>
                  <span className="text-[10px] text-silk-400 ml-2">
                    {formatDate(event.timestamp, language)}
                  </span>
                  {event.note && (
                    <p className="text-[11px] text-silk-600 dark:text-silk-300 italic">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

