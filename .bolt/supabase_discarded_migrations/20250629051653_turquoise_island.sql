/*
  # Fix Category Display in DApp Spotlight

  1. Changes
    - Add a function to properly retrieve category information for dApps
    - Ensure category data is correctly joined when querying dApps
  
  2. Problem Solved
    - Fixes issue where dApps with valid category_id still show as "Uncategorized"
    - Improves data retrieval for category information
*/

-- Create a view to make category retrieval more reliable
CREATE OR REPLACE VIEW dapp_with_categories AS
SELECT 
  d.*,
  c.id as category_id,
  c.title as category_title,
  c.slug as category_slug
FROM 
  dapps d
LEFT JOIN 
  categories c ON d.category_id = c.id;

-- Add an index to improve join performance
CREATE INDEX IF NOT EXISTS idx_dapps_category_id_lookup ON dapps(category_id);