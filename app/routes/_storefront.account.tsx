import React, { useState } from "react";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { formatPriceBDT, formatDate } from "~/lib/formatters";
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
} from "lucide-react";

export async function clientLoader() {
  const orders = mockRepository.getOrders();
  const products = mockRepository.getProducts();
  const supportTickets = mockRepository.getSupportTickets();
  return { orders, products, supportTickets };
}

export default function AccountPage() {
  const { orders, products, supportTickets } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { user, logout } = useAuth();
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
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center mx-auto border border-gold-400">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            Sign In to View Your Account
          </h2>
          <p className="text-xs text-silk-600 dark:text-silk-400">
            Access your real-time order tracking, purchase history, saved wishlist, and customer rewards.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/login?redirect=/account" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              Sign In
            </Button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Register New Account
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
      <div className="flex items-center gap-2 border-b border-silk-200 dark:border-dark-border overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition ${
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
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition ${
            activeTab === "wishlist"
              ? "border-b-2 border-gold-500 text-silk-950 dark:text-gold-300 font-bold bg-silk-100/80 dark:bg-dark-elevated"
              : "text-silk-600 hover:text-silk-950 hover:bg-silk-50 dark:text-silk-400 dark:hover:text-white dark:hover:bg-dark-elevated"
          }`}
        >
          <Heart className="w-4 h-4 text-crimson-600 dark:text-crimson-400" />
          <span>{t.nav.wishlist}</span>
        </button>

        <button
          onClick={() => handleTabChange("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition ${
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
                          src={item.image}
                          alt={item.productNameEn}
                          className="w-10 h-10 rounded-lg object-cover"
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

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          <h2 className="text-lg font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.nav.wishlist}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
