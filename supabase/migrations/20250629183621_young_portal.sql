/*
  # Fix admin_save_dapp function
  
  1. Implementation Changes
    - Replace the complex admin_save_dapp function with a simpler, more reliable implementation
    - Use direct SQL insertion/update instead of complex variable handling
    - Add proper error handling and authentication checks
    
  2. Security
    - Maintain security definer context
    - Keep proper authentication and admin checks
    - Maintain RLS policies for data protection
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS admin_save_dapp(jsonb, text);

-- Create a simplified and reliable version of the function
CREATE OR REPLACE FUNCTION admin_save_dapp(
  p_dapp_data JSONB,
  p_operation TEXT DEFAULT 'INSERT'
)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
  result JSONB;
BEGIN
  -- Log the function call for debugging
  INSERT INTO dapp_operation_logs (
    operation_type,
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'ADMIN_SAVE_DAPP_CALL',
    (p_dapp_data->>'id')::UUID,
    jsonb_build_object(
      'operation', p_operation,
      'data', p_dapp_data
    ),
    auth.uid()
  );

  -- Authentication check
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Authentication required',
      'code', 'AUTH_REQUIRED'
    );
  END IF;

  -- Admin check
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Admin privileges required',
      'code', 'ADMIN_REQUIRED'
    );
  END IF;

  -- INSERT operation
  IF p_operation = 'INSERT' THEN
    -- Generate new UUID if not provided
    IF p_dapp_data->>'id' IS NULL OR p_dapp_data->>'id' = '' THEN
      dapp_id := gen_random_uuid();
    ELSE
      dapp_id := (p_dapp_data->>'id')::UUID;
    END IF;

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
      CASE
        WHEN jsonb_typeof(p_dapp_data->'blockchains') = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains'))
        ELSE '{}'::text[]
      END,
      COALESCE((p_dapp_data->>'is_new')::BOOLEAN, false),
      COALESCE((p_dapp_data->>'is_featured')::BOOLEAN, false),
      p_dapp_data->>'live_url',
      NULLIF(p_dapp_data->>'github_url', ''),
      NULLIF(p_dapp_data->>'twitter_url', ''),
      NULLIF(p_dapp_data->>'documentation_url', ''),
      NULLIF(p_dapp_data->>'discord_url', '')
    );

    result := jsonb_build_object(
      'success', TRUE,
      'operation', 'INSERT',
      'id', dapp_id,
      'message', 'dApp successfully created'
    );

  -- UPDATE operation
  ELSIF p_operation = 'UPDATE' THEN
    dapp_id := (p_dapp_data->>'id')::UUID;
    
    IF dapp_id IS NULL THEN
      RETURN jsonb_build_object(
        'success', FALSE,
        'error', 'ID is required for update operation',
        'code', 'ID_REQUIRED'
      );
    END IF;

    UPDATE dapps
    SET
      name = COALESCE(p_dapp_data->>'name', name),
      description = COALESCE(p_dapp_data->>'description', description),
      problem_solved = COALESCE(p_dapp_data->>'problem_solved', problem_solved),
      logo_url = CASE WHEN p_dapp_data ? 'logo_url' THEN NULLIF(p_dapp_data->>'logo_url', '') ELSE logo_url END,
      thumbnail_url = CASE WHEN p_dapp_data ? 'thumbnail_url' THEN NULLIF(p_dapp_data->>'thumbnail_url', '') ELSE thumbnail_url END,
      category_id = CASE WHEN p_dapp_data ? 'category_id' THEN NULLIF(p_dapp_data->>'category_id', '')::UUID ELSE category_id END,
      sub_category = COALESCE(p_dapp_data->>'sub_category', sub_category),
      blockchains = CASE
                      WHEN jsonb_typeof(p_dapp_data->'blockchains') = 'array'
                      THEN ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains'))
                      ELSE blockchains
                    END,
      is_new = COALESCE((p_dapp_data->>'is_new')::BOOLEAN, is_new),
      is_featured = COALESCE((p_dapp_data->>'is_featured')::BOOLEAN, is_featured),
      live_url = COALESCE(p_dapp_data->>'live_url', live_url),
      github_url = CASE WHEN p_dapp_data ? 'github_url' THEN NULLIF(p_dapp_data->>'github_url', '') ELSE github_url END,
      twitter_url = CASE WHEN p_dapp_data ? 'twitter_url' THEN NULLIF(p_dapp_data->>'twitter_url', '') ELSE twitter_url END,
      documentation_url = CASE WHEN p_dapp_data ? 'documentation_url' THEN NULLIF(p_dapp_data->>'documentation_url', '') ELSE documentation_url END,
      discord_url = CASE WHEN p_dapp_data ? 'discord_url' THEN NULLIF(p_dapp_data->>'discord_url', '') ELSE discord_url END,
      updated_at = now()
    WHERE id = dapp_id;

    result := jsonb_build_object(
      'success', TRUE,
      'operation', 'UPDATE',
      'id', dapp_id,
      'message', 'dApp successfully updated'
    );
  
  ELSE
    -- Invalid operation
    result := jsonb_build_object(
      'success', FALSE,
      'error', 'Invalid operation: ' || p_operation,
      'code', 'INVALID_OPERATION'
    );
  END IF;

  -- Log the result
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'ADMIN_SAVE_DAPP_RESULT',
    dapp_id,
    result,
    auth.uid()
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Log the error
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'ADMIN_SAVE_DAPP_ERROR',
    dapp_id,
    jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'operation', p_operation
    ),
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'code', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
REVOKE ALL ON FUNCTION admin_save_dapp(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_save_dapp(jsonb, text) TO authenticated;

-- Create a simple function to test authentication status
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

GRANT EXECUTE ON FUNCTION check_auth_status() TO authenticated;
GRANT EXECUTE ON FUNCTION check_auth_status() TO anon;

-- Create a simple direct insert function as a fallback
CREATE OR REPLACE FUNCTION direct_insert_dapp(
  p_dapp_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
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

  -- Insert using the most basic approach
  INSERT INTO dapps (id, name, description, problem_solved, live_url)
  VALUES (
    dapp_id,
    p_dapp_data->>'name',
    p_dapp_data->>'description',
    p_dapp_data->>'problem_solved',
    p_dapp_data->>'live_url'
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'id', dapp_id,
    'message', 'dApp created with basic fields'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION direct_insert_dapp(JSONB) TO authenticated;