-- Ensure server-side (service role) has full access to admin-managed tables
GRANT ALL ON public.extensions TO service_role;
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.coupons TO service_role;
GRANT ALL ON public.licenses TO service_role;
GRANT ALL ON public.orders TO service_role;

DROP POLICY IF EXISTS "Service role manages extensions" ON public.extensions;
CREATE POLICY "Service role manages extensions"
ON public.extensions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages app_settings" ON public.app_settings;
CREATE POLICY "Service role manages app_settings"
ON public.app_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages coupons" ON public.coupons;
CREATE POLICY "Service role manages coupons"
ON public.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages licenses" ON public.licenses;
CREATE POLICY "Service role manages licenses"
ON public.licenses FOR ALL TO service_role USING (true) WITH CHECK (true);
