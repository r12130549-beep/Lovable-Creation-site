-- Storage RLS Policies for extensions bucket
-- Only admins can upload extension files
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

-- Note: No SELECT policy for users, access via signed URLs only
