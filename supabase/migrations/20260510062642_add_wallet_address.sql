-- 1. Add wallet_address column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_address text UNIQUE;

-- 2. Make email nullable for wallet-only users
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 3. Update the trigger function to capture wallet_address from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, wallet_address, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'wallet_address',
    'general_user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
