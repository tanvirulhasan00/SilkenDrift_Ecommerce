import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { Order, OrderStatus } from "~/types";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { normalizeImageUrl } from "~/lib/imageUrl";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { useToast } from "~/components/feedback/ToastContext";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Lock,
  UserCheck,
  UserPlus,
  LogIn,
  Copy,
  ChevronRight,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export async function clientLoader() {
  try {
    const orders = await firestoreService.getOrders();
    return { orders: orders || [] };
  } catch {
    return { orders: mockRepository.getOrders() };
  }
}

// Milestone sequence for Bangladesh ecommerce delivery
const TRACKING_STAGES: { status: OrderStatus; labelEn: string; labelBn: string; step: number }[] = [
  { status: "pending", labelEn: "Order Placed", labelBn: "অর্ডার গৃহীত", step: 1 },
  { status: "confirmed", labelEn: "Confirmed", labelBn: "অর্ডার নিশ্চিত", step: 2 },
  { status: "processing", labelEn: "Processing & Sourced", labelBn: "তাঁত ও স্টক প্রস্তুতি", step: 3 },
  { status: "packed", labelEn: "Inspected & Packed", labelBn: "প্যাকেজিং সম্পন্ন", step: 4 },
  { status: "shipped", labelEn: "In Transit / Courier", labelBn: "কুরিয়ারে হস্তান্তর", step: 5 },
  { status: "out_for_delivery", labelEn: "Out for Delivery", labelBn: "ডেলিভারিতে বের হয়েছে", step: 6 },
  { status: "delivered", labelEn: "Delivered", labelBn: "ডেলিভারি সম্পন্ন", step: 7 },
];

function getStageIndex(status: OrderStatus): number {
  const idx = TRACKING_STAGES.findIndex((s) => s.status === status);
  if (idx >= 0) return idx;
  if (status === "cancelled" || status === "returned" || status === "failed_delivery") return -1;
  return 1;
}

