import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  recentlyViewedSlugs: string[];
  wishlistSlugs: string[];
  isMobileMenuOpen: boolean;
  isFilterDrawerOpen: boolean;
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
  };
}

const RECENT_KEY = "silkendrift_recent_views";
const WISHLIST_KEY = "silkendrift_wishlist";

const loadRecent = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadWishlist = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialState: UIState = {
  recentlyViewedSlugs: loadRecent(),
  wishlistSlugs: loadWishlist(),
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  notificationPreferences: {
    orderUpdates: true,
    promotions: false,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const slug = action.payload;
      state.recentlyViewedSlugs = [
        slug,
        ...state.recentlyViewedSlugs.filter((s) => s !== slug),
      ].slice(0, 10);
      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_KEY, JSON.stringify(state.recentlyViewedSlugs));
      }
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const slug = action.payload;
      if (state.wishlistSlugs.includes(slug)) {
        state.wishlistSlugs = state.wishlistSlugs.filter((s) => s !== slug);
      } else {
        state.wishlistSlugs.push(slug);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(state.wishlistSlugs));
      }
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setFilterDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterDrawerOpen = action.payload;
    },
  },
});

export const {
  addRecentlyViewed,
  toggleWishlist,
  setMobileMenuOpen,
  setFilterDrawerOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
