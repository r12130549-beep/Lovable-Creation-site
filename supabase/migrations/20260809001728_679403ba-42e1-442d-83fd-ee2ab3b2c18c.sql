-- Enhance Extensions Table for complete management
ALTER TABLE public.extensions 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS changelog JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS compatibility JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update grants to ensure authenticated users (admins) can perform CRUD
GRANT INSERT, UPDATE, DELETE ON public.extensions TO authenticated;

-- Ensure RLS allows admins to manage extensions
DROP POLICY IF EXISTS "Admins can manage extensions" ON public.extensions;
CREATE POLICY "Admins can manage extensions" 
ON public.extensions FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));
