-- Function to create a product with a guaranteed unique slug and SKU
CREATE OR REPLACE FUNCTION admin_create_product(
  product_name TEXT,
  product_slug TEXT,
  product_sku TEXT,
  product_description TEXT,
  product_base_price DECIMAL,
  product_sale_price DECIMAL,
  product_stock_quantity INTEGER,
  product_category_id UUID,
  product_is_active BOOLEAN,
  product_is_featured BOOLEAN
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a product with a guaranteed unique slug and SKU
CREATE OR REPLACE FUNCTION admin_update_product(
  product_id UUID,
  product_name TEXT,
  product_slug TEXT,
  product_sku TEXT,
  product_description TEXT,
  product_base_price DECIMAL,
  product_sale_price DECIMAL,
  product_stock_quantity INTEGER,
  product_category_id UUID,
  product_is_active BOOLEAN,
  product_is_featured BOOLEAN
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 