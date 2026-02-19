import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item._id === product._id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stock) {
            toast.error(`Only ${product.stock} items available`);
            return;
          }
          set({
            items: items.map((item) =>
              item._id === product._id ? { ...item, quantity: newQuantity } : item
            ),
          });
        } else {
          if (quantity > product.stock) {
            toast.error(`Only ${product.stock} items available`);
            return;
          }
          set({ items: [...items, { ...product, quantity }] });
        }
        toast.success(`${quantity} x ${product.name} added to cart`);
      },

      removeItem: (productId) => {
        const itemToRemove = get().items.find((item) => item._id === productId);
        set({
          items: get().items.filter((item) => item._id !== productId),
        });
        if (itemToRemove) {
          toast.success(`${itemToRemove.name} removed from cart`);
        }
      },

      updateQuantity: (productId, quantity) => {
        const itemToUpdate = get().items.find((item) => item._id === productId);
        if (!itemToUpdate) return;

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        if (quantity > itemToUpdate.stock) {
          toast.error(`Only ${itemToUpdate.stock} items available`);
          return;
        }
        set({
          items: get().items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);