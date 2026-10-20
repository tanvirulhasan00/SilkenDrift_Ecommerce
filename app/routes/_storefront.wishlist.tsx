import React from "react";
import { useLoaderData, Link } from "react-router";
import { firestoreService } from "~/services/firebase/firestoreService";
import { mockRepository } from "~/services/mock/mockStore";
import { useLanguage } from "~/locales";
import { useWishlist } from "~/hooks/useWishlist";
import { ProductCard } from "~/features/catalog/ProductCard";
import { Button } from "~/components/ui/Button";
import { useToast } from "~/components/feedback/ToastContext";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles } from "lucide-react";

export async function clientLoader() {
  try {
    const products = await firestoreService.getProducts();
    return { products: products || [] };
  } catch {
    return { products: mockRepository.getProducts() };
  }
}

export default function WishlistPage() {
  const { products } = useLoaderData<typeof clientLoader>();
  const { language, t } = useLanguage();
  const { wishlistSlugs, clearWishlist } = useWishlist();
  const { showToast } = useToast();

  // Filter products to ONLY show items loved/saved by the user
  const lovedProducts = products.filter(
    (p) => wishlistSlugs.includes(p.slug) || wishlistSlugs.includes(p.id)
  );

  const handleClear = async () => {
    await clearWishlist();
    showToast(
      language === "bn" ? "উইশলিস্ট খালি করা হয়েছে" : "Wishlist has been cleared",
      "info"
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-silk-200 dark:border-dark-border shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-crimson-50 text-crimson-600 dark:bg-crimson-950/40 dark:text-crimson-400 flex items-center justify-center border border-crimson-200 dark:border-crimson-800">
              <Heart className="w-5 h-5 fill-crimson-600 dark:fill-crimson-400" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
                {language === "bn" ? "আমার পছন্দের উইশলিস্ট" : "My Saved Wishlist"}
              </h1>
              <p className="text-xs text-silk-600 dark:text-silk-400">
                {language === "bn"
                  ? "আপনার সমস্ত পছন্দ করা খাঁটি রাজশাহী সিল্ক ও জামদানি পণ্য এখানে ডাটাবেসে সুরক্ষিত রয়েছে।"
                  : "All your loved handloom sarees, panjabis, and fabrics synced and saved in database."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lovedProducts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>{language === "bn" ? "উইশলিস্ট খালি করুন" : "Clear Wishlist"}</span>
            </Button>
          )}

          <Link to="/shop">
            <Button variant="gold" size="sm">
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              <span>{language === "bn" ? "শপ ব্রাউজ করুন" : "Continue Shopping"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Loved Products Display */}
      {lovedProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-silk-600 dark:text-silk-400 px-1">
            <span className="font-bold text-silk-900 dark:text-silk-100 font-mono">
              {lovedProducts.length} {language === "bn" ? "টি পণ্য সংরক্ষিত" : "handlooms saved"}
            </span>
            <span className="text-[11px] text-silk-500">
              {language === "bn" ? "ডাটাবেসে সংরক্ষিত" : "Saved in Database"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {lovedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl border border-silk-200 dark:border-dark-border p-8 space-y-5 shadow-soft">
          <div className="w-16 h-16 rounded-3xl bg-crimson-50 text-crimson-600 dark:bg-crimson-950/40 dark:text-crimson-400 flex items-center justify-center mx-auto border border-crimson-200 dark:border-crimson-800 shadow-soft">
            <Heart className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-serif font-bold text-silk-950 dark:text-silk-50">
              {language === "bn" ? "আপনার উইশলিস্টে কোনো পণ্য নেই" : "Your Wishlist is Empty"}
            </h2>
            <p className="text-xs sm:text-sm text-silk-600 dark:text-silk-400 leading-relaxed">
              {language === "bn"
                ? "আপনি এখনও কোনো পণ্য পছন্দ করে রাখেননি। আমাদের খাঁটি রাজশাহী সিল্ক, জামদানি ও পাঞ্জাবি কালেকশন ঘুরে দেখুন এবং পছন্দের পণ্যের ওপর হার্ট (❤️) আইকনে ক্লিক করুন।"
                : "You haven't saved any handloom treasures yet. Explore our genuine Rajshahi silk sarees, Jamdani, and panjabis and tap the heart (❤️) icon on any product to save it here."}
            </p>
          </div>

          <div className="pt-2">
            <Link to="/shop">
              <Button variant="gold" size="lg" className="shadow-luxury">
                <Sparkles className="w-4 h-4 mr-2 text-silk-950" />
                <span>{language === "bn" ? "হ্যান্ডলুম কালেকশন দেখুন" : "Explore Handloom Catalog"}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
