import React from "react";
import { Link, useLoaderData } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { ProductCard } from "~/features/catalog/ProductCard";
import { Button } from "~/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Send,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { normalizeImageUrl, getGoogleDriveFallbackUrls } from "~/lib/imageUrl";
import { useToast } from "~/components/feedback/ToastContext";

export async function clientLoader() {
  const products = await firestoreService.getProducts();
  const categories = mockRepository.getCategories();
  const banners = mockRepository.getBanners();

  const flashDeals = products.filter((p) => p.isFlashDeal);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const bestSellers = products.filter((p) => p.isBestSeller);

  return {
    products,
    categories,
    banners,
    flashDeals,
    newArrivals,
    bestSellers,
  };
}

const TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    quoteBn:
      "পদ্মা গোল্ড জরি রাজশাহী সিল্ক শাড়িটি আমার বোনের বিয়ের জন্য নিয়েছিলাম। কাপড়ের কোমলতা ও সোনালি জরির ফিনিশিং চোখ জুড়ানো।",
    quoteEn:
      "Ordered the Padma Gold Zari Mulberry Silk saree for my sister's wedding. The drape, luster, and authenticity are unmatched.",
    nameBn: "ফারহানা সুলতানা",
    nameEn: "Farhana Sultana",
    locationBn: "ধানমন্ডি, ঢাকা",
    locationEn: "Dhanmondi, Dhaka",
    verifiedBn: "যাচাইকৃত ক্রেতা",
    verifiedEn: "Verified Buyer",
  },
  {
    id: 2,
    rating: 5,
    quoteBn:
      "এন্ডি সিল্কের পাঞ্জাবিটির কাটিং ও ফিটিংস নিখুঁত। সবচেয়ে ভালো লেগেছে বিকাশে ক্যাশব্যাকের সুবিধা এবং ২৪ ঘণ্টার মধ্যে দ্রুত ডেলিভারি।",
    quoteEn:
      "The Endi silk panjabi fit is impeccably tailored. Instant bKash checkout and rapid 24-hr doorstep delivery inside Dhaka.",
    nameBn: "তানভীর হাসান",
    nameEn: "Tanvir Hasan",
    locationBn: "আগ্রাবাদ, চট্টগ্রাম",
    locationEn: "Agrabad, Chattogram",
    verifiedBn: "যাচাইকৃত ক্রেতা",
    verifiedEn: "Verified Buyer",
  },
  {
    id: 3,
    rating: 5,
    quoteBn:
      "ঢাকাই জামদানি শাড়িতে শীতলক্ষ্যা পাড়ের নিখুঁত তেরছা জাল মোটিফ সত্যিই অসাধারণ। খাঁটি হস্তশিল্পের এমন কালেকশন সহজে মেলে না।",
    quoteEn:
      "The 84-count Dhakai Jamdani is pure museum-grade heritage. Authentic UNESCO handloom craft directly supporting rural weavers.",
    nameBn: "রুবাইয়া নাসরিন",
    nameEn: "Rubaiya Nasrin",
    locationBn: "গুলশান, ঢাকা",
    locationEn: "Gulshan, Dhaka",
    verifiedBn: "যাচাইকৃত ক্রেতা",
    verifiedEn: "Verified Buyer",
  },
];

