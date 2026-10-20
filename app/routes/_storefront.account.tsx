import React, { useState } from "react";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { useWishlist } from "~/hooks/useWishlist";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
import { normalizeImageUrl } from "~/lib/imageUrl";
import { ProductCard } from "~/features/catalog/ProductCard";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import { EmptyState } from "~/components/feedback/EmptyState";
import { useToast } from "~/components/feedback/ToastContext";
import {
  Package,
  Heart,
  User,
  Headphones,
  Search,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  Trash2,
  ShoppingBag,
} from "lucide-react";

export async function clientLoader() {
  try {
    const [orders, products] = await Promise.all([
      firestoreService.getOrders(),
      firestoreService.getProducts(),
    ]);
    const supportTickets = mockRepository.getSupportTickets();
    return { orders: orders || [], products: products || [], supportTickets };
  } catch {
    return {
      orders: mockRepository.getOrders(),
      products: mockRepository.getProducts(),
      supportTickets: mockRepository.getSupportTickets(),
    };
  }
}

export default function AccountPage() {
  const { orders, products, supportTickets } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { user, logout } = useAuth();
  const { wishlistSlugs, clearWishlist } = useWishlist();

  // Show ONLY products the user has loved / wishlisted
  const lovedProducts = products.filter(
    (p) => wishlistSlugs.includes(p.slug) || wishlistSlugs.includes(p.id)
  );
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "orders";
  const [trackingInput, setTrackingInput] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(supportTickets[0]?.id || "");

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleSendTicketMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketMessage.trim() && selectedTicketId) {
      mockRepository.addTicketMessage(
        selectedTicketId,
        "customer",
        ticketMessage.trim(),
        user?.displayName || "Customer"
      );
      setTicketMessage("");
      showToast(
        language === "bn" ? "বার্তা পাঠানো হয়েছে" : "Message sent to support team",
        "success"
      );
    }
  };

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId);

  if (!user) {
    const isTrackTab = activeTab === "track";
    const currentRedirect = isTrackTab ? "/account?tab=track" : "/account";

    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center mx-auto border border-gold-400">
          {isTrackTab ? <Package className="w-8 h-8" /> : <User className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          {isTrackTab && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-900 border border-gold-300 dark:bg-gold-950/40 dark:text-gold-300 dark:border-gold-800">
              {language === "bn" ? "শুধুমাত্র নিবন্ধিত গ্রাহকদের জন্য" : "Registered Members Only"}
            </span>
          )}
          <h2 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {isTrackTab
              ? language === "bn"
                ? "অর্ডার ট্র্যাক করতে লগইন বা নিবন্ধন করুন"
                : "Order Tracker Requires Account Access"
              : language === "bn"
              ? "অ্যাকাউন্ট দেখতে সাইন ইন করুন"
              : "Sign In to View Your Account"}
          </h2>
          <p className="text-xs text-silk-600 dark:text-silk-400 leading-relaxed">
            {isTrackTab
              ? language === "bn"
                ? "আপনার ডেলিভারি ঠিকানা এবং কুরিয়ার লাইভ ট্র্যাকিং তথ্যের সুরক্ষার জন্য অর্ডার ট্র্যাকার শুধুমাত্র নিবন্ধিত গ্রাহকদের জন্য উন্মুক্ত।"
                : "To protect your personal delivery address, phone number, and real-time courier updates, the Order Tracker is exclusively accessible for registered SilkenDrift members."
              : "Access your real-time order tracking, purchase history, saved wishlist, and customer rewards."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={`/login?redirect=${encodeURIComponent(currentRedirect)}`}
            className="w-full sm:w-auto"
          >
            <Button variant="primary" className="w-full">
              {isTrackTab
                ? language === "bn"
                  ? "সাইন ইন করে ট্র্যাক করুন"
                  : "Sign In to Track Order"
                : "Sign In"}
            </Button>
          </Link>
          <Link
            to={`/register?redirect=${encodeURIComponent(currentRedirect)}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full">
              {language === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Register New Account"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center font-serif font-bold text-xl border border-gold-400">
            {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
                {user?.displayName || "Valued Customer"}
              </h1>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  user.isDemo
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {user.isDemo ? "Demo Sandbox" : "Real Customer"}
              </span>
            </div>
            <p className="text-xs text-silk-700 dark:text-silk-300 font-medium">
              {user?.email} • {user?.phoneNumber || "+8801XXXXXXXXX"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="gold">
            {language === "bn" ? "সিলভার মেম্বার" : "Silver Member"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            {t.auth.logout}
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-silk-200 dark:border-dark-border overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => handleTabChange("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
            activeTab === "orders" || activeTab === "track"
              ? "border-b-2 border-gold-500 text-silk-950 dark:text-gold-300 font-bold bg-silk-100/80 dark:bg-dark-elevated"
              : "text-silk-600 hover:text-silk-950 hover:bg-silk-50 dark:text-silk-400 dark:hover:text-white dark:hover:bg-dark-elevated"
          }`}
        >
          <Package className="w-4 h-4 text-gold-600 dark:text-gold-400" />
          <span>{language === "bn" ? "আমার অর্ডারসমূহ ও ট্র্যাকিং" : "Orders & Tracking"}</span>
        </button>

        <button
          onClick={() => handleTabChange("wishlist")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
            activeTab === "wishlist"
              ? "border-b-2 border-gold-500 text-silk-950 dark:text-gold-300 font-bold bg-silk-100/80 dark:bg-dark-elevated"
              : "text-silk-600 hover:text-silk-950 hover:bg-silk-50 dark:text-silk-400 dark:hover:text-white dark:hover:bg-dark-elevated"
          }`}
        >
          <Heart className="w-4 h-4 text-crimson-600 dark:text-crimson-400" />
          <span>{t.nav.wishlist}</span>
          {lovedProducts.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-crimson-500 text-white">
              {lovedProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
            activeTab === "support"
              ? "border-b-2 border-gold-500 text-silk-950 dark:text-gold-300 font-bold bg-silk-100/80 dark:bg-dark-elevated"
              : "text-silk-600 hover:text-silk-950 hover:bg-silk-50 dark:text-silk-400 dark:hover:text-white dark:hover:bg-dark-elevated"
          }`}
        >
          <Headphones className="w-4 h-4 text-gold-600 dark:text-gold-400" />
          <span>{t.admin.support}</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* Orders & Tracking Tab */}
      {(activeTab === "orders" || activeTab === "track") && (
        <div className="space-y-6">
          {/* Quick Tracking Search Box */}
          <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-300 dark:bg-gold-950/20 dark:border-gold-800 flex flex-col sm:flex-row items-center gap-3">
            <Search className="w-5 h-5 text-gold-600 flex-shrink-0" />
            <input
              type="text"
              placeholder={
                language === "bn"
                  ? "অর্ডার নম্বর লিখুন (যেমন: SD-260215-4819)..."
                  : "Enter Order Number (e.g. SD-260215-4819)..."
              }
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="flex-1 w-full rounded-xl border border-silk-300 bg-white px-3 py-2 text-xs dark:bg-dark-surface dark:border-dark-border"
            />
            <Button
              size="sm"
              variant="gold"
              onClick={() => {
                const match = orders.find((o) => o.orderNumber.includes(trackingInput.trim()));
                if (match) {
                  window.location.href = `/order/success/${match.id}`;
                } else {
                  showToast(
                    language === "bn" ? "অর্ডারটি পাওয়া যায়নি" : "Order not found",
                    "error"
                  );
                }
              }}
            >
              {language === "bn" ? "ট্র্যাক করুন" : "Track Order"}
            </Button>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-silk-200 p-5 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-silk-100 pb-3 dark:border-dark-border">
                  <div>
                    <span className="text-xs font-bold text-silk-900 dark:text-silk-100">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] font-medium text-silk-600 dark:text-silk-400 ml-2">
                      {formatDate(order.createdAt, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={order.orderStatus === "delivered" ? "success" : "gold"}>
                      {t.statuses[order.orderStatus] || order.orderStatus}
                    </Badge>
                    <Link to={`/order/success/${order.id}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        <span>{t.common.details}</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={normalizeImageUrl(item.image)}
                          alt={item.productNameEn}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=60";
                          }}
                        />
                        <span className="font-semibold text-silk-900 dark:text-silk-100">
                          {language === "bn" ? item.productNameBn : item.productNameEn} (×{item.quantity})
                        </span>
                      </div>
                      <span className="font-bold text-silk-950 dark:text-silk-100">
                        {formatPriceBDT(item.subtotalBDT, language)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-silk-100 dark:border-dark-border flex items-center justify-between text-xs">
                  <span className="font-medium text-silk-700 dark:text-silk-300">
                    {order.courierProvider ? `Courier: ${order.courierProvider.toUpperCase()}` : "Processing"}
                  </span>
                  <span className="font-serif font-bold text-sm text-silk-950 dark:text-gold-400">
                    {t.cart.total}: {formatPriceBDT(order.totalBDT, language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Tab - ONLY Shows Loved Products */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-silk-100 dark:border-dark-border">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
                  {t.nav.wishlist}
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-crimson-100 text-crimson-800 dark:bg-crimson-950 dark:text-crimson-300">
                  {lovedProducts.length} {language === "bn" ? "টি সংরক্ষিত" : "saved"}
                </span>
              </div>
              <p className="text-xs text-silk-500 mt-1">
                {language === "bn"
                  ? "আপনার সমস্ত পছন্দের সিল্ক শাড়ি, পাঞ্জাবি ও জামদানি এখানে ডাটাবেসে সংরক্ষিত রয়েছে।"
                  : "All your loved handloom sarees, panjabis, and fabrics saved in your account."}
              </p>
            </div>

            {lovedProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await clearWishlist();
                  showToast(
                    language === "bn"
                      ? "উইশলিস্ট খালি করা হয়েছে"
                      : "Wishlist has been cleared",
                    "info"
                  );
                }}
                className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>{language === "bn" ? "উইশলিস্ট খালি করুন" : "Clear Wishlist"}</span>
              </Button>
            )}
          </div>

          {lovedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {lovedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-3xl border border-silk-200 dark:border-dark-border p-8 space-y-4 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-crimson-50 text-crimson-600 dark:bg-crimson-950/40 dark:text-crimson-400 flex items-center justify-center mx-auto border border-crimson-200 dark:border-crimson-800 shadow-soft">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
                  {language === "bn" ? "আপনার উইশলিস্ট খালি" : "Your Wishlist is Empty"}
                </h3>
                <p className="text-xs text-silk-600 dark:text-silk-400 leading-relaxed">
                  {language === "bn"
                    ? "আপনি এখনও কোনো পণ্য পছন্দ করে রাখেননি। শপ থেকে আপনার পছন্দের সিল্ক শাড়ি, জামদানি বা পাঞ্জাবির ওপর হার্ট (❤️) আইকনে ক্লিক করুন।"
                    : "You haven't saved any handloom treasures yet. Explore our genuine Rajshahi silk sarees, Jamdani, and panjabis and tap the heart (❤️) icon to save them here."}
                </p>
              </div>
              <Link to="/shop" className="inline-block pt-2">
                <Button variant="gold" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  <span>{language === "bn" ? "শপ ব্রাউজ করুন" : "Explore Handloom Catalog"}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Support & Messaging Tab */}
      {activeTab === "support" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-silk-700 dark:text-silk-300 mb-2">
              {language === "bn" ? "টিকেট তালিকা" : "Your Support Tickets"}
            </h3>
            {supportTickets.map((tkt) => {
              const isSelected = selectedTicketId === tkt.id;
              return (
                <button
                  key={tkt.id}
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? "bg-silk-950 border-gold-500 text-white shadow-sm dark:bg-gold-500/20 dark:border-gold-400"
                      : "border-silk-200 bg-white hover:border-gold-500 hover:bg-gold-50/50 hover:text-gold-950 dark:bg-dark-surface dark:border-dark-border dark:hover:border-gold-500 dark:hover:bg-dark-elevated dark:hover:text-gold-400 text-silk-900 dark:text-silk-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-mono font-bold ${
                        isSelected
                          ? "text-white dark:text-gold-200"
                          : "text-silk-950 dark:text-silk-50"
                      }`}
                    >
                      {tkt.ticketNumber}
                    </span>
                    <Badge variant={tkt.status === "resolved" ? "success" : "warning"} size="sm">
                      {tkt.status}
                    </Badge>
                  </div>
                  <p
                    className={`line-clamp-1 font-semibold ${
                      isSelected
                        ? "text-gold-300 dark:text-gold-300"
                        : "text-silk-800 dark:text-silk-200"
                    }`}
                  >
                    {tkt.subject}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-4">
            {selectedTicket ? (
              <>
                <div className="border-b border-silk-100 pb-3 dark:border-dark-border flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-silk-950 dark:text-silk-50">
                      {selectedTicket.subject}
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-silk-600 dark:text-silk-400">
                      #{selectedTicket.ticketNumber} • Category: {selectedTicket.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((msg) => {
                    const isCustomer = msg.senderRole === "customer";
                    return (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-2xl text-xs max-w-md shadow-sm ${
                          isCustomer
                            ? "ml-auto bg-silk-950 text-white rounded-br-none dark:bg-gold-500 dark:text-silk-950 font-medium"
                            : "bg-silk-100 border border-silk-200 text-silk-950 rounded-bl-none dark:bg-dark-elevated dark:border-dark-border dark:text-white"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-bold mb-1 ${
                            isCustomer
                              ? "text-gold-300 dark:text-silk-900"
                              : "text-silk-700 dark:text-silk-300"
                          }`}
                        >
                          {msg.senderName}
                        </p>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendTicketMessage} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder={language === "bn" ? "বার্তা লিখুন..." : "Type reply..."}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="flex-1 rounded-xl border border-silk-300 px-3 py-2 text-xs dark:border-dark-border dark:bg-dark-surface dark:text-silk-100"
                  />
                  <Button type="submit" size="sm" variant="gold">
                    {t.common.submit}
                  </Button>
                </form>
              </>
            ) : (
              <EmptyState title="No Ticket Selected" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
