import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Product } from '../data/products'

export interface CartItem {
  product: Product
  quantity: number
  note: string
}

interface CartState {
  items: CartItem[]
  customerName: string
  customerCity: string
  addItem: (product: Product, quantity?: number) => void
  decreaseItem: (id: string) => void
  removeItem: (id: string) => void
  setItemNote: (id: string, note: string) => void
  setCustomerName: (value: string) => void
  setCustomerCity: (value: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      customerName: '',
      customerCity: '',
      addItem: (product, quantity = 1) => set((state) => {
        const existing = state.items.find((item) => item.product.id === product.id)
        if (existing) {
          return {
            items: state.items.map((item) => item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item),
          }
        }
        return { items: [...state.items, { product, quantity, note: '' }] }
      }),
      decreaseItem: (id) => set((state) => ({
        items: state.items.flatMap((item) => item.product.id === id
          ? item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
          : [item]),
      })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.product.id !== id) })),
      setItemNote: (id, note) => set((state) => ({
        items: state.items.map((item) => item.product.id === id ? { ...item, note } : item),
      })),
      setCustomerName: (customerName) => set({ customerName }),
      setCustomerCity: (customerCity) => set({ customerCity }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'whatshome-order-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
        customerCity: state.customerCity,
      }),
    },
  ),
)
