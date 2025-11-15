import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClientComponentClient } from './supabase';
import { authHelpers } from './auth';

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

export type RecentlyRemovedItem = {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string;
    removedAt: number;
};

type CartState = {
    items: CartItem[];
    recentlyRemovedItems: RecentlyRemovedItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
    clearRecentlyRemoved: () => void;
    syncWithDatabase: (userId: string) => Promise<void>;
    loadFromDatabase: (userId: string) => Promise<void>;
};

// Don't use hooks directly in the store creation - this avoids SSR issues
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            recentlyRemovedItems: [],

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
                    // Kullanıcı giriş yapmışsa veritabanına senkronize et
                    authHelpers.getUser().then(({ user }) => {
                        if (user) {
                            get().syncWithDatabase(user.id);
                        }
                    });
                } else {
                    // Add new item
                    const newItem = {
                        ...item,
                        id: `${item.productId}${item.variantId ? `-${item.variantId}` : ''}-${Date.now()}`,
                    };

                    set({ items: [...items, newItem] });
                    // Kullanıcı giriş yapmışsa veritabanına senkronize et
                    authHelpers.getUser().then(({ user }) => {
                        if (user) {
                            get().syncWithDatabase(user.id);
                        }
                    });
                }
            },

            removeItem: (id) => {
                const { items, recentlyRemovedItems } = get();
                const itemToRemove = items.find(item => item.id === id);

                if (itemToRemove) {
                    // Son kaldırılan ürünü listeye ekle
                    const removedItem: RecentlyRemovedItem = {
                        id: itemToRemove.id,
                        productId: itemToRemove.productId,
                        name: itemToRemove.name,
                        price: itemToRemove.price,
                        image: itemToRemove.image,
                        removedAt: Date.now()
                    };

                    // En son kaldırılan 10 ürünü tut
                    const updatedRecentlyRemoved = [removedItem, ...recentlyRemovedItems]
                        .slice(0, 10);

                    set({
                        items: items.filter(item => item.id !== id),
                        recentlyRemovedItems: updatedRecentlyRemoved
                    });
                    // Kullanıcı giriş yapmışsa veritabanına senkronize et
                    authHelpers.getUser().then(({ user }) => {
                        if (user) {
                            get().syncWithDatabase(user.id);
                        }
                    });
                } else {
                    set({ items: items.filter(item => item.id !== id) });
                }
            },

            updateQuantity: (id, quantity) => {
                const { items } = get();

                if (quantity < 1) {
                    // Eğer miktar 0'a düşerse, ürünü kaldır ve son kaldırılanlar listesine ekle
                    get().removeItem(id);
                    return;
                }

                const updatedItems = items.map(item =>
                    item.id === id ? { ...item, quantity } : item
                );

                set({ items: updatedItems });
                // Kullanıcı giriş yapmışsa veritabanına senkronize et
                authHelpers.getUser().then(({ user }) => {
                    if (user) {
                        get().syncWithDatabase(user.id);
                    }
                });
            },

            clearCart: () => {
                set({ items: [] });
                // Kullanıcı giriş yapmışsa veritabanına senkronize et
                authHelpers.getUser().then(({ user }) => {
                    if (user) {
                        get().syncWithDatabase(user.id);
                    }
                });
            },

            totalItems: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            totalPrice: () => {
                const { items } = get();
                return items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            clearRecentlyRemoved: () => {
                set({ recentlyRemovedItems: [] });
            },

            // Sepet verilerini veritabanına senkronize et
            syncWithDatabase: async (userId: string) => {
                if (!userId) return;

                try {
                    const supabase = createClientComponentClient();
                    const { items, recentlyRemovedItems } = get();

                    // Önce mevcut sepet verilerini kontrol et
                    const { data: existingCart, error: fetchError } = await supabase
                        .from('user_cart')
                        .select('id')
                        .eq('user_id', userId)
                        .limit(1);

                    if (fetchError) {
                    }

                    if (existingCart && existingCart.length > 0) {
                        // Mevcut kayıt varsa güncelle
                        const { error: updateError } = await supabase
                            .from('user_cart')
                            .update({
                                cart_items: items,
                                recently_removed_items: recentlyRemovedItems,
                                updated_at: new Date().toISOString()
                            })
                            .eq('user_id', userId);

                        if (updateError) {
                            return;
                        }
                    } else {
                        // Kayıt yoksa yeni kayıt oluştur
                        const { error: insertError } = await supabase
                            .from('user_cart')
                            .insert({
                                user_id: userId,
                                cart_items: items,
                                recently_removed_items: recentlyRemovedItems,
                                updated_at: new Date().toISOString()
                            });

                        if (insertError) {
                            return;
                        }
                    }

                } catch (error) {
                }
            },

            // Veritabanından sepet verilerini yükle
            loadFromDatabase: async (userId: string) => {
                if (!userId) return;

                try {
                    const supabase = createClientComponentClient();

                    const { data, error } = await supabase
                        .from('user_cart')
                        .select('*')
                        .eq('user_id', userId)
                        .limit(1);

                    if (error) {
                        return;
                    }

                    // Veri varsa ilk kaydı kullan, yoksa boş sepet döndür
                    if (data && data.length > 0) {
                        // Veritabanındaki sepet verilerini yükle
                        set({
                            items: (data[0].cart_items as CartItem[]) || [],
                            recentlyRemovedItems: (data[0].recently_removed_items as RecentlyRemovedItem[]) || []
                        });
                    } else {
                    }
                } catch (error) {
                }
            }
        }),
        {
            name: 'cart-storage', // name of the item in localStorage
            skipHydration: true, // Skip automatic hydration, we'll handle it manually
        }
    )
); 