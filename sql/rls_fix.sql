-- Add admin policy for product_images table
DROP POLICY IF EXISTS product_images_admin_all ON product_images;

-- Create admin policy for full access to product_images
CREATE POLICY product_images_admin_all ON product_images
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Ensure the product_images_read_all policy exists
DROP POLICY IF EXISTS product_images_read_all ON product_images;
CREATE POLICY product_images_read_all ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id AND products.is_active = true
    )
  ); 