import React, { useState } from "react";
import { Drawer } from "~/components/ui/Drawer";
import { useAppDispatch, useAppSelector } from "~/store";
import {
  closeCartDrawer,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from "~/store/slices/cartSlice";
import { useLanguage } from "~/locales";
import { formatPriceBDT } from "~/lib/formatters";
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Truck } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Link } from "react-router";
import { useToast } from "~/components/feedback/ToastContext";
import { useSettings } from "~/hooks/useSettings";
import { normalizeImageUrl } from "~/lib/imageUrl";

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDrawerOpen, items, couponCode, discountPercentage } = useAppSelector(
    (state) => state.cart
  );
  const { language, t, interpolate } = useLanguage();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const [couponInput, setCouponInput] = useState("");

  const subtotal = items.reduce(
    (acc, item) => acc + (item.salePriceBDT || item.priceBDT) * item.quantity,
    0
  );

  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const freeShippingThreshold = settings.freeShippingMinBDT || 2500;
  const standardCharge = settings.insideDhakaChargeBDT ?? 60;
  const deliveryCharge = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : standardCharge;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === "SILKSPRING") {
      dispatch(applyCoupon({ code, discountPercentage: 10 }));
      showToast(t.cart.couponSuccess, "success");
      setCouponInput("");
    } else if (code === "WELCOME10") {
      dispatch(applyCoupon({ code, discountPercentage: 15 }));
      showToast(t.cart.couponSuccess, "success");
      setCouponInput("");
    } else {
      showToast(t.cart.couponInvalid, "error");
    }
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={() => dispatch(closeCartDrawer())}
      title={`${t.cart.myCart} (${items.length})`}
      width="md"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-silk-100 text-silk-600 mb-4 dark:bg-dark-elevated dark:text-silk-300">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h4 className="font-semibold text-silk-900 dark:text-silk-100">
            {t.cart.emptyCartTitle}
          </h4>
          <p className="mt-1 text-sm text-silk-700 dark:text-silk-300 font-medium max-w-xs">
            {t.cart.emptyCartDesc}
          </p>
          <Button
            className="mt-6"
            variant="primary"
            onClick={() => dispatch(closeCartDrawer())}
          >
            <Link to="/shop">{t.cart.continueShopping}</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* Free Shipping Progress Indicator */}
          <div className="mb-4 rounded-xl border border-silk-200 bg-silk-50 p-3 dark:border-dark-border dark:bg-dark-elevated">
            <div className="flex items-center gap-2 text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1.5">
              <Truck className="w-4 h-4 text-gold-600" />
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 dark:text-emerald-400">
                  {t.cart.freeDeliveryUnlocked}
                </span>
              ) : (
                <span>
                  {interpolate(t.cart.freeDeliveryProgress, {
                    amount: formatPriceBDT(freeShippingThreshold - subtotal, language),
                  })}
                </span>
              )}
            </div>
            <div className="h-1.5 w-full bg-silk-200 rounded-full overflow-hidden dark:bg-dark-border">
              <div
                className="h-full bg-gold-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-silk-100 pr-1 dark:divide-dark-border">
            {items.map((item) => {
              const currentPrice = item.salePriceBDT || item.priceBDT;
              return (
                <div key={`${item.productId}_${item.variantId || ""}`} className="py-3 flex gap-3">
                  <img
                    src={normalizeImageUrl(item.image)}
                    alt={language === "bn" ? item.productNameBn : item.productNameEn}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded-lg object-cover border border-silk-200 dark:border-dark-border flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.productSlug}`}
                          onClick={() => dispatch(closeCartDrawer())}
                          className="text-xs font-semibold text-silk-900 hover:text-gold-600 dark:text-silk-100 line-clamp-2"
                        >
                          {language === "bn" ? item.productNameBn : item.productNameEn}
                        </Link>
                        <button
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                productId: item.productId,
                                variantId: item.variantId,
                              })
                            )
                          }
                          className="text-silk-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.attributes && (
                        <p className="text-[11px] text-silk-700 dark:text-silk-300 font-medium mt-0.5">
                          {item.attributes.color && `${item.attributes.color} `}
                          {item.attributes.size && `/ ${item.attributes.size}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-silk-200 rounded-md dark:border-dark-border overflow-hidden">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          className="p-1 hover:bg-silk-200 hover:text-silk-950 dark:hover:bg-dark-border dark:hover:text-white text-silk-600 dark:text-silk-300 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-silk-900 dark:text-silk-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          className="p-1 hover:bg-silk-200 hover:text-silk-950 dark:hover:bg-dark-border dark:hover:text-white text-silk-600 dark:text-silk-300 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-silk-900 dark:text-silk-100">
                        {formatPriceBDT(currentPrice * item.quantity, language)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer & Checkout */}
          <div className="pt-4 border-t border-silk-200 dark:border-dark-border space-y-3">
            {/* Coupon input */}
            {couponCode ? (
              <div className="flex items-center justify-between bg-gold-50 p-2 rounded-lg border border-gold-200 text-xs dark:bg-gold-950/30 dark:border-gold-800">
                <span className="flex items-center gap-1.5 font-semibold text-gold-900 dark:text-gold-300">
                  <Tag className="w-3.5 h-3.5" />
                  {couponCode} (-{discountPercentage}%)
                </span>
                <button
                  onClick={() => dispatch(removeCoupon())}
                  className="text-silk-700 dark:text-silk-300 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 px-2 py-0.5 rounded font-semibold text-[11px] transition"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.cart.couponPlaceholder}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 rounded-lg border border-silk-300 px-3 py-1.5 text-xs uppercase placeholder:normal-case dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100"
                />
                <Button type="submit" size="sm" variant="secondary">
                  {t.cart.applyCoupon}
                </Button>
              </form>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-silk-700 dark:text-silk-300 font-medium">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-silk-900 dark:text-silk-200">
                  {formatPriceBDT(subtotal, language)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t.cart.discount}</span>
                  <span>-{formatPriceBDT(discountAmount, language)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.cart.deliveryCharge}</span>
                <span className="font-semibold text-silk-900 dark:text-silk-200">
                  {deliveryCharge === 0 ? "FREE" : formatPriceBDT(deliveryCharge, language)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-silk-950 pt-2 border-t border-silk-100 dark:border-dark-border dark:text-silk-50">
                <span>{t.cart.total}</span>
                <span className="text-base text-gold-600 dark:text-gold-400 font-serif">
                  {formatPriceBDT(total, language)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCartDrawer())}
              className="block w-full"
            >
              <Button className="w-full" size="lg" variant="gold">
                <span>{t.cart.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
};
