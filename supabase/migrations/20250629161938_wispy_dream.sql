/*
  # Fix dApp Schema

  1. Changes
     - Drop view that depends on columns
     - Remove rating and user_count columns
     - Recreate view with updated schema
  2. Security
     - No security changes
*/

-- First drop the view that depends on the columns
DROP VIEW IF EXISTS dapp_with_categories;

-- Drop rating column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'rating'
  ) THEN
    ALTER TABLE dapps DROP COLUMN rating;
  END IF;
END $$;

-- Drop user_count column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'user_count'
  ) THEN
    ALTER TABLE dapps DROP COLUMN user_count;
  END IF;
END $$;

-- Recreate the dapp_with_categories view to reflect the updated schema
CREATE VIEW dapp_with_categories AS
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