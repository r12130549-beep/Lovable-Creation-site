-- RLS for order-assets bucket
-- Anyone can insert screenshots (for guest checkout)
CREATE POLICY "Anyone can upload order assets"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'order-assets');

-- Public SELECT for order assets
CREATE POLICY "Public can view order assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'order-assets');

-- Ensure extensions bucket RLS is correct
-- Only admins can upload extension files
DROP POLICY IF EXISTS "Admins can upload extensions" ON storage.objects;
CREATE POLICY "Admins can upload extensions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'extensions' AND 
    public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update extensions" ON storage.objects;
CREATE POLICY "Admins can update extensions"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'extensions' AND 
    public.has_role(auth.uid(), 'admin')
);
