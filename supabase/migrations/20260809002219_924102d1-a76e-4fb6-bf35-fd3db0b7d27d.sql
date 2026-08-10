ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status text,
ADD COLUMN IF NOT EXISTS admin_note text;

-- Ensure grants are correct for the new columns
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
