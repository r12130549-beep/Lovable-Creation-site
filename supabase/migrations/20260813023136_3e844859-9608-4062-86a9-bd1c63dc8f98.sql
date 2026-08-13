GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.extensions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.licenses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coupons TO anon, authenticated, service_role;

-- Ensure RLS is enabled but policies are permissive for the core tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive orders" ON public.orders;
CREATE POLICY "Permissive orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive extensions" ON public.extensions;
CREATE POLICY "Permissive extensions" ON public.extensions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permissive app_settings" ON public.app_settings;
CREATE POLICY "Permissive app_settings" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);