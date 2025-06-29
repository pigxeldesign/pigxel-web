/*
  # Remove Rating and User Count Fields

  1. Changes
    - Drop the view that depends on the columns we want to remove
    - Remove rating and user_count columns from the dapps table
    - Recreate the view without the removed columns

  This migration removes the rating and user_count fields from the dApps table
  to simplify the data model.
*/

-- First, drop the view that depends on the columns we want to remove
DROP VIEW IF EXISTS dapp_with_categories;

-- Now drop the columns from the dapps table
ALTER TABLE dapps
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS user_count;

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