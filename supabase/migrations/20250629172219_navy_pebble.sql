/*
  # Enable detailed logging for dapp operations

  1. Add a trigger function to log dapp operations
  2. Add a logging table to track operations
  3. Add triggers to the dapps table
*/

-- Create a logging table for dapp operations
CREATE TABLE IF NOT EXISTS dapp_operation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  dapp_id uuid,
  data JSONB,
  performed_by uuid,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the logging table
ALTER TABLE dapp_operation_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the logging table
CREATE POLICY "Admins can view all logs" 
  ON dapp_operation_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'
  ));

-- Create a function for logging dapp operations
CREATE OR REPLACE FUNCTION log_dapp_operation()
RETURNS TRIGGER AS $$
DECLARE
  user_id uuid;
  log_data jsonb;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();

  -- Create JSON data for the log
  IF TG_OP = 'INSERT' THEN
    log_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    log_data := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key)
    );
  ELSIF TG_OP = 'DELETE' THEN
    log_data := to_jsonb(OLD);
  END IF;

  -- Insert the log record
  INSERT INTO dapp_operation_logs (operation_type, dapp_id, data, performed_by)
  VALUES (TG_OP, COALESCE(NEW.id, OLD.id), log_data, user_id);

  -- Return the appropriate value based on operation type
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for the dapps table
DROP TRIGGER IF EXISTS log_dapp_insert ON dapps;
CREATE TRIGGER log_dapp_insert
  AFTER INSERT ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation();

DROP TRIGGER IF EXISTS log_dapp_update ON dapps;
CREATE TRIGGER log_dapp_update
  AFTER UPDATE ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation();

DROP TRIGGER IF EXISTS log_dapp_delete ON dapps;
CREATE TRIGGER log_dapp_delete
  AFTER DELETE ON dapps
  FOR EACH ROW
  EXECUTE FUNCTION log_dapp_operation();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION log_dapp_operation() TO service_role;

-- Ensure that we can check dapp_id foreign keys properly
CREATE INDEX IF NOT EXISTS idx_dapp_logs_dapp_id ON dapp_operation_logs (dapp_id);

-- Verify the policies and default admin policy for dapps
DO $$ 
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if the admin insert policy exists for dapps
  SELECT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'dapps'
      AND policyname = 'Admins can insert dapps'
  ) INTO policy_exists;
  
  -- If it doesn't exist, create it
  IF NOT policy_exists THEN
    EXECUTE 'CREATE POLICY "Admins can insert dapps" ON dapps FOR INSERT TO authenticated WITH CHECK (is_admin());';
  END IF;
END $$;