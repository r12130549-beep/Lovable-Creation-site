-- 1. Ensure Orders table exists and has proper RLS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        CREATE TABLE public.orders (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
            customer_name text NOT NULL,
            customer_email text NOT NULL,
            customer_phone text,
            payment_method text NOT NULL,
            transaction_id text,
            status text NOT NULL DEFAULT 'Pending',
            amount numeric(10, 2) DEFAULT 0.00,
            extension_id uuid REFERENCES public.extensions(id) ON DELETE SET NULL,
            screenshot_url text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
        GRANT SELECT ON public.orders TO anon;
        GRANT ALL ON public.orders TO service_role;

        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can only see their own orders
        CREATE POLICY "Users can view own orders" ON public.orders
            FOR SELECT TO authenticated USING (auth.uid() = user_id);

        -- Policy: Allow anonymous insertions for guest checkout
        CREATE POLICY "Anyone can insert orders" ON public.orders
            FOR INSERT WITH CHECK (true);

        -- Policy: Admins can do everything
        CREATE POLICY "Admins have full access to orders" ON public.orders
            TO authenticated
            USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- 2. Refine Licenses RLS (Security)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
CREATE POLICY "Users can view own licenses" ON public.licenses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to licenses" ON public.licenses;
CREATE POLICY "Admins have full access to licenses" ON public.licenses
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- 3. Ensure Reviews table exists and has RLS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        CREATE TABLE public.reviews (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            extension_id uuid REFERENCES public.extensions(id) ON DELETE CASCADE,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment text,
            status text NOT NULL DEFAULT 'pending',
            created_at timestamptz DEFAULT now()
        );

        GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
        GRANT SELECT ON public.reviews TO anon;
        GRANT ALL ON public.reviews TO service_role;

        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can view approved reviews" ON public.reviews
            FOR SELECT USING (status = 'approved');

        CREATE POLICY "Users can insert reviews" ON public.reviews
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
            
        CREATE POLICY "Admins can moderate reviews" ON public.reviews
            TO authenticated
            USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- 4. Support Tickets RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
