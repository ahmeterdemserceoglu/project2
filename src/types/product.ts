export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  primary_image_url?: string | null;
  category_name?: string;
  category_id?: string;
  is_featured?: boolean;
  average_rating?: number;
  review_count?: number;
  images?: Array<{
    id: string;
    image_url: string;
    alt_text?: string | null;
    is_primary?: boolean | null;
  }>;
  variants?: Array<{
    id: string;
    price: number;
    stock: number;
  }>;
}