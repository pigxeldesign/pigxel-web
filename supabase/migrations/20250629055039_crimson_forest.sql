/*
  # Remove Additional Information Fields from dApps

  1. Changes
    - Drop the dapp_with_categories view first
    - Remove additional information columns from dapps table
    - Recreate the view without the dropped columns

  2. Columns being removed
    - founded
    - team
    - total_value_locked
    - daily_active_users
    - transactions
    - audits
    - licenses

  This migration removes the additional information fields that are no longer needed.
*/

-- First, drop the view that depends on the columns we want to remove
DROP VIEW IF EXISTS dapp_with_categories;

-- Now drop the columns from the dapps table
ALTER TABLE dapps
DROP COLUMN IF EXISTS founded,
DROP COLUMN IF EXISTS team,
DROP COLUMN IF EXISTS total_value_locked,
DROP COLUMN IF EXISTS daily_active_users,
DROP COLUMN IF EXISTS transactions,
DROP COLUMN IF EXISTS audits,
DROP COLUMN IF EXISTS licenses;

-- Recreate the dapp_with_categories view without the dropped columns
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
  d.user_count,
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