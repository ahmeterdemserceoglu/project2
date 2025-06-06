-- Function to generate a guaranteed unique product slug
CREATE OR REPLACE FUNCTION generate_unique_product_slug(base_slug TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 