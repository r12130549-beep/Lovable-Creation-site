
-- Re-apply policies for payments
DROP POLICY IF EXISTS "Anyone can upload payments" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payments" ON storage.objects;

CREATE POLICY "Anyone can upload payments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'payments');

CREATE POLICY "Public can view payments"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'payments');
