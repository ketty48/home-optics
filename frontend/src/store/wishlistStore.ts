import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        if (items.find((item) => item._id === product._id)) {
          toast.error(`${product.name} is already in your wishlist`);
          return;
        }
        set({ items: [...items, product] });
        toast.success(`${product.name} added to wishlist`);
      },

      removeItem: (productId) => {
        const itemToRemove = get().items.find((item) => item._id === productId);
        set({ items: get().items.filter((item) => item._id !== productId) });
        if (itemToRemove) {
          toast.success(`${itemToRemove.name} removed from wishlist`);
        }
      },

      toggleItem: (product) => {
        const { items } = get();
        const exists = items.find((item) => item._id === product._id);
        if (exists) {
          set({ items: items.filter((item) => item._id !== product._id) });
          toast.success(`${product.name} removed from wishlist`);
        } else {
          set({ items: [...items, product] });
          toast.success(`${product.name} added to wishlist`);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item._id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
