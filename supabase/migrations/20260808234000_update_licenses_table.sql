-- Add missing columns to licenses table
ALTER TABLE public.licenses 
ADD COLUMN IF NOT EXISTS activated_devices INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activated_at TIMESTAMP WITH TIME ZONE;

-- Add a check constraint for status
DO $$ BEGIN
  ALTER TABLE public.licenses ADD CONSTRAINT licenses_status_check 
  CHECK (status IN ('Active', 'Expired', 'Suspended', 'Revoked'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure RLS allows admin access to all licenses
CREATE POLICY "Admins can manage all licenses"
ON public.licenses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant access
GRANT ALL ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;
