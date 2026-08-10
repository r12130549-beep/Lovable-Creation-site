-- Fix SECURITY DEFINER execution permissions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

-- Ensure user_roles has policies to avoid "RLS Enabled No Policy" lint
CREATE POLICY "Admins can view all roles" ON public.user_roles 
FOR SELECT TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Add missing policies for extensions write access (Admin only)
CREATE POLICY "Admins can manage extensions" ON public.extensions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add missing policies for licenses management (Admin only)
CREATE POLICY "Admins can manage licenses" ON public.licenses
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add missing policies for profile management
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);
