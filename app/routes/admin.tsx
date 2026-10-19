import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useLanguage } from "~/locales";
import { LanguageSwitcher } from "~/components/common/LanguageSwitcher";
import { ThemeSwitcher } from "~/components/common/ThemeSwitcher";
import { RoleSwitcher } from "~/components/common/RoleSwitcher";
import { useSettings } from "~/hooks/useSettings";
import { normalizeImageUrl } from "~/lib/imageUrl";
import { getAdminPath } from "~/config/adminConfig";
import { Button } from "~/components/ui/Button";
import { Badge } from "~/components/ui/Badge";
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  CreditCard,
  Users,
  Warehouse,
  ShoppingBag,
  Tag,
  Headphones,
  Star,
  BarChart3,
  Settings,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
} from "lucide-react";

export default function AdminLayout() {
  const { user, role, isAdmin, isManager, isDemo, isLoading, loginDemo, logout } = useAuth();
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLogoError(false);
  }, [settings.logoUrl]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Define navigation items with dynamic secret path prefix
  const navItems = [
    {
      to: getAdminPath(),
      labelEn: "Overview",
      labelBn: "ড্যাশবোর্ড",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      to: getAdminPath("products"),
      labelEn: "Products & Stock",
      labelBn: "পণ্য ও স্টক",
      icon: Package,
      adminOnly: false,
    },
    {
      to: getAdminPath("orders"),
      labelEn: "Orders & Fulfillment",
      labelBn: "অর্ডার ও ডেলিভারি",
      icon: ShoppingBag,
      adminOnly: false,
    },
    {
      to: getAdminPath("inventory"),
      labelEn: "Warehouse & Stock",
      labelBn: "ইনভেন্টরি মুভমেন্ট",
      icon: Warehouse,
      adminOnly: false,
    },
    {
      to: getAdminPath("sourcing"),
      labelEn: "Sourcing & Suppliers",
      labelBn: "সোর্সিং ও সাপ্লায়ার",
      icon: Layers,
      adminOnly: false,
    },
    {
      to: getAdminPath("customers"),
      labelEn: "Customers",
      labelBn: "গ্রাহক তালিকা",
      icon: Users,
      adminOnly: false,
    },
    {
      to: getAdminPath("delivery"),
      labelEn: "Couriers & Zones",
      labelBn: "কুরিয়ার ও জোন",
      icon: Truck,
      adminOnly: true, // Only Admin
    },
    {
      to: getAdminPath("payments"),
      labelEn: "Payments & Ledger",
      labelBn: "পেমেন্ট লেজার",
      icon: CreditCard,
      adminOnly: true, // Only Admin
    },
    {
      to: getAdminPath("marketing"),
      labelEn: "Marketing & Coupons",
      labelBn: "মার্কেটিং ও কুপন",
      icon: Tag,
      adminOnly: false,
    },
    {
      to: getAdminPath("support"),
      labelEn: "Support Inbox",
      labelBn: "কাস্টমার সাপোর্ট",
      icon: Headphones,
      adminOnly: false,
    },
    {
      to: getAdminPath("reviews"),
      labelEn: "Review Moderation",
      labelBn: "রিভিউ মডারেশন",
      icon: Star,
      adminOnly: false,
    },
    {
      to: getAdminPath("reports"),
      labelEn: "Analytics & Reports",
      labelBn: "রিপোর্ট ও বিশ্লেষণ",
      icon: BarChart3,
      adminOnly: false,
    },
    {
      to: getAdminPath("settings"),
      labelEn: "Settings & API Keys",
      labelBn: "সিস্টেম সেটিংস",
      icon: Settings,
      adminOnly: true, // Only Admin
    },
  ];

  // Show smooth luxury loader if auth is still resolving
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-silk-50 dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-silk-950 flex items-center justify-center text-gold-400 animate-pulse">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-silk-600 dark:text-silk-400">
            {language === "bn" ? "অ্যাডমিন অনুমতি যাচাই করা হচ্ছে..." : "Verifying staff access..."}
          </p>
        </div>
      </div>
    );
  }

  // Role Gate check: require at least Manager
  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-silk-50 dark:bg-dark-bg text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-silk-200 shadow-xl dark:bg-dark-surface dark:border-dark-border space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto dark:bg-rose-950/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {language === "bn" ? "অ্যাডমিন অ্যাক্সেস সংরক্ষিত" : "Admin Dashboard Protected"}
          </h2>
          <p className="text-xs text-silk-600 dark:text-silk-400">
            {language === "bn"
              ? "এই ড্যাশবোর্ডটি দেখার জন্য অ্যাডমিন অথবা ম্যানেজার রোল আবশ্যক।"
              : "This administrative dashboard requires Admin or Store Manager role privileges."}
          </p>

          <div className="pt-4 border-t border-silk-100 dark:border-dark-border space-y-2">
            <p className="text-[11px] font-semibold text-gold-600">
              Demo Evaluation: Switch role below to preview:
            </p>
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="gold" onClick={() => loginDemo("admin")}>
                Login as Super Admin
              </Button>
              <Button size="sm" variant="outline" onClick={() => loginDemo("manager")}>
                Login as Manager
              </Button>
            </div>
            <Link to="/" className="inline-block pt-2 text-xs font-semibold text-silk-700 hover:text-silk-950 dark:text-silk-300 dark:hover:text-white">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-silk-50/70 dark:bg-dark-bg text-silk-950 dark:text-silk-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-silk-200/90 dark:bg-dark-surface dark:border-dark-border sticky top-0 h-screen z-30">
        {/* Brand header */}
        <div className="p-5 border-b border-silk-100 dark:border-dark-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {settings.logoUrl && !logoError ? (
              <img
                src={normalizeImageUrl(settings.logoUrl)}
                alt={settings.storeName || "SilkenDrift"}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-8 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-silk-900 flex items-center justify-center text-white font-serif font-bold text-sm">
                  S
                </div>
                <div>
                  <span className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
                    {settings.storeName || "SilkenDrift"}
                  </span>
                  <span className="block text-[9px] uppercase font-bold text-gold-600 tracking-wider">
                    Control Hub
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* User Role Badge in Sidebar */}
        <div className="px-5 py-3 bg-silk-50/60 dark:bg-dark-elevated/40 border-b border-silk-100 dark:border-dark-border flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-silk-900 dark:text-silk-100 truncate max-w-[130px]">
              {user?.displayName || "Staff Member"}
            </p>
            <Badge variant={isAdmin ? "gold" : "info"} size="sm" className="mt-0.5">
              {isAdmin ? t.admin.roleAdmin : t.admin.roleManager}
            </Badge>
          </div>
          <Link
            to="/"
            title="View Storefront"
            className="p-1.5 rounded-lg text-silk-600 hover:text-silk-950 hover:bg-silk-100 dark:text-silk-300 dark:hover:text-white dark:hover:bg-dark-elevated transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === getAdminPath()
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            const isDisabled = item.adminOnly && !isAdmin;

            if (isDisabled) {
              return (
                <div
                  key={item.to}
                  title="Restricted: Admin Only"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-silk-400 dark:text-silk-600 cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{language === "bn" ? item.labelBn : item.labelEn}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-silk-500">Lock</span>
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-silk-950 text-white font-bold shadow-sm hover:bg-silk-900 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400"
                    : "text-silk-700 hover:bg-gold-50 hover:text-gold-950 hover:font-semibold dark:text-silk-300 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold-400 dark:text-silk-950" : "text-silk-600 dark:text-silk-400"}`} />
                  <span>{language === "bn" ? item.labelBn : item.labelEn}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-4 border-t border-silk-100 dark:border-dark-border space-y-3">
          <RoleSwitcher />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-8 bg-white/90 backdrop-blur-md border-b border-silk-200 dark:bg-dark-surface/90 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-silk-600 hover:text-silk-950 hover:bg-silk-100 dark:text-silk-300 dark:hover:text-white dark:hover:bg-dark-elevated transition"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="font-serif font-bold text-lg text-silk-950 dark:text-silk-50 hidden sm:block">
              {t.admin.title}
            </h2>

            {/* Mode Indicator: Demo Mock DB vs Live Real DB */}
            {isDemo ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 text-[11px] font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Demo Sandbox (Mock DB / Live DB Protected)</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Cloud DB Active (Real Staff Session)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher />

            <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-silk-200 text-xs font-semibold text-silk-700 hover:bg-silk-950 hover:text-white dark:border-dark-border dark:text-silk-300 dark:hover:bg-gold-500 dark:hover:text-silk-950 dark:hover:border-gold-500 transition">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "স্টোরফ্রন্ট দেখুন" : "View Store"}</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold px-2 py-1"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-silk-950/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
            <div
              className="w-64 bg-white dark:bg-dark-surface h-full p-4 space-y-3 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-3 border-b border-silk-200 dark:border-dark-border">
                  <span className="font-serif font-bold text-base text-silk-950 dark:text-silk-50">
                    {settings.storeName || "SilkenDrift"} Admin
                  </span>
                  <button onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
                    <X className="w-5 h-5 text-silk-700 hover:text-silk-950 dark:text-silk-300 dark:hover:text-white" />
                  </button>
                </div>

                <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-silk-800 dark:text-silk-200 hover:bg-silk-100 hover:text-silk-950 dark:hover:bg-dark-elevated dark:hover:text-white"
                    >
                      {language === "bn" ? item.labelBn : item.labelEn}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="pt-3 border-t border-silk-200 dark:border-dark-border">
                <RoleSwitcher />
              </div>
            </div>
          </div>
        )}

        {/* Render nested module */}
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
