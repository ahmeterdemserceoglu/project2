import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  attributes?: Record<string, string>;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

// Don't use hooks directly in the store creation - this avoids SSR issues
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) => i.productId === item.productId && 
                 i.variantId === item.variantId
        );

        if (existingItemIndex !== -1) {
          // Item already exists, update quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
          
          set({ items: updatedItems });
          // We'll handle toasts in the components, not in the store
        } else {
          // Add new item
          const newItem = {
            ...item,
            id: `${item.productId}${item.variantId ? `-${item.variantId}` : ''}-${Date.now()}`,
          };
          
          set({ items: [...items, newItem] });
          // We'll handle toasts in the components, not in the store
        }
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
        // We'll handle toasts in the components, not in the store
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        
        if (quantity < 1) {
          set({ items: items.filter(item => item.id !== id) });
          return;
        }
        
        const updatedItems = items.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        
        set({ items: updatedItems });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      totalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      totalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage', // name of the item in localStorage
      skipHydration: true, // Skip automatic hydration, we'll handle it manually
    }
  )
); 