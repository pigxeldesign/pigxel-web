/*
  # Add default values to dApps table fields

  1. Changes
     - Add DEFAULT values for blockchains, is_new, is_featured to ensure consistency 
     - Ensure blockchains is always an array, never null
     - Add default false values for boolean flags
  
  2. Security
     - No RLS changes in this migration
*/

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