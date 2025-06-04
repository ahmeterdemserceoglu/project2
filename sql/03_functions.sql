-- HDTicaret.com Database Functions and API
-- This file contains PostgreSQL functions and security policies for Supabase API

-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For better search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search

-- Kullanıcı kaydı sonrası profiles tablosuna otomatik kayıt oluşturan fonksiyon ve trigger
CREATE OR REPLACE FUNCTION create_profile_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at, is_email_verified)
    VALUES (NEW.id, NEW.email, NOW(), NOW(), FALSE);
    
    -- Loglama için audit tablosu veya özel bir log tablosu ekleyin
    INSERT INTO public.debug_logs (operation, status, details)
    VALUES ('create_profile_from_auth', 'success', json_build_object('user_id', NEW.id, 'email', NEW.email));
    
  EXCEPTION WHEN OTHERS THEN
    -- Hata detayını kaydet
    INSERT INTO public.debug_logs (operation, status, details, error_code, error_message)
    VALUES (
      'create_profile_from_auth', 
      'error', 
      json_build_object('user_id', NEW.id, 'email', NEW.email),
      SQLSTATE,
      SQLERRM
    );
    
    -- Hatayı yeniden fırlat (trigger çalışmasını durdurur - dikkatli kullanın)
    -- RAISE;
    
    -- Veya hatayı sessizce geçin ve yolunuza devam edin (varsayılan olarak kullanmayın)
    RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni bir kullanıcı auth tablosuna eklendiğinde trigger çalışır
DROP TRIGGER IF EXISTS create_profile_after_auth_insert ON auth.users;
CREATE OR REPLACE TRIGGER create_profile_after_auth_insert
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_from_auth();

-- Email doğrulandığında is_email_verified alanını güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_email_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Email doğrulandığında profil tablosunu güncelle
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET is_email_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Email doğrulaması yapıldığında trigger çalışır
DROP TRIGGER IF EXISTS update_email_verification ON auth.users;
CREATE OR REPLACE TRIGGER update_email_verification
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION update_email_verification_status();

-- SECURITY POLICIES
-- We need to set up Row Level Security (RLS) for tables to secure the API

-- Setup RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcının admin olup olmadığını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS profiles_read_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_read_all ON profiles;
DROP POLICY IF EXISTS profiles_admin_all ON profiles;

-- Users can read their own profile
CREATE POLICY profiles_read_own ON profiles
  FOR SELECT USING (auth.uid() = id);
  
-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
-- Admin users can read and modify all profiles - using secure function
CREATE POLICY profiles_admin_all ON profiles
  USING (is_admin());

-- Setup RLS for addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS addresses_read_own ON addresses;
DROP POLICY IF EXISTS addresses_update_own ON addresses;
DROP POLICY IF EXISTS addresses_insert_own ON addresses;
DROP POLICY IF EXISTS addresses_delete_own ON addresses;
DROP POLICY IF EXISTS addresses_all_admin ON addresses;

-- Users can read, update their own addresses
CREATE POLICY addresses_read_own ON addresses
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY addresses_update_own ON addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY addresses_insert_own ON addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY addresses_delete_own ON addresses
  FOR DELETE USING (user_id = auth.uid());
  
-- Admins can access all addresses
CREATE POLICY addresses_all_admin ON addresses
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Setup RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS products_read_all ON products;
DROP POLICY IF EXISTS products_admin_all ON products;

-- Everyone can read active products
CREATE POLICY products_read_all ON products
  FOR SELECT USING (is_active = true);

-- Admins can do anything with products
CREATE POLICY products_admin_all ON products
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Similar policies for other tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS categories_read_all ON categories;
DROP POLICY IF EXISTS product_images_read_all ON product_images;
DROP POLICY IF EXISTS product_attributes_read_all ON product_attributes;
DROP POLICY IF EXISTS product_reviews_read_approved ON product_reviews;
DROP POLICY IF EXISTS product_reviews_insert ON product_reviews;
DROP POLICY IF EXISTS orders_read_own ON orders;
DROP POLICY IF EXISTS orders_insert_own ON orders;
DROP POLICY IF EXISTS orders_admin_all ON orders;
DROP POLICY IF EXISTS order_items_read_own ON order_items;
DROP POLICY IF EXISTS discounts_read_all ON discounts;

-- Public read access for categories
CREATE POLICY categories_read_all ON categories
  FOR SELECT USING (is_active = true);

-- Public read access for product images
CREATE POLICY product_images_read_all ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id AND products.is_active = true
    )
  );

-- Public read access for product attributes
CREATE POLICY product_attributes_read_all ON product_attributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_attributes.product_id AND products.is_active = true
    )
  );

