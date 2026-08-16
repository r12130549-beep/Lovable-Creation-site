
ALTER TABLE public.extensions ADD COLUMN IF NOT EXISTS price_usd numeric DEFAULT 0;
ALTER TABLE public.extensions ADD COLUMN IF NOT EXISTS price_bdt numeric;

-- Backfill price_usd from price if it exists
UPDATE public.extensions SET price_usd = price WHERE price_usd = 0 AND price > 0;

GRANT ALL ON public.extensions TO anon, authenticated, service_role;
