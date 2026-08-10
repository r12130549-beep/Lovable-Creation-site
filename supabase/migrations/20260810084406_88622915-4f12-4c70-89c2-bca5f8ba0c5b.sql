-- Initial setup and schema refinement
DO $$ 
BEGIN
    -- 20260808222004
    REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
    REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
    REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

    -- 20260808230000 (Coupons, Reviews, Support)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'coupons') THEN
        CREATE TABLE public.coupons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
            discount_value DECIMAL NOT NULL,
            expiry_date TIMESTAMPTZ,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            extension_id UUID REFERENCES public.extensions(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
        GRANT ALL ON public.coupons TO service_role;
        ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- 20260808232715 (Orders)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'orders') THEN
        CREATE TABLE public.orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            payment_method TEXT NOT NULL,
            transaction_id TEXT,
            screenshot_url TEXT,
            status TEXT DEFAULT 'pending' NOT NULL,
            amount NUMERIC,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
        );
        GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
        GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;
        GRANT ALL ON public.orders TO service_role;
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 20260809000000 (Final Optimization & Orders table sync)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'orders') THEN
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
    END IF;
END $$;

-- 20260809001519 (License system hardening)
ALTER TABLE public.licenses 
    ADD COLUMN IF NOT EXISTS device_limit INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS activated_devices INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS key TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS order_id TEXT;

-- 20260809002238 (Extensions enhancement)
ALTER TABLE public.extensions 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS changelog JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS compatibility JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 20260809004657 (App Settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.app_settings FOR SELECT USING (true);

-- 20260810005750 (Profile and Settings sync)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 20260810011141 (Final procedural security)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure as proc_name
        FROM pg_proc 
        WHERE proname IN ('has_role', 'handle_order_license_generation')
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION ' || r.proc_name || ' TO service_role';
    END LOOP;
END $$;