DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    product_name TEXT NOT NULL,
    category TEXT DEFAULT 'Extension',
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT '৳',
    quantity INTEGER DEFAULT 1,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'Pending',
    order_status TEXT DEFAULT 'Pending',
    license_key TEXT,
    license_name TEXT,
    download_link TEXT,
    expire_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    transaction_id TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for checkout" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select for guest tracking" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow admins full access" ON public.orders FOR ALL TO authenticated USING (true);