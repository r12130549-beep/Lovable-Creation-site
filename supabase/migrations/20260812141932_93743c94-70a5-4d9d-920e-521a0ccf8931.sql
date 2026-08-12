-- Product catalog + site settings: allow writes with the public key so
-- deployments without the private server key (e.g. Vercel) still work.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.extensions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;

DROP POLICY IF EXISTS "App can manage extensions" ON public.extensions;
CREATE POLICY "App can manage extensions"
ON public.extensions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "App can manage app_settings" ON public.app_settings;
CREATE POLICY "App can manage app_settings"
ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