export default function HomePage() {
  const { categories, banners, flashDeals, newArrivals, bestSellers } =
    useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [newsletterInput, setNewsletterInput] = React.useState("");
  const heroBanner = banners[0];

  const [currentReviewIndex, setCurrentReviewIndex] = React.useState(0);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      setTouchDeltaX(e.touches[0].clientX - touchStartX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX < -40) {
        // Swiped left
        setCurrentReviewIndex((prev) =>
          prev < TESTIMONIALS.length - 1 ? prev + 1 : 0
        );
      } else if (touchDeltaX > 40) {
        // Swiped right
        setCurrentReviewIndex((prev) =>
          prev > 0 ? prev - 1 : TESTIMONIALS.length - 1
        );
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) =>
      prev > 0 ? prev - 1 : TESTIMONIALS.length - 1
    );
  };

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) =>
      prev < TESTIMONIALS.length - 1 ? prev + 1 : 0
    );
  };

  const newArrivalsRef = React.useRef<HTMLDivElement>(null);

  const scrollNewArrivals = (direction: "left" | "right") => {
    if (newArrivalsRef.current) {
      const cardWidth =
        newArrivalsRef.current.querySelector<HTMLElement>(":scope > div")
          ?.offsetWidth || 280;
      newArrivalsRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16,
        behavior: "smooth",
      });
    }
  };

  const bestSellersRef = React.useRef<HTMLDivElement>(null);

  const scrollBestSellers = (direction: "left" | "right") => {
    if (bestSellersRef.current) {
      const cardWidth =
        bestSellersRef.current.querySelector<HTMLElement>(":scope > div")
          ?.offsetWidth || 280;
      bestSellersRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16,
        behavior: "smooth",
      });
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterInput.trim()) {
      showToast(
        language === "bn"
          ? "ধন্যবাদ! আপনার সাবস্ক্রিপশন সফল হয়েছে। প্রোমোকোড: SILKSPRING"
          : "Thank you! Subscription successful. Use code SILKSPRING for 10% off.",
        "success"
      );
      setNewsletterInput("");
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-silk-100 to-silk-50 pt-8 pb-16 sm:py-24 dark:from-dark-surface dark:to-dark-bg border-b border-silk-200/80 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400 bg-gold-50/80 px-3.5 py-1 text-xs font-semibold text-gold-950 dark:bg-gold-950/40 dark:border-gold-700 dark:text-gold-300">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>{t.home.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-silk-950 dark:text-silk-50 leading-[1.15] tracking-tight">
                {t.home.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-silk-700 dark:text-silk-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/shop">
                  <Button size="lg" variant="gold" className="shadow-luxury">
                    <span>{t.home.shopNow}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <Link to="/shop?category=rajshahi-silk-sarees">
                  <Button size="lg" variant="outline">
                    <span>{t.home.exploreCollections}</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Highlight Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-silk-200 dark:border-dark-border max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="font-serif font-bold text-lg sm:text-xl text-silk-900 dark:text-gold-400">
                    {language === "bn" ? "১০০% খাঁটি" : "100% Pure"}
                  </div>
                  <div className="text-[11px] font-semibold text-silk-700 dark:text-silk-300">
                    {language === "bn" ? "সিল্ক গ্যারান্টি" : "Grade-A Silk"}
                  </div>
                </div>
                <div>
                  <div className="font-serif font-bold text-lg sm:text-xl text-silk-900 dark:text-gold-400">
                    {language === "bn" ? "৬৪ জেলায়" : "64 Districts"}
                  </div>
                  <div className="text-[11px] font-semibold text-silk-700 dark:text-silk-300">
                    {language === "bn" ? "হোম ডেলিভারি" : "Fast Delivery"}
                  </div>
                </div>
                <div>
                  <div className="font-serif font-bold text-lg sm:text-xl text-silk-900 dark:text-gold-400">
                    {language === "bn" ? "৪.৯ / ৫.০" : "4.9 / 5.0"}
                  </div>
                  <div className="text-[11px] font-semibold text-silk-700 dark:text-silk-300">
                    {language === "bn" ? "গ্রাহক সন্তুষ্টি" : "Buyer Rating"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Banner Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border-2 border-gold-300 shadow-2xl dark:border-dark-border">
                <img
                  src={normalizeImageUrl(heroBanner?.imageUrl)}
                  alt={language === "bn" ? heroBanner?.titleBn : heroBanner?.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/5] object-cover object-center"
                  onError={(e) => {
                    if (heroBanner?.imageUrl) {
                      const fallbacks = getGoogleDriveFallbackUrls(heroBanner.imageUrl);
                      const target = e.target as HTMLImageElement;
                      const currentSrc = target.src;
                      const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                      if (nextIdx > 0 && nextIdx < fallbacks.length) {
                        target.src = fallbacks[nextIdx];
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-silk-950/90 via-silk-950/30 to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">
                    {language === "bn" ? "বিশেষ আকর্ষণ" : "Featured Spotlight"}
                  </span>
                  <h3 className="text-lg font-serif font-bold mt-1">
                    {language === "bn" ? heroBanner?.titleBn : heroBanner?.titleEn}
                  </h3>
                  <p className="text-xs text-silk-200 mt-1 line-clamp-2">
                    {language === "bn" ? heroBanner?.subtitleBn : heroBanner?.subtitleEn}
                  </p>
                  <Link to={heroBanner?.linkUrl || "/shop"} className="mt-3 inline-block">
                    <span className="text-xs font-semibold text-gold-300 underline underline-offset-4 hover:text-white">
                      {language === "bn" ? heroBanner?.ctaTextBn : heroBanner?.ctaTextEn} →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.home.featuredCategories}
            </h2>
            <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 mt-1">
              {language === "bn"
                ? "আমাদের কারুকার্যময় বিভিন্ন ঘরানার সিল্ক কালেকশন"
                : "Handcrafted categories celebrating heritage looms of Bangladesh"}
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 flex items-center gap-1"
          >
            <span>{t.common.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className={`group relative rounded-2xl overflow-hidden aspect-[4/5] border border-silk-200 dark:border-dark-border shadow-card hover:shadow-soft transition-all duration-300 ${
                idx >= 2 ? "hidden sm:block" : ""
              }`}
            >
              <img
                src={normalizeImageUrl(cat.imageUrl)}
                alt={language === "bn" ? cat.nameBn : cat.nameEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  if (cat.imageUrl) {
                    const fallbacks = getGoogleDriveFallbackUrls(cat.imageUrl);
                    const target = e.target as HTMLImageElement;
                    const currentSrc = target.src;
                    const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                    if (nextIdx > 0 && nextIdx < fallbacks.length) {
                      target.src = fallbacks[nextIdx];
                    }
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-silk-950/85 via-silk-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="text-xs sm:text-sm font-bold font-serif leading-tight">
                  {language === "bn" ? cat.nameBn : cat.nameEn}
                </h4>
                <span className="text-[10px] text-gold-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.common.details} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals with Countdown Accent */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gold-300/80 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5 p-6 sm:p-8 dark:border-gold-500/30 dark:bg-dark-surface">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-crimson-600 text-white shadow-soft">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
                    {t.home.flashDealsTitle}
                  </h2>
                  <p className="text-xs text-silk-600 dark:text-silk-400">
                    {t.home.flashDealsSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/80 dark:bg-dark-elevated px-3 py-1.5 rounded-full border border-silk-200 dark:border-dark-border text-xs font-semibold text-crimson-600">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {language === "bn" ? "অফার শেষ হতে আর বাকি: ১৮ ঘণ্টা" : "Offer ends in: 18h 45m"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {flashDeals.slice(0, 3).map((product, idx) => (
                <div key={product.id} className={idx >= 2 ? "hidden sm:block" : ""}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.home.newArrivals}
            </h2>
            <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 mt-1">
              {language === "bn"
                ? "সম্প্রতি তৈরি ঐতিহ্যবাহী নতুন পোশাক ও শাড়ি"
                : "Freshly woven silk sarees, panjabis and seasonal heritage apparel"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Slider Controls */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={() => scrollNewArrivals("left")}
                className="p-2 rounded-full border border-silk-200 bg-white text-silk-700 hover:text-gold-600 hover:border-gold-400 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-300 dark:hover:text-gold-400 shadow-sm transition active:scale-95"
                aria-label="Previous new arrivals"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollNewArrivals("right")}
                className="p-2 rounded-full border border-silk-200 bg-white text-silk-700 hover:text-gold-600 hover:border-gold-400 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-300 dark:hover:text-gold-400 shadow-sm transition active:scale-95"
                aria-label="Next new arrivals"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/shop?sort=newest"
              className="text-xs sm:text-sm font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 flex items-center gap-1"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Slider (Max 4 items on mobile, max 6 on larger screens) */}
        <div
          ref={newArrivalsRef}
          className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-0 gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {newArrivals.slice(0, 6).map((product, idx) => (
            <div
              key={product.id}
              className={`w-[72vw] max-w-[280px] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start ${
                idx >= 4 ? "hidden sm:block" : ""
              }`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.home.bestSellers}
            </h2>
            <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 mt-1">
              {language === "bn"
                ? "গ্রাহকদের সবচেয়ে পছন্দের ও সমাদৃত হস্তশিল্প"
                : "Customer favorites with the highest verified reviews across Bangladesh"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Slider Controls */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={() => scrollBestSellers("left")}
                className="p-2 rounded-full border border-silk-200 bg-white text-silk-700 hover:text-gold-600 hover:border-gold-400 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-300 dark:hover:text-gold-400 shadow-sm transition active:scale-95"
                aria-label="Previous best sellers"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBestSellers("right")}
                className="p-2 rounded-full border border-silk-200 bg-white text-silk-700 hover:text-gold-600 hover:border-gold-400 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-300 dark:hover:text-gold-400 shadow-sm transition active:scale-95"
                aria-label="Next best sellers"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/shop?sort=best_selling"
              className="text-xs sm:text-sm font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 flex items-center gap-1"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Best Sellers Slider (fits 1 item card on smaller screen) */}
        <div
          ref={bestSellersRef}
          className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-0 gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {bestSellers.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="w-[calc(100vw-32px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-silk-100/60 dark:bg-dark-surface/60 py-16 border-y border-silk-200/80 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.home.testimonialsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 mt-2">
              {language === "bn"
                ? "সারা বাংলাদেশের সন্তুষ্ট ক্রেতাদের মতামত"
                : "Real experiences from patrons who value genuine Bengal handloom"}
            </p>
          </div>

          {/* Mobile View: Customer Review Slider (< md) */}
          <div className="md:hidden">
            <div
              className="relative overflow-hidden rounded-2xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
              >
                {TESTIMONIALS.map((item) => (
                  <div key={item.id} className="w-full flex-shrink-0 px-1">
                    <div className="rounded-2xl bg-white p-6 shadow-card border border-silk-200/80 dark:bg-dark-elevated dark:border-dark-border flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex items-center gap-1 text-gold-500 mb-3">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-gold-500" />
                          ))}
                        </div>
                        <Quote className="w-6 h-6 text-silk-300 dark:text-silk-600 mb-2" />
                        <p className="text-xs text-silk-700 dark:text-silk-300 leading-relaxed italic">
                          {language === "bn" ? item.quoteBn : item.quoteEn}
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-silk-100 dark:border-dark-border flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-silk-900 dark:text-silk-100">
                            {language === "bn" ? item.nameBn : item.nameEn}
                          </h4>
                          <span className="text-[10px] font-semibold text-silk-600 dark:text-silk-400">
                            {language === "bn" ? item.locationBn : item.locationEn}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40">
                          {language === "bn" ? item.verifiedBn : item.verifiedEn}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Slider Controls */}
            <div className="flex items-center justify-between mt-5 px-1">
              <button
                type="button"
                onClick={handlePrevReview}
                className="p-2 rounded-full bg-white dark:bg-dark-elevated shadow-card border border-silk-200 dark:border-dark-border text-silk-700 dark:text-silk-300 hover:text-gold-600 dark:hover:text-gold-400 active:scale-95 transition"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentReviewIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentReviewIndex === idx
                        ? "w-6 bg-gold-500"
                        : "w-2 bg-silk-300 dark:bg-silk-700"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextReview}
                className="p-2 rounded-full bg-white dark:bg-dark-elevated shadow-card border border-silk-200 dark:border-dark-border text-silk-700 dark:text-silk-300 hover:text-gold-600 dark:hover:text-gold-400 active:scale-95 transition"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop View: Grid (>= md) */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white p-6 shadow-card border border-silk-200/80 dark:bg-dark-elevated dark:border-dark-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold-500 mb-3">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-silk-300 dark:text-silk-600 mb-2" />
                  <p className="text-xs text-silk-700 dark:text-silk-300 leading-relaxed italic">
                    {language === "bn" ? item.quoteBn : item.quoteEn}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-silk-100 dark:border-dark-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-silk-900 dark:text-silk-100">
                      {language === "bn" ? item.nameBn : item.nameEn}
                    </h4>
                    <span className="text-[10px] font-semibold text-silk-600 dark:text-silk-400">
                      {language === "bn" ? item.locationBn : item.locationEn}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40">
                    {language === "bn" ? item.verifiedBn : item.verifiedEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-silk-950 text-white p-8 sm:p-14 border border-gold-400/40 shadow-2xl dark:bg-black">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase font-bold text-gold-400 tracking-widest">
              SilkenDrift VIP Club
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold">
              {t.home.newsletterTitle}
            </h2>
            <p className="text-xs sm:text-sm text-silk-300">
              {t.home.newsletterSubtitle}
            </p>

            <form
              onSubmit={handleNewsletter}
              className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="text"
                placeholder={t.home.newsletterPlaceholder}
                value={newsletterInput}
                onChange={(e) => setNewsletterInput(e.target.value)}
                className="flex-1 rounded-xl bg-white/10 border border-silk-700 px-4 py-3 text-sm text-white placeholder:text-silk-400 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
              <Button type="submit" variant="gold" size="lg">
                <span>{t.home.subscribeBtn}</span>
                <Send className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
