-- Create orders table in Supabase to replace Firebase Firestore
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    user_id TEXT, -- Keep as text to support Firebase UIDs or guest
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

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert for checkout" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select for guest tracking" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow admins full access" ON public.orders FOR ALL TO authenticated USING (true);

-- Create app_settings if not exists (backup check)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon;
GRANT ALL ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of settings" ON public.app_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow admin edit of settings" ON public.app_settings FOR ALL TO authenticated USING (true);

-- Insert default settings if they don't exist
INSERT INTO public.app_settings (key, value) VALUES 
('binance_id', '"Not Set"') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES 
('bkash_number', '"Not Set"') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES 
('nagad_number', '"Not Set"') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES 
('usdt_rate', '130') ON CONFLICT (key) DO NOTHING;
