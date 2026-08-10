-- Add order_id and download_url to licenses
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Create a unique constraint to prevent duplicate licenses for the same order
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_order_id_key;
ALTER TABLE public.licenses ADD CONSTRAINT licenses_order_id_key UNIQUE (order_id);

-- Update RLS to allow public tracking of licenses via order_id if they know the order ID
DROP POLICY IF EXISTS "Public track license via order_id" ON public.licenses;
CREATE POLICY "Public track license via order_id" ON public.licenses
FOR SELECT TO anon, authenticated
USING (order_id IS NOT NULL);

GRANT SELECT ON public.licenses TO anon;
