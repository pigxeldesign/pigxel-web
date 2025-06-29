-- Drop existing function if it exists
DROP FUNCTION IF EXISTS admin_save_dapp(jsonb, text);

-- Recreate the function with improved handling
CREATE OR REPLACE FUNCTION admin_save_dapp(
  p_dapp_data JSONB,
  p_operation TEXT DEFAULT 'INSERT'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  dapp_id UUID;
  inserted_id UUID;
  v_timestamp TIMESTAMPTZ;
BEGIN
  -- Debug log the input parameters
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id,
    data,
    performed_by
  ) VALUES (
    'DEBUG_ADMIN_SAVE_DAPP_CALL',
    (p_dapp_data->>'id')::UUID,
    jsonb_build_object(
      'operation', p_operation,
      'data', p_dapp_data,
      'user_id', auth.uid()
    ),
    auth.uid()
  );

  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Authentication required',
      'code', 'AUTH_REQUIRED'
    );
  END IF;

  -- Check if user is admin
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

  -- Get current timestamp for consistency
  v_timestamp := now();

  -- Handle insert operation
  IF p_operation = 'INSERT' THEN
    -- Generate new UUID if not provided
    dapp_id := CASE
                 WHEN p_dapp_data ? 'id' AND (p_dapp_data->>'id') IS NOT NULL
                 THEN (p_dapp_data->>'id')::UUID
                 ELSE gen_random_uuid()
               END;
    
    -- Convert blockchains to text array if it's a JSON array
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
      discord_url,
      created_at,
      updated_at
    ) VALUES (
      dapp_id,
      p_dapp_data->>'name',
      p_dapp_data->>'description',
      p_dapp_data->>'problem_solved',
      NULLIF(p_dapp_data->>'logo_url', ''),
      NULLIF(p_dapp_data->>'thumbnail_url', ''),
      CASE
        WHEN p_dapp_data ? 'category_id' AND (p_dapp_data->>'category_id') <> ''
        THEN (p_dapp_data->>'category_id')::UUID
        ELSE NULL
      END,
      COALESCE(p_dapp_data->>'sub_category', ''),
      COALESCE(
        CASE 
          WHEN jsonb_typeof(p_dapp_data->'blockchains') = 'array' 
          THEN ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains'))
          ELSE '{}'::text[]
        END,
        '{}'::text[]
      ),
      COALESCE((p_dapp_data->>'is_new')::BOOLEAN, FALSE),
      COALESCE((p_dapp_data->>'is_featured')::BOOLEAN, FALSE),
      p_dapp_data->>'live_url',
      NULLIF(p_dapp_data->>'github_url', ''),
      NULLIF(p_dapp_data->>'twitter_url', ''),
      NULLIF(p_dapp_data->>'documentation_url', ''),
      NULLIF(p_dapp_data->>'discord_url', ''),
      v_timestamp,
      v_timestamp
    )
    RETURNING id INTO inserted_id;
    
    -- Check if insert was successful
    IF inserted_id IS NOT NULL THEN
      -- Return success with the ID
      result := jsonb_build_object(
        'success', TRUE,
        'operation', 'INSERT',
        'id', inserted_id,
        'message', 'dApp successfully created'
      );
    ELSE
      -- Handle case when insert didn't return an ID
      result := jsonb_build_object(
        'success', FALSE,
        'operation', 'INSERT',
        'error', 'Failed to insert dApp',
        'code', 'INSERT_FAILED'
      );
    END IF;
  
  -- Handle update operation
  ELSIF p_operation = 'UPDATE' THEN
    -- Get the ID from the data
    dapp_id := (p_dapp_data->>'id')::UUID;
    
    -- Check if ID exists
    IF dapp_id IS NULL THEN
      RETURN jsonb_build_object(
        'success', FALSE,
        'operation', 'UPDATE',
        'error', 'ID is required for update operation',
        'code', 'ID_REQUIRED'
      );
    END IF;
    
    -- Check if the dApp exists
    IF NOT EXISTS (SELECT 1 FROM dapps WHERE id = dapp_id) THEN
      RETURN jsonb_build_object(
        'success', FALSE,
        'operation', 'UPDATE',
        'error', 'dApp not found with ID: ' || dapp_id,
        'code', 'DAPP_NOT_FOUND'
      );
    END IF;

    -- Update the dApp
    UPDATE dapps
    SET
      name = COALESCE(p_dapp_data->>'name', name),
      description = COALESCE(p_dapp_data->>'description', description),
      problem_solved = COALESCE(p_dapp_data->>'problem_solved', problem_solved),
      logo_url = CASE 
                   WHEN p_dapp_data ? 'logo_url' 
                   THEN NULLIF(p_dapp_data->>'logo_url', '')
                   ELSE logo_url
                 END,
      thumbnail_url = CASE 
                        WHEN p_dapp_data ? 'thumbnail_url' 
                        THEN NULLIF(p_dapp_data->>'thumbnail_url', '')
                        ELSE thumbnail_url
                      END,
      category_id = CASE
                      WHEN p_dapp_data ? 'category_id' 
                      THEN NULLIF(p_dapp_data->>'category_id', '')::UUID
                      ELSE category_id
                    END,
      sub_category = COALESCE(p_dapp_data->>'sub_category', sub_category),
      blockchains = CASE
                      WHEN jsonb_typeof(p_dapp_data->'blockchains') = 'array'
                      THEN ARRAY(SELECT jsonb_array_elements_text(p_dapp_data->'blockchains'))
                      ELSE blockchains
                    END,
      is_new = CASE
                 WHEN p_dapp_data ? 'is_new'
                 THEN (p_dapp_data->>'is_new')::BOOLEAN
                 ELSE is_new
               END,
      is_featured = CASE
                      WHEN p_dapp_data ? 'is_featured'
                      THEN (p_dapp_data->>'is_featured')::BOOLEAN
                      ELSE is_featured
                    END,
      live_url = COALESCE(p_dapp_data->>'live_url', live_url),
      github_url = CASE 
                     WHEN p_dapp_data ? 'github_url' 
                     THEN NULLIF(p_dapp_data->>'github_url', '')
                     ELSE github_url
                   END,
      twitter_url = CASE 
                      WHEN p_dapp_data ? 'twitter_url' 
                      THEN NULLIF(p_dapp_data->>'twitter_url', '')
                      ELSE twitter_url
                    END,
      documentation_url = CASE 
                            WHEN p_dapp_data ? 'documentation_url' 
                            THEN NULLIF(p_dapp_data->>'documentation_url', '')
                            ELSE documentation_url
                          END,
      discord_url = CASE 
                      WHEN p_dapp_data ? 'discord_url' 
                      THEN NULLIF(p_dapp_data->>'discord_url', '')
                      ELSE discord_url
                    END,
      updated_at = v_timestamp
    WHERE id = dapp_id
    RETURNING id INTO inserted_id;
    
    -- Check if update was successful
    IF inserted_id IS NOT NULL THEN
      -- Return success with the ID
      result := jsonb_build_object(
        'success', TRUE,
        'operation', 'UPDATE',
        'id', inserted_id,
        'message', 'dApp successfully updated'
      );
    ELSE
      -- Handle case when update didn't return an ID
      result := jsonb_build_object(
        'success', FALSE,
        'operation', 'UPDATE',
        'error', 'Failed to update dApp',
        'code', 'UPDATE_FAILED'
      );
    END IF;
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
    'RPC_RESULT_' || p_operation,
    dapp_id,
    jsonb_build_object(
      'result', result,
      'timestamp', v_timestamp
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
        'stack', format('%s: %s', SQLERRM, SQLSTATE)
      ),
      auth.uid()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Suppress errors in the error handler
    NULL;
  END;
  
  -- Return detailed error information
  RETURN jsonb_build_object(
    'success', FALSE,
    'operation', p_operation,
    'error', SQLERRM,
    'code', SQLSTATE,
    'hint', 'See dapp_operation_logs for more details'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
REVOKE ALL ON FUNCTION admin_save_dapp(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_save_dapp(jsonb, text) TO authenticated;

-- Check RLS is enabled on dapps table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'dapps' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE dapps ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;