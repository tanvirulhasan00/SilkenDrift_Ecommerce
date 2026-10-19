import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "~/locales";
import { useAuth } from "~/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "~/store";
import { openCartDrawer } from "~/store/slices/cartSlice";
import { LanguageSwitcher } from "~/components/common/LanguageSwitcher";
import { ThemeSwitcher } from "~/components/common/ThemeSwitcher";
import { useSettings } from "~/hooks/useSettings";
import { normalizeImageUrl } from "~/lib/imageUrl";
import { getAdminPath } from "~/config/adminConfig";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Shield,
  PhoneCall,
  Sparkles,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";

export const Header: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isManager, isDemo, role, logout } = useAuth();
  const { settings } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setLogoError(false);
  }, [settings.logoUrl]);

  const cartItemsCount = useAppSelector((state) =>
    state.cart.items.reduce((acc, i) => acc + i.quantity, 0)
  );
  const wishlistCount = useAppSelector((state) => state.ui.wishlistSlugs.length);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const freeShippingThreshold = settings.freeShippingMinBDT || 2500;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-silk-200 dark:bg-dark-surface/90 dark:border-dark-border transition-colors">
      {/* Top announcement bar */}
      <div className="bg-silk-950 text-silk-100 text-[11px] py-1.5 px-4 dark:bg-black dark:text-silk-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="truncate">
              {language === "bn"
                ? `৳${freeShippingThreshold.toLocaleString("bn-BD")} এর বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি!`
                : `Free nationwide delivery on orders over ৳${freeShippingThreshold.toLocaleString("en-US")}!`}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-silk-300 shrink-0">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-gold-400" />
              <span>{settings.phone || "০৯৬১২-SILKEN"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-silk-700 hover:text-silk-950 hover:bg-silk-100 dark:text-silk-300 dark:hover:text-white dark:hover:bg-dark-elevated transition shrink-0"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group min-w-0">
            {settings.logoUrl && !logoError ? (
              <img
                src={normalizeImageUrl(settings.logoUrl)}
                alt={settings.storeName || t.common.brandName}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="h-8 sm:h-11 w-auto max-w-[130px] sm:max-w-[200px] object-contain transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-gold-500 to-silk-900 flex items-center justify-center text-white shadow-soft shrink-0">
                  <span className="font-serif font-black text-lg sm:text-xl italic tracking-tighter">S</span>
                </div>
                <div className="min-w-0">
                  <span className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-silk-950 dark:text-silk-50 group-hover:text-gold-600 transition truncate block max-w-[120px] sm:max-w-none">
                    {settings.storeName || t.common.brandName}
                  </span>
                  <span className="hidden sm:block text-[9px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-semibold truncate">
                    {language === "bn" ? settings.taglineBn || "Heritage Silk BD" : settings.taglineEn || "Heritage Silk BD"}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-silk-300 bg-silk-50/50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100 dark:focus:bg-dark-surface"
            />
            <Search className="w-4 h-4 text-silk-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <ThemeSwitcher />

            {/* User Account / Login / Register Menu */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl border border-silk-300 hover:border-gold-500 text-silk-800 hover:text-silk-950 dark:border-dark-border dark:text-silk-300 dark:hover:text-white transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-silk-600 dark:text-silk-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl bg-silk-900 text-white hover:bg-gold-500 hover:text-silk-950 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 transition flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-silk-200 hover:border-gold-500 bg-silk-50/70 hover:bg-silk-100 dark:border-dark-border dark:bg-dark-elevated dark:hover:bg-dark-surface transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center font-bold text-xs border border-gold-400/50">
                    {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-silk-900 dark:text-silk-100 max-w-[90px] truncate">
                    {user.displayName?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-silk-500 hidden sm:block" />
                </button>

                {/* Account Dropdown */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-surface border border-silk-200 dark:border-dark-border shadow-xl py-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-silk-100 dark:border-dark-border">
                      <p className="font-bold text-silk-950 dark:text-silk-50 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[10px] text-silk-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isDemo
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {isDemo ? "Demo Mode" : "Real Account"}
                        </span>
                        <span className="text-[9px] text-silk-400 capitalize">({role})</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-silk-50 dark:hover:bg-dark-elevated text-silk-700 dark:text-silk-300 transition"
                      >
                        <User className="w-3.5 h-3.5 text-gold-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/account?tab=orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-silk-50 dark:hover:bg-dark-elevated text-silk-700 dark:text-silk-300 transition"
                      >
                        <Package className="w-3.5 h-3.5 text-gold-500" />
                        <span>My Orders</span>
                      </Link>

                      {/* Discreet HQ Staff Portal link - ONLY visible when authenticated as staff */}
                      {isManager && (
                        <Link
                          to="/deshboard"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-silk-950/5 dark:bg-gold-500/10 text-silk-950 dark:text-gold-300 font-bold hover:bg-gold-500/20 transition"
                        >
                          <Shield className="w-3.5 h-3.5 text-gold-500" />
                          <span>Staff Portal (/deshboard)</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-silk-100 dark:border-dark-border">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsAccountMenuOpen(false);
                          await logout();
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Link */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-2 rounded-xl text-silk-700 hover:text-crimson-600 hover:bg-crimson-50 dark:text-silk-300 dark:hover:text-crimson-400 dark:hover:bg-dark-elevated transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-crimson-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => dispatch(openCartDrawer())}
              className="relative flex items-center gap-2 rounded-xl bg-silk-900 px-3.5 py-2 text-xs font-semibold text-white shadow-soft hover:bg-gold-500 hover:text-silk-950 transition dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.cart}</span>
              {cartItemsCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-crimson-500 text-[10px] font-bold text-white dark:bg-silk-950 dark:text-gold-400">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Category Nav (Desktop) */}
        <nav className="hidden md:flex items-center justify-between py-2.5 border-t border-silk-100 dark:border-dark-border text-xs font-medium text-silk-700 dark:text-silk-300">
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-gold-600 transition">
              {t.nav.home}
            </Link>
            <Link to="/shop" className="hover:text-gold-600 transition">
              {t.nav.shop}
            </Link>
            <Link to="/shop?category=rajshahi-silk-sarees" className="hover:text-gold-600 transition">
              {language === "bn" ? "রাজশাহী সিল্ক" : "Rajshahi Silk"}
            </Link>
            <Link to="/shop?category=dhakai-jamdani" className="hover:text-gold-600 transition">
              {language === "bn" ? "ঢাকাই জামদানি" : "Dhakai Jamdani"}
            </Link>
            <Link to="/shop?category=mens-silk-panjabi" className="hover:text-gold-600 transition">
              {language === "bn" ? "সিল্ক পাঞ্জাবি" : "Silk Panjabi"}
            </Link>
            <Link to="/shop?category=muslin-silk-shawls" className="hover:text-gold-600 transition">
              {language === "bn" ? "মসলিন ও শাল" : "Muslin & Shawls"}
            </Link>
            <Link to="/shop?deal=flash" className="text-crimson-600 font-semibold hover:text-crimson-700 dark:text-crimson-400">
              🔥 {t.home.flashDealsTitle}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-silk-700 dark:text-silk-300">
            <Link to="/account?tab=track" className="hover:text-silk-950 dark:hover:text-white transition">
              {t.nav.trackOrder}
            </Link>
            <Link to="/static/about" className="hover:text-silk-950 dark:hover:text-white transition">
              {t.nav.about}
            </Link>
            <Link to="/contact" className="hover:text-silk-950 dark:hover:text-white transition">
              {t.nav.contact}
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-silk-200 bg-white dark:bg-dark-surface dark:border-dark-border px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-silk-300 bg-silk-50 dark:bg-dark-elevated dark:border-dark-border"
            />
            <Search className="w-4 h-4 text-silk-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Mobile Auth Bar */}
          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-1 pb-2 border-b border-silk-100 dark:border-dark-border text-center text-xs font-bold">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 rounded-xl border border-silk-300 dark:border-dark-border text-silk-800 dark:text-silk-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 rounded-xl bg-silk-900 text-white dark:bg-gold-500 dark:text-silk-950"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-silk-50 dark:bg-dark-elevated flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-silk-900 dark:text-silk-100">{user.displayName}</p>
                <p className="text-[10px] text-silk-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await logout();
                  navigate("/");
                }}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Log Out
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {t.nav.shop}
            </Link>
            <Link
              to="/shop?category=rajshahi-silk-sarees"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {language === "bn" ? "রাজশাহী সিল্ক" : "Rajshahi Silk"}
            </Link>
            <Link
              to="/shop?category=dhakai-jamdani"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {language === "bn" ? "ঢাকাই জামদানি" : "Dhakai Jamdani"}
            </Link>
            <Link
              to="/shop?category=mens-silk-panjabi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {language === "bn" ? "সিল্ক পাঞ্জাবি" : "Silk Panjabi"}
            </Link>
            <Link
              to="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              My Account
            </Link>
            <Link
              to="/account?tab=track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-silk-50 dark:hover:bg-dark-elevated"
            >
              {t.nav.trackOrder}
            </Link>

            {/* Staff Link in mobile menu ONLY when logged in as staff */}
            {isManager && (
              <Link
                to="/deshboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-2 p-2.5 rounded-xl bg-silk-950 text-gold-300 font-bold text-xs border border-gold-500/80 hover:bg-gold-500 hover:text-silk-950 dark:bg-dark-elevated dark:text-gold-300 dark:border-gold-500 dark:hover:bg-gold-500 dark:hover:text-silk-950 transition-all duration-200"
              >
                <Shield className="w-4 h-4 text-gold-400 group-hover:text-silk-950 transition-colors" />
                <span>Staff Portal (/deshboard)</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
