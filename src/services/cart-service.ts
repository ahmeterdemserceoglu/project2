import { createClient } from '@/lib/supabase/client';
import type { CartItem, RecentlyRemovedItem } from '@/lib/store';

export class CartService {
  private supabase = createClient();

  async syncToDatabase(userId: string, items: CartItem[], recentlyRemoved: RecentlyRemovedItem[]) {
    try {
      const { data: existingCart } = await this.supabase
        .from('user_cart')
        .select('id')
        .eq('user_id', userId)
        .single();

      const cartData = {
        user_id: userId,
        cart_items: items,
        recently_removed_items: recentlyRemoved,
        updated_at: new Date().toISOString()
      };

      if (existingCart) {
        const { error } = await this.supabase
          .from('user_cart')
          .update(cartData)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await this.supabase
          .from('user_cart')
          .insert(cartData);
        
        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
     
      return { success: false, error };
    }
  }

  async loadFromDatabase(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_cart')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          items: (data?.cart_items as CartItem[]) || [],
          recentlyRemoved: (data?.recently_removed_items as RecentlyRemovedItem[]) || []
        }
      };
    } catch (error) {
      
      return { success: false, error, data: { items: [], recentlyRemoved: [] } };
    }
  }

  async clearCart(userId: string) {
    try {
      const { error } = await this.supabase
        .from('user_cart')
        .update({
          cart_items: [],
          recently_removed_items: [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
    
      return { success: false, error };
    }
  }
}

export const cartService = new CartService();