import React, { useState } from "react";
import { Link } from "react-router";
import { Product } from "~/types";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { useAppDispatch, useAppSelector } from "~/store";
import { addToCart } from "~/store/slices/cartSlice";
import { useWishlist } from "~/hooks/useWishlist";
import { Heart, ShoppingBag, Star, Zap, Check, Eye } from "lucide-react";
import { useToast } from "~/components/feedback/ToastContext";
import { cn, normalizeImageUrl, getGoogleDriveFallbackUrls } from "~/lib/utils";

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isWishlisted: checkIsWishlisted, toggleWishlist: toggleDbWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const isWishlisted = checkIsWishlisted(product.slug);

  const primaryImage = normalizeImageUrl(
    product.images[0] ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
  );
  const hoverImage = normalizeImageUrl(product.images[1] || primaryImage);

  const currentPrice = product.salePriceBDT || product.basePriceBDT;
  const hasDiscount = Boolean(product.salePriceBDT && product.salePriceBDT < product.basePriceBDT);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];

    dispatch(
      addToCart({
        id: `${product.id}_${defaultVariant?.id || "def"}`,
        productId: product.id,
        variantId: defaultVariant?.id,
        productNameEn: defaultVariant ? `${product.nameEn} (${defaultVariant.titleEn})` : product.nameEn,
        productNameBn: defaultVariant ? `${product.nameBn} (${defaultVariant.titleBn})` : product.nameBn,
        productSlug: product.slug,
        image: normalizeImageUrl(defaultVariant?.images?.[0] || defaultVariant?.imageUrl || primaryImage),
        priceBDT: defaultVariant?.priceBDT || product.basePriceBDT,
        salePriceBDT: defaultVariant?.salePriceBDT || product.salePriceBDT,
        quantity: 1,
        maxStock: defaultVariant ? defaultVariant.stock : product.stockTotal,
        attributes: defaultVariant?.attributes,
      })
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);

    showToast(
      language === "bn"
        ? `${product.nameBn} ব্যাগে যোগ করা হয়েছে!`
        : `${product.nameEn} added to cart!`,
      "success"
    );
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeSaved = await toggleDbWishlist(product.slug);
    showToast(
      !willBeSaved
        ? language === "bn"
          ? "উইশলিস্ট থেকে সরানো হয়েছে"
          : "Removed from Wishlist"
        : language === "bn"
        ? "উইশলিস্টে যুক্ত করা হয়েছে ❤️"
        : `${t.product.addedToWishlist} ❤️`,
      "info"
    );
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-silk-200/90 bg-white overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-gold-400/80 dark:border-dark-border dark:bg-dark-surface dark:hover:border-gold-500/60 dark:hover:shadow-gold-950/20">
      {/* Top Gold Shimmer Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* Product Image & Hover Reveal */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-silk-100/70 dark:bg-dark-elevated block"
      >
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={language === "bn" ? product.nameBn : product.nameEn}
          referrerPolicy="no-referrer"
          className={cn(
            "h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105",
            hoverImage !== primaryImage && "group-hover:opacity-0"
          )}
          loading="lazy"
          onError={(e) => {
            const rawFirst = product.images[0];
            const fallbacks = getGoogleDriveFallbackUrls(rawFirst);
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src;
            const nextIdx = fallbacks.indexOf(currentSrc) + 1;
            if (nextIdx > 0 && nextIdx < fallbacks.length) {
              target.src = fallbacks[nextIdx];
            } else {
              target.src =
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80";
            }
          }}
        />

        {/* Secondary Hover Image (if present) */}
        {hoverImage !== primaryImage && (
          <img
            src={hoverImage}
            alt={language === "bn" ? product.nameBn : product.nameEn}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const rawSecond = product.images[1];
              const fallbacks = getGoogleDriveFallbackUrls(rawSecond);
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;
              const nextIdx = fallbacks.indexOf(currentSrc) + 1;
              if (nextIdx > 0 && nextIdx < fallbacks.length) {
                target.src = fallbacks[nextIdx];
              } else {
                target.src = primaryImage;
              }
            }}
          />
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && product.discountPercentage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-crimson-600 to-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-md animate-pulse">
              <span>🔥</span>
              <span>-{product.discountPercentage}%</span>
            </span>
          )}

          {product.isFlashDeal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-md">
              <Zap className="w-2.5 h-2.5 fill-white text-white" />
              <span>FLASH</span>
            </span>
          )}

          {product.isNewArrival && (
            <span className="rounded-full bg-silk-950/85 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-gold-400 tracking-wider dark:bg-gold-500 dark:text-silk-950 shadow-sm">
              ✨ NEW
            </span>
          )}
        </div>

        {/* Wishlist Heart Button with bouncy pop */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 z-10 shadow-md backdrop-blur-md hover:scale-110 active:scale-90",
            isWishlisted
              ? "bg-crimson-600 text-white shadow-crimson-600/30 hover:bg-crimson-700"
              : "bg-white/95 text-silk-800 hover:text-white hover:bg-crimson-600 shadow-md dark:bg-dark-surface/95 dark:text-silk-200 dark:hover:text-white dark:hover:bg-crimson-600"
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("w-4 h-4 transition-transform", isWishlisted && "fill-white scale-110")} />
        </button>

        {/* Quick View / Details Hint on Desktop */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hidden sm:block z-10">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stockTotal <= 0}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 px-4 text-xs font-bold shadow-xl transition-all duration-200 backdrop-blur-md",
              justAdded
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : product.stockTotal <= 0
                ? "bg-silk-400/80 text-white cursor-not-allowed"
                : "bg-silk-950 text-white hover:bg-gold-500 hover:text-silk-950 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950"
            )}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "যোগ করা হয়েছে!" : "Added to Cart!"}</span>
              </>
            ) : product.stockTotal <= 0 ? (
              <span>{t.common.outOfStock}</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                <span>{t.product.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Card Content Details */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        {/* Rating & Stock Indicator */}
        <div className="flex items-center justify-between text-xs text-silk-600 dark:text-silk-300 mb-1.5">
          <div className="flex items-center gap-1.5 bg-silk-100/80 dark:bg-dark-elevated px-2 py-0.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            <span className="font-bold text-silk-950 dark:text-silk-100 text-[11px]">
              {product.rating}
            </span>
            <span className="text-[10px] font-medium text-silk-600 dark:text-silk-400">({product.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                product.stockTotal > 5
                  ? "bg-emerald-500 animate-pulse"
                  : product.stockTotal > 0
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                product.stockTotal > 5
                  ? "text-emerald-700 dark:text-emerald-400"
                  : product.stockTotal > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-rose-700 dark:text-rose-400"
              )}
            >
              {product.stockTotal > 5
                ? t.common.inStock
                : product.stockTotal > 0
                ? t.common.lowStock
                : t.common.outOfStock}
            </span>
          </div>
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.slug}`}
          className="text-xs sm:text-sm font-serif font-bold text-silk-950 group-hover:text-gold-600 transition-colors line-clamp-2 dark:text-silk-50 leading-snug"
        >
          {language === "bn" ? product.nameBn : product.nameEn}
        </Link>

        {/* Micro Tag Pills (Heritage / Fabric Type) */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-silk-100 text-silk-800 border border-silk-200 dark:bg-dark-elevated dark:text-silk-200 dark:border-dark-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Pricing & Mobile Quick Add Button */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-silk-100/70 dark:border-dark-border/60">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-silk-950 font-serif dark:text-gold-400">
              {formatPriceBDT(currentPrice, language)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-silk-400 line-through dark:text-silk-500 font-sans">
                {formatPriceBDT(product.basePriceBDT, language)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Pill Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stockTotal <= 0}
            className={cn(
              "sm:hidden p-2 rounded-xl text-xs font-bold transition shadow-sm",
              justAdded
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : product.stockTotal <= 0
                ? "bg-silk-200 text-silk-500 dark:bg-dark-elevated dark:text-silk-400 cursor-not-allowed"
                : "bg-silk-950 text-white hover:bg-gold-500 hover:text-silk-950 dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400 dark:hover:text-silk-950 active:scale-95"
            )}
            aria-label="Quick add"
          >
            {justAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
