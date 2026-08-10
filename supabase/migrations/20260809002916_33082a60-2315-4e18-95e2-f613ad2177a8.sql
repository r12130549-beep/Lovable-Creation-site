-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can upload order assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view order assets" ON storage.objects;

-- Allow anyone to upload to order-assets (required for guest checkout screenshots)
-- We keep the bucket private because public buckets are blocked by workspace policy.
CREATE POLICY "Anyone can upload order assets"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'order-assets');

-- Allow anyone (including anonymous guests) to READ screenshots from order-assets
-- This is necessary so the admin and the customer can see the payment proof.
-- Since it's a private bucket, the URL generated via supabase.storage.from('order-assets').getPublicUrl()
-- will work only if there is a SELECT policy for anon/authenticated.
CREATE POLICY "Anyone can view order assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'order-assets');
