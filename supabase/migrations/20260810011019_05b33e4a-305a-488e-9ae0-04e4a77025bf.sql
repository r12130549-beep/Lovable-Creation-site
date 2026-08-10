-- Profiles.id is TEXT in this project, but auth.uid() is UUID.
-- We must cast auth.uid() to TEXT for comparisons.

-- 1. Ensure role column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. Update roles from user_roles
-- Assuming user_roles.user_id is UUID or TEXT, let's cast both to TEXT to be safe.
UPDATE public.profiles p
SET role = CAST(ur.role AS TEXT)
FROM public.user_roles ur
WHERE p.id::TEXT = ur.user_id::TEXT;

-- 3. Correct RLS Policies with TEXT casting
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles 
    FOR SELECT 
    USING (auth.uid()::TEXT = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles 
    FOR ALL 
    USING (auth.uid()::TEXT = id)
    WITH CHECK (auth.uid()::TEXT = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        role = 'admin' OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::TEXT AND role = 'admin'
        )
    );

-- 4. App Settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view settings" ON public.app_settings FOR SELECT USING (true);

-- 5. Seed initial data
INSERT INTO public.app_settings (key, value)
VALUES ('server_status', '"Online"')
ON CONFLICT (key) DO NOTHING;