export default function OrderTrackerPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load orders when authenticated
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const fetched = await firestoreService.getOrders();
        if (mounted && fetched) {
          setOrders(fetched);
        }
      } catch {
        if (mounted) {
          setOrders(mockRepository.getOrders());
        }
      }
    }
    if (user) {
      loadData();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  // Handle URL query parameter ?order=...
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam && orders.length > 0) {
      const match = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === orderParam.toLowerCase() ||
          o.id.toLowerCase() === orderParam.toLowerCase() ||
          (o.courierTrackingId &&
            o.courierTrackingId.toLowerCase() === orderParam.toLowerCase())
      );
      if (match) {
        setSelectedOrder(match);
        setSearchInput(match.orderNumber);
      }
    } else if (!selectedOrder && orders.length > 0) {
      // Default to first order for instant preview
      setSelectedOrder(orders[0]);
    }
  }, [searchParams, orders]);

  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) {
      showToast(
        language === "bn"
          ? "দয়া করে অর্ডার নম্বর বা ট্র্যাকিং কোড লিখুন"
          : "Please enter an order number or tracking code",
        "info"
      );
      return;
    }

    setIsSearching(true);
    const match = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.id.toLowerCase().includes(query) ||
        (o.courierTrackingId && o.courierTrackingId.toLowerCase().includes(query)) ||
        o.customerPhone.replace(/[^0-9]/g, "").includes(query)
    );

    setIsSearching(false);
    if (match) {
      setSelectedOrder(match);
      setSearchParams({ order: match.orderNumber });
      showToast(
        language === "bn"
          ? `অর্ডার #${match.orderNumber} ট্র্যাকিং পাওয়া গেছে!`
          : `Tracking details loaded for #${match.orderNumber}`,
        "success"
      );
    } else {
      showToast(
        language === "bn"
          ? "অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর দিন।"
          : "No order found matching your query. Please check and try again.",
        "error"
      );
    }
  };

  const handleCopyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(
      language === "bn" ? "ট্র্যাকিং কোড কপি করা হয়েছে" : "Tracking code copied to clipboard",
      "success"
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ==========================================================================
  // ACCESS BARRIER: IF NOT LOGGED IN / REGISTERED
  // ==========================================================================
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-silk-50/50 dark:bg-dark-bg">
        <div className="max-w-2xl w-full space-y-8">
          {/* Main Card */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-silk-200 dark:border-dark-border p-8 sm:p-12 shadow-card text-center space-y-6">
            {/* Lock / Security Icon */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-500/20 to-silk-900/10 text-gold-600 dark:text-gold-400 flex items-center justify-center mx-auto border border-gold-400/50 shadow-soft">
                <Truck className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-silk-950 dark:bg-gold-500 text-white dark:text-silk-950 flex items-center justify-center shadow-md">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Access Badge */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-950/50 dark:text-gold-300 dark:border-gold-800">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                <span>
                  {language === "bn"
                    ? "শুধুমাত্র নিবন্ধিত গ্রাহকদের জন্য সংরক্ষিত"
                    : "Exclusively for Registered Patrons"}
                </span>
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
                {language === "bn" ? "অর্ডার ট্র্যাকার সিকিউরিটি গেট" : "Live Order Tracker Access"}
              </h1>

              <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 max-w-lg mx-auto leading-relaxed">
                {language === "bn"
                  ? "গ্রাহকদের ব্যক্তিগত ডেলিভারি ঠিকানা, ফোন নম্বর এবং কুরিয়ারের লাইভ ট্র্যাকিং তথ্যের কঠোর গোপনীয়তা বজায় রাখার জন্য অর্ডার ট্র্যাকার সুবিধাটি শুধুমাত্র নিবন্ধিত সিল্কেনড্রিফ্ট অ্যাকাউন্টের জন্য উন্মুক্ত।"
                  : "To safeguard personal delivery addresses, verified phone numbers, and live GPS courier milestones, our real-time Order Tracker is strictly reserved for registered SilkenDrift members."}
              </p>
            </div>

            {/* Guest order note */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-200 text-xs text-left flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {language === "bn"
                    ? "গেস্ট হিসেবে অর্ডার করেছিলেন?"
                    : "Placed an order as a guest?"}
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  {language === "bn"
                    ? "অর্ডার করার সময় যে মোবাইল নম্বর বা ইমেইল দিয়েছিলেন, সেটি দিয়ে একটি অ্যাকাউন্ট তৈরি করুন। আপনার পূর্বের সমস্ত অর্ডার স্বয়ংক্রিয়ভাবে ট্র্যাকিং পোর্টালে যুক্ত হয়ে যাবে।"
                    : "Simply register an account using the same phone number or email you used during checkout. All past and active orders will automatically link to your tracking dashboard."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/login?redirect=/track" className="w-full sm:w-auto">
                <Button variant="gold" size="lg" className="w-full shadow-luxury">
                  <LogIn className="w-4 h-4 mr-2" />
                  <span>{language === "bn" ? "সাইন ইন করে ট্র্যাক করুন" : "Sign In to Track Order"}</span>
                </Button>
              </Link>

              <Link to="/register?redirect=/track" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>{language === "bn" ? "নতুন অ্যাকাউন্ট নিবন্ধন" : "Register New Account"}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/80 dark:bg-dark-surface/60 rounded-2xl border border-silk-200 dark:border-dark-border p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
                🚚
              </div>
              <h4 className="font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "লাইভ কুরিয়ার লিংক" : "Live Courier Sync"}
              </h4>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "পাঠাও, রেডএক্স ও স্টিডফাস্ট-এর সাথে রিয়েল-টাইম এপিআই ট্র্যাকিং।"
                  : "Direct status sync with Steadfast, Pathao & RedX across 64 districts."}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-dark-surface/60 rounded-2xl border border-silk-200 dark:border-dark-border p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
                📍
              </div>
              <h4 className="font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "তাঁত থেকে ডোরস্টেপ" : "Loom to Doorstep"}
              </h4>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "রাজশাহী সিল্ক ও জামদানি কারিগরদের থেকে প্রতিটি পদক্ষেপের টাইমলাইন।"
                  : "Transparent stages from Rajshahi handloom hubs to your home."}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-dark-surface/60 rounded-2xl border border-silk-200 dark:border-dark-border p-4 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h4 className="font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "১০০% তথ্য নিরাপত্তা" : "Verified Privacy"}
              </h4>
              <p className="text-[11px] text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "অননুমোদিত কেউ আপনার অর্ডার বা ডেলিভারি তথ্য দেখতে পারবে না।"
                  : "Strict authentication protects recipient phone and delivery details."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // AUTHENTICATED REGISTERED USER VIEW: FULL ORDER TRACKER
  // ==========================================================================
  const currentStageIndex = selectedOrder ? getStageIndex(selectedOrder.orderStatus) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar with user verified tag */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-silk-200 dark:border-dark-border shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {language === "bn" ? "অর্ডার ট্র্যাকিং পোর্টাল" : "Live Order Tracker"}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <UserCheck className="w-3 h-3" />
              <span>{language === "bn" ? "নিবন্ধিত অ্যাকাউন্ট" : "Verified Member"}</span>
            </span>
          </div>
          <p className="text-xs text-silk-600 dark:text-silk-400 mt-1">
            {language === "bn"
              ? `স্বাগতম, ${user.displayName || "গ্রাহক"}! আপনার সমস্ত হ্যান্ডলুম অর্ডারের লাইভ শিপমেন্ট ও ডেলিভারি স্ট্যাটাস ট্র্যাক করুন।`
              : `Welcome, ${user.displayName || "Valued Patron"}! Monitor live transit milestones and courier dispatch for your handloom orders.`}
          </p>
        </div>

        <Link to="/account?tab=orders">
          <Button variant="outline" size="sm">
            <Package className="w-3.5 h-3.5 mr-1.5" />
            <span>{language === "bn" ? "আমার সমস্ত অর্ডার" : "All My Orders"}</span>
          </Button>
        </Link>
      </div>

      {/* Quick Search Bar */}
      <form
        onSubmit={handleTrackSearch}
        className="bg-gold-50/70 border border-gold-300 dark:bg-gold-950/20 dark:border-gold-800/60 p-4 sm:p-5 rounded-3xl shadow-soft flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              language === "bn"
                ? "অর্ডার নম্বর (যেমন: SD-260215-4819) বা কুরিয়ার ট্র্যাকিং কোড লিখুন..."
                : "Enter Order Number (e.g. SD-260215-4819) or Courier Tracking ID..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-silk-300 bg-white text-xs dark:bg-dark-surface dark:border-dark-border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>

        <Button type="submit" variant="gold" size="sm" isLoading={isSearching} className="w-full sm:w-auto shrink-0">
          <Search className="w-3.5 h-3.5 mr-1.5" />
          <span>{language === "bn" ? "অর্ডার খুঁজুন" : "Track Order"}</span>
        </Button>
      </form>

      {/* Active Tracked Order Details */}
      {selectedOrder ? (
        <div className="space-y-6">
          {/* Order Snapshot Card */}
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-silk-200 dark:border-dark-border p-6 sm:p-8 shadow-card space-y-8">
            {/* Top row: Order Number, Date, Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-silk-200 dark:border-dark-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silk-500">
                  {language === "bn" ? "অর্ডার নম্বর" : "Tracking Order"}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-xl font-bold font-mono text-silk-950 dark:text-silk-50">
                    #{selectedOrder.orderNumber}
                  </h2>
                  <Badge variant={selectedOrder.orderStatus === "delivered" ? "success" : "gold"}>
                    {t.statuses[selectedOrder.orderStatus] || selectedOrder.orderStatus}
                  </Badge>
                </div>
                <p className="text-[11px] text-silk-500 mt-1">
                  {language === "bn" ? "অর্ডারের তারিখ: " : "Placed on: "}
                  {formatDate(selectedOrder.createdAt, language)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/order/success/${selectedOrder.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    <span>{language === "bn" ? "অফিসিয়াল চালান" : "Official Invoice"}</span>
                  </Button>
                </Link>

                <a href="tel:09612-SILKEN">
                  <Button variant="outline" size="sm">
                    <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-gold-500" />
                    <span>{language === "bn" ? "হেল্পলাইন" : "Call Hotline"}</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Visual Multi-step Progression Tracker */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-silk-700 dark:text-silk-300">
                {language === "bn" ? "ডেলিভারি অগ্রগতি" : "Shipment Progress"}
              </h3>

              <div className="relative">
                {/* Horizontal line for desktop */}
                <div className="hidden sm:block absolute top-4 left-6 right-6 h-1 bg-silk-100 dark:bg-dark-elevated rounded-full -z-0">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (currentStageIndex / (TRACKING_STAGES.length - 1)) * 100))}%`,
                    }}
                  />
                </div>

                {/* Stages list */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 sm:gap-2 relative z-10">
                  {TRACKING_STAGES.map((st, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isUpcoming = idx > currentStageIndex;

                    return (
                      <div
                        key={st.status}
                        className={`flex sm:flex-col items-center sm:text-center gap-2 p-2 sm:p-0 rounded-xl sm:rounded-none transition ${
                          isCurrent
                            ? "bg-gold-50/70 sm:bg-transparent dark:bg-gold-950/20 sm:dark:bg-transparent"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-sm"
                              : isCurrent
                              ? "bg-gold-500 text-silk-950 ring-4 ring-gold-500/20 shadow-md animate-pulse"
                              : "bg-silk-100 text-silk-400 dark:bg-dark-elevated dark:text-silk-500"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.step}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold leading-tight ${
                              isCurrent
                                ? "text-gold-600 dark:text-gold-400 font-bold"
                                : isCompleted
                                ? "text-silk-900 dark:text-silk-100"
                                : "text-silk-400 dark:text-silk-500"
                            }`}
                          >
                            {language === "bn" ? st.labelBn : st.labelEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Courier & Destination Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-silk-100 dark:border-dark-border text-xs">
              {/* Courier Partner */}
              <div className="p-4 rounded-2xl bg-silk-50/80 dark:bg-dark-elevated/50 border border-silk-200 dark:border-dark-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-silk-900 dark:text-silk-100">
                  <Truck className="w-4 h-4 text-gold-500" />
                  <span>{language === "bn" ? "কুরিয়ার ও ট্র্যাকিং কোড" : "Courier Dispatch"}</span>
                </div>
                <p className="text-silk-600 dark:text-silk-400">
                  {selectedOrder.deliveryMethod === "pickup_point"
                    ? "Store Pickup Point"
                    : selectedOrder.deliveryMethod === "home_delivery"
                    ? "Express Home Delivery (Steadfast / Pathao)"
                    : "Standard Courier"}
                </p>
                {selectedOrder.courierTrackingId ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[11px] font-bold text-silk-900 dark:text-silk-100 bg-white dark:bg-dark-surface px-2 py-0.5 rounded border border-silk-300 dark:border-dark-border">
                      {selectedOrder.courierTrackingId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTrackingCode(selectedOrder.courierTrackingId!)}
                      className="text-[10px] text-gold-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-silk-400 italic">
                    {language === "bn" ? "কুরিয়ার কোড তৈরি হচ্ছে..." : "Tracking ID will be assigned upon dispatch"}
                  </p>
                )}
              </div>

              {/* Shipping Destination */}
              <div className="p-4 rounded-2xl bg-silk-50/80 dark:bg-dark-elevated/50 border border-silk-200 dark:border-dark-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-silk-900 dark:text-silk-100">
                  <MapPin className="w-4 h-4 text-gold-500" />
                  <span>{language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Destination"}</span>
                </div>
                <p className="font-medium text-silk-900 dark:text-silk-100">
                  {selectedOrder.customerName} ({selectedOrder.customerPhone})
                </p>
                <p className="text-silk-600 dark:text-silk-400 leading-snug">
                  {selectedOrder.shippingAddress.areaAddress}, {selectedOrder.shippingAddress.upazila},{" "}
                  {selectedOrder.shippingAddress.district} - {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-silk-50/80 dark:bg-dark-elevated/50 border border-silk-200 dark:border-dark-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-silk-900 dark:text-silk-100">
                  <CreditCard className="w-4 h-4 text-gold-500" />
                  <span>{language === "bn" ? "পেমেন্ট তথ্য" : "Payment Information"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silk-600 dark:text-silk-400">Method:</span>
                  <span className="font-bold uppercase text-silk-900 dark:text-silk-100">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-silk-600 dark:text-silk-400">Status:</span>
                  <Badge variant={selectedOrder.paymentStatus === "paid" ? "success" : "gold"}>
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-silk-200 dark:border-dark-border font-bold">
                  <span>Total Amount:</span>
                  <span className="text-gold-600 font-serif text-sm">
                    {formatPriceBDT(selectedOrder.totalBDT, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Chronological Milestone Events */}
            <div className="space-y-4 pt-4 border-t border-silk-100 dark:border-dark-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-silk-700 dark:text-silk-300">
                {language === "bn" ? "বিস্তারিত ট্র্যাকিং টাইমলাইন" : "Detailed Event Timeline"}
              </h3>

              <div className="space-y-4 pl-3 border-l-2 border-gold-400/50 dark:border-gold-800 ml-2">
                {selectedOrder.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5 text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gold-500 ring-4 ring-white dark:ring-dark-surface" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-silk-950 dark:text-silk-50">
                        {language === "bn" ? event.labelBn : event.labelEn}
                      </p>
                      <span className="text-[10px] text-silk-400">
                        {formatDate(event.timestamp, language)}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-[11px] text-silk-600 dark:text-silk-300 italic">
                        {event.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Items inside this order */}
            <div className="space-y-3 pt-4 border-t border-silk-100 dark:border-dark-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-silk-700 dark:text-silk-300">
                {language === "bn" ? "অর্ডারের অন্তর্ভুক্ত পণ্যসমূহ" : "Items in this Shipment"}
              </h3>

              <div className="divide-y divide-silk-100 dark:divide-dark-border">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={normalizeImageUrl(item.image)}
                        alt={item.productNameEn}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-silk-200 dark:border-dark-border"
                      />
                      <div>
                        <p className="font-bold text-silk-900 dark:text-silk-100">
                          {language === "bn" ? item.productNameBn : item.productNameEn}
                        </p>
                        <p className="text-[10px] text-silk-500">
                          Qty: {item.quantity}{" "}
                          {item.attributes?.color && `• Color: ${item.attributes.color}`}{" "}
                          {item.attributes?.size && `• Size: ${item.attributes.size}`}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-silk-900 dark:text-silk-100">
                      {formatPriceBDT(item.subtotalBDT, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-3xl border border-silk-200 dark:border-dark-border p-6">
          <Package className="w-12 h-12 text-silk-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-silk-900 dark:text-silk-100">
            {language === "bn" ? "কোন অর্ডার পাওয়া যায়নি" : "No Orders Found"}
          </h3>
          <p className="text-xs text-silk-500 mt-1 max-w-sm mx-auto">
            {language === "bn"
              ? "আপনার অ্যাকাউন্টে এখনও কোন সক্রিয় অর্ডার নেই। খাঁটি রাজশাহীর সিল্ক বা জামদানি দেখতে শপে যান।"
              : "You have no active orders to track. Explore our heritage handloom collection to place your first order."}
          </p>
          <Link to="/shop" className="inline-block mt-4">
            <Button variant="gold" size="sm">
              {language === "bn" ? "শপ ব্রাউজ করুন" : "Browse Handloom Catalog"}
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Orders List Selector */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-silk-950 dark:text-silk-50">
              {language === "bn" ? "আপনার সাম্প্রতিক অর্ডারসমূহ" : "Quick Switch: Your Recent Orders"}
            </h3>
            <span className="text-[11px] text-silk-500">
              {orders.length} {language === "bn" ? "টি অর্ডার" : "orders recorded"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.slice(0, 6).map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrder(order);
                    setSearchInput(order.orderNumber);
                    setSearchParams({ order: order.orderNumber });
                  }}
                  className={`p-4 rounded-2xl border text-left transition group ${
                    isSelected
                      ? "border-gold-500 bg-gold-50/50 dark:bg-gold-950/20 dark:border-gold-500 ring-2 ring-gold-500/20"
                      : "border-silk-200 bg-white hover:border-gold-400 dark:bg-dark-surface dark:border-dark-border"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-silk-950 dark:text-silk-50">
                      #{order.orderNumber}
                    </span>
                    <Badge variant={order.orderStatus === "delivered" ? "success" : "gold"}>
                      {t.statuses[order.orderStatus] || order.orderStatus}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-silk-500 mt-1">
                    {formatDate(order.createdAt, language)} • {order.items.length} items
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-silk-100 dark:border-dark-border text-xs">
                    <span className="font-bold text-gold-600 font-serif">
                      {formatPriceBDT(order.totalBDT, language)}
                    </span>
                    <span className="text-[10px] font-bold text-silk-600 group-hover:text-gold-600 flex items-center gap-0.5">
                      <span>Track</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
