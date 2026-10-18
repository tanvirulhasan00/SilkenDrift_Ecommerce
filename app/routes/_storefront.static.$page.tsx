import React, { useState } from "react";
import { useLoaderData, useParams, Link } from "react-router";
import { useLanguage } from "~/locales";
import { firestoreService } from "~/services/firebase/firestoreService";
import { isValidBDPhoneNumber } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { MapPin, Phone, Mail, Clock, HelpCircle, Shield, CheckCircle2, Send } from "lucide-react";

export async function clientLoader({ params }: { params: { page?: string } }) {
  return { page: params.page || "contact" };
}

export default function StaticContentPage() {
  const { page } = useLoaderData<typeof clientLoader>();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* About Us */}
      {page === "about" && (
        <div className="space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Heritage & Craft
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {language === "bn" ? "সিল্কেনড্রিফট এর গল্প" : "The SilkenDrift Story"}
          </h1>
          <p className="text-sm text-silk-700 leading-relaxed dark:text-silk-300">
            {t.footer.aboutText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border">
              <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 mb-2">
                {language === "bn" ? "রাজশাহী রেশম ঐতিহ্য" : "Rajshahi Mulberry Silk"}
              </h3>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium leading-relaxed">
                {language === "bn"
                  ? "শতবর্ষ ধরে রাজশাহীর পদ্মা তীরবর্তী রেশমপল্লীর তুঁত পোকা থেকে সুতো তৈরি করে হস্তশিল্পে বোনা হয় অভিজাত মালবেরি ও এন্ডি সিল্ক।"
                  : "Generations of skilled artisans spinning pure mulberry silk from cocoons along the serene banks of the Padma river in Rajshahi."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border">
              <h3 className="font-serif font-bold text-base text-silk-950 dark:text-silk-50 mb-2">
                {language === "bn" ? "শীতলক্ষ্যার ঢাকাই জামদানি" : "UNESCO Heritage Jamdani"}
              </h3>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium leading-relaxed">
                {language === "bn"
                  ? "ইউনেস্কো স্বীকৃত ঢাকাই জামদানির প্রতিটি মোটিফ বাঁশের পিট-লুমে তাঁতিদের নিখুঁত মেধা ও পরিশ্রমে বোনা হয়।"
                  : "Handwoven floral and geometric motifs on historic pit-looms by master weavers in Narayanganj along the Shitalakhya river."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us */}
      {page === "contact" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.nav.contact}
            </h1>
            <p className="text-xs sm:text-sm text-silk-700 dark:text-silk-300 font-medium mt-1">
              {language === "bn"
                ? "আমাদের কাস্টমার কেয়ার টিম সপ্তাহের ৭ দিনই আপনার সেবায় প্রস্তুত"
                : "Our concierge team is available 7 days a week for any assistance"}
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
                      : "Our concierge team will contact your mobile number shortly."}
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
      )}

      {/* FAQ */}
      {page === "faq" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.nav.faq}
          </h1>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-1.5">
              <h3 className="font-bold text-sm text-silk-950 dark:text-silk-100">
                {language === "bn"
                  ? "১. ঢাকায় ও ঢাকার বাইরে ডেলিভারিতে কত সময় লাগে?"
                  : "1. What is the delivery turnaround time in Bangladesh?"}
              </h3>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium leading-relaxed">
                {language === "bn"
                  ? "ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ঢাকার বাইরে সকল জেলা ও উপজেলায় ২ থেকে ৪ কার্যদিবসের মধ্যে পার্সেল পৌঁছে দেওয়া হয়।"
                  : "Inside Dhaka City, delivery takes 24-48 hours. For all other districts and upazilas, delivery takes 2 to 4 business days via Pathao or Steadfast express courier."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-1.5">
              <h3 className="font-bold text-sm text-silk-950 dark:text-silk-100">
                {language === "bn"
                  ? "২. ক্যাশ অন ডেলিভারিতে কি অর্ডার করা যায়?"
                  : "2. Do you support Cash on Delivery?"}
              </h3>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium leading-relaxed">
                {language === "bn"
                  ? "হ্যাঁ! সর্বোচ্চ ১৫,০০০ টাকা পর্যন্ত সকল অর্ডারে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে ডেলিভারি রাইডারের কাছে নগদ মূল্য পরিশোধ করতে পারবেন।"
                  : "Yes! Cash on Delivery is available across all 64 districts for orders up to ৳15,000. Inspect and pay upon arrival."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-1.5">
              <h3 className="font-bold text-sm text-silk-950 dark:text-silk-100">
                {language === "bn"
                  ? "৩. সিল্ক ও জামদানি কীভাবে যত্ন নেওয়া উচিত?"
                  : "3. How should pure silk handlooms be cared for?"}
              </h3>
              <p className="text-xs text-silk-700 dark:text-silk-300 font-medium leading-relaxed">
                {language === "bn"
                  ? "আমাদের সকল সিল্ক ও জামদানি শাড়ি শুধুমাত্র ড্রাই ওয়াশ করার পরামর্শ দেওয়া হয়। পাতলা সুতি কাপড়ে পেঁচিয়ে হ্যাঙ্গারে ঝুলিয়ে রাখা উত্তম।"
                  : "Professional dry cleaning is strictly recommended for all pure mulberry silk and Dhakai Jamdani weaves. Store wrapped in breathable muslin cotton cloth."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Policy */}
      {page === "delivery-policy" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.footer.shippingPolicy}
          </h1>
          <div className="p-6 bg-white rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-4 text-xs text-silk-700 dark:text-silk-300 leading-relaxed">
            <p>
              {language === "bn"
                ? "সিল্কেনড্রিফট পাঠাও, রেডএক্স ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে বাংলাদেশের প্রতিটি জেলা ও থানা পর্যায়ে সুরক্ষিতভাবে পণ্য পৌঁছে দেয়।"
                : "SilkenDrift partners with Pathao, Steadfast, and RedX to ensure guaranteed nationwide delivery across every upazila."}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>ঢাকা সিটির মধ্যে:</strong> ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি)।
              </li>
              <li>
                <strong>ঢাকার বাইরে:</strong> ডেলিভারি চার্জ ১২০ টাকা (২-৪ কার্যদিবস)।
              </li>
              <li>
                <strong>ফ্রি ডেলিভারি:</strong> যেকোনো ২,৫০০ টাকার বেশি অর্ডারে সমগ্র বাংলাদেশে ডেলিভারি সম্পূর্ণ ফ্রি!
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Return Policy */}
      {page === "return-policy" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.footer.returnPolicy}
          </h1>
          <div className="p-6 bg-white rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-4 text-xs text-silk-700 dark:text-silk-300 leading-relaxed">
            <p>
              {language === "bn"
                ? "আমাদের যেকোনো পণ্যে কোনো ত্রুটি থাকলে অথবা সাইজ পরিবর্তন করতে চাইলে পণ্য গ্রহণের ৭ দিনের মধ্যে সহজেই রিটার্ন বা এক্সচেঞ্জ করতে পারবেন।"
                : "If you receive a defective item or need a size replacement, SilkenDrift provides a 7-day hassle-free return and exchange policy."}
            </p>
          </div>
        </div>
      )}

      {/* Fallback for Privacy and Terms */}
      {(page === "privacy" || page === "terms") && (
        <div className="space-y-6">
          <h1 className="text-3xl font-serif font-bold text-silk-950 dark:text-silk-50 capitalize">
            {page === "privacy" ? t.footer.privacyPolicy : t.footer.termsCondition}
          </h1>
          <div className="p-6 bg-white rounded-2xl border border-silk-200 dark:bg-dark-surface dark:border-dark-border space-y-4 text-xs text-silk-700 dark:text-silk-300 leading-relaxed">
            <p>
              {language === "bn"
                ? "সিল্কেনড্রিফট গ্রাহকদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। কোনো পেমেন্ট সংক্রান্ত সংবেদনশীল তথ্য (যেমন: পিন, ওটিপি, পাসওয়ার্ড) আমাদের সিস্টেমে সংরক্ষণ করা হয় না।"
                : "SilkenDrift respects and protects customer privacy. Sensitive payment credentials (bKash PINs, OTPs, Card CVVs) are never stored on our servers."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
