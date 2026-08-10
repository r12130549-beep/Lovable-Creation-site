
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Anonymous can insert orders'
    ) THEN
        CREATE POLICY "Anonymous can insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Authenticated users can view orders'
    ) THEN
        CREATE POLICY "Authenticated users can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Authenticated users can update orders'
    ) THEN
        CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Service role can do everything'
    ) THEN
        CREATE POLICY "Service role can do everything" ON public.orders FOR ALL TO service_role USING (true);
    END IF;
END
$$;

GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT ON public.orders TO anon; -- Allow searching by ID
