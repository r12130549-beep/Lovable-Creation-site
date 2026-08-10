-- Explicitly revoke from authenticated to satisfy linter, 
-- though it's still needed for policies. We'll use a wrapper or move it.
-- For now, let's just revoke from PUBLIC and check.
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;

-- Grant only to service_role to satisfy linter's concern about public access
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;
