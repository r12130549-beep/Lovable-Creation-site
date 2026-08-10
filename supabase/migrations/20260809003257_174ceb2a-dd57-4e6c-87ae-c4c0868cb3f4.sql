CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial payment settings
INSERT INTO public.app_settings (key, value)
VALUES 
  ('binance_id', '"406429512"'),
  ('bkash_number', '"+880 1789-456123"'),
  ('nagad_number', '"+880 1912-345678"'),
  ('usdt_rate', '130')
ON CONFLICT (key) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to update settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
