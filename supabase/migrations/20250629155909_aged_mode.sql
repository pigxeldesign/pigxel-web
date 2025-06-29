/*
  # Fix dApps Table Schema

  1. Schema Updates
     - Ensures rating column exists with proper type (numeric(2,1))
     - Ensures view_count column exists with proper type (integer)
     - Ensures completion_rate column exists with proper type (integer)
     - Updates dapp_with_categories view to include all necessary columns

  2. Data Integrity
     - Adds default values for numeric columns
     - Adds constraint to ensure rating is between 0 and 5
*/

-- Ensure rating column exists with proper type and constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'rating'
  ) THEN
    ALTER TABLE dapps ADD COLUMN rating numeric(2,1) DEFAULT 0;
    
    -- Add constraint to ensure rating is between 0 and 5
    ALTER TABLE dapps ADD CONSTRAINT dapps_rating_check 
      CHECK (rating >= 0 AND rating <= 5);
  END IF;
END $$;

-- Ensure view_count column exists with proper type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE dapps ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Ensure completion_rate column exists with proper type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' AND column_name = 'completion_rate'
  ) THEN
    ALTER TABLE dapps ADD COLUMN completion_rate integer DEFAULT 0;
  END IF;
END $$;

-- Recreate the dapp_with_categories view to reflect the current schema
DROP VIEW IF EXISTS dapp_with_categories;

-- Create the view with all necessary columns
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
  d.rating,
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