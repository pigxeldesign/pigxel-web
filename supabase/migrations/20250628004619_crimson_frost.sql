/*
  # Create Storage Buckets

  1. Storage Buckets
    - dapp_logos: For dApp logo images
    - dapp_thumbnails: For dApp thumbnail images  
    - flow_screen_thumbnails: For flow screen images

  2. Storage Policies
    - Public read access for all buckets
    - Admin-only write access
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('dapp_logos', 'dapp_logos', true),
('dapp_thumbnails', 'dapp_thumbnails', true),
('flow_screen_thumbnails', 'flow_screen_thumbnails', true);

-- Storage policies for dapp_logos bucket
CREATE POLICY "Public read access for dapp logos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'dapp_logos');

CREATE POLICY "Admins can upload dapp logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dapp_logos' 
    AND is_admin()
  );

CREATE POLICY "Admins can update dapp logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dapp_logos' 
    AND is_admin()
  );

CREATE POLICY "Admins can delete dapp logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dapp_logos' 
    AND is_admin()
  );

-- Storage policies for dapp_thumbnails bucket
CREATE POLICY "Public read access for dapp thumbnails"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'dapp_thumbnails');

CREATE POLICY "Admins can upload dapp thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dapp_thumbnails' 
    AND is_admin()
  );

CREATE POLICY "Admins can update dapp thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dapp_thumbnails' 
    AND is_admin()
  );

CREATE POLICY "Admins can delete dapp thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dapp_thumbnails' 
    AND is_admin()
  );

-- Storage policies for flow_screen_thumbnails bucket
CREATE POLICY "Public read access for flow screen thumbnails"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'flow_screen_thumbnails');

CREATE POLICY "Admins can upload flow screen thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'flow_screen_thumbnails' 
    AND is_admin()
  );

CREATE POLICY "Admins can update flow screen thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'flow_screen_thumbnails' 
    AND is_admin()
  );

CREATE POLICY "Admins can delete flow screen thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'flow_screen_thumbnails' 
    AND is_admin()
  );