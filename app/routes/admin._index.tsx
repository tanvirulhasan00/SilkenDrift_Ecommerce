import React from "react";
import { Link, useLoaderData } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { getAdminPath } from "~/config/adminConfig";
import { useLanguage } from "~/locales";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Headphones,
  Mail,
} from "lucide-react";

export async function clientLoader() {
  const orders = await firestoreService.getOrders();
  const products = await firestoreService.getProducts();
  const tickets = mockRepository.getSupportTickets();
  const contactMessages = await firestoreService.getContactMessages();

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod_collected")
    .reduce((acc, o) => acc + o.totalBDT, 0);

  const totalOrders = orders.length;
  const lowStockCount = products.filter((p) => p.stockTotal <= p.lowStockThreshold).length;
  const recentOrders = orders.slice(0, 5);
  const topProducts = products.filter((p) => p.isBestSeller).slice(0, 4);
  const unreadContactCount = contactMessages.filter((m) => m.status === "unread").length;

  return {
    totalRevenue,
    totalOrders,
    lowStockCount,
    recentOrders,
    topProducts,
    recentTickets: tickets.slice(0, 3),
    recentContactMessages: contactMessages.slice(0, 3),
    unreadContactCount,
  };
}

export default function AdminOverviewPage() {
  const {
    totalRevenue,
    totalOrders,
    lowStockCount,
    recentOrders,
    topProducts,
    recentTickets,
    unreadContactCount,
  } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Unread Contact Messages Alert Banner */}
      {unreadContactCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50 border border-amber-200/90 rounded-2xl dark:bg-amber-950/20 dark:border-amber-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                {language === "bn"
                  ? `${unreadContactCount} টি নতুন কন্টাক্ট বার্তা এসেছে!`
                  : `${unreadContactCount} new inquiry messages received from storefront contact page!`}
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                {language === "bn"
                  ? "গ্রাহকরা ওয়েবসাইটের যোগাযোগ পাতা থেকে সরাসরি বার্তা পাঠিয়েছেন। অ্যাডমিন প্যানেলে রিভিউ করুন।"
                  : "Visitors have submitted contact requests. Review customer mobile numbers & inquiries in the Support Inbox."}
              </p>
            </div>
          </div>
          <Link to={getAdminPath("support")}>
            <Button size="sm" variant="gold" className="shrink-0">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <span>{language === "bn" ? "ইনবক্স দেখুন" : "View Inbox"} →</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.admin.dashboard}
          </h1>
          <p className="text-xs sm:text-sm text-silk-700 dark:text-silk-300 font-medium mt-1">
            {language === "bn"
              ? "সিল্কেনড্রিফট বাংলাদেশ ই-কমার্স অপারেশনাল ওভারভিউ"
              : "Real-time overview of orders, inventory, revenue, and fulfillment"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={getAdminPath("products")}>
            <Button size="sm" variant="gold">
              <Package className="w-3.5 h-3.5 mr-1" />
              <span>{t.admin.addNewProduct}</span>
            </Button>
          </Link>
          <Link to={getAdminPath("orders")}>
            <Button size="sm" variant="outline">
              <span>{language === "bn" ? "অর্ডার প্রসেস করুন" : "Process Orders"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue */}
        <div className="rounded-2xl bg-white p-5 border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
              {t.admin.quickStats.revenue}
            </span>
            <div className="p-2 rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-950/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-silk-950 dark:text-gold-400">
              {formatPriceBDT(totalRevenue, language)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% {language === "bn" ? "গত মাসের চেয়ে বেশি" : "vs last month"}</span>
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl bg-white p-5 border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
              {t.admin.quickStats.orders}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {totalOrders}
            </h3>
            <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1 block">
              {language === "bn" ? "সর্বমোট গৃহিত অর্ডার" : "Lifetime store orders"}
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="rounded-2xl bg-white p-5 border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
              {t.admin.quickStats.customers}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              1,428
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              +64 {language === "bn" ? "নতুন গ্রাহক (এই সপ্তাহে)" : "new this week"}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl bg-white p-5 border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider">
              {t.admin.quickStats.lowStock}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400">
              {lowStockCount}
            </h3>
            <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium mt-1 block">
              {language === "bn" ? "পুনরায় সোর্সিং প্রয়োজন" : "Requires procurement"}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart Visualizer */}
      <div className="rounded-3xl bg-white p-6 border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
              {t.admin.salesOverview}
            </h3>
            <p className="text-xs text-silk-600 dark:text-silk-400 font-medium">
              {language === "bn"
                ? "বিকাশ, কার্ড ও ক্যাশ অন ডেলিভারি ট্রেন্ড (মাসিক)"
                : "Monthly revenue trend broken down across payment channels"}
            </p>
          </div>
          <Badge variant="gold">2026 Q1 Live</Badge>
        </div>

        {/* Dynamic CSS Bar Chart */}
        <div className="pt-6 grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 border-b border-silk-100 dark:border-dark-border pb-3">
          {[
            { day: "Sat", bdt: 42000, height: "45%" },
            { day: "Sun", bdt: 68000, height: "70%" },
            { day: "Mon", bdt: 55000, height: "60%" },
            { day: "Tue", bdt: 89000, height: "90%" },
            { day: "Wed", bdt: 62000, height: "65%" },
            { day: "Thu", bdt: 98000, height: "100%" },
            { day: "Fri", bdt: 78000, height: "80%" },
          ].map((bar) => (
            <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-bold text-silk-700 dark:text-silk-300 opacity-0 group-hover:opacity-100 transition-opacity">
                ৳{Math.round(bar.bdt / 1000)}k
              </span>
              <div
                className="w-full bg-gradient-to-t from-silk-900 to-gold-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-sm"
                style={{ height: bar.height }}
              />
              <span className="text-[11px] font-bold text-silk-800 dark:text-silk-200">
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border">
            <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
              {t.admin.recentOrders}
            </h3>
            <Link to={getAdminPath("orders")} className="text-xs font-semibold text-gold-600 hover:text-gold-700">
              {t.common.viewAll} →
            </Link>
          </div>

          <div className="divide-y divide-silk-100 dark:divide-dark-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-silk-900 dark:text-silk-100">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={order.orderStatus === "delivered" ? "success" : "gold"} size="sm">
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <p className="text-silk-600 dark:text-silk-400 font-medium text-[11px] mt-0.5">
                    {order.customerName} • {order.items.length} items
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-silk-950 dark:text-gold-400 font-serif">
                    {formatPriceBDT(order.totalBDT, language)}
                  </span>
                  <span className="block text-[10px] text-silk-600 dark:text-silk-400 font-semibold uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border">
            <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
              {t.admin.topProducts}
            </h3>
            <Link to={getAdminPath("products")} className="text-xs font-semibold text-gold-600 hover:text-gold-700">
              {t.common.viewAll} →
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-silk-50 dark:bg-dark-elevated">
                <img
                  src={p.images[0]}
                  alt={p.nameEn}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-silk-900 truncate dark:text-silk-100">
                    {language === "bn" ? p.nameBn : p.nameEn}
                  </h4>
                  <span className="text-[11px] text-silk-600 dark:text-silk-400 font-medium">
                    Stock: {p.stockTotal} pcs
                  </span>
                </div>
                <span className="text-xs font-bold text-gold-600 dark:text-gold-400 font-serif">
                  {formatPriceBDT(p.salePriceBDT || p.basePriceBDT, language)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
