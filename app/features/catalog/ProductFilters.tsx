import React from "react";
import { Category, Brand } from "~/types";
import { useLanguage } from "~/locales";
import { RotateCcw, Check, Sparkles, Zap, PackageCheck } from "lucide-react";
import { cn } from "~/lib/utils";

export interface FilterState {
  category?: string;
  brand?: string;
  priceRange?: string;
  inStockOnly?: boolean;
  flashDealOnly?: boolean;
}

export interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const { language, t } = useLanguage();

  const priceRanges = [
    { id: "all", labelEn: "All Prices", labelBn: "সকল মূল্য" },
    { id: "under_5k", labelEn: "Under ৳5,000", labelBn: "৳৫,০০০ এর নিচে" },
    { id: "5k_10k", labelEn: "৳5,000 - ৳10,000", labelBn: "৳৫,০০০ - ৳১০,০০০" },
    { id: "10k_20k", labelEn: "৳10,000 - ৳20,000", labelBn: "৳১০,০০০ - ৳২০,০০০" },
    { id: "above_20k", labelEn: "Above ৳20,000", labelBn: "৳২০,০০০ এর বেশি" },
  ];

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.brand ||
    (filters.priceRange && filters.priceRange !== "all") ||
    filters.inStockOnly ||
    filters.flashDealOnly
  );

  return (
    <div className="space-y-6 text-xs text-silk-800 dark:text-silk-200">
      {/* Header with clear button */}
      <div className="flex items-center justify-between pb-3 border-b border-silk-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping"></span>
          <h3 className="font-serif font-bold text-sm tracking-wide text-silk-950 dark:text-silk-50">
            {t.shop.filterBy}
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white transition shadow-sm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.shop.clearFilters}</span>
          </button>
        )}
      </div>

      {/* Quick Toggles: In Stock & Flash Deals */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, flashDealOnly: !filters.flashDealOnly })}
          className={cn(
            "w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs font-bold",
            filters.flashDealOnly
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md hover:from-amber-600 hover:to-orange-600"
              : "bg-amber-50/60 text-amber-900 border-amber-200/80 hover:bg-amber-100 hover:border-amber-400 hover:text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/40 dark:hover:border-amber-600"
          )}
        >
          <div className="flex items-center gap-2">
            <Zap className={cn("w-4 h-4", filters.flashDealOnly ? "fill-white" : "text-amber-600")} />
            <span>{language === "bn" ? "🔥 ফ্ল্যাশ ডিল সমূহ" : "🔥 Flash Deals Only"}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded-md">
            {filters.flashDealOnly ? "Active" : "Off"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={cn(
            "w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs font-bold",
            filters.inStockOnly
              ? "bg-emerald-600 text-white border-transparent shadow-md hover:bg-emerald-700"
              : "bg-emerald-50/60 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/40 dark:hover:border-emerald-600"
          )}
        >
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4" />
            <span>{t.shop.inStockOnly}</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded-md">
            {filters.inStockOnly ? "Active" : "Off"}
          </span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2 pt-2 border-t border-silk-100 dark:border-dark-border">
        <h4 className="font-bold text-silk-900 dark:text-silk-100 uppercase tracking-wider text-[11px] flex items-center justify-between">
          <span>{t.shop.categories}</span>
          <span className="text-[10px] text-silk-400 font-normal">({categories.length})</span>
        </h4>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, category: undefined })}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 rounded-xl transition text-xs font-medium",
              !filters.category
                ? "bg-silk-950 text-white font-bold shadow-sm hover:bg-silk-900 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400"
                : "hover:bg-gold-50 hover:text-gold-950 text-silk-700 dark:text-silk-300 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
            )}
          >
            <span>{language === "bn" ? "সকল কালেকশন" : "All Categories"}</span>
            {!filters.category && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, category: cat.slug })}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 rounded-xl transition text-xs",
                  isSelected
                    ? "bg-silk-950 text-white font-bold shadow-sm hover:bg-silk-900 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400"
                    : "hover:bg-gold-50 hover:text-gold-950 text-silk-700 dark:text-silk-300 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
                )}
              >
                <span>{language === "bn" ? cat.nameBn : cat.nameEn}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Pills */}
      <div className="space-y-2.5 pt-2 border-t border-silk-100 dark:border-dark-border">
        <h4 className="font-bold text-silk-900 dark:text-silk-100 uppercase tracking-wider text-[11px]">
          {t.shop.priceRange}
        </h4>

        <div className="grid grid-cols-1 gap-1.5">
          {priceRanges.map((range) => {
            const isSelected = (filters.priceRange || "all") === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, priceRange: range.id })}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl border text-left transition text-xs",
                  isSelected
                    ? "bg-silk-950 text-white font-bold border-silk-950 shadow-sm hover:bg-silk-900 dark:bg-gold-500 dark:text-silk-950 dark:border-gold-500 dark:hover:bg-gold-400"
                    : "border-silk-200/80 bg-white hover:border-gold-500 hover:bg-gold-50/60 hover:text-gold-950 text-silk-800 dark:bg-dark-elevated dark:border-dark-border dark:text-silk-200 dark:hover:border-gold-500 dark:hover:text-gold-400"
                )}
              >
                <span>{language === "bn" ? range.labelBn : range.labelEn}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 dark:text-silk-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2 pt-2 border-t border-silk-100 dark:border-dark-border">
        <h4 className="font-bold text-silk-900 dark:text-silk-100 uppercase tracking-wider text-[11px]">
          {t.shop.brands}
        </h4>

        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => {
            const isSelected = filters.brand === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    brand: isSelected ? undefined : brand.id,
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[11px] font-semibold transition",
                  isSelected
                    ? "bg-silk-950 text-white border-silk-950 dark:bg-gold-500 dark:text-silk-950 dark:border-gold-500 shadow-sm hover:bg-silk-900 dark:hover:bg-gold-400"
                    : "bg-silk-50 border-silk-200 text-silk-700 hover:border-gold-500 hover:bg-gold-50 hover:text-gold-950 dark:bg-dark-elevated dark:border-dark-border dark:text-silk-300 dark:hover:border-gold-500 dark:hover:text-gold-400"
                )}
              >
                {language === "bn" ? brand.nameBn : brand.nameEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
