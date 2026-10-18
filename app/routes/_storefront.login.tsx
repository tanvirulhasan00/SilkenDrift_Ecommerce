import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth, DEMO_USERS } from "~/hooks/useAuth";
import { useLanguage } from "~/locales";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  UserPlus,
} from "lucide-react";

export default function LoginPage() {
  const { user, loginRealUser, loginDemo } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  // Customer Form state
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await loginRealUser(customerEmail, customerPassword);
      if (res.success) {
        showToast(
          language === "bn" ? "লগইন সফল হয়েছে!" : "Welcome back to SilkenDrift!",
          "success"
        );
        navigate(redirectUrl);
      } else {
        setErrorMessage(res.error || "Login failed");
        showToast(res.error || "Invalid credentials", "error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCustomer = (email: string, pass: string) => {
    setCustomerEmail(email);
    setCustomerPassword(pass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-silk-50/60 dark:bg-dark-bg">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-silk-900 text-white shadow-soft">
            <span className="font-serif font-black text-2xl italic">S</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {language === "bn" ? "কাস্টমার লগইন" : "Customer Sign In"}
          </h1>
          <p className="text-xs text-silk-600 dark:text-silk-300">
            Heritage Bangladeshi Silk & Handloom Couture
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Customer Login Card */}
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-3xl border border-silk-200 dark:border-dark-border shadow-soft">
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={customerPassword}
              onChange={(e) => setCustomerPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-silk-600 dark:text-silk-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-silk-300 text-gold-600 focus:ring-gold-500"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Password reset link will be sent to your email", "info");
                }}
                className="text-gold-600 dark:text-gold-400 hover:underline font-semibold"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Sign In as Customer</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="text-center pt-3 border-t border-silk-100 dark:border-dark-border text-xs text-silk-600 dark:text-silk-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>

        {/* Quick Testing Preset for Reviewer */}
        <div className="bg-silk-100/70 dark:bg-dark-surface/60 rounded-3xl p-4 border border-silk-200 dark:border-dark-border space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-silk-900 dark:text-silk-100">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Fast Testing Customer Preset</span>
            </span>
            <span className="text-[10px] text-silk-500">Demo or Real</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickCustomer("customer@silkendrift.com", "customer123")}
              className="p-2.5 rounded-xl border border-silk-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-left hover:border-gold-500 transition group"
            >
              <div className="font-bold text-silk-950 dark:text-silk-100 flex items-center justify-between">
                <span>Real Customer</span>
                <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Live DB</span>
              </div>
              <div className="text-[10px] text-silk-500 truncate">customer@silkendrift.com</div>
            </button>

            <button
              type="button"
              onClick={() => {
                loginDemo("customer");
                showToast("Logged in as Demo Customer (Tanvir Hasan)", "info");
                navigate(redirectUrl);
              }}
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 text-left hover:border-amber-500 transition"
            >
              <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
                <span>Demo Customer</span>
                <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">Mock DB</span>
              </div>
              <div className="text-[10px] text-amber-800 dark:text-amber-300">Instant Demo Login</div>
            </button>
          </div>
        </div>

        {/* Discreet link for internal staff */}
        <div className="text-center text-[11px] text-silk-500">
          SilkenDrift Staff Member?{" "}
          <Link
            to="/deshboard"
            className="text-silk-600 dark:text-silk-400 hover:text-gold-500 underline"
          >
            Go to Staff Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
