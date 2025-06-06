-- Fix permissions issues with auth.users table access
-- This script creates security definer functions to safely access auth information

-- Disable triggers during updates
SET session_replication_role = replica;

-- Clear function cache
DO $$ 
BEGIN
  EXECUTE 'SELECT pg_notify(''pgrst'', ''reload schema'')';
END $$;

-- Helper function to check if user is admin without directly accessing auth.users
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to safely get a user's email
CREATE OR REPLACE FUNCTION get_auth_email() 
RETURNS text AS $$
DECLARE
  email text;
BEGIN
  -- Use service_role to access auth.users
  SELECT au.email INTO email
  FROM auth.users au
  WHERE au.id = auth.uid();
  
  RETURN email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if email is verified
CREATE OR REPLACE FUNCTION is_email_verified()
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely register a user with profile
DROP FUNCTION IF EXISTS register_user_with_profile(text,text,text);

CREATE OR REPLACE FUNCTION register_user_with_profile(
  user_email text,
  first_name text DEFAULT '',
  last_name text DEFAULT ''
) RETURNS void AS $$
DECLARE
  auth_user_id uuid;
  log_column_name TEXT;
BEGIN
  -- First check if user already exists in profiles
  IF EXISTS (SELECT 1 FROM profiles WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;

  -- Try to find user in auth.users by email
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  -- If we found the auth user but no profile, create a profile
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      email, 
      first_name,
      last_name,
      is_admin,
      is_email_verified,
      created_at,
      updated_at
    ) VALUES (
      auth_user_id,
      user_email,
      first_name,
      last_name,
      false,
      false,
      now(),
      now()
    );
    
    -- Check which column name exists in debug_logs
    SELECT column_name INTO log_column_name
    FROM information_schema.columns 
    WHERE table_name = 'debug_logs' 
    AND column_name IN ('event_type', 'operation')
    LIMIT 1;
    
    -- Log successful profile creation based on table structure
    IF log_column_name = 'event_type' THEN
      INSERT INTO debug_logs (
        event_type,
        details,
        created_at
      ) VALUES (
        'profile_created',
        jsonb_build_object(
          'method', 'register_user_with_profile',
          'user_id', auth_user_id,
          'email', user_email
        ),
        now()
      );
    ELSE 
      -- Assume operation column exists
      INSERT INTO debug_logs (
        operation,
        status,
        details,
        created_at
      ) VALUES (
        'register_user_with_profile',
        'success',
        jsonb_build_object(
          'user_id', auth_user_id,
          'email', user_email,
          'method', 'register_user_with_profile'
        ),
        now()
      );
    END IF;
  ELSE
    -- No auth user found with this email
    RAISE EXCEPTION 'No authenticated user found with email %', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure a user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile() 
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace or create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE ensure_user_profile();

-- Update email verification status on confirmation
CREATE OR REPLACE FUNCTION update_email_verification_status() 
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check debug_logs table structure and fix if needed
DO $$
BEGIN
  -- Check if event_type column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'debug_logs' AND column_name = 'event_type'
  ) AND EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'debug_logs' AND column_name = 'operation'
  ) THEN
    -- Use existing column names for inserts
    CREATE OR REPLACE FUNCTION temp_log_function() 
    RETURNS trigger AS $FUNC$
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
    $FUNC$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Update logging calls based on table structure
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'debug_logs' AND column_name = 'operation'
  ) THEN
    -- Original table structure with 'operation' column
    -- No changes needed
    NULL;
  ELSIF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'debug_logs' AND column_name = 'event_type'
  ) THEN
    -- Update logging function for the event_type structure
    CREATE OR REPLACE FUNCTION on_auth_user_created_log() 
    RETURNS trigger AS $FUNC$
    BEGIN
      INSERT INTO debug_logs (
        event_type,
        details,
        created_at
      ) VALUES (
        'profile_created_by_trigger',
        jsonb_build_object(
          'user_id', NEW.id,
          'email', NEW.email
        ),
        NOW()
      );
      RETURN NULL;
    END;
    $FUNC$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Update the on_email_confirmed trigger
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at)
  EXECUTE PROCEDURE update_email_verification_status();

-- Fix any data inconsistencies
-- Update profiles with email verified status from auth.users
UPDATE profiles p
SET is_email_verified = true
FROM auth.users u
WHERE 
  p.id = u.id AND
  u.email_confirmed_at IS NOT NULL AND
  (p.is_email_verified IS NULL OR p.is_email_verified = false);

-- Update RLS policies to use safer admin check
-- Re-apply RLS to profiles table
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles
  USING (is_admin());

-- Re-create admin policies for other tables
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

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Notify PostgREST to refresh schema cache
SELECT pg_notify('pgrst', 'reload schema'); 