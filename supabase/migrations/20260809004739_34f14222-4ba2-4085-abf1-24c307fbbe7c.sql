-- Fix permission denied for has_role while satisfying linter
-- 1. Grant execute to authenticated and service_role (needed for RLS policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Revoke from public and anon to prevent direct API calls from unauthorized users
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- 3. Ensure user_roles table is readable by the roles that use it in policies
GRANT SELECT ON public.user_roles TO authenticated, service_role;
