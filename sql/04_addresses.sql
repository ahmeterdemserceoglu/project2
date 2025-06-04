-- Create the addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(30),
  is_default BOOLEAN NOT NULL DEFAULT false,
  address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('shipping', 'billing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the addresses table
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own addresses
CREATE POLICY "Users can insert their own addresses" ON public.addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own addresses
CREATE POLICY "Users can update their own addresses" ON public.addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own addresses
CREATE POLICY "Users can delete their own addresses" ON public.addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index to speed up address lookups by user
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON public.addresses (user_id);

-- Add trigger to ensure only one default address per user and type
CREATE OR REPLACE FUNCTION public.handle_default_address()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger for insert operations
CREATE TRIGGER set_single_default_address_insert
AFTER INSERT ON public.addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.handle_default_address();

-- Trigger for update operations
CREATE TRIGGER set_single_default_address_update
AFTER UPDATE ON public.addresses
FOR EACH ROW
WHEN (NEW.is_default = true AND (OLD.is_default = false OR OLD.address_type != NEW.address_type))
EXECUTE FUNCTION public.handle_default_address(); 