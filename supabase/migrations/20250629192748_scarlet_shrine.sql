-- Fix search_path vulnerability in security definer functions
-- This migration addresses the "Function Search Path Mutable" security issue

-- Fix search_path in is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in is_premium_user function (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_premium_user'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION is_premium_user()
      RETURNS BOOLEAN AS $$
      BEGIN
        SET search_path = pg_catalog, public;
        
        RETURN EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND user_type = ''premium_user''
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    ';
  END IF;
END $$;

-- Fix search_path in admin_save_dapp function
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
  SET search_path = pg_catalog, public;
  
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

-- Fix search_path in direct_insert_dapp function
CREATE OR REPLACE FUNCTION direct_insert_dapp(
  p_dapp_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
  inserted_id UUID;
BEGIN
  SET search_path = pg_catalog, public;
  
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

  -- Insert using the most basic approach with minimal required fields
  INSERT INTO dapps (id, name, description, problem_solved, live_url)
  VALUES (
    dapp_id,
    p_dapp_data->>'name',
    p_dapp_data->>'description',
    p_dapp_data->>'problem_solved',
    p_dapp_data->>'live_url'
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
    'DIRECT_INSERT_ERROR',
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

-- Fix search_path in simple_insert_dapp function
CREATE OR REPLACE FUNCTION simple_insert_dapp(p_dapp_data JSONB)
RETURNS JSONB AS $$
DECLARE
  dapp_id UUID;
  inserted_id UUID;
BEGIN
  SET search_path = pg_catalog, public;
  
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

-- Fix search_path in check_auth_status function
CREATE OR REPLACE FUNCTION check_auth_status()
RETURNS JSONB AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
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

-- Fix search_path in get_dapp_by_id function
CREATE OR REPLACE FUNCTION get_dapp_by_id(p_dapp_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SET search_path = pg_catalog, public;
  
  -- Check if the user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can use this function';
  END IF;

  -- Direct fetch bypassing RLS
  SELECT to_jsonb(d) INTO result
  FROM dapps d
  WHERE d.id = p_dapp_id;

  IF result IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'dApp not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'data', result
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in insert_operation_log function
CREATE OR REPLACE FUNCTION insert_operation_log(
  p_operation_type TEXT,
  p_dapp_id UUID,
  p_data JSONB,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
  INSERT INTO dapp_operation_logs (
    operation_type,
    dapp_id,
    data,
    performed_by
  ) VALUES (
    p_operation_type,
    p_dapp_id,
    p_data,
    p_user_id
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to insert operation log: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in log_operation function
CREATE OR REPLACE FUNCTION log_operation(
  operation TEXT,
  table_name TEXT,
  record_id UUID,
  data JSONB,
  user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
  INSERT INTO dapp_operation_logs (
    operation_type, 
    dapp_id, 
    data, 
    performed_by
  ) VALUES (
    operation,
    record_id,
    data,
    COALESCE(user_id, auth.uid())
  );
EXCEPTION WHEN OTHERS THEN
  -- Log to Postgres log but don't fail the operation
  RAISE WARNING 'Failed to log operation: % % % %', operation, table_name, record_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in log_dapp_operation_with_debug function
CREATE OR REPLACE FUNCTION log_dapp_operation_with_debug()
RETURNS TRIGGER AS $$
DECLARE
  user_id uuid;
  log_data jsonb;
  debug_info jsonb;
BEGIN
  SET search_path = pg_catalog, public;
  
  -- Get the current user ID with fallback
  BEGIN
    user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_id := NULL;
  END;

  -- Add helpful debug info
  debug_info := jsonb_build_object(
    'trigger_name', TG_NAME,
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'timestamp', now(),
    'user_id', user_id
  );

  -- Create JSON data for the log
  IF TG_OP = 'INSERT' THEN
    log_data := to_jsonb(NEW) || jsonb_build_object('debug', debug_info);
  ELSIF TG_OP = 'UPDATE' THEN
    log_data := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key),
      'debug', debug_info
    );
  ELSIF TG_OP = 'DELETE' THEN
    log_data := to_jsonb(OLD) || jsonb_build_object('debug', debug_info);
  END IF;

  -- Insert the log record, using a more resilient approach
  BEGIN
    INSERT INTO dapp_operation_logs (operation_type, dapp_id, data, performed_by)
    VALUES (TG_OP, COALESCE(NEW.id, OLD.id), log_data, user_id);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent the operation
    RAISE WARNING 'Failed to log dApp operation: %', SQLERRM;
  END;

  -- Return the appropriate value based on operation type
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Catch-all to prevent trigger failures
  RAISE WARNING 'Error in dApp operation trigger: %', SQLERRM;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in update_flow_screen_count function
CREATE OR REPLACE FUNCTION update_flow_screen_count()
RETURNS TRIGGER AS $$
DECLARE
  flow_id uuid;
  new_count integer;
BEGIN
  SET search_path = pg_catalog, public;
  
  IF TG_OP = 'DELETE' THEN
    flow_id := OLD.flow_id;
  ELSE
    flow_id := NEW.flow_id;
  END IF;

  -- Count screens for this flow
  SELECT COUNT(*) INTO new_count 
  FROM flow_screens 
  WHERE flow_screens.flow_id = flow_id;

  -- Update the flow's screen_count
  UPDATE flows SET screen_count = new_count WHERE id = flow_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in create_profile_for_new_user function
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = pg_catalog, public;
  
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    NEW.id, 
    NEW.email,
    'general_user'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix search_path in any other security definer functions by using a more robust approach
DO $$
DECLARE
  func_name text;
  func_args text;
  func_body text;
  func_def text;
BEGIN
  -- Loop through all SECURITY DEFINER functions
  FOR func_name, func_args, func_def IN 
    SELECT 
      p.proname, 
      pg_get_function_arguments(p.oid),
      pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true  -- SECURITY DEFINER
    AND p.proname NOT IN (
      'is_admin', 'is_premium_user', 'admin_save_dapp', 'direct_insert_dapp',
      'simple_insert_dapp', 'check_auth_status', 'get_dapp_by_id',
      'insert_operation_log', 'log_operation', 'log_dapp_operation_with_debug',
      'update_updated_at_column', 'update_flow_screen_count', 'create_profile_for_new_user'
    )
  LOOP
    -- Check if the function doesn't have SET search_path already
    IF func_def NOT ILIKE '%SET search_path = pg_catalog, public%' THEN
      -- Create a dynamic SQL block to replace each function safely
      EXECUTE 'DO $inner_block$ 
      BEGIN
        -- Get the function body and add search_path
        EXECUTE FORMAT(
          ''CREATE OR REPLACE FUNCTION %s(%s) 
           AS $body$
           BEGIN
             SET search_path = pg_catalog, public;
             -- Rest of the original function follows
           %s
           $body$ LANGUAGE plpgsql SECURITY DEFINER;'',
          ''' || func_name || ''', 
          ''' || func_args || ''',
          -- Extract just what comes after the first BEGIN keyword
          substring(''' || regexp_replace(func_def, '''', '''''', 'g') || ''' from 
            ''BEGIN(.*?)LANGUAGE''
            using ''s'')
        );
        
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE ''Could not update function %: %'', ''' || func_name || ''', SQLERRM;
      END $inner_block$;';
    END IF;
  END LOOP;
END $$;

-- Update permissions to ensure they're correct
DO $$
BEGIN
  -- Functions that need to be executable by authenticated users
  EXECUTE 'GRANT EXECUTE ON FUNCTION admin_save_dapp(jsonb, text) TO authenticated;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION direct_insert_dapp(jsonb) TO authenticated;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION simple_insert_dapp(jsonb) TO authenticated;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION check_auth_status() TO authenticated, anon;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION get_dapp_by_id(uuid) TO authenticated;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;';
  EXECUTE 'GRANT EXECUTE ON FUNCTION insert_operation_log(text, uuid, jsonb, uuid) TO authenticated;';
EXCEPTION WHEN OTHERS THEN
  -- If a function doesn't exist, the grant will fail, but we want to continue
  RAISE NOTICE 'Some permissions could not be updated: %', SQLERRM;
END $$;