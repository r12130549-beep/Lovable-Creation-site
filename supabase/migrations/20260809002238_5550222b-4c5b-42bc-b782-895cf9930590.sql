-- Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status text,
ADD COLUMN IF NOT EXISTS admin_note text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Grant access to public.orders
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
