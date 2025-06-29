-- Make sure blockchains is never null and defaults to an empty array
ALTER TABLE dapps 
  ALTER COLUMN blockchains SET DEFAULT '{}' :: text[];

-- Add default values for boolean flags if they don't have them already
DO $$
BEGIN
  -- Check if is_new has a default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' 
      AND column_name = 'is_new' 
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE dapps 
      ALTER COLUMN is_new SET DEFAULT false;
  END IF;

  -- Check if is_featured has a default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' 
      AND column_name = 'is_featured' 
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE dapps 
      ALTER COLUMN is_featured SET DEFAULT false;
  END IF;
END $$;

-- Ensure existing null values for blockchains are updated to empty arrays
UPDATE dapps 
SET blockchains = '{}' :: text[]
WHERE blockchains IS NULL;

-- Ensure existing null values for boolean flags are updated to false
UPDATE dapps 
SET is_new = false
WHERE is_new IS NULL;

UPDATE dapps 
SET is_featured = false
WHERE is_featured IS NULL;

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify and ensure dapps RLS policies are correct
DO $$ 
BEGIN
  -- Ensure "Anyone can view dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Anyone can view dapps'
  ) THEN
    CREATE POLICY "Anyone can view dapps" ON dapps FOR SELECT
    USING (true);
  END IF;

  -- Ensure "Admins can update dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can update dapps'
  ) THEN
    CREATE POLICY "Admins can update dapps" ON dapps FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;

  -- Ensure "Admins can delete dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can delete dapps'
  ) THEN
    CREATE POLICY "Admins can delete dapps" ON dapps FOR DELETE
    USING (is_admin());
  END IF;

  -- Ensure "Admins can insert dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can insert dapps'
  ) THEN
    CREATE POLICY "Admins can insert dapps" ON dapps FOR INSERT
    WITH CHECK (is_admin());
  END IF;
END $$;