
-- Ensure coupons table exists with all required fields
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL,
    extension_id uuid REFERENCES public.extensions(id) ON DELETE CASCADE,
    expiry_date timestamptz,
    usage_limit integer,
    used_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Grants
GRANT ALL ON public.coupons TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public select on coupons" ON public.coupons;
CREATE POLICY "Allow public select on coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow all for service_role on coupons" ON public.coupons;
CREATE POLICY "Allow all for service_role on coupons" ON public.coupons FOR ALL TO service_role USING (true);
