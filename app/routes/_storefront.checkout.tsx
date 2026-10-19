import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useLanguage } from "~/locales";
import { useAppDispatch, useAppSelector } from "~/store";
import {
  setStep,
  updateCustomerInfo,
  updateShippingAddress,
  setDeliveryMethod,
  setPaymentMethod,
  setOrderNotes,
  resetCheckoutDraft,
} from "~/store/slices/checkoutSlice";
import { clearCart } from "~/store/slices/cartSlice";
import { firestoreService } from "~/services/firebase/firestoreService";
import { BD_DIVISIONS, getDistrictsByDivision, getUpazilasByDistrict } from "~/lib/bd-geo";
import { formatPriceBDT, isValidBDPhoneNumber } from "~/lib/formatters";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useToast } from "~/components/feedback/ToastContext";
import { useSettings } from "~/hooks/useSettings";
import { normalizeImageUrl, getGoogleDriveFallbackUrls } from "~/lib/imageUrl";
import { SEED_PICKUP_POINTS } from "~/services/mock/seedData";
import { paymentAdapters } from "~/services/payments/adapters";
import {
  Check,
  User,
  MapPin,
  Truck,
  CreditCard,
  Building,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const { language, t } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const cart = useAppSelector((state) => state.cart);
  const checkout = useAppSelector((state) => state.checkout);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = useMemo(
    () =>
      cart.items.reduce(
        (acc, item) => acc + (item.salePriceBDT || item.priceBDT) * item.quantity,
        0
      ),
    [cart.items]
  );

  const discountAmount = Math.round((subtotal * cart.discountPercentage) / 100);

  // Delivery charge calculation based on destination & method from settings
  const freeShippingThreshold = settings.freeShippingMinBDT ?? 2500;
  const isInsideDhaka = checkout.shippingAddress.division === "dhaka";
  const standardDeliveryCharge = isInsideDhaka
    ? (settings.insideDhakaChargeBDT ?? 60)
    : (settings.outsideDhakaChargeBDT ?? 120);
  const isPickup = checkout.deliveryMethod === "pickup_point";
  const baseDeliveryCharge = isPickup ? 30 : standardDeliveryCharge;
  const deliveryCharge = subtotal >= freeShippingThreshold && !isPickup ? 0 : baseDeliveryCharge;
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

  // Geo cascading dropdowns
  const availableDistricts = useMemo(
    () => getDistrictsByDivision(checkout.shippingAddress.division || "dhaka"),
    [checkout.shippingAddress.division]
  );

  const availableUpazilas = useMemo(
    () => getUpazilasByDistrict(checkout.shippingAddress.district || "dhaka_dist"),
    [checkout.shippingAddress.district]
  );

  // Step validation
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (checkout.currentStep === 1) {
      if (!checkout.customerInfo.name.trim()) {
        errors.name = language === "bn" ? "পূর্ণ নাম আবশ্যক" : "Full name is required";
      }
      if (!isValidBDPhoneNumber(checkout.customerInfo.phone)) {
        errors.phone =
          language === "bn"
            ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)"
            : "Valid 11-digit BD phone required (e.g. 01XXXXXXXXX)";
      }
    } else if (checkout.currentStep === 2) {
      if (!checkout.shippingAddress.division) {
        errors.division = language === "bn" ? "বিভাগ নির্বাচন করুন" : "Select division";
      }
      if (!checkout.shippingAddress.district) {
        errors.district = language === "bn" ? "জেলা নির্বাচন করুন" : "Select district";
      }
      if (!checkout.shippingAddress.upazila) {
        errors.upazila = language === "bn" ? "থানা নির্বাচন করুন" : "Select upazila";
      }
      if (!checkout.shippingAddress.areaAddress.trim()) {
        errors.areaAddress =
          language === "bn" ? "বিস্তারিত ঠিকানা প্রদান করুন" : "Detailed address required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      dispatch(setStep(checkout.currentStep + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    dispatch(setStep(Math.max(1, checkout.currentStep - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      showToast(t.cart.emptyCartTitle, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute payment adapter
      const adapter = paymentAdapters[checkout.paymentMethod];
      const selectedDivisionObj = BD_DIVISIONS.find((d) => d.id === checkout.shippingAddress.division);
      const selectedDistrictObj = availableDistricts.find((d) => d.id === checkout.shippingAddress.district);

      const orderData = {
        customerName: checkout.customerInfo.name,
        customerPhone: checkout.customerInfo.phone,
        customerEmail: checkout.customerInfo.email || undefined,
        shippingAddress: {
          id: `addr_${Date.now()}`,
          name: checkout.customerInfo.name,
          phone: checkout.customerInfo.phone,
          division: selectedDivisionObj ? selectedDivisionObj.nameEn : "Dhaka",
          district: selectedDistrictObj ? selectedDistrictObj.nameEn : "Dhaka",
          upazila: checkout.shippingAddress.upazila,
          areaAddress: checkout.shippingAddress.areaAddress,
          postalCode: checkout.shippingAddress.postalCode || "1200",
        },
        deliveryMethod: checkout.deliveryMethod,
        pickupPointId: checkout.pickupPointId || undefined,
        items: cart.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          productNameEn: i.productNameEn,
          productNameBn: i.productNameBn,
          image: i.image,
          priceBDT: i.salePriceBDT || i.priceBDT,
          quantity: i.quantity,
          subtotalBDT: (i.salePriceBDT || i.priceBDT) * i.quantity,
          attributes: i.attributes,
        })),
        subtotalBDT: subtotal,
        discountBDT: discountAmount,
        deliveryChargeBDT: deliveryCharge,
        vatBDT: 0,
        totalBDT: total,
        orderStatus: "confirmed" as const,
        paymentStatus: (checkout.paymentMethod === "cod" ? "cod_pending" : "paid") as any,
        paymentMethod: checkout.paymentMethod,
        couponCode: cart.couponCode || undefined,
        notes: checkout.orderNotes || undefined,
      };

      const createdOrder = await firestoreService.createOrder(orderData);

      // Trigger payment initiation
      await adapter.initiatePayment(createdOrder);

      // Clear draft & cart
      dispatch(clearCart());
      dispatch(resetCheckoutDraft());

      showToast(t.orderSuccess.title, "success");
      navigate(`/order/success/${createdOrder.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to place order", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-silk-100 flex items-center justify-center mx-auto mb-4 text-silk-700 dark:bg-dark-elevated dark:text-silk-300">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.cart.emptyCartTitle}
        </h2>
        <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-1 max-w-sm mx-auto">
          {t.cart.emptyCartDesc}
        </p>
        <Link to="/shop" className="inline-block mt-6">
          <Button variant="gold">{t.cart.continueShopping}</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: t.checkout.stepDetails, icon: User },
    { num: 2, label: t.checkout.stepShipping, icon: MapPin },
    { num: 3, label: t.checkout.stepDelivery, icon: Truck },
    { num: 4, label: t.checkout.stepPayment, icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Title & Progress Tracker */}
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-silk-950 dark:text-silk-50">
          {t.checkout.title}
        </h1>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl">
          {steps.map((st) => (
            <div
              key={st.num}
              onClick={() => st.num < checkout.currentStep && dispatch(setStep(st.num))}
              className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border text-xs font-semibold transition ${
                st.num === checkout.currentStep
                  ? "border-gold-500 bg-silk-950 text-white dark:bg-gold-500 dark:text-silk-950 dark:border-gold-500 shadow-sm"
                  : st.num < checkout.currentStep
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 cursor-pointer dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                  : "border-silk-200 bg-white text-silk-600 dark:border-dark-border dark:bg-dark-surface dark:text-silk-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                  st.num < checkout.currentStep
                    ? "bg-emerald-600 text-white"
                    : st.num === checkout.currentStep
                    ? "bg-gold-500 text-silk-950"
                    : "bg-silk-100 text-silk-700 dark:bg-dark-elevated dark:text-silk-300"
                }`}
              >
                {st.num < checkout.currentStep ? <Check className="w-3.5 h-3.5" /> : st.num}
              </div>
              <span className="hidden sm:inline truncate">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Steps Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border">
          {/* STEP 1: Customer Contact Info */}
          {checkout.currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-silk-100 pb-3 dark:border-dark-border">
                <h2 className="text-lg font-serif font-bold text-silk-950 dark:text-silk-50">
                  ১. {t.checkout.customerInfo}
                </h2>
                <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
                  {language === "bn"
                    ? "অর্ডার কনফার্মেশন ও ট্র্যাকিং আপডেটের জন্য ব্যবহৃত হবে"
                    : "Used for order updates and courier dispatch notifications"}
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label={t.checkout.nameLabel}
                  placeholder={t.checkout.namePlaceholder}
                  value={checkout.customerInfo.name}
                  onChange={(e) =>
                    dispatch(updateCustomerInfo({ name: e.target.value }))
                  }
                  error={formErrors.name}
                />

                <Input
                  label={t.checkout.phoneLabel}
                  placeholder={t.common.phonePlaceholder}
                  value={checkout.customerInfo.phone}
                  onChange={(e) =>
                    dispatch(updateCustomerInfo({ phone: e.target.value }))
                  }
                  error={formErrors.phone}
                  helperText={
                    language === "bn"
                      ? "ডেলিভারি ম্যান এই নম্বরে যোগাযোগ করবেন"
                      : "The delivery rider will call on this number"
                  }
                />

                <Input
                  type="email"
                  label={t.checkout.emailLabel}
                  placeholder="name@example.com"
                  value={checkout.customerInfo.email}
                  onChange={(e) =>
                    dispatch(updateCustomerInfo({ email: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button size="lg" variant="gold" onClick={handleNextStep}>
                  <span>{language === "bn" ? "পরবর্তী ধাপ (ঠিকানা)" : "Continue to Address"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Bangladesh Shipping Address */}
          {checkout.currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-silk-100 pb-3 dark:border-dark-border">
                <h2 className="text-lg font-serif font-bold text-silk-950 dark:text-silk-50">
                  ২. {t.checkout.shippingAddress}
                </h2>
                <p className="text-xs text-silk-700 dark:text-silk-300 font-medium mt-0.5">
                  {language === "bn"
                    ? "সঠিক বিভাগ, জেলা ও থানা নির্বাচন করুন"
                    : "Select your Bangladesh administrative location"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Division Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                    {t.checkout.divisionLabel}
                  </label>
                  <select
                    value={checkout.shippingAddress.division}
                    onChange={(e) => {
                      const divId = e.target.value;
                      const firstDist = getDistrictsByDivision(divId)[0];
                      const firstUp = firstDist?.upazilas[0]?.nameEn || "";
                      dispatch(
                        updateShippingAddress({
                          division: divId,
                          district: firstDist?.id || "",
                          upazila: firstUp,
                        })
                      );
                    }}
                    className="w-full rounded-lg border border-silk-300 bg-white p-2.5 text-xs text-silk-900 focus:outline-none focus:border-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100"
                  >
                    {BD_DIVISIONS.map((div) => (
                      <option key={div.id} value={div.id}>
                        {language === "bn" ? div.nameBn : div.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                    {t.checkout.districtLabel}
                  </label>
                  <select
                    value={checkout.shippingAddress.district}
                    onChange={(e) => {
                      const distId = e.target.value;
                      const upazilas = getUpazilasByDistrict(distId);
                      dispatch(
                        updateShippingAddress({
                          district: distId,
                          upazila: upazilas[0]?.nameEn || "",
                        })
                      );
                    }}
                    className="w-full rounded-lg border border-silk-300 bg-white p-2.5 text-xs text-silk-900 focus:outline-none focus:border-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100"
                  >
                    {availableDistricts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {language === "bn" ? dist.nameBn : dist.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200">
                    {t.checkout.upazilaLabel}
                  </label>
                  <select
                    value={checkout.shippingAddress.upazila}
                    onChange={(e) =>
                      dispatch(updateShippingAddress({ upazila: e.target.value }))
                    }
                    className="w-full rounded-lg border border-silk-300 bg-white p-2.5 text-xs text-silk-900 focus:outline-none focus:border-gold-500 dark:border-dark-border dark:bg-dark-elevated dark:text-silk-100"
                  >
                    {availableUpazilas.map((up) => (
                      <option key={up.nameEn} value={up.nameEn}>
                        {language === "bn" ? up.nameBn : up.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area and Street Address */}
              <Input
                label={t.checkout.streetAddressLabel}
                placeholder={t.checkout.streetAddressPlaceholder}
                value={checkout.shippingAddress.areaAddress}
                onChange={(e) =>
                  dispatch(updateShippingAddress({ areaAddress: e.target.value }))
                }
                error={formErrors.areaAddress}
              />

              <Input
                label={t.checkout.postalCodeLabel}
                placeholder="1209"
                value={checkout.shippingAddress.postalCode}
                onChange={(e) =>
                  dispatch(updateShippingAddress({ postalCode: e.target.value }))
                }
              />

              <div className="flex justify-between pt-4">
                <Button size="lg" variant="outline" onClick={handlePrevStep}>
                  {t.common.back}
                </Button>
                <Button size="lg" variant="gold" onClick={handleNextStep}>
                  <span>{language === "bn" ? "পরবর্তী ধাপ (ডেলিভারি)" : "Continue to Delivery"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Method & Pickup Points */}
          {checkout.currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-silk-100 pb-3 dark:border-dark-border">
                <h2 className="text-lg font-serif font-bold text-silk-950 dark:text-silk-50">
                  ৩. {t.checkout.deliveryMethods.title}
                </h2>
              </div>

              <div className="space-y-3">
                {/* Home Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    checkout.deliveryMethod === "home_delivery"
                      ? "border-2 border-gold-500 bg-silk-50 dark:bg-gold-500/10 dark:border-gold-400 shadow-sm"
                      : "border-silk-200 hover:border-gold-500 hover:bg-gold-50/40 bg-white dark:bg-dark-surface dark:border-dark-border dark:hover:border-gold-500/80 dark:hover:bg-dark-elevated"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={checkout.deliveryMethod === "home_delivery"}
                    onChange={() =>
                      dispatch(setDeliveryMethod({ method: "home_delivery" }))
                    }
                    className="mt-1 text-gold-500 focus:ring-gold-400"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-bold text-silk-950 dark:text-silk-50">
                        {t.checkout.deliveryMethods.homeDelivery}
                      </span>
                      <span className="text-xs font-bold text-gold-600 dark:text-gold-400">
                        {subtotal >= freeShippingThreshold ? "FREE" : formatPriceBDT(standardDeliveryCharge, language)}
                      </span>
                    </div>
                    <p className="text-xs text-silk-700 dark:text-silk-300 mt-0.5 font-medium">
                      {t.checkout.deliveryMethods.homeDeliveryDesc} (
                      {isInsideDhaka ? "24-48 Hours" : "2-4 Business Days"})
                    </p>
                  </div>
                </label>

                {/* Pickup Point */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    checkout.deliveryMethod === "pickup_point"
                      ? "border-2 border-gold-500 bg-silk-50 dark:bg-gold-500/10 dark:border-gold-400 shadow-sm"
                      : "border-silk-200 hover:border-gold-500 hover:bg-gold-50/40 bg-white dark:bg-dark-surface dark:border-dark-border dark:hover:border-gold-500/80 dark:hover:bg-dark-elevated"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={checkout.deliveryMethod === "pickup_point"}
                    onChange={() =>
                      dispatch(
                        setDeliveryMethod({
                          method: "pickup_point",
                          pickupPointId: SEED_PICKUP_POINTS[0].id,
                        })
                      )
                    }
                    className="mt-1 text-gold-500 focus:ring-gold-400"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-bold text-silk-950 dark:text-silk-50">
                        {t.checkout.deliveryMethods.pickupPoint}
                      </span>
                      <span className="text-xs font-bold text-gold-600 dark:text-gold-400">
                        {formatPriceBDT(30, language)}
                      </span>
                    </div>
                    <p className="text-xs text-silk-700 dark:text-silk-300 mt-0.5 font-medium">
                      {t.checkout.deliveryMethods.pickupPointDesc}
                    </p>
                  </div>
                </label>

                {/* Pickup Hub Selection dropdown if active */}
                {checkout.deliveryMethod === "pickup_point" && (
                  <div className="ml-8 p-3 rounded-xl bg-silk-50 border border-silk-200 dark:bg-dark-elevated dark:border-dark-border space-y-2">
                    <span className="text-xs font-semibold text-silk-800 dark:text-silk-200">
                      {t.checkout.pickupPointsTitle}:
                    </span>
                    <select
                      value={checkout.pickupPointId || SEED_PICKUP_POINTS[0].id}
                      onChange={(e) =>
                        dispatch(
                          setDeliveryMethod({
                            method: "pickup_point",
                            pickupPointId: e.target.value,
                          })
                        )
                      }
                      className="w-full rounded-lg border border-silk-300 bg-white p-2 text-xs text-silk-900 dark:bg-dark-surface dark:border-dark-border dark:text-silk-100"
                    >
                      {SEED_PICKUP_POINTS.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {language === "bn" ? hub.nameBn : hub.nameEn} —{" "}
                          {language === "bn" ? hub.addressBn : hub.addressEn}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button size="lg" variant="outline" onClick={handlePrevStep}>
                  {t.common.back}
                </Button>
                <Button size="lg" variant="gold" onClick={handleNextStep}>
                  <span>{language === "bn" ? "পরবর্তী ধাপ (পেমেন্ট)" : "Continue to Payment"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Selection & Confirmation */}
          {checkout.currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-silk-100 pb-3 dark:border-dark-border">
                <h2 className="text-lg font-serif font-bold text-silk-950 dark:text-silk-50">
                  ৪. {t.checkout.paymentMethods.title}
                </h2>
              </div>

              <div className="space-y-3">
                {/* bKash */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    checkout.paymentMethod === "bkash"
                      ? "border-2 border-pink-500 bg-pink-50/70 dark:bg-pink-950/30 dark:border-pink-500 shadow-sm"
                      : "border-silk-200 hover:border-pink-400 hover:bg-pink-50/40 bg-white dark:bg-dark-surface dark:border-dark-border dark:hover:border-pink-500/80 dark:hover:bg-dark-elevated"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={checkout.paymentMethod === "bkash"}
                    onChange={() => dispatch(setPaymentMethod("bkash"))}
                    className="mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-silk-950 dark:text-silk-50">
                        {t.checkout.paymentMethods.bkashTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-bold text-[10px]">
                        bKash
                      </span>
                    </div>
                    <p className="text-xs text-pink-950 dark:text-pink-200 mt-1 font-medium">
                      {t.checkout.paymentMethods.bkashDesc}
                    </p>
                  </div>
                </label>

                {/* SSLCOMMERZ */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    checkout.paymentMethod === "sslcommerz"
                      ? "border-2 border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-500 shadow-sm"
                      : "border-silk-200 hover:border-blue-400 hover:bg-blue-50/40 bg-white dark:bg-dark-surface dark:border-dark-border dark:hover:border-blue-500/80 dark:hover:bg-dark-elevated"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={checkout.paymentMethod === "sslcommerz"}
                    onChange={() => dispatch(setPaymentMethod("sslcommerz"))}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-silk-950 dark:text-silk-50">
                        {t.checkout.paymentMethods.sslcommerzTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                        Cards / Net Banking
                      </span>
                    </div>
                    <p className="text-xs text-blue-950 dark:text-blue-200 mt-1 font-medium">
                      {t.checkout.paymentMethods.sslcommerzDesc}
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                    checkout.paymentMethod === "cod"
                      ? "border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm"
                      : "border-silk-200 hover:border-emerald-400 hover:bg-emerald-50/40 bg-white dark:bg-dark-surface dark:border-dark-border dark:hover:border-emerald-500/80 dark:hover:bg-dark-elevated"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={checkout.paymentMethod === "cod"}
                    onChange={() => dispatch(setPaymentMethod("cod"))}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-silk-950 dark:text-silk-50">
                        {t.checkout.paymentMethods.codTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                        COD
                      </span>
                    </div>
                    <p className="text-xs text-emerald-950 dark:text-emerald-200 mt-1 font-medium">
                      {t.checkout.paymentMethods.codDesc}
                    </p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{t.checkout.paymentMethods.codEligibleNote}</span>
                    </p>
                  </div>
                </label>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-silk-800 dark:text-silk-200 mb-1">
                  {t.checkout.orderNotes}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.checkout.orderNotesPlaceholder}
                  value={checkout.orderNotes}
                  onChange={(e) => dispatch(setOrderNotes(e.target.value))}
                  className="w-full rounded-lg border border-silk-300 p-2.5 text-xs focus:border-gold-500 focus:outline-none dark:border-dark-border dark:bg-dark-surface dark:text-silk-100"
                />
              </div>

              <div className="p-3 bg-silk-50 rounded-xl text-xs text-silk-600 flex items-center gap-2 dark:bg-dark-elevated dark:text-silk-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.checkout.termsAgree}</span>
              </div>

              <div className="flex justify-between pt-4">
                <Button size="lg" variant="outline" onClick={handlePrevStep}>
                  {t.common.back}
                </Button>
                <Button
                  size="lg"
                  variant="gold"
                  isLoading={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="shadow-luxury"
                >
                  {isSubmitting ? t.checkout.processingOrder : t.checkout.placeOrderBtn}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Column (Sticky) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-silk-200 shadow-card dark:bg-dark-surface dark:border-dark-border space-y-5 sticky top-28">
          <h3 className="font-serif font-bold text-lg text-silk-950 dark:text-silk-50 pb-3 border-b border-silk-100 dark:border-dark-border">
            {t.cart.cartSummary} ({cart.items.length})
          </h3>

          <div className="divide-y divide-silk-100 dark:divide-dark-border max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center gap-3">
                <img
                  src={normalizeImageUrl(item.image)}
                  alt={language === "bn" ? item.productNameBn : item.productNameEn}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover border border-silk-200 dark:border-dark-border flex-shrink-0"
                  onError={(e) => {
                    if (item.image) {
                      const fallbacks = getGoogleDriveFallbackUrls(item.image);
                      const target = e.target as HTMLImageElement;
                      const currentSrc = target.src;
                      const nextIdx = fallbacks.indexOf(currentSrc) + 1;
                      if (nextIdx > 0 && nextIdx < fallbacks.length) {
                        target.src = fallbacks[nextIdx];
                      }
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-silk-900 truncate dark:text-silk-100">
                    {language === "bn" ? item.productNameBn : item.productNameEn}
                  </h4>
                  <p className="text-[11px] text-silk-700 dark:text-silk-300 font-medium mt-0.5">
                    {item.quantity} × {formatPriceBDT(item.salePriceBDT || item.priceBDT, language)}
                  </p>
                </div>
                <span className="text-xs font-bold text-silk-950 dark:text-silk-100">
                  {formatPriceBDT((item.salePriceBDT || item.priceBDT) * item.quantity, language)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-silk-100 dark:border-dark-border text-xs text-silk-700 dark:text-silk-300 font-medium">
            <div className="flex justify-between">
              <span>{t.cart.subtotal}</span>
              <span className="font-semibold text-silk-900 dark:text-silk-100">
                {formatPriceBDT(subtotal, language)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t.cart.discount} ({cart.couponCode})</span>
                <span>-{formatPriceBDT(discountAmount, language)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t.cart.deliveryCharge}</span>
              <span className="font-semibold text-silk-900 dark:text-silk-100">
                {deliveryCharge === 0 ? "FREE" : formatPriceBDT(deliveryCharge, language)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-silk-100 dark:border-dark-border text-base font-bold text-silk-950 dark:text-silk-50">
              <span>{t.cart.total}</span>
              <span className="text-lg text-gold-600 dark:text-gold-400 font-serif">
                {formatPriceBDT(total, language)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
