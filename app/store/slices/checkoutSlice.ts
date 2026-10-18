import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeliveryMethod, PaymentMethod } from "~/types";

interface CustomerDraft {
  name: string;
  phone: string;
  email: string;
}

interface AddressDraft {
  division: string;
  district: string;
  upazila: string;
  areaAddress: string;
  postalCode: string;
}

interface CheckoutState {
  currentStep: number;
  customerInfo: CustomerDraft;
  shippingAddress: AddressDraft;
  deliveryMethod: DeliveryMethod;
  pickupPointId: string | null;
  paymentMethod: PaymentMethod;
  orderNotes: string;
}

const CHECKOUT_DRAFT_KEY = "silkendrift_checkout_draft";

const loadDraft = (): Partial<CheckoutState> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savedDraft = loadDraft();

const initialState: CheckoutState = {
  currentStep: savedDraft.currentStep || 1,
  customerInfo: savedDraft.customerInfo || {
    name: "",
    phone: "",
    email: "",
  },
  shippingAddress: savedDraft.shippingAddress || {
    division: "dhaka",
    district: "dhaka_dist",
    upazila: "Dhanmondi",
    areaAddress: "",
    postalCode: "1209",
  },
  deliveryMethod: savedDraft.deliveryMethod || "home_delivery",
  pickupPointId: savedDraft.pickupPointId || null,
  paymentMethod: savedDraft.paymentMethod || "cod",
  orderNotes: savedDraft.orderNotes || "",
};

const persistCheckout = (state: CheckoutState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(state));
  } catch {
    // Storage full
  }
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      persistCheckout(state);
    },
    updateCustomerInfo: (state, action: PayloadAction<Partial<CustomerDraft>>) => {
      state.customerInfo = { ...state.customerInfo, ...action.payload };
      persistCheckout(state);
    },
    updateShippingAddress: (state, action: PayloadAction<Partial<AddressDraft>>) => {
      state.shippingAddress = { ...state.shippingAddress, ...action.payload };
      persistCheckout(state);
    },
    setDeliveryMethod: (
      state,
      action: PayloadAction<{ method: DeliveryMethod; pickupPointId?: string | null }>
    ) => {
      state.deliveryMethod = action.payload.method;
      state.pickupPointId = action.payload.pickupPointId ?? null;
      persistCheckout(state);
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
      persistCheckout(state);
    },
    setOrderNotes: (state, action: PayloadAction<string>) => {
      state.orderNotes = action.payload;
      persistCheckout(state);
    },
    resetCheckoutDraft: (state) => {
      state.currentStep = 1;
      state.orderNotes = "";
      if (typeof window !== "undefined") {
        localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      }
    },
  },
});

export const {
  setStep,
  updateCustomerInfo,
  updateShippingAddress,
  setDeliveryMethod,
  setPaymentMethod,
  setOrderNotes,
  resetCheckoutDraft,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
