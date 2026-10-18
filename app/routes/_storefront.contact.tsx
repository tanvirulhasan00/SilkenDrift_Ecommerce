import React, { useState } from "react";
import { Link } from "react-router";
import { useLanguage } from "~/locales";
import { firestoreService } from "~/services/firebase/firestoreService";
import { isValidBDPhoneNumber } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { MapPin, Phone, Mail, Clock, HelpCircle, Shield, CheckCircle2, Send } from "lucide-react";

export async function clientLoader() {
  return {};
}

export default function ContactPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactName.trim() || !contactMessage.trim()) {
      showToast(
        language === "bn" ? "দয়া করে নাম ও বার্তা প্রদান করুন" : "Name and message are required",
        "error"
      );
      return;
    }

    if (!isValidBDPhoneNumber(contactPhone)) {
      setPhoneError(
        language === "bn"
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)"
          : "Valid 11-digit BD mobile number required (e.g. 01XXXXXXXXX)"
      );
      return;
    }
    setPhoneError("");

    setIsSubmitting(true);
    try {
      const res = await firestoreService.submitContactMessage({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim() || undefined,
        subject: contactSubject.trim() || undefined,
        message: contactMessage.trim(),
      });

      if (res.success) {
        setSubmittedId(res.id);
        setContactName("");
        setContactPhone("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
        showToast(
          language === "bn"
            ? "আপনার বার্তাটি সফলভাবে সংরক্ষিত হয়েছে। অ্যাডমিন প্যানেল থেকে শীঘ্রই যোগাযোগ করা হবে।"
            : "Your message has been saved to Firebase. Our support team will review and reply soon.",
          "success"
        );
      }
    } catch (err: any) {
      showToast(err.message || "Failed to submit message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.nav.contact}
        </h1>
        <p className="text-xs sm:text-sm text-silk-700 dark:text-silk-300 font-medium mt-1">
          {language === "bn"
            ? "আমাদের কাস্টমার কেয়ার টিম সপ্তাহের ৭ দিনই আপনার সেবায় প্রস্তুত (বার্তা সরাসরি ফায়ারবেস ক্লাউডে সংরক্ষিত হবে)"
            : "Our concierge team is available 7 days a week for any assistance (Messages synced directly to Firebase)"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gold-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "প্রধান কার্যালয়" : "Headquarters"}
              </h4>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium">{t.footer.headOffice}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gold-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "হটলাইন নম্বর" : "Hotline"}
              </h4>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium">{t.footer.hotline}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gold-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-silk-900 dark:text-silk-100">
                {language === "bn" ? "ইমেইল সাপোর্ট" : "Email Support"}
              </h4>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium">support@silkendrift.com</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleContactSubmit}
          className="space-y-4 bg-white p-6 rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border"
        >
          {submittedId && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === "bn" ? "বার্তাটি গৃহীত হয়েছে!" : "Message Received!"}</span>
              </div>
              <p>
                {language === "bn"
                  ? "আপনার রেফারেন্স কোড: "
                  : "Your reference code: "}
                <code className="font-mono font-bold bg-white dark:bg-dark-surface px-1 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                  {submittedId}
                </code>
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                {language === "bn"
                  ? "আমাদের কাস্টমার কেয়ার টিম শীঘ্রই আপনার মোবাইল নম্বরে যোগাযোগ করবে।"
                  : "Our concierge team will review and contact your mobile number shortly."}
              </p>
            </div>
          )}

          <Input
            label={language === "bn" ? "আপনার নাম" : "Your Name"}
            placeholder={language === "bn" ? "যেমন: আনোয়ার হোসেন" : "e.g. Anwar Hossain"}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />

          <Input
            label={language === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}
            placeholder="01XXXXXXXXX"
            value={contactPhone}
            onChange={(e) => {
              setContactPhone(e.target.value);
              if (phoneError) setPhoneError("");
            }}
            error={phoneError}
            required
          />

          <Input
            label={language === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
            type="email"
            placeholder="you@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <Input
            label={language === "bn" ? "বিষয় (ঐচ্ছিক)" : "Subject (Optional)"}
            placeholder={
              language === "bn"
                ? "যেমন: ব্রাইডাল শাড়ি কাস্টমাইজেশন বা বাল্ক অর্ডার"
                : "e.g. Bridal custom saree or wholesale inquiry"
            }
            value={contactSubject}
            onChange={(e) => setContactSubject(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
              {language === "bn" ? "আপনার বার্তা" : "Message"}
            </label>
            <textarea
              rows={4}
              required
              placeholder={
                language === "bn"
                  ? "আপনার বিস্তারিত প্রশ্ন বা বার্তা লিখুন..."
                  : "Write your message, question, or request details..."
              }
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full rounded-lg border border-silk-300 p-2.5 text-xs text-silk-900 bg-white dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <Button type="submit" variant="gold" className="w-full" isLoading={isSubmitting}>
            <Send className="w-4 h-4 mr-1.5" />
            <span>
              {isSubmitting
                ? language === "bn"
                  ? "পাঠানো হচ্ছে..."
                  : "Submitting..."
                : language === "bn"
                ? "বার্তা পাঠান"
                : "Send Message"}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
