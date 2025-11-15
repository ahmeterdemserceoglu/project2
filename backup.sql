

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."day_enum" AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


ALTER TYPE "public"."day_enum" OWNER TO "postgres";


CREATE TYPE "public"."license_type" AS ENUM (
    'trial',
    'monthly',
    'yearly',
    'lifetime',
    'standard'
);


ALTER TYPE "public"."license_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'info',
    'warning',
    'error'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'premium',
    'admin',
    'superAdmin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_flash_deal"("p_product_id" "uuid", "p_title" character varying, "p_description" "text", "p_discount_percent" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_is_active" boolean DEFAULT true) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Validate inputs
  IF p_discount_percent <= 0 OR p_discount_percent > 99 THEN
    RAISE EXCEPTION 'Discount percent must be between 1 and 99';
  END IF;
  
  IF p_start_time >= p_end_time THEN
    RAISE EXCEPTION 'Start time must be before end time';
  END IF;
  
  -- Check if product exists and is active
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'Product does not exist or is not active';
  END IF;
  
  -- Insert new flash deal
  INSERT INTO flash_deals (
    product_id, 
    title, 
    description, 
    discount_percent, 
    start_time, 
    end_time, 
    is_active
  ) 
  VALUES (
    p_product_id, 
    p_title, 
    p_description, 
    p_discount_percent, 
    p_start_time, 
    p_end_time, 
    p_is_active
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;


ALTER FUNCTION "public"."add_flash_deal"("p_product_id" "uuid", "p_title" character varying, "p_description" "text", "p_discount_percent" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_bulk_update_product_prices"("category_id" "uuid", "adjustment_type" "text", "adjustment_value" numeric) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  affected_rows INTEGER;
  operation_id INTEGER;
BEGIN
  -- Generate operation ID
  SELECT nextval('bulk_operation_seq') INTO operation_id;
  
  -- Record the operation
  INSERT INTO admin_operations (
    operation_id,
    operation_type,
    parameters,
    created_by,
    created_at
  ) VALUES (
    operation_id,
    'bulk_price_update',
    jsonb_build_object(
      'category_id', category_id,
      'adjustment_type', adjustment_type,
      'adjustment_value', adjustment_value
    ),
    auth.uid(),
    NOW()
  );
  
  -- Perform the update based on adjustment type
  IF adjustment_type = 'percentage_increase' THEN
    UPDATE products 
    SET 
      base_price = base_price * (1 + adjustment_value / 100),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price * (1 + adjustment_value / 100)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'percentage_decrease' THEN
    UPDATE products 
    SET 
      base_price = base_price * (1 - adjustment_value / 100),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price * (1 - adjustment_value / 100)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'fixed_increase' THEN
    UPDATE products 
    SET 
      base_price = base_price + adjustment_value,
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price + adjustment_value
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'fixed_decrease' THEN
    UPDATE products 
    SET 
      base_price = GREATEST(base_price - adjustment_value, 0),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN GREATEST(sale_price - adjustment_value, 0)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'set_discount_percentage' THEN
    UPDATE products 
    SET 
      sale_price = ROUND(base_price * (1 - adjustment_value / 100), 2),
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  END IF;
  
  -- Get number of affected rows
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Return the result
  RETURN jsonb_build_object(
    'operation_id', operation_id,
    'affected_rows', affected_rows,
    'status', 'success'
  );
END;
$$;


ALTER FUNCTION "public"."admin_bulk_update_product_prices"("category_id" "uuid", "adjustment_type" "text", "adjustment_value" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_confirm_user_email"("input_user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result json;
BEGIN
    -- This function can be called by service role to confirm user email
    -- Update auth.users table to mark email as confirmed
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = input_user_id;
    
    -- Return success result
    SELECT json_build_object(
        'success', true,
        'user_id', input_user_id,
        'confirmed_at', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."admin_confirm_user_email"("input_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_parent_category_id" "uuid", "p_image_url" "text", "p_sort_order" integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_category_id UUID;
BEGIN
  -- Ensure user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only admin users can call this function.';
  END IF;

  INSERT INTO categories (
    name,
    slug,
    description,
    parent_category_id,
    image_url,
    sort_order,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_slug,
    NULLIF(p_description, ''),
    p_parent_category_id,
    NULLIF(p_image_url, ''),
    COALESCE(p_sort_order, 0),
    NOW(),
    NOW()
  )
  RETURNING id INTO new_category_id;

  RETURN new_category_id;
END;
$$;


ALTER FUNCTION "public"."admin_create_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_parent_category_id" "uuid", "p_image_url" "text", "p_sort_order" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean, "product_tags" "text"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_product_id uuid;
BEGIN
  -- DÜZELTİLMİŞ admin kontrolü (is_admin = true kontrolü).
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Only admin users can create products';
  END IF;

  -- Ürünü 'tags' sütununu da içerecek şekilde ekle.
  INSERT INTO public.products (name, slug, sku, description, base_price, stock_quantity, category_id, is_active, is_featured, tags)
  VALUES (product_name, product_slug, product_sku, product_description, product_base_price, product_stock_quantity, product_category_id, product_is_active, product_is_featured, product_tags)
  RETURNING id INTO new_product_id;

  RETURN new_product_id;
END;
$$;


ALTER FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean, "product_tags" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  unique_slug TEXT;
  unique_sku TEXT;
  new_product_id UUID;
BEGIN
  -- Ensure user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only admin users can call this function.';
  END IF;

  -- Generate a unique slug
  unique_slug := generate_unique_product_slug(product_slug);
  
  -- Generate a unique SKU (if provided)
  IF product_sku IS NOT NULL THEN
    unique_sku := generate_unique_product_sku(product_sku);
  ELSE
    unique_sku := NULL;
  END IF;
  
  -- Insert the product with the unique slug and SKU
  INSERT INTO products (
    name,
    slug,
    sku,
    description,
    base_price,
    sale_price,
    stock_quantity,
    category_id,
    is_active,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    product_name,
    unique_slug,
    unique_sku,
    product_description,
    product_base_price,
    product_sale_price,
    product_stock_quantity,
    product_category_id,
    product_is_active,
    product_is_featured,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_product_id;

  RETURN new_product_id;
END;
$$;


ALTER FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_insert_product_image"("product_id_param" "uuid", "image_url_param" "text", "is_primary_param" boolean, "display_order_param" integer, "alt_text_param" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Ensure user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only admin users can call this function.';
  END IF;

  -- Insert the product image
  INSERT INTO product_images (
    product_id, 
    image_url, 
    is_primary, 
    display_order, 
    alt_text
  ) VALUES (
    product_id_param,
    image_url_param,
    is_primary_param,
    display_order_param,
    alt_text_param
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;


ALTER FUNCTION "public"."admin_insert_product_image"("product_id_param" "uuid", "image_url_param" "text", "is_primary_param" boolean, "display_order_param" integer, "alt_text_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_insert_product_variants"("variants_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO product_variants (product_id, attributes, price, stock_quantity, sku, image_url, is_default)
  SELECT 
    (value->>'product_id')::UUID,
    value->'attributes',
    (value->>'price')::NUMERIC,
    (value->>'stock_quantity')::INTEGER,
    value->>'sku',
    value->>'image_url',
    COALESCE((value->>'is_default')::BOOLEAN, FALSE)
  FROM jsonb_array_elements(variants_data);
END;
$$;


ALTER FUNCTION "public"."admin_insert_product_variants"("variants_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_product"("product_id" "uuid", "product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_slug TEXT;
  current_sku TEXT;
  unique_slug TEXT;
  unique_sku TEXT;
BEGIN
  -- Ensure user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Only admin users can call this function.';
  END IF;

  -- Get the current slug and SKU for this product
  SELECT slug, sku INTO current_slug, current_sku FROM products WHERE id = product_id;
  
  -- If the slug is changing, generate a unique one
  IF current_slug != product_slug THEN
    unique_slug := generate_unique_product_slug(product_slug);
  ELSE
    unique_slug := current_slug;
  END IF;
  
  -- If the SKU is changing, generate a unique one
  IF COALESCE(current_sku, '') != COALESCE(product_sku, '') THEN
    unique_sku := generate_unique_product_sku(product_sku);
  ELSE
    unique_sku := current_sku;
  END IF;
  
  -- Update the product with the unique slug and SKU
  UPDATE products SET
    name = product_name,
    slug = unique_slug,
    sku = unique_sku,
    description = product_description,
    base_price = product_base_price,
    sale_price = product_sale_price,
    stock_quantity = product_stock_quantity,
    category_id = product_category_id,
    is_active = product_is_active,
    is_featured = product_is_featured,
    updated_at = NOW()
  WHERE id = product_id;

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."admin_update_product"("product_id" "uuid", "product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."api_register_seller"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_store_name" "text", "p_description" "text" DEFAULT NULL::"text", "p_contact_email" "text" DEFAULT NULL::"text", "p_contact_phone" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_api_key TEXT;
    v_result JSONB;
BEGIN
    -- Create a new user
    v_user_id := auth.uid();
    
    IF v_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'User already authenticated';
    END IF;
    
    -- Create the user in auth.users
    v_user_id := (SELECT id FROM auth.users WHERE email = p_email);
    
    IF v_user_id IS NULL THEN
        -- User doesn't exist, create a new one
        v_user_id := extensions.uuid_generate_v4();
        
        INSERT INTO auth.users (
            id,
            email,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            p_email,
            jsonb_build_object('full_name', p_full_name),
            now(),
            now()
        );
        
        -- Set the user's password
        PERFORM auth.set_password(v_user_id, p_password);
    ELSE
        -- User exists, check if they already have a seller profile
        IF EXISTS (SELECT 1 FROM public.seller_profiles WHERE user_id = v_user_id) THEN
            RAISE EXCEPTION 'User already has a seller profile';
        END IF;
    END IF;
    
    -- Insert the new seller profile
    INSERT INTO public.seller_profiles (
        user_id, 
        store_name, 
        description, 
        contact_email, 
        contact_phone
    )
    VALUES (
        v_user_id, 
        p_store_name, 
        p_description, 
        COALESCE(p_contact_email, p_email), 
        p_contact_phone
    );
    
    -- Generate an API key for the seller
    v_api_key := public.generate_api_key();
    
    INSERT INTO public.api_keys (
        user_id,
        key,
        name
    )
    VALUES (
        v_user_id,
        v_api_key,
        'Default API Key'
    );
    
    -- Return the result
    v_result := jsonb_build_object(
        'user_id', v_user_id,
        'email', p_email,
        'store_name', p_store_name,
        'api_key', v_api_key,
        'message', 'Seller registered successfully'
    );
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."api_register_seller"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_product_submission"("submission_id" "uuid", "admin_id" "uuid", "commission" numeric DEFAULT 10.00, "notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  product_id UUID;
  submission_record public.seller_product_submissions;
BEGIN
  -- Get the submission record
  SELECT * INTO submission_record FROM public.seller_product_submissions 
  WHERE id = submission_id;
  
  -- Check if submission exists
  IF submission_record IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;
  
  -- Check if submission is already processed
  IF submission_record.status != 'pending' THEN
    RAISE EXCEPTION 'Submission already processed';
  END IF;
  
  -- Create a new product from the submission
  INSERT INTO public.products (
    name,
    description,
    category_id,
    base_price,
    sale_price,
    sku,
    stock_quantity,
    is_active,
    seller_id,
    commission_rate,
    images
  ) VALUES (
    submission_record.name,
    submission_record.description,
    submission_record.category_id,
    submission_record.base_price,
    submission_record.sale_price,
    submission_record.sku,
    submission_record.stock_quantity,
    true,
    submission_record.seller_id,
    commission,
    submission_record.images
  )
  RETURNING id INTO product_id;
  
  -- Update the submission status
  UPDATE public.seller_product_submissions SET
    status = 'approved',
    admin_notes = notes,
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = submission_id;
  
  RETURN product_id;
END;
$$;


ALTER FUNCTION "public"."approve_product_submission"("submission_id" "uuid", "admin_id" "uuid", "commission" numeric, "notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_email_verifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < NOW() AND verified = FALSE;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_email_verifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_verifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < NOW() 
    AND verified = false;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_verifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_user_cart"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.user_cart
  SET cart_items = '[]'::jsonb
  WHERE user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."clear_user_cart"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_api_key"("p_name" "text" DEFAULT 'Default API Key'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_key TEXT;
    v_result JSONB;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Generate a new API key
    v_key := public.generate_api_key();
    
    -- Insert the new API key
    INSERT INTO public.api_keys (user_id, key, name)
    VALUES (v_user_id, v_key, p_name)
    RETURNING jsonb_build_object(
        'id', id,
        'key', key,
        'name', name,
        'created_at', created_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."create_api_key"("p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order"("user_id" "uuid", "shipping_address_id" "uuid", "billing_address_id" "uuid", "items" "jsonb", "payment_method" "text", "notes" "text" DEFAULT NULL::"text") RETURNS TABLE("order_id" "uuid", "order_number" "text", "total_amount" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_order"("user_id" "uuid", "shipping_address_id" "uuid", "billing_address_id" "uuid", "items" "jsonb", "payment_method" "text", "notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_from_auth"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_profile_from_auth"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrease_product_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."decrease_product_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_category_image"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  image_url text;
  image_path text;
BEGIN
  -- Kategori image_url'den dosya adını çıkar
  image_url := OLD.image_url;
  
  IF image_url IS NOT NULL THEN
    -- URL'den dosya yolunu çıkar
    -- Örnek: https://xxxx.supabase.co/storage/v1/object/public/category_images/xyz.jpg -> xyz.jpg
    image_path := substring(image_url from '([^/]+)$');
    
    IF image_path IS NOT NULL THEN
      DELETE FROM storage.objects
      WHERE bucket_id = 'category_images' AND name = image_path;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$_$;


ALTER FUNCTION "public"."delete_category_image"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_product_images"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  image_path text;
  product_image_paths text[];
BEGIN
  -- Önce product_images tablosundaki resimleri al
  SELECT array_agg(storage_path) INTO product_image_paths
  FROM product_images
  WHERE product_id = OLD.id;
  
  -- Eğer resim varsa, her bir resmi storage'dan sil
  IF product_image_paths IS NOT NULL THEN
    FOREACH image_path IN ARRAY product_image_paths
    LOOP
      DELETE FROM storage.objects
      WHERE bucket_id = 'product_images' AND name = image_path;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_product_images"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_default_variant"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE product_variants
    SET is_default = FALSE
    WHERE product_id = NEW.product_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_default_variant"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE 
  user_email text;
  log_column_name TEXT;
BEGIN
  -- Get email from the inserted auth.user record
  user_email := NEW.email;
  
  -- Try to find existing profile for this user
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Create a new profile if it doesn't exist
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
      is_admin,
      is_email_verified,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      false,
      false,
      NOW(),
      NOW()
    );
    
    -- Check which column name exists in debug_logs
    SELECT column_name INTO log_column_name
    FROM information_schema.columns 
    WHERE table_name = 'debug_logs' 
    AND column_name IN ('event_type', 'operation')
    LIMIT 1;
    
    -- Log profile creation based on table structure
    IF log_column_name = 'event_type' THEN
      INSERT INTO debug_logs (
        event_type,
        details,
        created_at
      ) VALUES (
        'profile_created_by_trigger',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', user_email
        ),
        NOW()
      );
    ELSE 
      -- Assume operation column exists
      INSERT INTO debug_logs (
        operation,
        status,
        details,
        created_at
      ) VALUES (
        'profile_created_by_trigger',
        'success',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', user_email
        ),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_api_key"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_key TEXT;
    key_exists BOOLEAN;
BEGIN
    -- Generate a secure random key of 48 characters
    LOOP
        v_key := encode(gen_random_bytes(36), 'base64');
        -- Replace non-alphanumeric characters for URL safety
        v_key := replace(replace(replace(v_key, '/', '_'), '+', '-'), '=', '');
        
        -- Check if this key already exists
        SELECT EXISTS (
            SELECT 1 FROM public.api_keys WHERE key = v_key
        ) INTO key_exists;
        
        EXIT WHEN NOT key_exists;
    END LOOP;
    
    RETURN v_key;
END;
$$;


ALTER FUNCTION "public"."generate_api_key"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_product_sku"("base_sku" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_sku TEXT;
  counter INTEGER := 0;
  is_unique BOOLEAN := FALSE;
BEGIN
  -- If base_sku is null, return null (SKU is optional)
  IF base_sku IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Start with the base SKU
  new_sku := base_sku;
  
  -- Keep trying until we find a unique SKU
  WHILE NOT is_unique LOOP
    -- Check if the SKU exists
    SELECT COUNT(*) = 0 INTO is_unique FROM products WHERE sku = new_sku;
    
    -- If not unique, add a counter suffix and try again
    IF NOT is_unique THEN
      counter := counter + 1;
      new_sku := base_sku || '-' || counter::text;
    END IF;
    
    -- Safety check to avoid infinite loops
    IF counter > 1000 THEN
      -- Append timestamp as a last resort
      new_sku := base_sku || '-' || EXTRACT(EPOCH FROM NOW())::text;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_sku;
END;
$$;


ALTER FUNCTION "public"."generate_unique_product_sku"("base_sku" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_product_slug"("base_slug" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
  is_unique BOOLEAN := FALSE;
BEGIN
  -- Start with the base slug
  new_slug := base_slug;
  
  -- Keep trying until we find a unique slug
  WHILE NOT is_unique LOOP
    -- Check if the slug exists
    SELECT COUNT(*) = 0 INTO is_unique FROM products WHERE slug = new_slug;
    
    -- If not unique, add a counter suffix and try again
    IF NOT is_unique THEN
      counter := counter + 1;
      new_slug := base_slug || '-' || counter::text;
    END IF;
    
    -- Safety check to avoid infinite loops
    IF counter > 1000 THEN
      -- Append timestamp as a last resort
      new_slug := base_slug || '-' || EXTRACT(EPOCH FROM NOW())::text;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_slug;
END;
$$;


ALTER FUNCTION "public"."generate_unique_product_slug"("base_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_flash_deals"("limit_count" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "product_id" "uuid", "title" character varying, "description" "text", "discount_percent" integer, "start_time" timestamp with time zone, "end_time" timestamp with time zone, "remaining_seconds" integer, "product_name" character varying, "product_slug" character varying, "base_price" numeric, "sale_price" numeric, "primary_image_url" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.id,
    fd.product_id,
    fd.title,
    fd.description,
    fd.discount_percent,
    fd.start_time,
    fd.end_time,
    EXTRACT(EPOCH FROM (fd.end_time - NOW()))::INTEGER AS remaining_seconds,
    p.name::VARCHAR(255) AS product_name,
    p.slug::VARCHAR(255) AS product_slug,
    p.base_price,
    p.sale_price,
    p.primary_image_url
  FROM
    flash_deals fd
  JOIN
    products p ON fd.product_id = p.id
  WHERE
    fd.is_active = TRUE 
    AND NOW() BETWEEN fd.start_time AND fd.end_time
    AND p.is_active = TRUE
  ORDER BY 
    fd.end_time ASC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_active_flash_deals"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_flash_deals_safe"("limit_count" integer) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN (
        WITH active_deals AS (
            SELECT 
                fd.id,
                fd.product_id,
                fd.title,
                fd.description,
                fd.discount_percent,
                fd.start_time,
                fd.end_time,
                GREATEST(0, EXTRACT(EPOCH FROM (fd.end_time - NOW())))::int as remaining_seconds,
                p.name as product_name,
                p.slug as product_slug,
                p.base_price,
                p.sale_price,
                p.primary_image_url
            FROM 
                flash_deals fd
            JOIN 
                products p ON fd.product_id = p.id
            WHERE 
                fd.is_active = TRUE 
                AND NOW() BETWEEN fd.start_time AND fd.end_time
                AND p.is_active = TRUE
            ORDER BY 
                fd.end_time ASC
            LIMIT 
                limit_count
        )
        SELECT COALESCE(
            json_agg(active_deals),
            '[]'::json
        )
        FROM active_deals
    );
END;
$$;


ALTER FUNCTION "public"."get_active_flash_deals_safe"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_customer_stats"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
  total_customers INTEGER;
  active_customers INTEGER;
  inactive_customers INTEGER;
  customers_with_orders INTEGER;
  customers_without_orders INTEGER;
  avg_lifetime_value DECIMAL(10, 2);
BEGIN
  -- Count total customers
  SELECT COUNT(*) INTO total_customers
  FROM profiles
  WHERE NOT is_admin;
  
  -- Count active customers (with at least one order)
  SELECT COUNT(DISTINCT user_id) INTO active_customers
  FROM orders;
  
  -- Calculate inactive customers
  inactive_customers := total_customers - active_customers;
  
  -- Count customers with orders
  customers_with_orders := active_customers;
  
  -- Count customers without orders
  customers_without_orders := inactive_customers;
  
  -- Calculate average customer lifetime value
  SELECT COALESCE(AVG(total_spent), 0) INTO avg_lifetime_value
  FROM (
    SELECT user_id, SUM(total_amount) AS total_spent
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY user_id
  ) AS customer_totals;
  
  -- Build the result JSON
  result := jsonb_build_object(
    'total_customers', total_customers,
    'active_customers', active_customers,
    'inactive_customers', inactive_customers,
    'customers_with_orders', customers_with_orders,
    'customers_without_orders', customers_without_orders,
    'avg_lifetime_value', avg_lifetime_value
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_admin_customer_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_dashboard_stats"("period" "text" DEFAULT 'week'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  start_date DATE;
  previous_start_date DATE;
  current_date DATE := CURRENT_DATE;
  result JSONB;
  total_sales DECIMAL(10, 2);
  previous_total_sales DECIMAL(10, 2);
  total_orders INTEGER;
  previous_total_orders INTEGER;
  total_customers INTEGER;
  new_customers INTEGER;
  previous_new_customers INTEGER;
  average_order DECIMAL(10, 2);
  previous_average_order DECIMAL(10, 2);
  sales_change DECIMAL(10, 2);
  orders_change DECIMAL(10, 2);
  customers_change DECIMAL(10, 2);
  average_order_change DECIMAL(10, 2);
BEGIN
  -- Set date ranges based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
      previous_start_date := current_date - INTERVAL '1 day';
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
      previous_start_date := current_date - INTERVAL '13 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
      previous_start_date := current_date - INTERVAL '59 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
      previous_start_date := current_date - INTERVAL '729 days';
    ELSE
      start_date := current_date - INTERVAL '6 days';
      previous_start_date := current_date - INTERVAL '13 days';
  END CASE;

  -- Get total sales for current period
  SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
  FROM orders
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second';
  
  -- Get total sales for previous period
  SELECT COALESCE(SUM(total_amount), 0) INTO previous_total_sales
  FROM orders
  WHERE created_at >= previous_start_date AND created_at < start_date;
  
  -- Calculate sales change percentage
  IF previous_total_sales = 0 THEN
    sales_change := 100; -- If previous sales were 0, consider it a 100% increase
  ELSE
    sales_change := ((total_sales - previous_total_sales) / previous_total_sales) * 100;
  END IF;

  -- Get total orders for current period
  SELECT COUNT(*) INTO total_orders
  FROM orders
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second';
  
  -- Get total orders for previous period
  SELECT COUNT(*) INTO previous_total_orders
  FROM orders
  WHERE created_at >= previous_start_date AND created_at < start_date;
  
  -- Calculate orders change percentage
  IF previous_total_orders = 0 THEN
    orders_change := 100; -- If previous orders were 0, consider it a 100% increase
  ELSE
    orders_change := ((total_orders - previous_total_orders) / previous_total_orders) * 100;
  END IF;
    
  -- Count total customers
  SELECT COUNT(*) INTO total_customers
  FROM profiles
  WHERE NOT is_admin;
    
  -- Count new customers in current period
  SELECT COUNT(*) INTO new_customers
  FROM profiles
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
  AND NOT is_admin;
    
  -- Count new customers in previous period
  SELECT COUNT(*) INTO previous_new_customers
  FROM profiles
  WHERE created_at >= previous_start_date AND created_at < start_date
  AND NOT is_admin;
    
  -- Calculate customers change percentage
  IF previous_new_customers = 0 THEN
    customers_change := 100; -- If previous new customers were 0, consider it a 100% increase
  ELSE
    customers_change := ((new_customers - previous_new_customers) / previous_new_customers) * 100;
  END IF;
    
  -- Calculate average order value
  IF total_orders > 0 THEN
    average_order := total_sales / total_orders;
  ELSE
    average_order := 0;
  END IF;
    
  -- Calculate previous average order value
  IF previous_total_orders > 0 THEN
    previous_average_order := previous_total_sales / previous_total_orders;
  ELSE
    previous_average_order := 0;
  END IF;
    
  -- Calculate average order change percentage
  IF previous_average_order = 0 THEN
    average_order_change := 100; -- If previous average order was 0, consider it a 100% increase
  ELSE
    average_order_change := ((average_order - previous_average_order) / previous_average_order) * 100;
  END IF;
    
  -- Build the result JSON
  result := jsonb_build_object(
    'total_sales', total_sales,
    'sales_change', sales_change,
    'total_orders', total_orders,
    'orders_change', orders_change,
    'total_customers', total_customers,
    'new_customers', new_customers,
    'customers_change', customers_change,
    'average_order', average_order,
    'average_order_change', average_order_change,
    'period', period,
    'start_date', start_date,
    'end_date', current_date
  );
    
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_admin_dashboard_stats"("period" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_low_stock_products"("threshold" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "name" "text", "sku" "text", "stock_quantity" integer, "category_name" "text", "base_price" numeric, "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    c.name AS category_name,
    p.base_price,
    CASE
      WHEN p.stock_quantity = 0 THEN 'out_of_stock'
      WHEN p.stock_quantity <= threshold THEN 'low_stock'
      ELSE 'in_stock'
    END AS status
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
  AND p.stock_quantity <= threshold
  ORDER BY p.stock_quantity ASC;
END;
$$;


ALTER FUNCTION "public"."get_admin_low_stock_products"("threshold" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_recent_orders"("limit_count" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "order_number" "text", "customer_name" "text", "status" "text", "total_amount" numeric, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    CONCAT(p.first_name, ' ', p.last_name) as customer_name,
    o.status,
    o.total_amount,
    o.created_at
  FROM orders o
  JOIN profiles p ON o.user_id = p.id
  ORDER BY o.created_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_admin_recent_orders"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_sales_by_category"("period" "text" DEFAULT 'month'::"text") RETURNS TABLE("category_id" "uuid", "category_name" "text", "total_sales" numeric, "percentage" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  start_date DATE;
  current_date DATE := CURRENT_DATE;
  total DECIMAL(10, 2);
BEGIN
  -- Set date range based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
    ELSE
      start_date := current_date - INTERVAL '29 days';
  END CASE;

  -- Calculate total sales for the period
  SELECT COALESCE(SUM(o.total_amount), 0) INTO total
  FROM orders o
  WHERE o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled';

  RETURN QUERY
  SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_sales,
    CASE 
      WHEN total > 0 THEN ROUND((COALESCE(SUM(oi.quantity * oi.unit_price), 0) / total) * 100, 2)
      ELSE 0
    END AS percentage
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled'
  WHERE c.is_active = true
  GROUP BY c.id, c.name
  ORDER BY total_sales DESC;
END;
$$;


ALTER FUNCTION "public"."get_admin_sales_by_category"("period" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_sales_by_period"("period" "text" DEFAULT 'day'::"text", "start_date" "date" DEFAULT (CURRENT_DATE - '30 days'::interval), "end_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("date_label" "text", "total_sales" numeric, "order_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF period = 'day' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('day', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('day', o.created_at)
    ORDER BY DATE_TRUNC('day', o.created_at);
  
  ELSIF period = 'week' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('week', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('week', o.created_at)
    ORDER BY DATE_TRUNC('week', o.created_at);
  
  ELSIF period = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('month', o.created_at), 'YYYY-MM') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('month', o.created_at)
    ORDER BY DATE_TRUNC('month', o.created_at);
  
  ELSE -- Default to day
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('day', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('day', o.created_at)
    ORDER BY DATE_TRUNC('day', o.created_at);
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_admin_sales_by_period"("period" "text", "start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_top_products"("period" "text" DEFAULT 'week'::"text", "limit_count" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "name" "text", "category_name" "text", "units_sold" bigint, "total_revenue" numeric, "average_price" numeric, "stock_quantity" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  start_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Set date range based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
    ELSE
      start_date := current_date - INTERVAL '6 days';
  END CASE;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    c.name AS category_name,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    AVG(oi.unit_price) AS average_price,
    p.stock_quantity
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled'
  GROUP BY p.id, p.name, c.name, p.stock_quantity
  ORDER BY units_sold DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_admin_top_products"("period" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_email"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  email text;
BEGIN
  -- Use service_role to access auth.users
  SELECT au.email INTO email
  FROM auth.users au
  WHERE au.id = auth.uid();
  
  RETURN email;
END;
$$;


ALTER FUNCTION "public"."get_auth_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_details"("product_slug" "text") RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "sku" "text", "description" "text", "base_price" numeric, "sale_price" numeric, "stock_quantity" integer, "category_id" "uuid", "category_name" "text", "is_featured" boolean, "is_active" boolean, "primary_image_url" "text", "images" "jsonb", "attributes" "jsonb", "reviews" "jsonb", "average_rating" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_product_details"("product_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_seller_id"("user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  seller_id UUID;
BEGIN
  SELECT id INTO seller_id FROM public.sellers WHERE user_id = $1;
  RETURN seller_id;
END;
$_$;


ALTER FUNCTION "public"."get_seller_id"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_and_column_info"() RETURNS TABLE("table_name" "text", "column_name" "text", "data_type" "text")
    LANGUAGE "sql"
    AS $$
  SELECT 
    table_name,
    column_name,
    data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position;
$$;


ALTER FUNCTION "public"."get_table_and_column_info"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."verification_tokens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."verification_tokens" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_token_by_email_and_token"("email_param" "text", "token_param" "text") RETURNS SETOF "public"."verification_tokens"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM verification_tokens
  WHERE email = email_param AND token = token_param AND expires_at > NOW();
END;
$$;


ALTER FUNCTION "public"."get_token_by_email_and_token"("email_param" "text", "token_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trending_products"("limit_count" integer DEFAULT 6) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "base_price" numeric, "sale_price" numeric, "primary_image_url" "text", "sold_count" integer, "category_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.base_price,
    p.sale_price,
    p.primary_image_url,
    COALESCE(p.sold_count, 0) as sold_count,
    c.name as category_name
  FROM 
    products p
  LEFT JOIN 
    categories c ON p.category_id = c.id
  WHERE 
    p.is_active = TRUE
  ORDER BY 
    COALESCE(p.sold_count, 0) DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_trending_products"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_cart"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_cart JSONB;
BEGIN
  SELECT cart_items INTO v_cart
  FROM public.user_cart
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(v_cart, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_user_cart"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_default_address"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If new address is set as default, clear default flag on other addresses of same type for this user
  IF NEW.is_default = true THEN
    UPDATE public.addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND address_type = NEW.address_type
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_default_address"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (user_id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    _user_id uuid;
    _is_admin boolean;
BEGIN
    -- Get the authenticated user's ID
    _user_id := auth.uid();
    
    -- Check if user is authenticated
    IF _user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Check for is_admin in profiles
    SELECT is_admin INTO _is_admin
    FROM public.profiles
    WHERE id = _user_id OR user_id = _user_id;
    
    -- Return the result (default to false if not found)
    RETURN COALESCE(_is_admin, false);
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_email_verified"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_verified boolean;
BEGIN
  -- Check from profiles table first (our custom field)
  SELECT p.is_email_verified INTO is_verified
  FROM profiles p
  WHERE p.id = auth.uid();
  
  -- If not found or null, fall back to auth.users
  IF is_verified IS NULL THEN
    SELECT au.email_confirmed_at IS NOT NULL INTO is_verified
    FROM auth.users au
    WHERE au.id = auth.uid();
  END IF;
  
  RETURN COALESCE(is_verified, false);
END;
$$;


ALTER FUNCTION "public"."is_email_verified"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_seller"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sellers 
    WHERE user_id = $1 AND is_approved = true
  );
END;
$_$;


ALTER FUNCTION "public"."is_seller"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_seller"("p_store_name" "text", "p_description" "text" DEFAULT NULL::"text", "p_contact_email" "text" DEFAULT NULL::"text", "p_contact_phone" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_result JSONB;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get the user's email
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    -- Check if the user already has a seller profile
    IF EXISTS (SELECT 1 FROM public.seller_profiles WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'User already has a seller profile';
    END IF;
    
    -- Insert the new seller profile
    INSERT INTO public.seller_profiles (
        user_id, 
        store_name, 
        description, 
        contact_email, 
        contact_phone
    )
    VALUES (
        v_user_id, 
        p_store_name, 
        p_description, 
        COALESCE(p_contact_email, v_user_email), 
        p_contact_phone
    )
    RETURNING jsonb_build_object(
        'id', id,
        'store_name', store_name,
        'is_approved', is_approved,
        'approval_status', approval_status,
        'created_at', created_at
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."register_seller"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_seller_with_api_key"("p_store_name" "text", "p_description" "text" DEFAULT NULL::"text", "p_contact_email" "text" DEFAULT NULL::"text", "p_contact_phone" "text" DEFAULT NULL::"text", "p_api_key_name" "text" DEFAULT 'Default API Key'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_api_key TEXT;
    v_result JSONB;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get the user's email
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    -- Check if the user already has a seller profile
    IF EXISTS (SELECT 1 FROM public.seller_profiles WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'User already has a seller profile';
    END IF;
    
    -- Insert the new seller profile
    INSERT INTO public.seller_profiles (
        user_id, 
        store_name, 
        description, 
        contact_email, 
        contact_phone
    )
    VALUES (
        v_user_id, 
        p_store_name, 
        p_description, 
        COALESCE(p_contact_email, v_user_email), 
        p_contact_phone
    );
    
    -- Generate an API key for the seller
    v_api_key := public.generate_api_key();
    
    INSERT INTO public.api_keys (
        user_id,
        key,
        name
    )
    VALUES (
        v_user_id,
        v_api_key,
        p_api_key_name
    );
    
    -- Return the result
    v_result := jsonb_build_object(
        'store_name', p_store_name,
        'api_key', v_api_key,
        'message', 'Seller profile created with API key'
    );
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."register_seller_with_api_key"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text", "p_api_key_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_user_with_profile"("user_email" "text", "first_name" "text", "last_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_id_from_auth UUID;
BEGIN
    -- Email adresine göre auth.users tablosundan kullanıcı ID'sini al.
    SELECT id INTO user_id_from_auth FROM auth.users WHERE email = user_email;

    -- Eğer kullanıcı ID'si bulunduysa, profili eklemeyi dene.
    -- ON CONFLICT (id) DO NOTHING ifadesi, bu ID'ye sahip bir profil zaten varsa,
    -- hata vermesini engeller ve işlemi başarıyla tamamlanmış sayar.
    IF user_id_from_auth IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, first_name, last_name)
        VALUES (user_id_from_auth, user_email, first_name, last_name)
        ON CONFLICT (id) DO NOTHING;
    END IF;

END;
$$;


ALTER FUNCTION "public"."register_user_with_profile"("user_email" "text", "first_name" "text", "last_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reject_product_submission"("submission_id" "uuid", "admin_id" "uuid", "notes" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if submission exists
  IF NOT EXISTS (SELECT 1 FROM public.seller_product_submissions WHERE id = submission_id) THEN
    RAISE EXCEPTION 'Submission not found';
    RETURN FALSE;
  END IF;
  
  -- Check if submission is already processed
  IF EXISTS (SELECT 1 FROM public.seller_product_submissions WHERE id = submission_id AND status != 'pending') THEN
    RAISE EXCEPTION 'Submission already processed';
    RETURN FALSE;
  END IF;
  
  -- Update the submission status
  UPDATE public.seller_product_submissions SET
    status = 'rejected',
    admin_notes = notes,
    reviewed_at = now(),
    reviewed_by = admin_id,
    updated_at = now()
  WHERE id = submission_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."reject_product_submission"("submission_id" "uuid", "admin_id" "uuid", "notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_api_key"("p_key_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_affected_rows INT;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Revoke the API key (set is_active to false)
    UPDATE public.api_keys
    SET is_active = false
    WHERE id = p_key_id AND user_id = v_user_id
    RETURNING 1 INTO v_affected_rows;
    
    RETURN v_affected_rows = 1;
END;
$$;


ALTER FUNCTION "public"."revoke_api_key"("p_key_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sku" "text",
    "description" "text",
    "base_price" numeric(10,2) NOT NULL,
    "sale_price" numeric(10,2),
    "stock_quantity" integer DEFAULT 0,
    "category_id" "uuid",
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "primary_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "weight_grams" integer,
    "dimensions" "jsonb",
    "metadata" "jsonb",
    "sold_count" integer DEFAULT 0,
    "seller_id" "uuid",
    "commission_rate" numeric(5,2) DEFAULT 10.00,
    "tags" "text",
    "is_flash_deal" boolean DEFAULT false,
    "flash_deal_price" numeric(10,2),
    "flash_deal_start_date" timestamp with time zone,
    "flash_deal_end_date" timestamp with time zone,
    "flash_deal_stock" integer
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'Products available for purchase';



CREATE OR REPLACE FUNCTION "public"."search_products"("search_term" "text") RETURNS SETOF "public"."products"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."search_products"("search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_product_image_storage_path"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.storage_path IS NULL AND NEW.image_url IS NOT NULL THEN
        NEW.storage_path = SPLIT_PART(REPLACE(NEW.image_url, 'https://', ''), '/', 3);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_product_image_storage_path"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."temp_log_function"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
      -- Mapping event_type to operation
      INSERT INTO debug_logs (
        operation,
        status,
        details,
        created_at
      ) VALUES (
        TG_ARGV[0],
        'info',
        TG_ARGV[1],
        NOW()
      );
      RETURN NULL;
    END;
    $$;


ALTER FUNCTION "public"."temp_log_function"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_favorite"("p_product_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- Kullanıcı kimliğini al
    v_user_id := auth.uid();
    
    -- Kullanıcı giriş yapmamışsa hata ver
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Kullanıcı kimliği bulunamadı';
    END IF;
    
    -- Favori zaten var mı kontrol et
    SELECT EXISTS (
        SELECT 1 FROM public.user_favorites
        WHERE user_id = v_user_id AND product_id = p_product_id
    ) INTO v_exists;
    
    -- Eğer favori varsa sil, yoksa ekle
    IF v_exists THEN
        DELETE FROM public.user_favorites
        WHERE user_id = v_user_id AND product_id = p_product_id;
        RETURN FALSE; -- Favori kaldırıldı
    ELSE
        INSERT INTO public.user_favorites (user_id, product_id)
        VALUES (v_user_id, p_product_id);
        RETURN TRUE; -- Favori eklendi
    END IF;
END;
$$;


ALTER FUNCTION "public"."toggle_favorite"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_api_key_last_used"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.api_keys
  SET last_used_at = now()
  WHERE id = NEW.api_key_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_api_key_last_used"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_email_verification_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  log_column_name TEXT;
BEGIN
  -- If email confirmed timestamp is set, update our profile record
  IF NEW.email_confirmed_at IS NOT NULL AND 
     (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at <> NEW.email_confirmed_at) 
  THEN
    UPDATE profiles
    SET 
      is_email_verified = true,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Check which column name exists in debug_logs
    SELECT column_name INTO log_column_name
    FROM information_schema.columns 
    WHERE table_name = 'debug_logs' 
    AND column_name IN ('event_type', 'operation')
    LIMIT 1;
    
    -- Log verification based on table structure
    IF log_column_name = 'event_type' THEN
      INSERT INTO debug_logs (
        event_type,
        details,
        created_at
      ) VALUES (
        'email_verified',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', NEW.email,
          'confirmed_at', NEW.email_confirmed_at
        ),
        NOW()
      );
    ELSE 
      -- Assume operation column exists
      INSERT INTO debug_logs (
        operation,
        status,
        details,
        created_at
      ) VALUES (
        'email_verified',
        'success',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', NEW.email,
          'confirmed_at', NEW.email_confirmed_at
        ),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_email_verification_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_status"("order_id" "uuid", "new_status" "text", "comment" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."update_order_status"("order_id" "uuid", "new_status" "text", "comment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_cart"("p_user_id" "uuid", "p_cart_items" "jsonb", "p_recently_removed_items" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Kullanıcının sepet kaydı var mı kontrol et
  SELECT COUNT(*) INTO v_count FROM public.user_cart WHERE user_id = p_user_id;
  
  IF v_count > 0 THEN
    -- Kayıt varsa güncelle
    UPDATE public.user_cart 
    SET 
      cart_items = p_cart_items,
      recently_removed_items = COALESCE(p_recently_removed_items, '[]'::jsonb),
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Kayıt yoksa yeni ekle
    INSERT INTO public.user_cart (user_id, cart_items, recently_removed_items)
    VALUES (p_user_id, p_cart_items, COALESCE(p_recently_removed_items, '[]'::jsonb));
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_user_cart"("p_user_id" "uuid", "p_cart_items" "jsonb", "p_recently_removed_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_cart_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_cart_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_recently_viewed_product"("p_user_id" "uuid", "p_product_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    oldest_viewed_id UUID;
    view_count INT;
BEGIN
    -- Remove any existing entry for this product to update its viewed_at timestamp
    DELETE FROM public.recently_viewed_products
    WHERE user_id = p_user_id AND product_id = p_product_id;

    -- Get the current count of recently viewed products for the user
    SELECT count(*) INTO view_count
    FROM public.recently_viewed_products
    WHERE user_id = p_user_id;

    -- If the count is 5 or more, find and delete the oldest one
    IF view_count >= 5 THEN
        SELECT id INTO oldest_viewed_id
        FROM public.recently_viewed_products
        WHERE user_id = p_user_id
        ORDER BY viewed_at ASC
        LIMIT 1;

        IF oldest_viewed_id IS NOT NULL THEN
            DELETE FROM public.recently_viewed_products
            WHERE id = oldest_viewed_id;
        END IF;
    END IF;

    -- Insert the new recently viewed product record
    INSERT INTO public.recently_viewed_products (user_id, product_id, viewed_at)
    VALUES (p_user_id, p_product_id, now());
END;
$$;


ALTER FUNCTION "public"."upsert_recently_viewed_product"("p_user_id" "uuid", "p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_api_key"("p_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_is_valid BOOLEAN;
    v_key_record RECORD;
    v_user_record RECORD;
    v_result JSONB;
BEGIN
    -- Find the API key
    SELECT * FROM public.api_keys
    WHERE key = p_key
    INTO v_key_record;
    
    -- Check if the key exists and is active
    IF v_key_record.id IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid API key');
    END IF;
    
    IF NOT v_key_record.is_active THEN
        RETURN jsonb_build_object('valid', false, 'error', 'API key is inactive');
    END IF;
    
    IF v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'API key has expired');
    END IF;
    
    -- Update the last_used_at timestamp
    UPDATE public.api_keys
    SET last_used_at = now()
    WHERE id = v_key_record.id;
    
    -- Get user information
    SELECT id, email, raw_user_meta_data->>'full_name' as full_name
    FROM auth.users
    WHERE id = v_key_record.user_id
    INTO v_user_record;
    
    -- Return success with user information
    RETURN jsonb_build_object(
        'valid', true,
        'user', jsonb_build_object(
            'id', v_user_record.id,
            'email', v_user_record.email,
            'full_name', v_user_record.full_name
        ),
        'permissions', v_key_record.permissions
    );
END;
$$;


ALTER FUNCTION "public"."validate_api_key"("p_key" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "city" "text" NOT NULL,
    "state" "text",
    "postal_code" "text" NOT NULL,
    "country" "text" DEFAULT 'Türkiye'::"text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "address_type" "text" DEFAULT 'both'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "full_name" "text",
    "phone" "text",
    "title" "text",
    "neighborhood" character varying(255),
    CONSTRAINT "addresses_address_type_check" CHECK (("address_type" = ANY (ARRAY['billing'::"text", 'shipping'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


COMMENT ON TABLE "public"."addresses" IS 'Customer shipping and billing addresses';



COMMENT ON COLUMN "public"."addresses"."neighborhood" IS 'Adresin bulunduğu mahalle';



CREATE TABLE IF NOT EXISTS "public"."admin_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "entity" "text",
    "entity_id" "uuid",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_operations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "operation_id" integer NOT NULL,
    "operation_type" "text" NOT NULL,
    "parameters" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_operations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_key_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "api_key_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "ip_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_key_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_used_at" timestamp with time zone,
    "key" "text",
    "permissions" "jsonb" DEFAULT '{"read": true, "write": false}'::"jsonb"
);


ALTER TABLE "public"."api_keys" OWNER TO "postgres";


COMMENT ON TABLE "public"."api_keys" IS 'API keys for seller access to the platform';



CREATE SEQUENCE IF NOT EXISTS "public"."bulk_operation_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."bulk_operation_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "parent_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "parent_category_id" "uuid",
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS 'Product categories';



CREATE TABLE IF NOT EXISTS "public"."collection_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "added_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collection_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."debug_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "operation" "text" NOT NULL,
    "status" "text" NOT NULL,
    "details" "jsonb",
    "error_code" "text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."debug_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" "text",
    "description" "text",
    "discount_type" "text" NOT NULL,
    "discount_value" numeric(10,2) NOT NULL,
    "minimum_purchase_amount" numeric(10,2),
    "starts_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "discounts_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed_amount'::"text"])))
);


ALTER TABLE "public"."discounts" OWNER TO "postgres";


COMMENT ON TABLE "public"."discounts" IS 'Discount codes and coupons';



CREATE TABLE IF NOT EXISTS "public"."email_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "token" character varying(100) NOT NULL,
    "verified" boolean DEFAULT false,
    "expires_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_verifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flash_deals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "discount_percent" integer NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."flash_deals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "status" "text" NOT NULL,
    "comment" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_history" IS 'History of order status changes';



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "product_id" "text",
    "product_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "attributes" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_items" IS 'Items in customer orders';



COMMENT ON COLUMN "public"."order_items"."product_id" IS 'Ürün ID (TEXT format, ürün katalog sisteminden gelen ID)';



CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "order_number" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "total_amount" numeric(10,2) NOT NULL,
    "shipping_amount" numeric(10,2) DEFAULT 0,
    "tax_amount" numeric(10,2) DEFAULT 0,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "shipping_address_id" "uuid",
    "billing_address_id" "uuid",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "commission_amount" numeric(10,2) DEFAULT 0,
    "shipping_address_data" "jsonb",
    "billing_address_data" "jsonb",
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."orders" IS 'Customer orders';



COMMENT ON COLUMN "public"."orders"."shipping_address_data" IS 'Teslimat adresi bilgileri JSON formatında';



COMMENT ON COLUMN "public"."orders"."billing_address_data" IS 'Fatura adresi bilgileri JSON formatında';



CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."password_reset_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attributes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "attribute_name" "text" NOT NULL,
    "attribute_value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_attributes" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_attributes" IS 'Attributes for products like size, color, etc.';



CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "image_url" "text" NOT NULL,
    "alt_text" "text",
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "storage_path" "text"
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_images" IS 'Images for products';



CREATE TABLE IF NOT EXISTS "public"."product_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "user_id" "uuid",
    "rating" integer NOT NULL,
    "comment" "text",
    "is_verified" boolean DEFAULT false,
    "is_approved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."product_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_reviews" IS 'Customer reviews for products';



CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "attributes" "jsonb" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "sku" "text",
    "image_url" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_admin" boolean DEFAULT false,
    "user_id" "uuid",
    "is_email_verified" boolean DEFAULT false
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles for HDTicaret.com';



CREATE TABLE IF NOT EXISTS "public"."recently_viewed_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."recently_viewed_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."recently_viewed_products" IS 'Kullanıcıların son görüntülediği ürünleri takip eder';



CREATE TABLE IF NOT EXISTS "public"."seller_product_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category_id" "uuid",
    "base_price" numeric(12,2) NOT NULL,
    "sale_price" numeric(12,2),
    "sku" "text",
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "images" "jsonb",
    "specifications" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid"
);


ALTER TABLE "public"."seller_product_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sellers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_name" "text" NOT NULL,
    "contact_email" "text" NOT NULL,
    "contact_phone" "text",
    "tax_id" "text",
    "is_approved" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sellers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."seller_products" AS
 SELECT "sps"."id",
    "sps"."name",
    "sps"."description",
    "sps"."category_id",
    "sps"."base_price",
    "sps"."sale_price",
    "sps"."sku",
    "sps"."stock_quantity",
    "sps"."images",
    "sps"."specifications",
    "sps"."status",
    "sps"."admin_notes",
    "sps"."created_at",
    "sps"."updated_at",
    "sps"."reviewed_at",
    "sps"."reviewed_by",
    "sps"."seller_id",
    "s"."company_name" AS "seller_name",
    "s"."contact_email" AS "seller_email",
    "c"."name" AS "category_name"
   FROM (("public"."seller_product_submissions" "sps"
     LEFT JOIN "public"."sellers" "s" ON (("sps"."seller_id" = "s"."id")))
     LEFT JOIN "public"."categories" "c" ON (("sps"."category_id" = "c"."id")));


ALTER TABLE "public"."seller_products" OWNER TO "postgres";


COMMENT ON VIEW "public"."seller_products" IS 'View for seller product submissions with additional seller and category information for the admin panel';



CREATE TABLE IF NOT EXISTS "public"."seller_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "store_name" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "banner_url" "text",
    "contact_email" "text" NOT NULL,
    "contact_phone" "text",
    "address" "jsonb",
    "social_media" "jsonb",
    "is_approved" boolean DEFAULT false,
    "approval_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."seller_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."seller_profiles" IS 'Profiles for sellers on the platform';



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings" IS 'Application settings';



CREATE TABLE IF NOT EXISTS "public"."special_collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "slug" character varying(255) NOT NULL,
    "image_url" "text",
    "badge" character varying(50),
    "badge_color" character varying(100),
    "icon_name" character varying(50),
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."special_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL,
    "payment_date" timestamp with time zone DEFAULT "now"(),
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tax_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_cart" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "cart_items" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "recently_removed_items" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_cart" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_operations"
    ADD CONSTRAINT "admin_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_key_usage"
    ADD CONSTRAINT "api_key_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_collection_id_product_id_key" UNIQUE ("collection_id", "product_id");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."debug_logs"
    ADD CONSTRAINT "debug_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verifications"
    ADD CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_verifications"
    ADD CONSTRAINT "email_verifications_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."flash_deals"
    ADD CONSTRAINT "flash_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_history"
    ADD CONSTRAINT "order_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."product_attributes"
    ADD CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attributes"
    ADD CONSTRAINT "product_attributes_product_id_attribute_name_attribute_valu_key" UNIQUE ("product_id", "attribute_name", "attribute_value");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recently_viewed_products"
    ADD CONSTRAINT "recently_viewed_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recently_viewed_products"
    ADD CONSTRAINT "recently_viewed_products_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."seller_product_submissions"
    ADD CONSTRAINT "seller_product_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_store_name_unique" UNIQUE ("store_name");



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."special_collections"
    ADD CONSTRAINT "special_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."special_collections"
    ADD CONSTRAINT "special_collections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."tax_payments"
    ADD CONSTRAINT "tax_payments_month_year_key" UNIQUE ("month", "year");



ALTER TABLE ONLY "public"."tax_payments"
    ADD CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_tokens"
    ADD CONSTRAINT "token_email_unique" UNIQUE ("email", "token");



ALTER TABLE ONLY "public"."user_cart"
    ADD CONSTRAINT "user_cart_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."verification_tokens"
    ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id");



CREATE INDEX "addresses_user_id_idx" ON "public"."addresses" USING "btree" ("user_id");



CREATE INDEX "api_keys_key_idx" ON "public"."api_keys" USING "btree" ("key");



CREATE INDEX "api_keys_user_id_idx" ON "public"."api_keys" USING "btree" ("user_id");



CREATE INDEX "flash_deals_active_idx" ON "public"."flash_deals" USING "btree" ("is_active");



CREATE INDEX "flash_deals_product_id_idx" ON "public"."flash_deals" USING "btree" ("product_id");



CREATE INDEX "flash_deals_time_idx" ON "public"."flash_deals" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_addresses_neighborhood" ON "public"."addresses" USING "btree" ("neighborhood");



CREATE INDEX "idx_admin_logs_action" ON "public"."admin_logs" USING "btree" ("action");



CREATE INDEX "idx_admin_logs_admin_id" ON "public"."admin_logs" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_logs_created_at" ON "public"."admin_logs" USING "btree" ("created_at");



CREATE INDEX "idx_admin_logs_entity" ON "public"."admin_logs" USING "btree" ("entity");



CREATE INDEX "idx_api_key_usage_api_key_id" ON "public"."api_key_usage" USING "btree" ("api_key_id");



CREATE INDEX "idx_api_key_usage_created_at" ON "public"."api_key_usage" USING "btree" ("created_at");



CREATE INDEX "idx_api_keys_user_id" ON "public"."api_keys" USING "btree" ("user_id");



CREATE INDEX "idx_collection_products_collection_id" ON "public"."collection_products" USING "btree" ("collection_id");



CREATE INDEX "idx_collection_products_created_at" ON "public"."collection_products" USING "btree" ("created_at");



CREATE INDEX "idx_collection_products_product_id" ON "public"."collection_products" USING "btree" ("product_id");



CREATE INDEX "idx_email_verifications_email" ON "public"."email_verifications" USING "btree" ("email");



CREATE INDEX "idx_email_verifications_token" ON "public"."email_verifications" USING "btree" ("token");



CREATE INDEX "idx_email_verifications_user_id" ON "public"."email_verifications" USING "btree" ("user_id");



CREATE INDEX "idx_email_verifications_verified" ON "public"."email_verifications" USING "btree" ("verified");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_billing_address" ON "public"."orders" USING "gin" ("billing_address_data");



CREATE INDEX "idx_orders_shipping_address" ON "public"."orders" USING "gin" ("shipping_address_data");



CREATE INDEX "idx_password_reset_tokens_email" ON "public"."password_reset_tokens" USING "btree" ("email");



CREATE INDEX "idx_password_reset_tokens_expires_at" ON "public"."password_reset_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_password_reset_tokens_token" ON "public"."password_reset_tokens" USING "btree" ("token");



CREATE INDEX "idx_password_reset_tokens_user_id" ON "public"."password_reset_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_product_variants_attributes" ON "public"."product_variants" USING "gin" ("attributes");



CREATE INDEX "idx_product_variants_default" ON "public"."product_variants" USING "btree" ("product_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_product_variants_product_id" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_products_seller_id" ON "public"."products" USING "btree" ("seller_id");



CREATE INDEX "idx_recently_viewed_products_product_id" ON "public"."recently_viewed_products" USING "btree" ("product_id");



CREATE INDEX "idx_recently_viewed_products_user_id" ON "public"."recently_viewed_products" USING "btree" ("user_id");



CREATE INDEX "idx_recently_viewed_products_viewed_at" ON "public"."recently_viewed_products" USING "btree" ("viewed_at");



CREATE INDEX "idx_seller_product_submissions_seller_id" ON "public"."seller_product_submissions" USING "btree" ("seller_id");



CREATE INDEX "idx_seller_product_submissions_status" ON "public"."seller_product_submissions" USING "btree" ("status");



CREATE INDEX "idx_sellers_user_id" ON "public"."sellers" USING "btree" ("user_id");



CREATE INDEX "idx_special_collections_is_active" ON "public"."special_collections" USING "btree" ("is_active");



CREATE INDEX "idx_special_collections_slug" ON "public"."special_collections" USING "btree" ("slug");



CREATE INDEX "idx_special_collections_sort_order" ON "public"."special_collections" USING "btree" ("sort_order");



CREATE INDEX "idx_tax_payments_month_year" ON "public"."tax_payments" USING "btree" ("month", "year");



CREATE INDEX "idx_user_cart_user_id" ON "public"."user_cart" USING "btree" ("user_id");



CREATE INDEX "idx_verification_tokens_email" ON "public"."verification_tokens" USING "btree" ("email");



CREATE INDEX "idx_verification_tokens_expires_at" ON "public"."verification_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_verification_tokens_token" ON "public"."verification_tokens" USING "btree" ("token");



CREATE INDEX "idx_verification_tokens_user_id" ON "public"."verification_tokens" USING "btree" ("user_id");



CREATE INDEX "products_sold_count_idx" ON "public"."products" USING "btree" ("sold_count");



CREATE INDEX "seller_profiles_user_id_idx" ON "public"."seller_profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "decrease_stock_on_order" AFTER INSERT ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."decrease_product_stock"();



CREATE OR REPLACE TRIGGER "delete_category_image_trigger" BEFORE DELETE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."delete_category_image"();



CREATE OR REPLACE TRIGGER "delete_product_images_trigger" BEFORE DELETE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."delete_product_images"();



CREATE OR REPLACE TRIGGER "ensure_single_default_variant_trigger" BEFORE INSERT OR UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_default_variant"();



CREATE OR REPLACE TRIGGER "set_single_default_address_insert" AFTER INSERT ON "public"."addresses" FOR EACH ROW WHEN (("new"."is_default" = true)) EXECUTE FUNCTION "public"."handle_default_address"();



CREATE OR REPLACE TRIGGER "set_single_default_address_update" AFTER UPDATE ON "public"."addresses" FOR EACH ROW WHEN ((("new"."is_default" = true) AND (("old"."is_default" = false) OR ("old"."address_type" <> "new"."address_type")))) EXECUTE FUNCTION "public"."handle_default_address"();



CREATE OR REPLACE TRIGGER "set_storage_path_on_insert" BEFORE INSERT ON "public"."product_images" FOR EACH ROW EXECUTE FUNCTION "public"."set_product_image_storage_path"();



CREATE OR REPLACE TRIGGER "update_addresses_timestamp" BEFORE UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_api_key_last_used_trigger" AFTER INSERT ON "public"."api_key_usage" FOR EACH ROW EXECUTE FUNCTION "public"."update_api_key_last_used"();



CREATE OR REPLACE TRIGGER "update_categories_timestamp" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_discounts_timestamp" BEFORE UPDATE ON "public"."discounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_email_verifications_updated_at" BEFORE UPDATE ON "public"."email_verifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_timestamp" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_product_reviews_timestamp" BEFORE UPDATE ON "public"."product_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_timestamp" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_profiles_timestamp" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_settings_timestamp" BEFORE UPDATE ON "public"."settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_special_collections_updated_at" BEFORE UPDATE ON "public"."special_collections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_cart_modified" BEFORE UPDATE ON "public"."user_cart" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_cart_modified_column"();



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_operations"
    ADD CONSTRAINT "admin_operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."api_key_usage"
    ADD CONSTRAINT "api_key_usage_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."special_collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_products"
    ADD CONSTRAINT "collection_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_verifications"
    ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flash_deals"
    ADD CONSTRAINT "flash_deals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_history"
    ADD CONSTRAINT "order_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_history"
    ADD CONSTRAINT "order_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "public"."addresses"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_attributes"
    ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_viewed_products"
    ADD CONSTRAINT "recently_viewed_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recently_viewed_products"
    ADD CONSTRAINT "recently_viewed_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seller_product_submissions"
    ADD CONSTRAINT "seller_product_submissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."seller_product_submissions"
    ADD CONSTRAINT "seller_product_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."seller_product_submissions"
    ADD CONSTRAINT "seller_product_submissions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seller_profiles"
    ADD CONSTRAINT "seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cart"
    ADD CONSTRAINT "user_cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."verification_tokens"
    ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin tüm favorileri görebilir" ON "public"."user_favorites" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can delete addresses" ON "public"."addresses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can insert addresses" ON "public"."addresses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage product variants" ON "public"."product_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage special collections" ON "public"."special_collections" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update addresses" ON "public"."addresses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all addresses" ON "public"."addresses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow admin full access" ON "public"."collection_products" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow authenticated users to create order items" ON "public"."order_items" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to create orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow individual user access to their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow individual user access to their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow public read access" ON "public"."collection_products" FOR SELECT USING (true);



CREATE POLICY "Kullanıcılar kendi favorilerini ekleyebilir" ON "public"."user_favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi favorilerini görebilir" ON "public"."user_favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi favorilerini silebilir" ON "public"."user_favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi görüntüleme geçmişini görebilir" ON "public"."recently_viewed_products" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi görüntüleme geçmişini güncelleyebili" ON "public"."recently_viewed_products" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi görüntüleme geçmişini oluşturabilir" ON "public"."recently_viewed_products" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Kullanıcılar kendi görüntüleme geçmişini silebilir" ON "public"."recently_viewed_products" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Public can view active special collections" ON "public"."special_collections" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view product variants" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Service role can manage all email verifications" ON "public"."email_verifications" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage password reset tokens" ON "public"."password_reset_tokens" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role tüm haklara sahiptir" ON "public"."recently_viewed_products" TO "service_role" USING (true);



CREATE POLICY "Users can delete their own API keys" ON "public"."api_keys" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own addresses" ON "public"."addresses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own email verifications" ON "public"."email_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own API keys" ON "public"."api_keys" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own addresses" ON "public"."addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own email verifications" ON "public"."email_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own seller profile" ON "public"."seller_profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own password reset tokens" ON "public"."password_reset_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own email verifications" ON "public"."email_verifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own API keys" ON "public"."api_keys" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own addresses" ON "public"."addresses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own email verifications" ON "public"."email_verifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own seller profile" ON "public"."seller_profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own email verifications" ON "public"."email_verifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own API keys" ON "public"."api_keys" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own addresses" ON "public"."addresses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own email verifications" ON "public"."email_verifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own seller profile" ON "public"."seller_profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "addresses_admin_all" ON "public"."addresses" USING ("public"."is_admin"());



CREATE POLICY "addresses_all_admin" ON "public"."addresses" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "addresses_delete_own" ON "public"."addresses" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "addresses_insert_own" ON "public"."addresses" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "addresses_read_own" ON "public"."addresses" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "addresses_update_own" ON "public"."addresses" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "admin_all" ON "public"."flash_deals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_all_tokens" ON "public"."verification_tokens" USING ("public"."is_admin"());



CREATE POLICY "admin_cart_delete_policy" ON "public"."user_cart" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_cart_insert_policy" ON "public"."user_cart" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_cart_select_policy" ON "public"."user_cart" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_cart_update_policy" ON "public"."user_cart" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



ALTER TABLE "public"."admin_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_logs_insert_own" ON "public"."admin_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_logs_read_all" ON "public"."admin_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "admin_logs_service_role" ON "public"."admin_logs" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."api_key_usage" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "api_key_usage_service_policy" ON "public"."api_key_usage" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "api_keys_delete_policy" ON "public"."api_keys" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "api_keys_insert_policy" ON "public"."api_keys" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "api_keys_select_policy" ON "public"."api_keys" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "api_keys_update_policy" ON "public"."api_keys" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categories_admin_all" ON "public"."categories" USING ("public"."is_admin"());



CREATE POLICY "categories_read_all" ON "public"."categories" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."collection_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "discounts_read_all" ON "public"."discounts" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."email_verifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flash_deals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_profiles" ON "public"."profiles" FOR INSERT TO "anon" WITH CHECK (true);



ALTER TABLE "public"."order_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_items_read_own" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_admin_all" ON "public"."orders" USING ("public"."is_admin"());



CREATE POLICY "orders_insert_own" ON "public"."orders" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "orders_read_own" ON "public"."orders" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."password_reset_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_attributes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_attributes_read_all" ON "public"."product_attributes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_attributes"."product_id") AND ("products"."is_active" = true)))));



ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_images_admin_all" ON "public"."product_images" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "product_images_read_all" ON "public"."product_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products"
  WHERE (("products"."id" = "product_images"."product_id") AND ("products"."is_active" = true)))));



ALTER TABLE "public"."product_reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_reviews_delete" ON "public"."product_reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "product_reviews_insert" ON "public"."product_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "product_reviews_read_approved" ON "public"."product_reviews" FOR SELECT USING (("is_approved" = true));



CREATE POLICY "product_reviews_select" ON "public"."product_reviews" FOR SELECT USING (true);



CREATE POLICY "product_reviews_update" ON "public"."product_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products_admin_all" ON "public"."products" USING ("public"."is_admin"());



CREATE POLICY "products_read_all" ON "public"."products" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_all" ON "public"."profiles" USING ("public"."is_admin"());



CREATE POLICY "profiles_read_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "public_read" ON "public"."flash_deals" FOR SELECT TO "authenticated", "anon" USING ((("is_active" = true) AND (("now"() >= "start_time") AND ("now"() <= "end_time"))));



ALTER TABLE "public"."recently_viewed_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seller_product_submissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "seller_product_submissions_service_policy" ON "public"."seller_product_submissions" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."seller_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sellers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sellers_insert_policy" ON "public"."sellers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "sellers_select_policy" ON "public"."sellers" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sellers_service_policy" ON "public"."sellers" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "sellers_update_policy" ON "public"."sellers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."special_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cart" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_cart_delete_policy" ON "public"."user_cart" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_cart_insert_policy" ON "public"."user_cart" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "user_cart_select_policy" ON "public"."user_cart" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "user_cart_update_policy" ON "public"."user_cart" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_read_own_tokens" ON "public"."verification_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."verification_tokens" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."add_flash_deal"("p_product_id" "uuid", "p_title" character varying, "p_description" "text", "p_discount_percent" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."add_flash_deal"("p_product_id" "uuid", "p_title" character varying, "p_description" "text", "p_discount_percent" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_flash_deal"("p_product_id" "uuid", "p_title" character varying, "p_description" "text", "p_discount_percent" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_bulk_update_product_prices"("category_id" "uuid", "adjustment_type" "text", "adjustment_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_bulk_update_product_prices"("category_id" "uuid", "adjustment_type" "text", "adjustment_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_bulk_update_product_prices"("category_id" "uuid", "adjustment_type" "text", "adjustment_value" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_confirm_user_email"("input_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_confirm_user_email"("input_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_confirm_user_email"("input_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_parent_category_id" "uuid", "p_image_url" "text", "p_sort_order" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_parent_category_id" "uuid", "p_image_url" "text", "p_sort_order" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_category"("p_name" "text", "p_slug" "text", "p_description" "text", "p_parent_category_id" "uuid", "p_image_url" "text", "p_sort_order" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean, "product_tags" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean, "product_tags" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean, "product_tags" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_product"("product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_insert_product_image"("product_id_param" "uuid", "image_url_param" "text", "is_primary_param" boolean, "display_order_param" integer, "alt_text_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_insert_product_image"("product_id_param" "uuid", "image_url_param" "text", "is_primary_param" boolean, "display_order_param" integer, "alt_text_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_insert_product_image"("product_id_param" "uuid", "image_url_param" "text", "is_primary_param" boolean, "display_order_param" integer, "alt_text_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_insert_product_variants"("variants_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_insert_product_variants"("variants_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_insert_product_variants"("variants_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_product"("product_id" "uuid", "product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_product"("product_id" "uuid", "product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_product"("product_id" "uuid", "product_name" "text", "product_slug" "text", "product_sku" "text", "product_description" "text", "product_base_price" numeric, "product_sale_price" numeric, "product_stock_quantity" integer, "product_category_id" "uuid", "product_is_active" boolean, "product_is_featured" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."api_register_seller"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."api_register_seller"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."api_register_seller"("p_email" "text", "p_password" "text", "p_full_name" "text", "p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_product_submission"("submission_id" "uuid", "admin_id" "uuid", "commission" numeric, "notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_product_submission"("submission_id" "uuid", "admin_id" "uuid", "commission" numeric, "notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_product_submission"("submission_id" "uuid", "admin_id" "uuid", "commission" numeric, "notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_email_verifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_verifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_email_verifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_verifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_verifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_verifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."clear_user_cart"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."clear_user_cart"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_user_cart"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_api_key"("p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_api_key"("p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_api_key"("p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_order"("user_id" "uuid", "shipping_address_id" "uuid", "billing_address_id" "uuid", "items" "jsonb", "payment_method" "text", "notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order"("user_id" "uuid", "shipping_address_id" "uuid", "billing_address_id" "uuid", "items" "jsonb", "payment_method" "text", "notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order"("user_id" "uuid", "shipping_address_id" "uuid", "billing_address_id" "uuid", "items" "jsonb", "payment_method" "text", "notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_from_auth"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_from_auth"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_from_auth"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrease_product_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_product_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_product_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_category_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_category_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_category_image"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_product_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_product_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_product_images"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_default_variant"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_variant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_variant"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_api_key"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_api_key"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_api_key"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_product_sku"("base_sku" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_product_sku"("base_sku" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_product_sku"("base_sku" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_product_slug"("base_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_product_slug"("base_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_product_slug"("base_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_flash_deals"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_flash_deals"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_flash_deals"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_flash_deals_safe"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_flash_deals_safe"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_flash_deals_safe"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_customer_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_customer_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_customer_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"("period" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"("period" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard_stats"("period" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_low_stock_products"("threshold" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_low_stock_products"("threshold" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_low_stock_products"("threshold" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_recent_orders"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_recent_orders"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_recent_orders"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_sales_by_category"("period" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_sales_by_category"("period" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_sales_by_category"("period" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_sales_by_period"("period" "text", "start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_sales_by_period"("period" "text", "start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_sales_by_period"("period" "text", "start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_top_products"("period" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_top_products"("period" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_top_products"("period" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_details"("product_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_details"("product_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_details"("product_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_seller_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_seller_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_seller_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_and_column_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_and_column_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_and_column_info"() TO "service_role";



GRANT ALL ON TABLE "public"."verification_tokens" TO "anon";
GRANT ALL ON TABLE "public"."verification_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_tokens" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_token_by_email_and_token"("email_param" "text", "token_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_by_email_and_token"("email_param" "text", "token_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_by_email_and_token"("email_param" "text", "token_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trending_products"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trending_products"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trending_products"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_cart"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_cart"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_cart"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_default_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_default_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_default_address"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_email_verified"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_email_verified"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_email_verified"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_seller"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_seller"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_seller"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."register_seller"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."register_seller"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_seller"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."register_seller_with_api_key"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text", "p_api_key_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."register_seller_with_api_key"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text", "p_api_key_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_seller_with_api_key"("p_store_name" "text", "p_description" "text", "p_contact_email" "text", "p_contact_phone" "text", "p_api_key_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."register_user_with_profile"("user_email" "text", "first_name" "text", "last_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."register_user_with_profile"("user_email" "text", "first_name" "text", "last_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_user_with_profile"("user_email" "text", "first_name" "text", "last_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_product_submission"("submission_id" "uuid", "admin_id" "uuid", "notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reject_product_submission"("submission_id" "uuid", "admin_id" "uuid", "notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reject_product_submission"("submission_id" "uuid", "admin_id" "uuid", "notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_api_key"("p_key_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_api_key"("p_key_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_api_key"("p_key_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON FUNCTION "public"."search_products"("search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_products"("search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_products"("search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_product_image_storage_path"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_image_storage_path"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_image_storage_path"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."temp_log_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."temp_log_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."temp_log_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_favorite"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_favorite"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_favorite"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_api_key_last_used"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_api_key_last_used"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_api_key_last_used"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_email_verification_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_email_verification_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_email_verification_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_status"("order_id" "uuid", "new_status" "text", "comment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_status"("order_id" "uuid", "new_status" "text", "comment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_status"("order_id" "uuid", "new_status" "text", "comment" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_cart"("p_user_id" "uuid", "p_cart_items" "jsonb", "p_recently_removed_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_cart"("p_user_id" "uuid", "p_cart_items" "jsonb", "p_recently_removed_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_cart"("p_user_id" "uuid", "p_cart_items" "jsonb", "p_recently_removed_items" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_cart_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_cart_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_cart_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_recently_viewed_product"("p_user_id" "uuid", "p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_recently_viewed_product"("p_user_id" "uuid", "p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_recently_viewed_product"("p_user_id" "uuid", "p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_api_key"("p_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."admin_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_operations" TO "anon";
GRANT ALL ON TABLE "public"."admin_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_operations" TO "service_role";



GRANT ALL ON TABLE "public"."api_key_usage" TO "anon";
GRANT ALL ON TABLE "public"."api_key_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."api_key_usage" TO "service_role";



GRANT ALL ON TABLE "public"."api_keys" TO "anon";
GRANT ALL ON TABLE "public"."api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."api_keys" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bulk_operation_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bulk_operation_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bulk_operation_seq" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."collection_products" TO "anon";
GRANT ALL ON TABLE "public"."collection_products" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_products" TO "service_role";



GRANT ALL ON TABLE "public"."debug_logs" TO "anon";
GRANT ALL ON TABLE "public"."debug_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."debug_logs" TO "service_role";



GRANT ALL ON TABLE "public"."discounts" TO "anon";
GRANT ALL ON TABLE "public"."discounts" TO "authenticated";
GRANT ALL ON TABLE "public"."discounts" TO "service_role";



GRANT ALL ON TABLE "public"."email_verifications" TO "anon";
GRANT ALL ON TABLE "public"."email_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."email_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."flash_deals" TO "anon";
GRANT ALL ON TABLE "public"."flash_deals" TO "authenticated";
GRANT ALL ON TABLE "public"."flash_deals" TO "service_role";



GRANT ALL ON TABLE "public"."order_history" TO "anon";
GRANT ALL ON TABLE "public"."order_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_history" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."product_attributes" TO "anon";
GRANT ALL ON TABLE "public"."product_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_reviews" TO "anon";
GRANT ALL ON TABLE "public"."product_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."product_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recently_viewed_products" TO "anon";
GRANT ALL ON TABLE "public"."recently_viewed_products" TO "authenticated";
GRANT ALL ON TABLE "public"."recently_viewed_products" TO "service_role";



GRANT ALL ON TABLE "public"."seller_product_submissions" TO "anon";
GRANT ALL ON TABLE "public"."seller_product_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_product_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."sellers" TO "anon";
GRANT ALL ON TABLE "public"."sellers" TO "authenticated";
GRANT ALL ON TABLE "public"."sellers" TO "service_role";



GRANT ALL ON TABLE "public"."seller_products" TO "anon";
GRANT ALL ON TABLE "public"."seller_products" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_products" TO "service_role";



GRANT ALL ON TABLE "public"."seller_profiles" TO "anon";
GRANT ALL ON TABLE "public"."seller_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."special_collections" TO "anon";
GRANT ALL ON TABLE "public"."special_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."special_collections" TO "service_role";



GRANT ALL ON TABLE "public"."tax_payments" TO "anon";
GRANT ALL ON TABLE "public"."tax_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_payments" TO "service_role";



GRANT ALL ON TABLE "public"."user_cart" TO "anon";
GRANT ALL ON TABLE "public"."user_cart" TO "authenticated";
GRANT ALL ON TABLE "public"."user_cart" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
