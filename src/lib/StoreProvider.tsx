"use client";

import { useRef, useEffect } from "react";
import { useCartStore } from "./store";
import { toast, Toaster } from "react-hot-toast";
import { createClientComponentClient } from "./supabase";

// This component handles store hydration on the client side
// without causing hydration mismatches
export function StoreInitializer() {
    const initialized = useRef(false);
    const supabase = createClientComponentClient();

    useEffect(() => {
        if (!initialized.current && typeof window !== "undefined") {
            // Access the store to trigger hydration only on client side
            useCartStore.persist.rehydrate();
            initialized.current = true;

            // Kullanıcı giriş yapmışsa sepet verilerini veritabanından yükle
            const loadCartFromDatabase = async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await useCartStore.getState().loadFromDatabase(user.id);
                    }
                } catch (error) {
                }
            };

            loadCartFromDatabase();
        }
    }, []);

    // Kullanıcı oturumu değiştiğinde sepet verilerini senkronize et
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Kullanıcı giriş yaptığında veya çıkış yaptığında tetiklenir
            const { data: authChangeHandler } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    // Kullanıcı giriş yaptığında veritabanından sepet verilerini yükle
                    try {
                        await useCartStore.getState().loadFromDatabase(session.user.id);
                    } catch (error) {
                    }
                } else if (event === 'SIGNED_OUT') {
                    // Kullanıcı çıkış yaptığında sadece localStorage'dan yükle
                    useCartStore.persist.rehydrate();
                }
            });

            // Cleanup
            return () => {
                authChangeHandler?.subscription?.unsubscribe();
            };
        }
    }, []);

    return null;
}

// This component provides toast notifications for the store actions
export function ToastHandler() {
    // Add toast notifications for cart actions here
    return <Toaster position="top-right" />;
}

// Combine both into a single provider to use in layout
export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <StoreInitializer />
            <ToastHandler />
        </>
    );
}
