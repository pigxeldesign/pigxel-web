/*
  # Fix Security Definer View

  1. Changes
    - Drop existing view if it exists
    - Recreate the view with correct SECURITY DEFINER syntax
    - Ensure all columns and joins are preserved
*/

-- First drop the existing view
DROP VIEW IF EXISTS public.dapp_with_categories;

-- Recreate the view with SECURITY DEFINER property using correct syntax
CREATE OR REPLACE VIEW public.dapp_with_categories 
AS 
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
  public.dapps d
LEFT JOIN
  public.categories c ON d.category_id = c.id
WITH SECURITY DEFINER;