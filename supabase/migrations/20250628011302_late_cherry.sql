/*
  # Auto-create profiles for new users

  1. New Functions
    - `create_profile_for_new_user()` - Automatically creates a profile when a new user signs up
  
  2. New Triggers
    - `on_auth_user_created` - Triggers the profile creation function after user insertion
  
  3. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Automatically sets user_type to 'general_user' by default
    - Handles the id and email from the auth.users table

  This migration ensures that every new user who signs up through Supabase Authentication
  will automatically have a corresponding entry in the profiles table.
*/

-- Create a function to insert a new profile when a new user is created
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (NEW.id, NEW.email, 'general_user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();