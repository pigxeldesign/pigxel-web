/*
  # Fix dApp Category Display

  1. Create View
    - Create a view that properly joins dapps with categories
    - Avoid column name conflicts by using specific column aliases
  
  2. Performance
    - Add index to improve join performance on category lookups
*/

-- Create a view to make category retrieval more reliable
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
  d.rating,
  d.user_count,
  d.is_new,
  d.is_featured,
  d.live_url,
  d.github_url,
  d.twitter_url,
  d.documentation_url,
  d.discord_url,
  d.founded,
  d.team,
  d.total_value_locked,
  d.daily_active_users,
  d.transactions,
  d.audits,
  d.licenses,
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

-- Add an index to improve join performance
CREATE INDEX IF NOT EXISTS idx_dapps_category_id_lookup ON dapps(category_id);