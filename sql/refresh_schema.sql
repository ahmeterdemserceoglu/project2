-- Refresh PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Show profile table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM 
  information_schema.columns
WHERE 
  table_name = 'profiles' 
ORDER BY ordinal_position;

-- Ensure is_email_verified column exists in profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_email_verified boolean DEFAULT false;
  END IF;
END $$; 

-- Fix permission issues with admin check functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create policy for admin access
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles
  USING (is_admin());

-- Re-create policies for other tables that might use auth.users
DO $$ 
DECLARE
  tables text[] := ARRAY['orders', 'products', 'categories', 'addresses', 'payments', 'favorites', 'carts', 'reviews'];
  t text;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %1$s_admin_all ON %1$s', t);
      EXECUTE format('CREATE POLICY %1$s_admin_all ON %1$s USING (is_admin())', t);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping table %: %', t, SQLERRM;
    END;
  END LOOP;
END $$; 