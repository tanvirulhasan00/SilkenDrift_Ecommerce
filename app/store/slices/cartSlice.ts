import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "~/types";

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  couponCode: string | null;
  discountPercentage: number;
}

const STORAGE_KEY = "silkendrift_cart_v1";

const loadInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
};

const initialState: CartState = {
  items: loadInitialCart(),
  isDrawerOpen: false,
  couponCode: null,
  discountPercentage: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (i) =>
          i.productId === action.payload.productId &&
          i.variantId === action.payload.variantId
      );

      if (existingIndex > -1) {
        const item = state.items[existingIndex];
        const newQty = Math.min(
          item.quantity + action.payload.quantity,
          item.maxStock || 99
        );
        state.items[existingIndex] = { ...item, quantity: newQty };
      } else {
        state.items.push(action.payload);
      }
      saveCart(state.items);
      state.isDrawerOpen = true;
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; variantId?: string }>
    ) => {
      state.items = state.items.filter(
        (i) =>
          !(
            i.productId === action.payload.productId &&
            i.variantId === action.payload.variantId
          )
      );
      saveCart(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.variantId === action.payload.variantId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              !(
                i.productId === action.payload.productId &&
                i.variantId === action.payload.variantId
              )
          );
        } else {
          item.quantity = Math.min(action.payload.quantity, item.maxStock || 99);
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountPercentage = 0;
      saveCart([]);
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discountPercentage: number }>
    ) => {
      state.couponCode = action.payload.code;
      state.discountPercentage = action.payload.discountPercentage;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountPercentage = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCartDrawer,
  openCartDrawer,
  closeCartDrawer,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
