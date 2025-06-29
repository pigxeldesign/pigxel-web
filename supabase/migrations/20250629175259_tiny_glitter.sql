/*
  # Fix dApp Save Issues

  1. Add Default Values
    - Ensure blockchains is never null and defaults to empty array
    - Set default values for boolean fields
  
  2. Create Admin Utility Functions
    - Add RPC function for direct database manipulation
    - Improve logging for better debugging
  
  3. Fix Row Level Security
    - Verify and update RLS policies for dapps table
*/

-- Make sure blockchains is never null and defaults to an empty array
ALTER TABLE dapps 
  ALTER COLUMN blockchains SET DEFAULT '{}' :: text[];

-- Add default values for boolean flags if they don't have them already
DO $$
BEGIN
  -- Check if is_new has a default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' 
      AND column_name = 'is_new' 
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE dapps 
      ALTER COLUMN is_new SET DEFAULT false;
  END IF;

  -- Check if is_featured has a default value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dapps' 
      AND column_name = 'is_featured' 
      AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE dapps 
      ALTER COLUMN is_featured SET DEFAULT false;
  END IF;
END $$;

-- Ensure existing null values for blockchains are updated to empty arrays
UPDATE dapps 
SET blockchains = '{}' :: text[]
WHERE blockchains IS NULL;

-- Ensure existing null values for boolean flags are updated to false
UPDATE dapps 
SET is_new = false
WHERE is_new IS NULL;

UPDATE dapps 
SET is_featured = false
WHERE is_featured IS NULL;

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a direct method for admins to save dApps
CREATE OR REPLACE FUNCTION admin_save_dapp(
  p_dapp_data JSONB,
  p_operation TEXT DEFAULT 'INSERT'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  dapp_id UUID;
  inserted_row RECORD;
BEGIN
  -- Only admins can use this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can use this function';
  END IF;

  -- Log the request
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'RPC_CALL_' || p_operation,
    (p_dapp_data->>'id')::UUID,
    jsonb_build_object(
      'request_data', p_dapp_data,
      'timestamp', now(),
      'user_id', auth.uid()
    ),
    auth.uid()
  );

  IF p_operation = 'INSERT' THEN
    -- Extract the ID if provided or generate a new one
    dapp_id := COALESCE(
      (p_dapp_data->>'id')::UUID,
      gen_random_uuid()
    );

    -- Ensure id is included in data
    p_dapp_data := p_dapp_data || jsonb_build_object('id', dapp_id);
    
    -- Insert the new dApp
    IF p_dapp_data ? 'id' THEN
      -- Convert JSON to record structure and insert
      INSERT INTO dapps
      SELECT * FROM jsonb_populate_record(null::dapps, p_dapp_data)
      RETURNING * INTO inserted_row;
      
      -- Return success
      result := jsonb_build_object(
        'success', TRUE,
        'operation', 'INSERT',
        'id', inserted_row.id,
        'message', 'dApp successfully created'
      );
    ELSE
      -- Return error if ID is missing
      result := jsonb_build_object(
        'success', FALSE,
        'operation', 'INSERT',
        'error', 'ID field is missing in the provided data'
      );
    END IF;
  ELSIF p_operation = 'UPDATE' THEN
    -- Extract the ID from data
    dapp_id := (p_dapp_data->>'id')::UUID;
    
    IF dapp_id IS NULL THEN
      RAISE EXCEPTION 'ID is required for update operation';
    END IF;
    
    -- Update the dApp
    UPDATE dapps
    SET 
      name = COALESCE(p_dapp_data->>'name', name),
      description = COALESCE(p_dapp_data->>'description', description),
      problem_solved = COALESCE(p_dapp_data->>'problem_solved', problem_solved),
      logo_url = NULLIF(p_dapp_data->>'logo_url', ''),
      thumbnail_url = NULLIF(p_dapp_data->>'thumbnail_url', ''),
      category_id = NULLIF(p_dapp_data->>'category_id', '')::UUID,
      sub_category = COALESCE(p_dapp_data->>'sub_category', sub_category),
      blockchains = COALESCE(
        (SELECT ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains'))),
        blockchains,
        '{}'::text[]
      ),
      is_new = COALESCE((p_dapp_data->>'is_new')::BOOLEAN, is_new, false),
      is_featured = COALESCE((p_dapp_data->>'is_featured')::BOOLEAN, is_featured, false),
      live_url = COALESCE(p_dapp_data->>'live_url', live_url),
      github_url = NULLIF(p_dapp_data->>'github_url', ''),
      twitter_url = NULLIF(p_dapp_data->>'twitter_url', ''),
      documentation_url = NULLIF(p_dapp_data->>'documentation_url', ''),
      discord_url = NULLIF(p_dapp_data->>'discord_url', ''),
      updated_at = now()
    WHERE id = dapp_id
    RETURNING * INTO inserted_row;
    
    -- Return success
    IF inserted_row IS NOT NULL THEN
      result := jsonb_build_object(
        'success', TRUE,
        'operation', 'UPDATE',
        'id', inserted_row.id,
        'message', 'dApp successfully updated'
      );
    ELSE
      result := jsonb_build_object(
        'success', FALSE,
        'operation', 'UPDATE',
        'error', 'No dApp found with ID: ' || dapp_id
      );
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid operation: must be INSERT or UPDATE';
  END IF;

  -- Log the result
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'RPC_RESULT_' || p_operation,
    dapp_id,
    jsonb_build_object(
      'result', result,
      'timestamp', now(),
      'user_id', auth.uid()
    ),
    auth.uid()
  );

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  BEGIN
    INSERT INTO dapp_operation_logs (
      operation_type, 
      dapp_id,
      data,
      performed_by
    ) VALUES (
      'RPC_ERROR_' || p_operation,
      dapp_id,
      jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'timestamp', now(),
        'request_data', p_dapp_data,
        'user_id', auth.uid()
      ),
      auth.uid()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Suppress errors in the error handler
  END;

  RETURN jsonb_build_object(
    'success', FALSE,
    'operation', p_operation,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure proper access to the admin_save_dapp function
GRANT EXECUTE ON FUNCTION admin_save_dapp(JSONB, TEXT) TO authenticated;

-- Verify and ensure dapps RLS policies are correct
DO $$ 
BEGIN
  -- Ensure "Anyone can view dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Anyone can view dapps'
  ) THEN
    CREATE POLICY "Anyone can view dapps" ON dapps FOR SELECT
    USING (true);
  END IF;

  -- Ensure "Admins can update dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can update dapps'
  ) THEN
    CREATE POLICY "Admins can update dapps" ON dapps FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;

  -- Ensure "Admins can delete dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can delete dapps'
  ) THEN
    CREATE POLICY "Admins can delete dapps" ON dapps FOR DELETE
    USING (is_admin());
  END IF;

  -- Ensure "Admins can insert dapps" policy exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps' 
      AND policyname = 'Admins can insert dapps'
  ) THEN
    CREATE POLICY "Admins can insert dapps" ON dapps FOR INSERT
    WITH CHECK (is_admin());
  END IF;
END $$;