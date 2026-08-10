
-- Check if app_settings table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_settings') THEN
        CREATE TABLE public.app_settings (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            key text UNIQUE NOT NULL,
            value text NOT NULL,
            updated_at timestamptz DEFAULT now()
        );
        
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
        GRANT ALL ON public.app_settings TO service_role;
        GRANT SELECT ON public.app_settings TO anon;
        
        ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow all read app_settings" ON public.app_settings FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated update app_settings" ON public.app_settings FOR ALL TO authenticated USING (
          EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        );
    END IF;
END $$;
