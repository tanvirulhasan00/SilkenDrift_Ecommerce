import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useLanguage } from "~/locales";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Sylhet",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

export default function RegisterPage() {
  const { registerRealUser } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!displayName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms of service and privacy policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerRealUser({
        displayName,
        email,
        password,
        phoneNumber: phone,
        district: division,
      });

      if (res.success) {
        showToast(
          language === "bn"
            ? "স্বাগতম! আপনার অ্যাকাউন্ট তৈরি হয়েছে।"
            : "Welcome to SilkenDrift! Your real customer account has been created.",
          "success"
        );
        navigate("/account");
      } else {
        setErrorMessage(res.error || "Registration could not be completed.");
        showToast(res.error || "Registration error", "error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-silk-50/60 dark:bg-dark-bg">
      <div className="max-w-lg w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-silk-900 text-white shadow-soft">
            <span className="font-serif font-black text-2xl italic">S</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            Create Your Customer Account
          </h1>
          <p className="text-xs text-silk-600 dark:text-silk-300">
            Enjoy priority order fulfillment, heritage artisan previews, and member loyalty rewards
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-3xl border border-silk-200 dark:border-dark-border shadow-soft">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Tanvir Hasan or Farhana Ahmed"
              leftIcon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-silk-900 dark:text-silk-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-500" />
                <span>Delivery Division / Region</span>
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-silk-300 bg-white focus:outline-none focus:border-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100"
              >
                {BD_DIVISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} Division
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Create Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-silk-600 dark:text-silk-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-silk-300 text-gold-600 focus:ring-gold-500"
              />
              <span>
                I agree to the{" "}
                <Link to="/static/terms" className="text-gold-600 dark:text-gold-400 underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/static/privacy" className="text-gold-600 dark:text-gold-400 underline font-medium">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              <span>Complete Customer Registration</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="text-center pt-3 border-t border-silk-100 dark:border-dark-border text-xs text-silk-600 dark:text-silk-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
