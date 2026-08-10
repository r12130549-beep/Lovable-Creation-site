-- Final License System Hardening & Automation
-- This migration ensures the licenses table strictly matches the requested fields and statuses.

-- 1. Ensure the licenses table structure is complete
ALTER TABLE public.licenses 
    ADD COLUMN IF NOT EXISTS device_limit INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS activated_devices INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS key TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS extension_id UUID REFERENCES public.extensions(id) ON DELETE CASCADE;

-- 2. Clean up status constraint to match exactly: Active, Expired, Suspended, Revoked
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_status_check;
ALTER TABLE public.licenses ADD CONSTRAINT licenses_status_check 
    CHECK (status IN ('Active', 'Expired', 'Suspended', 'Revoked'));

-- 3. Automation: Generate license when order is Approved or Paid
CREATE OR REPLACE FUNCTION public.handle_order_license_generation()
RETURNS TRIGGER AS $$
DECLARE
    new_license_key TEXT;
BEGIN
    -- Only trigger on status change to 'Approved', 'Paid', or 'Completed'
    IF (NEW.status IN ('Approved', 'Paid', 'Completed') AND (OLD.status IS NULL OR OLD.status NOT IN ('Approved', 'Paid', 'Completed'))) THEN
        
        -- Generate VIBEX-XXXX-XXXX-XXXX key
        new_license_key := 'VIBEX-' || 
            upper(substring(md5(random()::text), 1, 4)) || '-' || 
            upper(substring(md5(random()::text), 5, 4)) || '-' || 
            upper(substring(md5(random()::text), 9, 4));

        -- Insert license if it doesn't exist (one license per user per extension)
        INSERT INTO public.licenses (
            user_id,
            extension_id,
            key,
            status,
            device_limit,
            expires_at,
            created_at
        ) VALUES (
            NEW.user_id,
            NEW.extension_id,
            new_license_key,
            'Active',
            3, -- Default device limit
            now() + interval '1 year', -- Default 1 year
            now()
        )
        ON CONFLICT (user_id, extension_id) DO UPDATE 
        SET status = 'Active', 
            expires_at = now() + interval '1 year',
            updated_at = now()
        WHERE licenses.status != 'Active'; -- Only reactivate if not already active
            
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_approved_generate_license ON public.orders;
CREATE TRIGGER on_order_approved_generate_license
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_license_generation();

-- 4. Ensure Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;

-- 5. RLS (Refresh)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
CREATE POLICY "Users can view own licenses" ON public.licenses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to licenses" ON public.licenses;
CREATE POLICY "Admins have full access to licenses" ON public.licenses
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
