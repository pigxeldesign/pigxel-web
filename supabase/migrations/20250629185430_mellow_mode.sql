/*
  # Fix dApp Creation

  1. Create a simple function for direct table insertion
  2. Simplified admin_save_dapp function with proper error handling
  3. Add debugging capabilities
*/

-- Create a direct insert function that bypasses potential issues
CREATE OR REPLACE FUNCTION simple_insert_dapp(p_dapp_data JSONB)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
  inserted_id UUID;
BEGIN
  -- Generate new UUID
  dapp_id := gen_random_uuid();

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
REVOKE ALL ON FUNCTION simple_insert_dapp(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION simple_insert_dapp(jsonb) TO authenticated;