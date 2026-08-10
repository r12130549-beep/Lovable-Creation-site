GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.extensions TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.user_roles TO anon;

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view their own guest order" ON public.orders;
CREATE POLICY "Public can view their own guest order" ON public.orders
FOR SELECT TO anon, authenticated
USING (true);
