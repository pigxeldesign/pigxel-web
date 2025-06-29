/*
  # Add operation logs insert policy

  1. Security
     - Add an INSERT policy for dapp_operation_logs table
     - This allows admins to insert operation logs
     - Ensure operation logs can be created during dApp operations
     - Make sure existing logs can be queried correctly
*/

-- Create an INSERT policy for dapp_operation_logs to allow authenticated users to insert logs
CREATE POLICY "Admins can insert operation logs"
  ON dapp_operation_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow inserts if user is admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
    -- Also allow inserts through security definer functions (for logging functions)
    OR current_setting('role') = 'rls_definer'
  );

-- Update the existing SELECT policy to ensure it's complete
DROP POLICY IF EXISTS "Admins can view all logs" ON dapp_operation_logs;
CREATE POLICY "Admins can view all logs" 
  ON dapp_operation_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Ensure RLS is enabled on dapp_operation_logs table
ALTER TABLE dapp_operation_logs ENABLE ROW LEVEL SECURITY;

-- Create helper function for creating log entries without RLS restrictions
CREATE OR REPLACE FUNCTION insert_operation_log(
  p_operation_type TEXT,
  p_dapp_id UUID,
  p_data JSONB,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
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

-- Grant permission to call this function
GRANT EXECUTE ON FUNCTION insert_operation_log(TEXT, UUID, JSONB, UUID) TO authenticated;