-- The has_role function is SECURITY DEFINER, meaning it runs as its creator.
-- We must restrict EXECUTE permissions to prevent abuse.

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;

-- Only service_role needs to execute this directly if used in edge functions, 
-- or internal database calls which already have permission as the owner.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;