-- Read policies for reviews that are approved
CREATE POLICY product_reviews_read_approved ON product_reviews
  FOR SELECT USING (is_approved = true);

-- Users can create reviews for products they've purchased
CREATE POLICY product_reviews_insert ON product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM orders
      JOIN order_items ON orders.id = order_items.order_id
      WHERE orders.user_id = auth.uid() AND order_items.product_id = product_reviews.product_id
    )
  );

-- Users can read their own orders
CREATE POLICY orders_read_own ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert orders for themselves
CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin users have full access to orders
CREATE POLICY orders_admin_all ON orders
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Order items policies follow the order policies
CREATE POLICY order_items_read_own ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Discounts visible to all
CREATE POLICY discounts_read_all ON discounts
  FOR SELECT USING (is_active = true);


-- FUNCTIONS

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM products p
  WHERE 
    p.is_active = true AND
    (
      p.name ILIKE '%' || search_term || '%' OR
      p.description ILIKE '%' || search_term || '%' OR
      EXISTS (
        SELECT 1 FROM categories c
        WHERE c.id = p.category_id AND c.name ILIKE '%' || search_term || '%'
      )
    )
  ORDER BY 
    CASE WHEN p.name ILIKE search_term || '%' THEN 0
         WHEN p.name ILIKE '%' || search_term || '%' THEN 1
         ELSE 2
    END,
    p.is_featured DESC,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product details with related data
CREATE OR REPLACE FUNCTION get_product_details(product_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  sku TEXT,
  description TEXT,
  base_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  stock_quantity INTEGER,
  category_id UUID,
  category_name TEXT,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  primary_image_url TEXT,
  images JSONB,
  attributes JSONB,
  reviews JSONB,
  average_rating NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.sku,
    p.description,
    p.base_price,
    p.sale_price,
    p.stock_quantity,
    p.category_id,
    c.name as category_name,
    p.is_featured,
    p.is_active,
    p.primary_image_url,
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'url', pi.image_url,
          'alt_text', pi.alt_text,
          'is_primary', pi.is_primary,
          'display_order', pi.display_order
        )
        ORDER BY pi.is_primary DESC, pi.display_order ASC
      ), '[]'::jsonb)
      FROM product_images pi
      WHERE pi.product_id = p.id
    ) as images,
    (
      SELECT COALESCE(jsonb_object_agg(
        pa.attribute_name,
        jsonb_agg(pa.attribute_value)
      ), '{}'::jsonb)
      FROM (
        SELECT DISTINCT attribute_name, attribute_value
        FROM product_attributes
        WHERE product_id = p.id
      ) pa
      GROUP BY pa.attribute_name
    ) as attributes,
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pr.id,
          'user_id', pr.user_id,
          'user_name', CONCAT(profiles.first_name, ' ', profiles.last_name),
          'rating', pr.rating,
          'comment', pr.comment,
          'created_at', pr.created_at
        )
        ORDER BY pr.created_at DESC
      ), '[]'::jsonb)
      FROM product_reviews pr
      JOIN profiles ON pr.user_id = profiles.id
      WHERE pr.product_id = p.id AND pr.is_approved = true
    ) as reviews,
    (
      SELECT COALESCE(AVG(pr.rating), 0)
      FROM product_reviews pr
      WHERE pr.product_id = p.id AND pr.is_approved = true
    ) as average_rating,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.slug = product_slug AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new order
CREATE OR REPLACE FUNCTION create_order(
  user_id UUID,
  shipping_address_id UUID,
  billing_address_id UUID,
  items JSONB,
  payment_method TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  total_amount DECIMAL(10, 2)
) AS $$
DECLARE
  new_order_id UUID;
  new_order_number TEXT;
  total DECIMAL(10, 2) := 0;
  shipping_cost DECIMAL(10, 2) := 0;
  tax_amount DECIMAL(10, 2) := 0;
  item_record RECORD;
  product_record RECORD;
  tax_rate DECIMAL(10, 2);
