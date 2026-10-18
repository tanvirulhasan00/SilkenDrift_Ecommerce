import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth, DEMO_USERS } from "~/hooks/useAuth";
import { useLanguage } from "~/locales";
import { getAdminPath } from "~/config/adminConfig";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Badge } from "~/components/ui/Badge";
import { useToast } from "~/components/feedback/ToastContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  Settings,
  Headphones,
  LogOut,
  Store,
  CheckCircle2,
  AlertCircle,
  Warehouse,
  Tag,
  Shield,
  UserCheck,
} from "lucide-react";

export default function StaffPortalPage() {
  const { user, role, isAdmin, isManager, isDemo, loginRealUser, loginDemo, logout } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Staff Credentials Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passkey, setPasskey] = useState("sd88");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await loginRealUser(email, password, passkey);
      if (res.success) {
        if (res.user?.role === "customer") {
          setErrorMessage("Customer accounts cannot access the staff portal. Please use staff credentials.");
          showToast("Access restricted: Staff privileges required", "error");
          await logout();
        } else {
          showToast(`Staff authorized: Welcome ${res.user?.displayName || "Staff Member"}`, "success");
          navigate(getAdminPath());
        }
      } else {
        setErrorMessage(res.error || "Staff authentication failed");
        showToast(res.error || "Invalid staff credentials", "error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An authentication error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (roleType: "admin" | "manager") => {
    loginDemo(roleType);
    showToast(`Logged in as Demo ${roleType.toUpperCase()} (Sandbox Mode)`, "info");
    navigate(getAdminPath());
  };

  const handlePresetFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setPasskey("sd88");
  };

  return (
    <div className="min-h-screen bg-silk-950 text-silk-100 flex flex-col justify-between selection:bg-gold-500 selection:text-silk-950">
      {/* Top Bar */}
      <header className="border-b border-silk-800/80 bg-silk-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-500 to-silk-700 flex items-center justify-center text-silk-950 font-serif font-black text-xl shadow-lg">
            S
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-gold-300 tracking-wide flex items-center gap-2">
              <span>SilkenDrift</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                Staff Portal
              </span>
            </span>
            <p className="text-[11px] text-silk-400">
              Operations, Inventory & Artisan Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs text-silk-300 hover:text-gold-400 flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl border border-silk-800 hover:border-gold-500/50"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          {isManager && (
            <Button
              size="sm"
              variant="gold"
              onClick={() => navigate(getAdminPath())}
              className="font-bold text-xs"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Enter Admin Vault</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-xl w-full space-y-6">
          {/* Active Session Card (If already logged in as staff) */}
          {isManager ? (
            <div className="bg-silk-900/90 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-silk-950 flex items-center justify-center font-bold text-xl shadow-lg">
                    {user?.displayName?.slice(0, 1).toUpperCase() || "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-serif font-bold text-silk-50">
                        {user?.displayName || "Staff Member"}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/40">
                        {role?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-silk-400">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDemo
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isDemo ? "Demo Sandbox Mode" : "Live Cloud Firestore"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    showToast("Staff session ended", "info");
                  }}
                  className="p-2 rounded-xl text-silk-400 hover:text-rose-400 hover:bg-rose-950/30 transition border border-silk-800"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Operational Jump Hub */}
              <div className="space-y-3 pt-4 border-t border-silk-800">
                <p className="text-xs font-semibold text-silk-300">
                  Quick Access Modules:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <Link
                    to={getAdminPath("products")}
                    className="p-3 rounded-2xl bg-silk-950/60 border border-silk-800 hover:border-gold-500/60 text-center transition group hover:bg-silk-950"
                  >
                    <Package className="w-5 h-5 mx-auto text-gold-400 group-hover:scale-110 transition" />
                    <span className="block text-[11px] font-bold mt-1 text-silk-200">
                      Products
                    </span>
                  </Link>

                  <Link
                    to={getAdminPath("orders")}
                    className="p-3 rounded-2xl bg-silk-950/60 border border-silk-800 hover:border-gold-500/60 text-center transition group hover:bg-silk-950"
                  >
                    <Layers className="w-5 h-5 mx-auto text-gold-400 group-hover:scale-110 transition" />
                    <span className="block text-[11px] font-bold mt-1 text-silk-200">
                      Orders
                    </span>
                  </Link>

                  <Link
                    to={getAdminPath("sourcing")}
                    className="p-3 rounded-2xl bg-silk-950/60 border border-silk-800 hover:border-gold-500/60 text-center transition group hover:bg-silk-950"
                  >
                    <Warehouse className="w-5 h-5 mx-auto text-gold-400 group-hover:scale-110 transition" />
                    <span className="block text-[11px] font-bold mt-1 text-silk-200">
                      Weavers
                    </span>
                  </Link>

                  <Link
                    to={getAdminPath("delivery")}
                    className="p-3 rounded-2xl bg-silk-950/60 border border-silk-800 hover:border-gold-500/60 text-center transition group hover:bg-silk-950"
                  >
                    <Truck className="w-5 h-5 mx-auto text-gold-400 group-hover:scale-110 transition" />
                    <span className="block text-[11px] font-bold mt-1 text-silk-200">
                      Delivery
                    </span>
                  </Link>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="gold"
                  className="w-full font-bold flex items-center justify-center gap-2"
                  onClick={() => navigate(getAdminPath())}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Main Management Vault</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-silk-700 text-silk-300 hover:text-white"
                  onClick={() => navigate("/")}
                >
                  <Store className="w-4 h-4 mr-1.5" />
                  <span>View Customer Storefront</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Staff Login Form (When not authenticated as staff) */
            <div className="bg-silk-900/90 border border-silk-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30 mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-silk-50">
                  Staff Authentication Portal
                </h1>
                <p className="text-xs text-silk-400">
                  Enter authorized credentials to access internal store operations
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-4">
                <Input
                  label="Staff Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@silkendrift.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  className="bg-silk-950/80 border-silk-800 text-silk-100 placeholder:text-silk-600 focus:border-gold-500"
                />

                <Input
                  label="Staff Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  className="bg-silk-950/80 border-silk-800 text-silk-100 placeholder:text-silk-600 focus:border-gold-500"
                />

                <Input
                  label="Vault Passkey"
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Passkey (default: sd88)"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  helperText="Secondary verification barrier for HQ protection"
                  className="bg-silk-950/80 border-silk-800 text-silk-100 placeholder:text-silk-600 focus:border-gold-500"
                />

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full mt-2 font-bold py-3 text-silk-950 bg-gold-500 hover:bg-gold-400"
                  isLoading={isLoading}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Authenticate & Enter Staff Vault</span>
                </Button>
              </form>

              {/* Fast Presets for Testing */}
              <div className="pt-4 border-t border-silk-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-silk-400 font-semibold">
                  <span className="flex items-center gap-1.5 text-gold-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Testing Credentials</span>
                  </span>
                  <span className="text-[10px]">1-Click Access</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handlePresetFill("admin@silkendrift.com", "admin123")}
                    className="p-2.5 rounded-xl border border-silk-800 bg-silk-950/60 text-left hover:border-gold-500/70 transition"
                  >
                    <div className="font-bold text-silk-200 flex items-center justify-between">
                      <span>Live Super Admin</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400">Real DB</span>
                    </div>
                    <div className="text-[10px] text-silk-500 truncate">admin@silkendrift.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetFill("manager@silkendrift.com", "manager123")}
                    className="p-2.5 rounded-xl border border-silk-800 bg-silk-950/60 text-left hover:border-gold-500/70 transition"
                  >
                    <div className="font-bold text-silk-200 flex items-center justify-between">
                      <span>Live Manager</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400">Real DB</span>
                    </div>
                    <div className="text-[10px] text-silk-500 truncate">manager@silkendrift.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin("admin")}
                    className="p-2.5 rounded-xl border border-amber-900/50 bg-amber-950/20 text-left hover:border-amber-500/60 transition"
                  >
                    <div className="font-bold text-amber-300 flex items-center justify-between">
                      <span>Demo Super Admin</span>
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400">Mock DB</span>
                    </div>
                    <div className="text-[10px] text-amber-500 truncate">Instant Sandbox Access</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin("manager")}
                    className="p-2.5 rounded-xl border border-amber-900/50 bg-amber-950/20 text-left hover:border-amber-500/60 transition"
                  >
                    <div className="font-bold text-amber-300 flex items-center justify-between">
                      <span>Demo Manager</span>
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400">Mock DB</span>
                    </div>
                    <div className="text-[10px] text-amber-500 truncate">Instant Sandbox Access</div>
                  </button>
                </div>
              </div>

              {/* Customer Notice */}
              <div className="text-center pt-3 border-t border-silk-800 text-xs text-silk-400">
                Are you a customer?{" "}
                <Link to="/login" className="text-gold-400 font-semibold hover:underline">
                  Go to Customer Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-silk-900 text-center py-4 text-xs text-silk-500">
        SilkenDrift Administrative & Operational Network &copy; {new Date().getFullYear()} — Internal Access Only
      </footer>
    </div>
  );
}
