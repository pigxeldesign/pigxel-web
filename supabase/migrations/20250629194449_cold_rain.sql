/*
# Simplify dApp Creation Process
  
This migration adds a simpler function for dApp insertion that bypasses complex RPC mechanisms.
*/

-- Create a simpler direct insertion function
CREATE OR REPLACE FUNCTION simple_insert_dapp(p_dapp_data JSONB)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
  inserted_id UUID;
BEGIN
  -- Admin check
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Admin privileges required'
    );
  END IF;

  -- Generate UUID if not provided
  IF p_dapp_data->>'id' IS NULL OR p_dapp_data->>'id' = '' THEN
    dapp_id := gen_random_uuid();
  ELSE
    dapp_id := (p_dapp_data->>'id')::UUID;
  END IF;

  -- Simple direct insert with minimal fields
  INSERT INTO dapps (
    id,
    name,
    description,
    problem_solved,
    logo_url,
    thumbnail_url,
    category_id,
    sub_category,
    blockchains,
    is_new,
    is_featured,
    live_url,
    github_url,
    twitter_url,
    documentation_url,
    discord_url
  ) VALUES (
    dapp_id,
    p_dapp_data->>'name',
    p_dapp_data->>'description',
    p_dapp_data->>'problem_solved',
    NULLIF(p_dapp_data->>'logo_url', ''),
    NULLIF(p_dapp_data->>'thumbnail_url', ''),
    NULLIF((p_dapp_data->>'category_id'), '')::UUID,
    p_dapp_data->>'sub_category',
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains')),
      '{}'::text[]
    ),
    COALESCE((p_dapp_data->>'is_new')::BOOLEAN, false),
    COALESCE((p_dapp_data->>'is_featured')::BOOLEAN, false),
    p_dapp_data->>'live_url',
    NULLIF(p_dapp_data->>'github_url', ''),
    NULLIF(p_dapp_data->>'twitter_url', ''),
    NULLIF(p_dapp_data->>'documentation_url', ''),
    NULLIF(p_dapp_data->>'discord_url', '')
  )
  RETURNING id INTO inserted_id;

  IF inserted_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Failed to insert dApp'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'id', inserted_id,
    'message', 'dApp created successfully'
  );
EXCEPTION WHEN OTHERS THEN
  INSERT INTO dapp_operation_logs (
    operation_type,
    data,
    performed_by
  ) VALUES (
    'SIMPLE_INSERT_ERROR',
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'data', p_dapp_data
    ),
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION simple_insert_dapp(jsonb) TO authenticated;

-- Create a simple function to check authentication status
CREATE OR REPLACE FUNCTION check_auth_status()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'is_authenticated', auth.uid() IS NOT NULL,
    'user_id', auth.uid(),
    'is_admin', EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_auth_status() TO authenticated, anon;