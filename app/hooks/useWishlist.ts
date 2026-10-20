import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "~/store";
import {
  setWishlistSlugs,
  toggleWishlist as toggleWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  clearWishlist as clearWishlistAction,
} from "~/store/slices/uiSlice";
import { firestoreService } from "~/services/firebase/firestoreService";
import { useAuth } from "~/hooks/useAuth";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const wishlistSlugs = useAppSelector((state) => state.ui.wishlistSlugs);
  const { user } = useAuth();

  // Load loved products from DB (Firestore or mock repository) on mount or whenever authenticated user changes
  useEffect(() => {
    let isMounted = true;

    async function syncFromDb() {
      try {
        const dbSlugs = await firestoreService.getWishlist(user?.uid);
        if (isMounted && Array.isArray(dbSlugs)) {
          // Merge local slugs with DB slugs so no guest favorites are lost upon logging in
          const merged = Array.from(new Set([...dbSlugs, ...wishlistSlugs]));
          dispatch(setWishlistSlugs(merged));

          // If local items were merged into DB, persist the merged set to DB
          if (merged.length !== dbSlugs.length) {
            await firestoreService.saveWishlist(merged, user?.uid);
          }
        }
      } catch (err) {
        console.warn("Could not sync wishlist from DB:", err);
      }
    }

    syncFromDb();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Toggle wishlist: updates Redux state immediately and persists to database
  const toggle = useCallback(
    async (slug: string) => {
      const willBeSaved = !wishlistSlugs.includes(slug);
      const newSlugs = willBeSaved
        ? [...wishlistSlugs, slug]
        : wishlistSlugs.filter((s) => s !== slug);

      // Instant UI update
      dispatch(toggleWishlistAction(slug));

      // Asynchronous DB persistence
      try {
        await firestoreService.saveWishlist(newSlugs, user?.uid);
      } catch (err) {
        console.warn("Could not save wishlist to DB:", err);
      }

      return willBeSaved;
    },
    [dispatch, wishlistSlugs, user?.uid]
  );

  // Remove single item from wishlist and DB
  const remove = useCallback(
    async (slug: string) => {
      const newSlugs = wishlistSlugs.filter((s) => s !== slug);
      dispatch(removeFromWishlistAction(slug));
      try {
        await firestoreService.saveWishlist(newSlugs, user?.uid);
      } catch (err) {
        console.warn("Could not remove item from DB wishlist:", err);
      }
    },
    [dispatch, wishlistSlugs, user?.uid]
  );

  // Clear all loved items from wishlist and DB
  const clear = useCallback(async () => {
    dispatch(clearWishlistAction());
    try {
      await firestoreService.saveWishlist([], user?.uid);
    } catch (err) {
      console.warn("Could not clear DB wishlist:", err);
    }
  }, [dispatch, user?.uid]);

  return {
    wishlistSlugs,
    wishlistCount: wishlistSlugs.length,
    isWishlisted: (slug: string) => wishlistSlugs.includes(slug),
    toggleWishlist: toggle,
    removeFromWishlist: remove,
    clearWishlist: clear,
  };
}
