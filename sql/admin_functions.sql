-- Function to insert a product image with admin privileges
-- This bypasses RLS since it's marked as SECURITY DEFINER
CREATE OR REPLACE FUNCTION admin_insert_product_image(
  product_id_param UUID,
  image_url_param TEXT,
  is_primary_param BOOLEAN,
  display_order_param INTEGER,
  alt_text_param TEXT
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 