-- Function to generate a guaranteed unique product SKU
CREATE OR REPLACE FUNCTION generate_unique_product_sku(base_sku TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 