/*
  # Fix Security Definer View

  1. Changes
     - Add SECURITY DEFINER property to the dapp_with_categories view
     - This ensures the view enforces proper row-level security policies

  2. Security
     - Ensures the view runs with the permissions of the view creator
     - Enforces proper row-level security policies
*/

-- First drop the existing view
DROP VIEW IF EXISTS dapp_with_categories;

-- Recreate the view with SECURITY DEFINER property
CREATE VIEW dapp_with_categories WITH (SECURITY_DEFINER = true) AS
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