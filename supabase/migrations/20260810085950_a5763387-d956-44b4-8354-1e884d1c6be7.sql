
-- Re-apply policies for order-assets
DROP POLICY IF EXISTS "Anyone can upload order assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view order assets" ON storage.objects;

CREATE POLICY "Anyone can upload order assets"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'order-assets');

CREATE POLICY "Anyone can view order assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'order-assets');

-- Re-apply policies for extensions
DROP POLICY IF EXISTS "Admins can upload extensions" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update extensions" ON storage.objects;
DROP POLICY IF EXISTS "Public can view extension icons" ON storage.objects;

CREATE POLICY "Admins can upload extensions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'extensions' AND 
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update extensions"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'extensions' AND 
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Public can view extension icons"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'extensions');
