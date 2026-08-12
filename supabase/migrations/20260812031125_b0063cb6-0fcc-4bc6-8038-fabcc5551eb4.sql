-- ORDERS: remove overly permissive policies
DROP POLICY IF EXISTS "Allow admins full access" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert for checkout" ON public.orders;
DROP POLICY IF EXISTS "Allow public select for guest tracking" ON public.orders;
DROP POLICY IF EXISTS "Anonymous can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can do everything" ON public.orders;

REVOKE ALL ON public.orders FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages orders"
ON public.orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- STORAGE: order-assets
DROP POLICY IF EXISTS "Anyone can view order assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload order assets" ON storage.objects;

CREATE POLICY "Admins can view order assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'order-assets' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Checkout can upload order assets"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'order-assets');

-- STORAGE: payments
DROP POLICY IF EXISTS "Public can view payments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payments" ON storage.objects;

CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payments' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Checkout can upload payment proofs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'payments');