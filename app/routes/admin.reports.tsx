import React from "react";
import { useLoaderData } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { BarChart3, TrendingUp, PieChart, MapPin, DollarSign } from "lucide-react";

export async function clientLoader() {
  const orders = mockRepository.getOrders();
  const products = mockRepository.getProducts();

  const totalSales = orders.reduce((acc, o) => acc + o.totalBDT, 0);
  const avgOrderValue = Math.round(totalSales / (orders.length || 1));

  return { totalSales, avgOrderValue, orderCount: orders.length };
}

export default function AdminReportsPage() {
  const { totalSales, avgOrderValue, orderCount } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.admin.reports}
        </h1>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
          {language === "bn"
            ? "বিক্রয় বিশ্লেষণ, গড় অর্ডার ভ্যালু ও ডেলিভারি জোনের পারফরম্যান্স"
            : "Financial breakdowns, conversion analytics, and division performance"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            Gross Merchandize Value
          </span>
          <h3 className="text-2xl font-serif font-bold text-silk-950 dark:text-gold-400 mt-2">
            {formatPriceBDT(totalSales, language)}
          </h3>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Across {orderCount} processed orders
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            Average Order Value (AOV)
          </span>
          <h3 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50 mt-2">
            {formatPriceBDT(avgOrderValue, language)}
          </h3>
          <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium block mt-1">
            Driven by premium mulberry silk sarees
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
            Repeat Customer Rate
          </span>
          <h3 className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            34.2%
          </h3>
          <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium block mt-1">
            Top tier in Bangladesh fashion ecommerce
          </span>
        </div>
      </div>

      {/* Top Bangladesh Delivery Hubs Breakdown */}
      <div className="bg-white rounded-3xl border border-silk-200 p-6 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
        <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-600" />
          <span>Regional Order Distribution by Division</span>
        </h3>

        <div className="space-y-3 pt-2">
          {[
            { name: "Dhaka Division (Gulshan, Dhanmondi, Uttara)", share: 62, orders: 890 },
            { name: "Chattogram Division (Agrabad, Panchlaish, Cox's Bazar)", share: 18, orders: 257 },
            { name: "Rajshahi Division (Silk Heritage Origin)", share: 9, orders: 128 },
            { name: "Sylhet Division (Tea Estate & Diaspora)", share: 6, orders: 86 },
            { name: "All Other Districts", share: 5, orders: 71 },
          ].map((item) => (
            <div key={item.name} className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-silk-800 dark:text-silk-200">
                <span className="font-medium">{item.name}</span>
                <span className="font-bold">{item.share}% ({item.orders} orders)</span>
              </div>
              <div className="w-full bg-silk-100 rounded-full h-2 dark:bg-dark-elevated overflow-hidden">
                <div
                  className="bg-gold-500 h-full rounded-full"
                  style={{ width: `${item.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
