-- Fix Security Linter Warnings for handle_order_license_generation
-- 1. Set search_path
-- 2. Revoke public/authenticated execute permissions (it's a trigger function)

ALTER FUNCTION public.handle_order_license_generation() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM anon;
GRANT EXECUTE ON FUNCTION public.handle_order_license_generation() TO service_role;
