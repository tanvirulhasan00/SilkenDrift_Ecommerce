import React, { useState, useEffect } from "react";
import { useLoaderData, Link, useNavigate } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { normalizeImageUrl, getGoogleDriveFallbackUrls } from "~/lib/utils";
import { useAppDispatch, useAppSelector } from "~/store";
import { addToCart } from "~/store/slices/cartSlice";
import { addRecentlyViewed } from "~/store/slices/uiSlice";
import { useWishlist } from "~/hooks/useWishlist";
import { Button } from "~/components/ui/Button";
import { useToast } from "~/components/feedback/ToastContext";
import { ProductCard } from "~/features/catalog/ProductCard";
import { Modal } from "~/components/ui/Modal";
import { Input } from "~/components/ui/Input";
import {
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { ProductVariant } from "~/types";

export async function clientLoader({ params }: { params: { slug: string } }) {
  const product = await firestoreService.getProductBySlug(params.slug);
  if (!product) {
    throw new Response("Product Not Found", { status: 404 });
  }

  const allProducts = await firestoreService.getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return { product, relatedProducts, allProducts };
}

export default function ProductDetailPage() {
  const { product, relatedProducts, allProducts } =
    useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const recentlyViewedSlugs = useAppSelector(
    (state) => state.ui.recentlyViewedSlugs
  );
  const { isWishlisted: checkIsWishlisted, toggleWishlist: toggleDbWishlist } = useWishlist();
  const isWishlisted = checkIsWishlisted(product.slug);

  // Find default variant: check isDefault first, fallback to first variant
  const defaultVariant =
    product.variants && product.variants.length > 0
      ? product.variants.find((v) => v.isDefault) || product.variants[0]
      : null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  // Question modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");

  // Sync state if product changes
  useEffect(() => {
    const def =
      product.variants && product.variants.length > 0
        ? product.variants.find((v) => v.isDefault) || product.variants[0]
        : null;
    setSelectedVariant(def);
    setActiveImageIndex(0);
  }, [product.id, product.slug]);

  useEffect(() => {
    // Record into recently viewed
    dispatch(addRecentlyViewed(product.slug));
  }, [product.slug, dispatch]);

  interface GalleryImageItem {
    url: string;
    label?: string;
    variantId?: string;
    isVariantImage?: boolean;
    color?: string;
  }

  // Construct comprehensive gallery containing ALL images
  // When a variant is selected, that variant's images are placed first
  const galleryImages: GalleryImageItem[] = React.useMemo(() => {
    const items: GalleryImageItem[] = [];
    const addedUrls = new Set<string>();

    const pushImage = (
      url?: string,
      label?: string,
      variantId?: string,
      isVariantImage?: boolean,
      color?: string
    ) => {
      const cleanUrl = normalizeImageUrl(url);
      if (cleanUrl && !addedUrls.has(cleanUrl)) {
        addedUrls.add(cleanUrl);
        items.push({ url: cleanUrl, label, variantId, isVariantImage, color });
      }
    };

    // 1. If variant is selected, place its image(s) FIRST so selecting a variant immediately shows its image!
    if (selectedVariant) {
      const vImgs =
        selectedVariant.images && selectedVariant.images.length > 0
          ? selectedVariant.images
          : selectedVariant.imageUrl
          ? [selectedVariant.imageUrl]
          : [];

      vImgs.forEach((url, idx) => {
        pushImage(
          url,
          `${selectedVariant.titleEn} ${vImgs.length > 1 ? `(#${idx + 1})` : ""}`,
          selectedVariant.id,
          true,
          selectedVariant.attributes?.color
        );
      });
    }

    // 2. Add all default product images
    (product.images || []).forEach((url, idx) => {
      pushImage(url, idx === 0 ? "Default Hero" : `Photo #${idx + 1}`, undefined, false);
    });

    // 3. Add images from all other variants so ALL images are visible on the product detail page!
    (product.variants || []).forEach((v) => {
      if (v.id !== selectedVariant?.id) {
        const vImgs =
          v.images && v.images.length > 0
            ? v.images
            : v.imageUrl
            ? [v.imageUrl]
            : [];
        vImgs.forEach((url, idx) => {
          pushImage(
            url,
            `${v.titleEn} ${vImgs.length > 1 ? `(#${idx + 1})` : ""}`,
            v.id,
            true,
            v.attributes?.color
          );
        });
      }
    });

    // Fallback if empty
    if (items.length === 0) {
      items.push({
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
        label: "Default View",
      });
    }

    return items;
  }, [product, selectedVariant]);

  const activeItem = galleryImages[activeImageIndex] || galleryImages[0];

  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    // Setting activeImageIndex to 0 immediately switches the hero to that variant's primary image!
    setActiveImageIndex(0);
  };

  const handleSelectThumbnail = (idx: number) => {
    setActiveImageIndex(idx);
    const clickedItem = galleryImages[idx];
    if (clickedItem?.variantId && clickedItem.variantId !== selectedVariant?.id) {
      const match = product.variants.find((v) => v.id === clickedItem.variantId);
      if (match) {
        setSelectedVariant(match);
      }
    }
  };

  const activePrice =
    selectedVariant?.salePriceBDT ||
    selectedVariant?.priceBDT ||
    product.salePriceBDT ||
    product.basePriceBDT;

  const handleAddToCart = () => {
    const activeImg = activeItem?.url || product.images[0];
    dispatch(
      addToCart({
        id: `${product.id}_${selectedVariant?.id || "def"}`,
        productId: product.id,
        variantId: selectedVariant?.id,
        productNameEn: selectedVariant ? `${product.nameEn} (${selectedVariant.titleEn})` : product.nameEn,
        productNameBn: selectedVariant ? `${product.nameBn} (${selectedVariant.titleBn})` : product.nameBn,
        productSlug: product.slug,
        image: activeImg,
        priceBDT: selectedVariant?.priceBDT || product.basePriceBDT,
        salePriceBDT: selectedVariant?.salePriceBDT || product.salePriceBDT,
        quantity,
        maxStock: selectedVariant ? selectedVariant.stock : product.stockTotal,
        attributes: selectedVariant?.attributes,
      })
    );
    showToast(t.product.addedToCart, "success");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast(t.product.copiedLink, "info");
    }
  };

  const recentlyViewedProducts = allProducts.filter(
    (p) => recentlyViewedSlugs.includes(p.slug) && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Product Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
        {/* Left: Gallery & Zoom Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-silk-200/80 bg-white shadow-soft dark:border-dark-border dark:bg-dark-surface">
            <img
              src={normalizeImageUrl(activeItem?.url || product.images[0])}
              alt={activeItem?.label || (language === "bn" ? product.nameBn : product.nameEn)}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center transition-all duration-300"
              onError={(e) => {
                const rawUrl = activeItem?.url || product.images[0];
                const fallbacks = getGoogleDriveFallbackUrls(rawUrl);
                const target = e.target as HTMLImageElement;
                const currentSrc = target.src;
                const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                if (nextIdx > 0 && nextIdx < fallbacks.length) {
                  target.src = fallbacks[nextIdx];
                } else {
                  target.src =
                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80";
                }
              }}
            />

            {/* Discount Badge */}
            {product.discountPercentage && (
              <span className="absolute top-4 left-4 rounded-md bg-crimson-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                -{product.discountPercentage}%
              </span>
            )}

            {/* Active Variant / Photo Indicator Badge */}
            {activeItem?.label && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-silk-950/85 text-gold-300 text-[11px] font-bold backdrop-blur-md shadow-md border border-gold-500/30">
                  {activeItem.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-silk-950/60 text-white text-[10px] font-mono backdrop-blur-xs">
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails (Displays ALL images across default and all variants) */}
          {galleryImages.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-silk-600 dark:text-silk-400 font-medium px-1">
                <span>Product Gallery & Color Angles ({galleryImages.length} Photos)</span>
                {selectedVariant && (
                  <span className="text-gold-600 dark:text-gold-400 font-bold">
                    Active: {selectedVariant.titleEn}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                {galleryImages.map((item, idx) => {
                  const isSelected = activeImageIndex === idx;
                  const isCurrentVariant = item.variantId === selectedVariant?.id;

                  return (
                    <button
                      key={`${item.url}_${idx}`}
                      type="button"
                      onClick={() => handleSelectThumbnail(idx)}
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition group ${
                        isSelected
                          ? "border-gold-500 ring-2 ring-gold-400/40 shadow-md scale-102"
                          : isCurrentVariant
                          ? "border-gold-300/80 hover:border-gold-500"
                          : "border-silk-200 hover:border-gold-500 dark:border-dark-border dark:hover:border-gold-400 opacity-80 hover:opacity-100"
                      }`}
                      title={item.label || `Photo ${idx + 1}`}
                    >
                      <img
                        src={normalizeImageUrl(item.url)}
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const fallbacks = getGoogleDriveFallbackUrls(item.url);
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                          if (nextIdx > 0 && nextIdx < fallbacks.length) {
                            target.src = fallbacks[nextIdx];
                          } else {
                            target.src =
                              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=60";
                          }
                        }}
                      />
                      {item.isVariantImage && item.color && (
                        <span className="absolute bottom-0.5 inset-x-0.5 px-1 text-[8px] font-bold truncate rounded bg-silk-950/85 text-gold-300 text-center">
                          {item.color}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info, Price, Variants, Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                SKU: {selectedVariant ? selectedVariant.sku : product.sku}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                <span className="font-bold text-silk-900 dark:text-silk-100">
                  {product.rating}
                </span>
                <span className="text-silk-700 dark:text-silk-300 font-medium">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-silk-950 dark:text-silk-50 leading-tight">
              {language === "bn" ? product.nameBn : product.nameEn}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-silk-100/60 dark:bg-dark-elevated">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-gold-400">
              {formatPriceBDT(activePrice, language)}
            </span>
            {product.salePriceBDT && (
              <span className="text-base text-silk-400 line-through dark:text-silk-500">
                {formatPriceBDT(product.basePriceBDT, language)}
              </span>
            )}
            <span className="text-xs text-emerald-600 font-semibold ml-auto bg-emerald-50 px-2.5 py-1 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400">
              {product.stockTotal > 0 ? t.product.inStockNotice : t.product.outOfStockNotice}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-silk-700 dark:text-silk-300 leading-relaxed">
            {language === "bn" ? product.descriptionBn : product.descriptionEn}
          </p>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-silk-800 dark:text-silk-200">
                  {language === "bn" ? "ভেরিয়েন্ট / কালার ও সাইজ নির্বাচন করুন" : "Select Variant / Color Options"}
                </label>
                {selectedVariant && (
                  <span className="text-[11px] text-gold-600 dark:text-gold-400 font-bold">
                    Selected: {language === "bn" ? selectedVariant.titleBn : selectedVariant.titleEn}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vImages =
                    v.images && v.images.length > 0
                      ? v.images
                      : v.imageUrl
                      ? [v.imageUrl]
                      : [];

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariant(v)}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-silk-950 text-white border-silk-950 shadow-md hover:bg-silk-900 dark:bg-gold-500 dark:text-silk-950 dark:border-gold-500 dark:hover:bg-gold-400 ring-2 ring-gold-400/30"
                          : "border-silk-200 bg-white text-silk-900 hover:border-gold-500 hover:bg-gold-50 hover:text-gold-950 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100 dark:hover:border-gold-500 dark:hover:bg-dark-elevated dark:hover:text-gold-400"
                      }`}
                    >
                      {/* Mini variant image dot / thumbnail */}
                      {vImages[0] ? (
                        <img
                          src={normalizeImageUrl(vImages[0])}
                          alt={v.titleEn}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover border border-silk-300 dark:border-dark-border"
                          onError={(e) => {
                            const fallbacks = getGoogleDriveFallbackUrls(vImages[0]);
                            const target = e.target as HTMLImageElement;
                            const currentSrc = target.src;
                            const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                            if (nextIdx > 0 && nextIdx < fallbacks.length) {
                              target.src = fallbacks[nextIdx];
                            }
                          }}
                        />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-gold-500 inline-block" />
                      )}

                      <span>{language === "bn" ? v.titleBn : v.titleEn}</span>

                      {vImages.length > 1 && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            isSelected
                              ? "bg-gold-400/30 text-gold-300 dark:bg-silk-900/40 dark:text-silk-950"
                              : "bg-silk-100 dark:bg-dark-elevated text-silk-500"
                          }`}
                          title={`${vImages.length} photos available for this variant`}
                        >
                          {vImages.length}P
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold ${
                          isSelected
                            ? "text-gold-300 dark:text-silk-900"
                            : "text-silk-600 dark:text-silk-400"
                        }`}
                      >
                        ({formatPriceBDT(v.salePriceBDT || v.priceBDT, language)})
                      </span>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-gold-400 dark:text-silk-950" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-silk-800 dark:text-silk-200 uppercase">
                {t.product.quantity}:
              </span>
              <div className="flex items-center border border-silk-300 rounded-xl bg-white dark:bg-dark-surface dark:border-dark-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-silk-600 hover:text-silk-950 hover:bg-silk-100 dark:text-silk-300 dark:hover:text-white dark:hover:bg-dark-elevated transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-silk-900 dark:text-silk-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-silk-600 hover:text-silk-950 hover:bg-silk-100 dark:text-silk-300 dark:hover:text-white dark:hover:bg-dark-elevated transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                onClick={handleAddToCart}
                size="lg"
                variant="primary"
                className="flex-1"
              >
                {t.product.addToCart}
              </Button>

              <Button
                type="button"
                onClick={handleBuyNow}
                size="lg"
                variant="gold"
                className="flex-1 shadow-luxury"
              >
                {t.product.buyNow}
              </Button>

              <div className="flex gap-3 sm:contents">
                <button
                  type="button"
                  onClick={async () => {
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
                  }}
                  className={`flex-1 sm:flex-initial p-3.5 rounded-xl border transition flex items-center justify-center ${
                    isWishlisted
                      ? "bg-crimson-50 border-crimson-300 text-crimson-600 hover:bg-crimson-600 hover:text-white hover:border-crimson-600 dark:bg-crimson-950/40 dark:border-crimson-800 dark:hover:bg-crimson-600 dark:hover:text-white"
                      : "border-silk-300 text-silk-700 hover:bg-crimson-50 hover:text-crimson-600 hover:border-crimson-300 dark:border-dark-border dark:text-silk-300 dark:hover:bg-dark-elevated dark:hover:text-crimson-400 dark:hover:border-crimson-800"
                  }`}
                  aria-label="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-crimson-600" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 sm:flex-initial p-3.5 rounded-xl border border-silk-300 text-silk-700 hover:bg-silk-950 hover:text-white hover:border-silk-950 transition dark:border-dark-border dark:text-silk-300 dark:hover:bg-gold-500 dark:hover:text-silk-950 dark:hover:border-gold-500 flex items-center justify-center"
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="rounded-2xl border border-silk-200 bg-silk-50/50 p-4 space-y-3 dark:border-dark-border dark:bg-dark-surface/50 text-xs">
            <h4 className="font-bold text-silk-900 dark:text-silk-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gold-600" />
              <span>{t.product.deliveryInfoTitle}</span>
            </h4>
            <div className="space-y-1.5 text-silk-700 dark:text-silk-300 font-medium pl-6">
              <p>• {t.product.deliveryInsideDhaka}</p>
              <p>• {t.product.deliveryOutsideDhaka}</p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                • {t.product.freeDeliveryEligible}
              </p>
            </div>

            <div className="pt-2 border-t border-silk-200 dark:border-dark-border flex items-center justify-between text-silk-700 dark:text-silk-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                <span>{language === "bn" ? "১০০% খাঁটি পণ্য" : "100% Genuine"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-gold-500" />
                <span>{language === "bn" ? "৭ দিনের সহজ রিটার্ন" : "7 Days Return"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details */}
      <section className="rounded-3xl border border-silk-200 bg-white p-6 sm:p-10 shadow-card dark:border-dark-border dark:bg-dark-surface">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-silk-950 dark:text-silk-50 mb-6">
          {t.product.specifications}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(
            language === "bn"
              ? product.specificationsBn || product.specificationsEn || {}
              : product.specificationsEn || {}
          ).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between p-3 rounded-xl bg-silk-50 dark:bg-dark-elevated text-xs"
            >
              <span className="font-semibold text-silk-700 dark:text-silk-300">{key}</span>
              <span className="text-silk-950 font-medium dark:text-silk-100">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews & Ratings */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {t.product.customerReviews}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-gold-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-500" />
                ))}
              </div>
              <span className="text-xs font-semibold text-silk-800 dark:text-silk-200">
                {product.rating} out of 5 ({product.reviewCount} ratings)
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            <span>{t.product.writeReview}</span>
          </Button>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-silk-200 bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-silk-900 dark:text-silk-100">
                Dr. Sadia Afrin
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40">
                {t.product.verifiedPurchase}
              </span>
            </div>
            <div className="flex items-center text-gold-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
              ))}
            </div>
            <p className="text-xs text-silk-600 dark:text-silk-400 leading-relaxed">
              {language === "bn"
                ? "অর্ডার করার ২ দিনের মধ্যে ডেলিভারি পেয়েছি। সিল্কের ফেব্রিক সত্যিই অসাধারণ এবং আসল মালবেরি সিল্ক।"
                : "Received in Dhaka within 48 hours. Beautiful genuine silk fabric, looks exactly as pictured."}
            </p>
          </div>

          <div className="rounded-2xl border border-silk-200 bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-silk-900 dark:text-silk-100">
                Kamal Hossain
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40">
                {t.product.verifiedPurchase}
              </span>
            </div>
            <div className="flex items-center text-gold-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
              ))}
            </div>
            <p className="text-xs text-silk-600 dark:text-silk-400 leading-relaxed">
              {language === "bn"
                ? "বিয়ের গিফট হিসেবে কিনেছিলাম। গিফট প্যাকেজিং এবং ফিনিশিং খুবই চমৎকার ছিল। সম্পূর্ণ সন্তুষ্ট।"
                : "Bought this as a wedding gift. Packaging was premium and luxurious. Highly recommended!"}
            </p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.product.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-silk-200 dark:border-dark-border">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
            {t.product.recentlyViewed}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={t.product.writeReview}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsReviewModalOpen(false);
            showToast(
              language === "bn"
                ? "আপনার রিভিউ জমা হয়েছে এবং যাচাইকরণ শেষে প্রকাশিত হবে।"
                : "Your review has been submitted for moderation.",
              "success"
            );
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
              {language === "bn" ? "রেটিং নির্বাচন করুন" : "Select Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating
                        ? "fill-gold-500 text-gold-500"
                        : "text-silk-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Input
            label={language === "bn" ? "আপনার নাম" : "Your Name"}
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
              {language === "bn" ? "আপনার মতামত" : "Your Review"}
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              className="w-full rounded-lg border border-silk-300 p-3 text-sm focus:border-gold-500 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-silk-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="gold">
              {t.common.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