BEGIN
  -- Generate a new order number (format: HD-YEAR-SEQUENCE)
  new_order_number := 'HD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                     LPAD(CAST(NEXTVAL('order_number_seq') AS TEXT), 6, '0');
  
  -- Get the default tax rate from settings
  SELECT CAST(value->>'default_rate' AS DECIMAL(10, 2))
  INTO tax_rate
  FROM settings
  WHERE id = 'tax_rates';
  
  -- Calculate shipping cost based on settings
  SELECT CAST(s.value->'shipping_methods'->>'free_shipping_threshold' AS DECIMAL(10, 2))
  INTO shipping_cost
  FROM settings s
  WHERE id = 'site_info';
  
  -- Calculate order total and create order items
  FOR item_record IN SELECT * FROM jsonb_array_elements(items) LOOP
    -- Get product info
    SELECT p.* INTO product_record
    FROM products p
    WHERE p.id = (item_record->>'product_id')::UUID;
    
    -- Calculate item total
    total := total + COALESCE(product_record.sale_price, product_record.base_price) * (item_record->>'quantity')::INTEGER;
  END LOOP;
  
  -- Check if free shipping applies
  IF total >= shipping_cost THEN
    shipping_cost := 0;
  ELSE
    shipping_cost := 29.90; -- Default shipping cost
  END IF;
  
  -- Calculate tax
  tax_amount := (total * tax_rate) / 100;
  
  -- Create the order record
  INSERT INTO orders (
    id,
    user_id,
    order_number,
    status,
    total_amount,
    shipping_amount,
    tax_amount,
    shipping_address_id,
    billing_address_id,
    payment_method,
    payment_status,
    notes
  )
  VALUES (
    uuid_generate_v4(),
    user_id,
    new_order_number,
    'pending',
    total + shipping_cost + tax_amount,
    shipping_cost,
    tax_amount,
    shipping_address_id,
    billing_address_id,
    payment_method,
    'pending',
    notes
  )
  RETURNING id INTO new_order_id;
  
  -- Create order history entry
  INSERT INTO order_history (order_id, status, comment, created_by)
  VALUES (new_order_id, 'pending', 'Sipariş alındı', user_id);
  
  -- Create order items
  FOR item_record IN SELECT * FROM jsonb_array_elements(items) LOOP
    -- Get product info again
    SELECT p.* INTO product_record
    FROM products p
    WHERE p.id = (item_record->>'product_id')::UUID;
    
    -- Insert order item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      attributes
    )
    VALUES (
      new_order_id,
      product_record.id,
      product_record.name,
      (item_record->>'quantity')::INTEGER,
      COALESCE(product_record.sale_price, product_record.base_price),
      item_record->'attributes'
    );
  END LOOP;
  
  -- Return the order details
  RETURN QUERY
  SELECT 
    new_order_id,
    new_order_number,
    total + shipping_cost + tax_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Helper function to register user and create profile
CREATE OR REPLACE FUNCTION register_user_with_profile(
  user_email TEXT,
  first_name TEXT,
  last_name TEXT
)
RETURNS TABLE (
  user_id UUID,
  status TEXT,
  message TEXT
) AS $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
  result_message TEXT;
BEGIN
  -- Check if email already exists in profiles
  SELECT id INTO existing_user_id 
  FROM profiles 
  WHERE email = user_email;
  
  IF existing_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      existing_user_id, 
      'error'::TEXT, 
      'Email already exists'::TEXT;
    RETURN;
  END IF;
  
  -- Let auth handle the actual user creation via trigger
  -- We're just creating a placeholder here
  BEGIN
    -- Insert user profile directly
    INSERT INTO profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      created_at, 
      updated_at, 
      is_admin,
      is_email_verified
    )
    VALUES (
      gen_random_uuid(), -- Generate a UUID for the user
      user_email,
      first_name,
      last_name,
      NOW(),
      NOW(),
      FALSE,
      FALSE
    )
    RETURNING id INTO new_user_id;
    
    result_message := 'User registered successfully';
    
    -- Log successful operation
    INSERT INTO debug_logs (operation, status, details)
    VALUES (
      'register_user_with_profile', 
      'success', 
      json_build_object('user_id', new_user_id, 'email', user_email)
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error details
    INSERT INTO debug_logs (
      operation, 
      status, 
      details, 
      error_code, 
      error_message
    )
    VALUES (
      'register_user_with_profile', 
      'error', 
      json_build_object('email', user_email, 'first_name', first_name, 'last_name', last_name),
      SQLSTATE,
      SQLERRM
    );
    
    -- Return error information
    RETURN QUERY
    SELECT 
      NULL::UUID, 
      'error'::TEXT, 
      'Database error: ' || SQLERRM;
    RETURN;
  END;
  
  -- Return success response
  RETURN QUERY
  SELECT 
    new_user_id, 
    'success'::TEXT, 
    result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  order_id UUID,
  new_status TEXT,
  comment TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user is admin
  SELECT p.is_admin INTO is_admin
  FROM profiles p
  WHERE p.id = user_id;
  
  -- Only admins can update order status
  IF NOT is_admin THEN
    RETURN FALSE;
  END IF;
  
  -- Update order status
  UPDATE orders
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = order_id;
  
  -- Add history entry
  INSERT INTO order_history (order_id, status, comment, created_by)
  VALUES (order_id, new_status, comment, user_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 