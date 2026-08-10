-- 1. Drop dependent policies first
DROP POLICY IF EXISTS "Public track license via order_id" ON public.licenses;
DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins have full access to licenses" ON public.licenses;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can select orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;

-- 2. Drop foreign key
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'licenses_order_id_fkey') THEN
        ALTER TABLE public.licenses DROP CONSTRAINT licenses_order_id_fkey;
    END IF;
END $$;

-- 3. Change column types to text
ALTER TABLE public.orders ALTER COLUMN id TYPE text;
ALTER TABLE public.licenses ALTER COLUMN order_id TYPE text;

-- 4. Restore default for orders.id
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 5. Restore foreign key
ALTER TABLE public.licenses 
    ADD CONSTRAINT licenses_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES public.orders(id) 
    ON DELETE SET NULL;

-- 6. Grant permissions (inclusive)
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.licenses TO anon, authenticated, service_role;

-- 7. Restore policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Anyone can select licenses" ON public.licenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert licenses" ON public.licenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update licenses" ON public.licenses FOR UPDATE USING (true);
