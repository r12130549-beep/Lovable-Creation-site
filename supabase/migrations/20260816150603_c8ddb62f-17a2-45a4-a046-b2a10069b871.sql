DROP POLICY IF EXISTS "Permissive coupons" ON public.coupons;
CREATE POLICY "Permissive coupons" ON public.coupons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;