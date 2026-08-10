
INSERT INTO public.app_settings (key, value)
VALUES ('server_status', '"Online"')
ON CONFLICT (key) DO UPDATE SET value = '"Online"';
