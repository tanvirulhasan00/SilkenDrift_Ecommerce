import React, { useState, useMemo } from "react";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { ProductCard } from "~/features/catalog/ProductCard";
import { ProductFilters, FilterState } from "~/features/catalog/ProductFilters";
import { Drawer } from "~/components/ui/Drawer";
import { EmptyState } from "~/components/feedback/EmptyState";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Search,
  X,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Flame,
  ArrowUpDown,
  Tag,
  PackageCheck,
} from "lucide-react";
import { Product } from "~/types";
import { cn } from "~/lib/utils";

export async function clientLoader() {
  const products = await firestoreService.getProducts();
  const categories = mockRepository.getCategories();
  const brands = mockRepository.getBrands();
  return { products, categories, brands };
}

export default function ShopPage() {
  const { products, categories, brands } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Read query params
  const categoryParam = searchParams.get("category") || undefined;
  const brandParam = searchParams.get("brand") || undefined;
  const priceRangeParam = searchParams.get("priceRange") || "all";
  const inStockOnlyParam = searchParams.get("inStock") === "true";
  const flashDealOnlyParam = searchParams.get("deal") === "flash";
  const queryParam = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "relevance";

  const filters: FilterState = useMemo(
    () => ({
      category: categoryParam,
      brand: brandParam,
      priceRange: priceRangeParam,
      inStockOnly: inStockOnlyParam,
      flashDealOnly: flashDealOnlyParam,
    }),
    [categoryParam, brandParam, priceRangeParam, inStockOnlyParam, flashDealOnlyParam]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.priceRange && filters.priceRange !== "all") count++;
    if (filters.inStockOnly) count++;
    if (filters.flashDealOnly) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.category) params.set("category", newFilters.category);
    else params.delete("category");

    if (newFilters.brand) params.set("brand", newFilters.brand);
    else params.delete("brand");

    if (newFilters.priceRange && newFilters.priceRange !== "all") {
      params.set("priceRange", newFilters.priceRange);
    } else {
      params.delete("priceRange");
    }

    if (newFilters.inStockOnly) params.set("inStock", "true");
    else params.delete("inStock");

    if (newFilters.flashDealOnly) params.set("deal", "flash");
    else params.delete("deal");

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (queryParam) params.set("q", queryParam);
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    setSearchParams(params);
  };

  const handleSearchChange = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameBn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filters.category) {
      const matchedCat = categories.find((c) => c.slug === filters.category);
      if (matchedCat) {
        result = result.filter((p) => p.categoryId === matchedCat.id);
      }
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter((p) => p.brandId === filters.brand);
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== "all") {
      result = result.filter((p) => {
        const price = p.salePriceBDT || p.basePriceBDT;
        if (filters.priceRange === "under_5k") return price < 5000;
        if (filters.priceRange === "5k_10k") return price >= 5000 && price <= 10000;
        if (filters.priceRange === "10k_20k") return price >= 10000 && price <= 20000;
        if (filters.priceRange === "above_20k") return price > 20000;
        return true;
      });
    }

    // Availability filter
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stockTotal > 0);
    }

    // Flash deal filter
    if (filters.flashDealOnly) {
      result = result.filter((p) => p.isFlashDeal);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = a.salePriceBDT || a.basePriceBDT;
      const priceB = b.salePriceBDT || b.basePriceBDT;

      switch (sortParam) {
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "rating":
          return b.rating - a.rating;
        case "best_selling":
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [products, categories, queryParam, filters, sortParam]);

  // Funky Top Quick Categories Array
  const categoryShortcuts = [
    {
      id: "all",
      slug: undefined,
      icon: "🌟",
      nameEn: "All Handlooms",
      nameBn: "সব কালেকশন",
    },
    {
      id: "rajshahi",
      slug: "rajshahi-silk-sarees",
      icon: "🥻",
      nameEn: "Rajshahi Silk",
      nameBn: "রাজশাহী সিল্ক",
    },
    {
      id: "jamdani",
      slug: "dhakai-jamdani",
      icon: "🌺",
      nameEn: "Dhakai Jamdani",
      nameBn: "ঢাকাই জামদানি",
    },
    {
      id: "panjabi",
      slug: "mens-panjabi",
      icon: "👔",
      nameEn: "Men's Endi Panjabi",
      nameBn: "এন্ডি সিল্ক পাঞ্জাবি",
    },
    {
      id: "tangail",
      slug: "tangail-handloom",
      icon: "🧵",
      nameEn: "Tangail Handloom",
      nameBn: "টাঙ্গাইল তাঁত",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ==================================================== */}
      {/* 1. FUNKY ARTISAN EMPORIUM HERO & INTEGRATED SEARCH */}
      {/* ==================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-silk-950 via-silk-900 to-silk-950 p-6 sm:p-10 text-white shadow-2xl border border-silk-800">
        {/* Shimmer Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-crimson-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-spin" />
            <span>
              {language === "bn"
                ? "শতবর্ষের ঐতিহ্যবাহী রেশম ও তাঁতশিল্প"
                : "Centuries of Heritage Handlooms & Pure Mulberry Silks"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            {language === "bn"
              ? "সিল্কেনড্রিফট রাজকীয় তাঁত ভাণ্ডার"
              : "SilkenDrift Artisan Heritage Catalog"}
          </h1>

          <p className="text-xs sm:text-sm text-silk-200/90 leading-relaxed max-w-2xl">
            {language === "bn"
              ? "রাজশাহীর পদ্মা পাড়ের খাঁটি মালবেরি রেশম, রূপসী বাংলার ঢাকাই জামদানি এবং ঐতিহ্যবাহী টাঙ্গাইল তাঁতের বর্ণাঢ্য সমাহার।"
              : "Directly curated from master weavers across Rajshahi mulberry farms, Narayanganj riverbanks, and Tangail pit-looms."}
          </p>

          {/* Integrated Funky Search Input */}
          <div className="pt-2 max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-silk-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  language === "bn"
                    ? "শাড়ি, জামদানি, এন্ডি পাঞ্জাবি বা ফেব্রিক খুঁজুন..."
                    : "Search by silk type, jamdani motif, or panjabi..."
                }
                value={queryParam}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-silk-300 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition shadow-inner"
              />
              {queryParam && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3.5 p-1 rounded-full text-silk-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. HORIZONTAL CATEGORY PILL RIBBON (Funky & Easy) */}
      {/* ==================================================== */}
      <div className="overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2.5 min-w-max">
          {categoryShortcuts.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleFilterChange({ ...filters, category: cat.slug })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm",
                  isSelected
                    ? "bg-silk-950 text-white border-silk-950 shadow-md hover:bg-gold-500 hover:text-silk-950 hover:border-gold-500 dark:bg-gold-500 dark:text-silk-950 dark:border-gold-500 dark:hover:bg-gold-400"
                    : "bg-white text-silk-800 border-silk-200 hover:border-gold-500 hover:bg-gold-50 hover:text-gold-950 dark:bg-dark-surface dark:border-dark-border dark:text-silk-200 dark:hover:bg-dark-elevated dark:hover:text-gold-400 dark:hover:border-gold-500"
                )}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{language === "bn" ? cat.nameBn : cat.nameEn}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}

          {/* Quick Flash Deal Ribbon Pill */}
          <button
            type="button"
            onClick={() =>
              handleFilterChange({ ...filters, flashDealOnly: !filters.flashDealOnly })
            }
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-black transition-all duration-200 active:scale-95 shadow-sm",
              filters.flashDealOnly
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg hover:brightness-105"
                : "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-500 dark:hover:text-silk-950"
            )}
          >
            <span>⚡</span>
            <span>{language === "bn" ? "ফ্ল্যাশ ডিল" : "Flash Deals"}</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. ACTIVE FILTER CHIPS (Effortless 1-Click Remove) */}
      {/* ==================================================== */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-silk-50/80 rounded-2xl border border-silk-200/70 dark:bg-dark-elevated dark:border-dark-border">
          <span className="text-[11px] font-extrabold text-silk-700 dark:text-silk-300 uppercase tracking-wider pl-1">
            {language === "bn" ? "সক্রিয় ফিল্টার:" : "Active Filters:"}
          </span>

          {/* Category Chip */}
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-silk-200 text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 shadow-sm hover:border-gold-400 transition">
              <span>
                {categories.find((c) => c.slug === filters.category)?.[
                  language === "bn" ? "nameBn" : "nameEn"
                ] || filters.category}
              </span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, category: undefined })}
                className="p-0.5 rounded-full text-silk-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Flash Deals Chip */}
          {filters.flashDealOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 shadow-sm">
              <span>⚡ Flash Deals</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, flashDealOnly: false })}
                className="p-0.5 rounded-full text-amber-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* In Stock Chip */}
          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200 shadow-sm">
              <span>📦 In Stock Only</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, inStockOnly: false })}
                className="p-0.5 rounded-full text-emerald-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Price Range Chip */}
          {filters.priceRange && filters.priceRange !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-silk-200 text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 shadow-sm hover:border-gold-400 transition">
              <span>Price Range</span>
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, priceRange: "all" })}
                className="p-0.5 rounded-full text-silk-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.shop.clearFilters}</span>
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. CONTROL BAR: RESULTS COUNT, SORT, VIEW MODES */}
      {/* ==================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-silk-200/90 shadow-sm dark:bg-dark-surface dark:border-dark-border">
        {/* Left: Mobile Filter Trigger & Counter */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-silk-200 text-xs font-bold text-silk-900 bg-silk-50 hover:bg-gold-50 hover:text-gold-950 hover:border-gold-500 dark:bg-dark-elevated dark:border-dark-border dark:text-silk-100 dark:hover:bg-dark-border dark:hover:text-gold-400 dark:hover:border-gold-500 transition active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-500" />
            <span>{t.shop.filterBy}</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-gold-500 text-silk-950 text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs font-semibold text-silk-700 dark:text-silk-300">
            <strong className="text-silk-950 dark:text-silk-100 font-serif text-sm">
              {filteredProducts.length}
            </strong>{" "}
            {t.shop.resultsFound}
          </span>
        </div>

        {/* Right: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-silk-600 dark:text-silk-300 hidden sm:inline" />
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-xl border border-silk-200 bg-silk-50 px-3 py-2 text-xs font-semibold text-silk-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100 transition cursor-pointer"
            >
              <option value="relevance">{t.shop.sortRelevance}</option>
              <option value="newest">{t.shop.sortNewest}</option>
              <option value="price_asc">{t.shop.sortPriceAsc}</option>
              <option value="price_desc">{t.shop.sortPriceDesc}</option>
              <option value="rating">{t.shop.sortRating}</option>
              <option value="best_selling">{t.shop.sortBestSelling}</option>
            </select>
          </div>

          {/* Grid/List Toggle */}
          <div className="hidden sm:flex items-center border border-silk-200 rounded-xl p-1 bg-silk-50 dark:border-dark-border dark:bg-dark-elevated">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition",
                viewMode === "grid"
                  ? "bg-white text-silk-950 shadow-sm dark:bg-dark-surface dark:text-gold-400 font-bold"
                  : "text-silk-600 hover:bg-silk-200/70 hover:text-silk-950 dark:text-silk-400 dark:hover:bg-dark-border dark:hover:text-white"
              )}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-lg transition",
                viewMode === "list"
                  ? "bg-white text-silk-950 shadow-sm dark:bg-dark-surface dark:text-gold-400 font-bold"
                  : "text-silk-600 hover:bg-silk-200/70 hover:text-silk-950 dark:text-silk-400 dark:hover:bg-dark-border dark:hover:text-white"
              )}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. MAIN CONTENT: DESKTOP FILTERS & PRODUCTS GRID */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block bg-white p-6 rounded-3xl border border-silk-200/90 shadow-sm dark:bg-dark-surface dark:border-dark-border sticky top-28">
          <ProductFilters
            categories={categories}
            brands={brands}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Grid / List */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-silk-200/90 p-10 text-center space-y-4 shadow-sm dark:bg-dark-surface dark:border-dark-border">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto dark:bg-amber-950/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-silk-950 dark:text-silk-100">
                  {t.shop.noProductsFound}
                </h3>
                <p className="text-xs text-silk-700 dark:text-silk-300 font-medium max-w-sm mx-auto">
                  {language === "bn"
                    ? "আপনার বর্তমান ফিল্টারের সাথে মিলে এমন কোন পণ্য পাওয়া যায়নি। নিচের সাজেশনগুলি দেখুন।"
                    : "No silk garments match this filter criteria. Try resetting or exploring top collections."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-gold-500 text-silk-950 font-bold text-xs shadow-md hover:bg-gold-400 transition"
                >
                  {t.shop.clearFilters}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFilterChange({ category: "rajshahi-silk-sarees" })
                  }
                  className="px-4 py-2 rounded-xl bg-silk-100 text-silk-900 font-semibold text-xs hover:bg-silk-950 hover:text-white dark:bg-dark-elevated dark:text-silk-100 dark:hover:bg-gold-500 dark:hover:text-silk-950 transition"
                >
                  Explore Rajshahi Silk
                </button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
                  : "grid grid-cols-1 gap-4"
              )}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. MOBILE STICKY FLOATING FILTER PILL */}
      {/* ==================================================== */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-silk-950/90 text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-silk-800 hover:bg-gold-500 hover:text-silk-950 transition-all duration-200 active:scale-95 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{language === "bn" ? "ফিল্টার ও সাজান" : "Filter & Sort"}</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-crimson-600 text-white text-[10px] flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ==================================================== */}
      {/* 7. MOBILE FILTER DRAWER */}
      {/* ==================================================== */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title={t.shop.filterBy}
        side="left"
        width="sm"
      >
        <ProductFilters
          categories={categories}
          brands={brands}
          filters={filters}
          onFilterChange={(newFilters) => {
            handleFilterChange(newFilters);
            setIsMobileFilterOpen(false);
          }}
          onClearFilters={() => {
            handleClearFilters();
            setIsMobileFilterOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
}
