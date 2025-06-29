/*
  # Fix view creation error

  1. Changes
     - Remove references to non-existent columns in the view
     - Safely drop columns that might exist
     - Recreate the dapp_with_categories view with correct column references
*/

-- Safely drop columns from the dapps table if they exist
DO $$
BEGIN
  -- Drop founded column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'founded'
  ) THEN
    ALTER TABLE dapps DROP COLUMN founded;
  END IF;

  -- Drop team column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'team'
  ) THEN
    ALTER TABLE dapps DROP COLUMN team;
  END IF;

  -- Drop total_value_locked column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'total_value_locked'
  ) THEN
    ALTER TABLE dapps DROP COLUMN total_value_locked;
  END IF;

  -- Drop daily_active_users column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'daily_active_users'
  ) THEN
    ALTER TABLE dapps DROP COLUMN daily_active_users;
  END IF;

  -- Drop transactions column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'transactions'
  ) THEN
    ALTER TABLE dapps DROP COLUMN transactions;
  END IF;

  -- Drop audits column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'audits'
  ) THEN
    ALTER TABLE dapps DROP COLUMN audits;
  END IF;

  -- Drop licenses column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'licenses'
  ) THEN
    ALTER TABLE dapps DROP COLUMN licenses;
  END IF;
END $$;

-- Recreate the dapp_with_categories view to reflect the current schema
DROP VIEW IF EXISTS dapp_with_categories;

-- Create the view with only columns that exist in the schema
CREATE OR REPLACE VIEW dapp_with_categories AS
SELECT
  d.id,
  d.name,
  d.description,
  d.problem_solved,
  d.logo_url,
  d.thumbnail_url,
  d.category_id,
  d.sub_category,
  d.blockchains,
  d.view_count,
  d.completion_rate,
  d.is_new,
  d.is_featured,
  d.live_url,
  d.github_url,
  d.twitter_url,
  d.documentation_url,
  d.discord_url,
  d.created_at,
  d.updated_at,
  c.title as category_title,
  c.slug as category_slug,
  c.description as category_description,
  c.icon_name as category_icon,
  c.color_gradient as category_color
FROM
  dapps d
LEFT JOIN
  categories c ON d.category_id = c.id;