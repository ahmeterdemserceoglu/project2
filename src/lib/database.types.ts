export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string | null
          city: string
          country: string
          created_at: string | null
          full_name: string | null
          id: string
          is_default: boolean | null
          phone: string | null
          postal_code: string
          state: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string | null
          city: string
          country?: string
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code: string
          state?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string | null
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string
          state?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_value: string
          name: string
          created_at: string
          expires_at: string | null
          last_used_at: string | null
          is_active: boolean
          permissions: Json
        }
        Insert: {
          id?: string
          user_id: string
          key_value: string
          name: string
          created_at?: string
          expires_at?: string | null
          last_used_at?: string | null
          is_active?: boolean
          permissions?: Json
        }
        Update: {
          id?: string
          user_id?: string
          key_value?: string
          name?: string
          created_at?: string
          expires_at?: string | null
          last_used_at?: string | null
          is_active?: boolean
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_operations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          operation_id: number
          operation_type: string
          parameters: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          operation_id: number
          operation_type: string
          parameters?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          operation_id?: number
          operation_type?: string
          parameters?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_operations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          error_code: string | null
          error_message: string | null
          id: string
          operation: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          operation: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          operation?: string
          status?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          minimum_purchase_amount: number | null
          starts_at: string | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_purchase_amount?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_purchase_amount?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      flash_deals: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number
          end_time: string
          id: string
          is_active: boolean | null
          product_id: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent: number
          end_time: string
          id?: string
          is_active?: boolean | null
          product_id: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          product_id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flash_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by: string | null
          id: string
          order_id: string | null
          status: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_id?: string | null
          status: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address_id: string | null
          shipping_amount: number | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          attribute_name: string
          attribute_value: string
          created_at: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string | null
          storage_path: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
          storage_path?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          product_id: string | null
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          stock: number
          created_at: string | null
          updated_at: string | null
          sku: string | null
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          stock: number
          created_at?: string | null
          updated_at?: string | null
          sku?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          stock?: number
          created_at?: string | null
          updated_at?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          primary_image_url: string | null
          sale_price: number | null
          sku: string | null
          slug: string
          sold_count: number | null
          stock_quantity: number | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          primary_image_url?: string | null
          sale_price?: number | null
          sku?: string | null
          slug: string
          sold_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          primary_image_url?: string | null
          sale_price?: number | null
          sku?: string | null
          slug?: string
          sold_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["product_id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_email_verified: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_email_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_email_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      recently_viewed_products: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      token_blacklist: {
        Row: {
          id: string
          token_jti: string
          user_id: string
          expires_at: string
          reason: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          token_jti: string
          user_id: string
          expires_at: string
          reason?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          token_jti?: string
          user_id?: string
          expires_at?: string
          reason?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_blacklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_cart: {
        Row: {
          cart_items: Json
          created_at: string
          id: string
          recently_removed_items: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cart_items?: Json
          created_at?: string
          id?: string
          recently_removed_items?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cart_items?: Json
          created_at?: string
          id?: string
          recently_removed_items?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_auth: {
        Row: {
          id: string
          user_id: string
          secret: string
          is_enabled: boolean | null
          backup_codes: Json | null
          last_used_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          secret: string
          is_enabled?: boolean | null
          backup_codes?: Json | null
          last_used_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          secret?: string
          is_enabled?: boolean | null
          backup_codes?: Json | null
          last_used_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "two_factor_auth_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tax_payments: {
        Row: {
          id: string
          month: number
          year: number
          payment_date: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          month: number
          year: number
          payment_date?: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          month?: number
          year?: number
          payment_date?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          id: string
          user_id: string
          store_name: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          contact_email: string
          contact_phone: string | null
          address: Json | null
          social_media: Json | null
          is_approved: boolean
          approval_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_name: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          contact_email: string
          contact_phone?: string | null
          address?: Json | null
          social_media?: Json | null
          is_approved?: boolean
          approval_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          contact_email?: string
          contact_phone?: string | null
          address?: Json | null
          social_media?: Json | null
          is_approved?: boolean
          approval_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      special_collections: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          image_url: string | null
          badge: string | null
          badge_color: string | null
          icon_name: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          image_url?: string | null
          badge?: string | null
          badge_color?: string | null
          icon_name?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          image_url?: string | null
          badge?: string | null
          badge_color?: string | null
          icon_name?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_flash_deal: {
        Args: {
          p_product_id: string
          p_title: string
          p_description: string
          p_discount_percent: number
          p_start_time: string
          p_end_time: string
          p_is_active?: boolean
        }
        Returns: string
      }
      admin_bulk_update_product_prices: {
        Args: {
          category_id: string
          adjustment_type: string
          adjustment_value: number
        }
        Returns: Json
      }
      admin_confirm_user_email: {
        Args: { input_user_id: string }
        Returns: boolean
      }
      admin_create_product: {
        Args: {
          product_name: string
          product_slug: string
          product_sku: string
          product_description: string
          product_base_price: number
          product_sale_price: number
          product_stock_quantity: number
          product_category_id: string
          product_is_active: boolean
          product_is_featured: boolean
        }
        Returns: string
      }
      admin_create_category: {
        Args: {
          p_name: string
          p_slug: string
          p_description: string | null
          p_parent_category_id: string | null
          p_image_url: string | null
          p_sort_order: number | null
        }
        Returns: string
      }
      admin_insert_product_image: {
        Args: {
          product_id_param: string
          image_url_param: string
          is_primary_param: boolean
          display_order_param: number
          alt_text_param: string
        }
        Returns: string
      }
      admin_update_product: {
        Args: {
          product_id: string
          product_name: string
          product_slug: string
          product_sku: string
          product_description: string
          product_base_price: number
          product_sale_price: number
          product_stock_quantity: number
          product_category_id: string
          product_is_active: boolean
          product_is_featured: boolean
        }
        Returns: boolean
      }
      cleanup_expired_verifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_user_cart: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_order: {
        Args: {
          user_id: string
          shipping_address_id: string
          billing_address_id: string
          items: Json
          payment_method: string
          notes?: string
        }
        Returns: {
          order_id: string
          order_number: string
          total_amount: number
        }[]
      }
      generate_unique_product_sku: {
        Args: { base_sku: string }
        Returns: string
      }
      generate_unique_product_slug: {
        Args: { base_slug: string }
        Returns: string
      }
      get_active_flash_deals: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          product_id: string
          title: string
          description: string
          discount_percent: number
          start_time: string
          end_time: string
          remaining_seconds: number
          product_name: string
          product_slug: string
          base_price: number
          sale_price: number
          primary_image_url: string
        }[]
      }
      get_active_flash_deals_safe: {
        Args: { limit_count: number }
        Returns: Json
      }
      get_admin_customer_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_dashboard_stats: {
        Args: { period?: string }
        Returns: Json
      }
      get_admin_low_stock_products: {
        Args: { threshold?: number }
        Returns: {
          id: string
          name: string
          sku: string
          stock_quantity: number
          category_name: string
          base_price: number
          status: string
        }[]
      }
      get_admin_recent_orders: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          order_number: string
          customer_name: string
          status: string
          total_amount: number
          created_at: string
        }[]
      }
      get_admin_sales_by_category: {
        Args: { period?: string }
        Returns: {
          category_id: string
          category_name: string
          total_sales: number
          percentage: number
        }[]
      }
      get_admin_sales_by_period: {
        Args: { period?: string; start_date?: string; end_date?: string }
        Returns: {
          date_label: string
          total_sales: number
          order_count: number
        }[]
      }
      get_admin_top_products: {
        Args: { period?: string; limit_count?: number }
        Returns: {
          id: string
          name: string
          category_name: string
          units_sold: number
          total_revenue: number
          average_price: number
          stock_quantity: number
        }[]
      }
      get_auth_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_product_details: {
        Args: { product_slug: string }
        Returns: {
          id: string
          name: string
          slug: string
          sku: string
          description: string
          base_price: number
          sale_price: number
          stock_quantity: number
          category_id: string
          category_name: string
          is_featured: boolean
          is_active: boolean
          primary_image_url: string
          images: Json
          attributes: Json
          reviews: Json
          average_rating: number
          created_at: string
          updated_at: string
        }[]
      }
      get_token_by_email_and_token: {
        Args: { email_param: string; token_param: string }
        Returns: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          user_id: string | null
        }[]
      }
      get_trending_products: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          name: string
          slug: string
          base_price: number
          sale_price: number
          primary_image_url: string
          sold_count: number
          category_name: string
        }[]
      }
      get_user_cart: {
        Args: { p_user_id: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_email_verified: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      register_user_with_profile: {
        Args: { user_email: string; first_name: string; last_name: string }
        Returns: undefined
      }
      search_products: {
        Args: { search_term: string }
        Returns: {
          base_price: number
          category_id: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          primary_image_url: string | null
          sale_price: number | null
          sku: string | null
          slug: string
          sold_count: number | null
          stock_quantity: number | null
          updated_at: string | null
          weight_grams: number | null
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      toggle_favorite: {
        Args: { p_product_id: string }
        Returns: boolean
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_order_status: {
        Args: { order_id: string; new_status: string; comment?: string }
        Returns: boolean
      }
      update_user_cart: {
        Args: {
          p_user_id: string
          p_cart_items: Json
          p_recently_removed_items?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      day_enum:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday"
      license_type: "trial" | "monthly" | "yearly" | "lifetime" | "standard"
      notification_type: "info" | "warning" | "error"
      user_role: "user" | "premium" | "admin" | "superAdmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

