/*
  # Fix dApp Operations and Add Debugging Support

  1. Database Functions
     - Create improved debug logging function
     - Add direct logging for dApp operations
  
  2. RLS Policies
     - Ensure proper permissions for admin operations
     - Add explicit policies for dApp operations
     
  3. Helper Functions
     - Add is_admin() function if not exists
     - Improve exception handling in triggers
*/

-- Create a more comprehensive logging function
CREATE OR REPLACE FUNCTION log_operation(
  operation TEXT,
  table_name TEXT,
  record_id UUID,
  data JSONB,
  user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
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

-- Create a new function specifically for dApp operations
CREATE OR REPLACE FUNCTION log_dapp_operation_with_debug()
RETURNS TRIGGER AS $$
DECLARE
  user_id uuid;
  log_data jsonb;
  debug_info jsonb;
BEGIN
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

-- Replace the existing dApp logging triggers with the improved version
DROP TRIGGER IF EXISTS log_dapp_insert ON dapps;
CREATE TRIGGER log_dapp_insert
  AFTER INSERT ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation_with_debug();

DROP TRIGGER IF EXISTS log_dapp_update ON dapps;
CREATE TRIGGER log_dapp_update
  AFTER UPDATE ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation_with_debug();

DROP TRIGGER IF EXISTS log_dapp_delete ON dapps;
CREATE TRIGGER log_dapp_delete
  AFTER DELETE ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation_with_debug();

-- Add a direct way to debug RLS issues
-- This function allows admins to directly insert or update a dApp
-- bypassing potential RLS issues
CREATE OR REPLACE FUNCTION admin_save_dapp(
  p_dapp_data JSONB,
  p_operation TEXT DEFAULT 'INSERT'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  dapp_id UUID;
BEGIN
  -- Only admins can use this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can use this function';
  END IF;

  IF p_operation = 'INSERT' THEN
    -- Extract the ID if provided or generate a new one
    dapp_id := COALESCE(
      (p_dapp_data->>'id')::UUID,
      gen_random_uuid()
    );

    -- Ensure id is included in data
    p_dapp_data := p_dapp_data || jsonb_build_object('id', dapp_id);
    
    -- Direct insert bypassing RLS
    EXECUTE 'INSERT INTO dapps SELECT * FROM jsonb_populate_record(NULL::dapps, $1)' 
    USING p_dapp_data;
    
    -- Log the operation
    PERFORM log_operation('ADMIN_INSERT', 'dapps', dapp_id, p_dapp_data);
    
    -- Return result
    result := jsonb_build_object(
      'success', TRUE,
      'operation', 'INSERT',
      'id', dapp_id,
      'message', 'dApp successfully created'
    );
  ELSIF p_operation = 'UPDATE' THEN
    -- Extract the ID from data
    dapp_id := (p_dapp_data->>'id')::UUID;
    
    IF dapp_id IS NULL THEN
      RAISE EXCEPTION 'ID is required for update operation';
    END IF;
    
    -- Direct update bypassing RLS
    EXECUTE 'UPDATE dapps SET dapps = jsonb_populate_record(dapps, $1::jsonb) WHERE id = $2' 
    USING p_dapp_data, dapp_id;
    
    -- Log the operation
    PERFORM log_operation('ADMIN_UPDATE', 'dapps', dapp_id, p_dapp_data);
    
    -- Return result
    result := jsonb_build_object(
      'success', TRUE,
      'operation', 'UPDATE',
      'id', dapp_id,
      'message', 'dApp successfully updated'
    );
  ELSE
    RAISE EXCEPTION 'Invalid operation: must be INSERT or UPDATE';
  END IF;

  RETURN result;
EXCEPTION WHEN OTHERS THEN
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

-- Create a direct read access function for debugging
CREATE OR REPLACE FUNCTION get_dapp_by_id(p_dapp_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the user is admin
  IF NOT is_admin() THEN
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

GRANT EXECUTE ON FUNCTION get_dapp_by_id(UUID) TO authenticated;

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