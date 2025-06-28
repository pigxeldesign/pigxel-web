/*
  # Add Flow Analytics Fields

  1. New Fields
    - `view_count` - Track how many times a flow has been viewed
    - `completion_rate` - Percentage of users who complete the flow
    - `rating` - Average user rating for the flow
  
  2. Changes
    - Add these fields to the flows table
    - Set default values for new fields
    - Update existing flows to have default values

  This migration adds analytics capabilities to track flow performance.
*/

-- Add analytics fields to flows table
ALTER TABLE flows 
ADD COLUMN view_count integer DEFAULT 0 NOT NULL,
ADD COLUMN completion_rate integer DEFAULT 0 NOT NULL,
ADD COLUMN rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

-- Create index for view_count to optimize sorting and filtering
CREATE INDEX IF NOT EXISTS idx_flows_view_count ON flows(view_count);