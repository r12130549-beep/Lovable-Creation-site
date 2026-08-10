-- Final permission fix for has_role
-- 1. Grant execute to all roles including anon (needed for RLS even if they don't call it directly)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 2. Revoke from PUBLIC (default role) to be safe
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;

-- 3. Ensure the function is SECURITY DEFINER and search_path is set (already is, but good to reinforce)
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY DEFINER SET search_path = public;

-- 4. Grant select on user_roles to anon as well (RLS will still apply)
GRANT SELECT ON public.user_roles TO anon, authenticated, service_role;
