DO $$ 
BEGIN
    -- Orders
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        GRANT ALL ON public.orders TO anon, authenticated, service_role;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
        CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Public select orders" ON public.orders;
        CREATE POLICY "Public select orders" ON public.orders FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Public update orders" ON public.orders;
        CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);
    END IF;

    -- Licenses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'licenses') THEN
        GRANT ALL ON public.licenses TO anon, authenticated, service_role;
        ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public select licenses" ON public.licenses;
        CREATE POLICY "Public select licenses" ON public.licenses FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Public insert licenses" ON public.licenses;
        CREATE POLICY "Public insert licenses" ON public.licenses FOR INSERT WITH CHECK (true);
    END IF;

    -- Extensions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'extensions') THEN
        GRANT ALL ON public.extensions TO anon, authenticated, service_role;
        ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public select extensions" ON public.extensions;
        CREATE POLICY "Public select extensions" ON public.extensions FOR SELECT USING (true);
    END IF;

    -- Profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        GRANT ALL ON public.profiles TO anon, authenticated, service_role;
    END IF;

    -- Support Tickets
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
        GRANT ALL ON public.support_tickets TO anon, authenticated, service_role;
    END IF;

    -- Coupons
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
        GRANT ALL ON public.coupons TO anon, authenticated, service_role;
    END IF;

    -- App Settings
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_settings') THEN
        GRANT ALL ON public.app_settings TO anon, authenticated, service_role;
    END IF;
END $$;
