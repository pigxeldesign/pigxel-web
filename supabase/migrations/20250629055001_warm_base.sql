/*
  # Remove Additional Information Fields from dApps Table

  1. Changes
    - Drop columns related to additional information from the dapps table
    - Update the dapp_with_categories view to reflect the schema changes

  2. Columns Removed
    - founded: Year the dApp was founded
    - team: Information about the team behind the dApp
    - total_value_locked: Total value locked in the protocol
    - daily_active_users: Number of daily active users
    - transactions: Transaction volume information
    - audits: Array of security audit information
    - licenses: Array of license information

  This migration permanently removes these fields from the database schema.
*/

-- Drop columns from the dapps table
ALTER TABLE dapps
DROP COLUMN founded,
DROP COLUMN team,
DROP COLUMN total_value_locked,
DROP COLUMN daily_active_users,
DROP COLUMN transactions,
DROP COLUMN audits,
DROP COLUMN licenses;

-- Recreate the dapp_with_categories view to reflect the schema changes
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