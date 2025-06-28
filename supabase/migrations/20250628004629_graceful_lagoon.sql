/*
  # Create Admin User

  This script helps you create an admin user after they sign up through Supabase Auth.
  
  Instructions:
  1. First, have the admin user sign up through your app's authentication
  2. Get their user ID from the Supabase Auth dashboard
  3. Replace 'REPLACE_WITH_ACTUAL_USER_ID' with their actual UUID
  4. Run this script
*/

-- Replace 'REPLACE_WITH_ACTUAL_USER_ID' with the actual user ID from auth.users
-- Replace 'admin@yourdomain.com' with the actual admin email

-- Example usage (uncomment and modify):
/*
INSERT INTO profiles (id, email, user_type) 
VALUES (
  'REPLACE_WITH_ACTUAL_USER_ID',
  'admin@yourdomain.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET 
  user_type = 'admin',
  updated_at = now();
*/

-- You can also use this query to find existing users:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- And this query to check current profiles:
-- SELECT * FROM profiles ORDER BY created_at DESC;