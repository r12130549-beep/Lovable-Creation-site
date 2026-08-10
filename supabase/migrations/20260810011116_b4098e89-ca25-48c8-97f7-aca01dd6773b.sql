-- Fix security warnings for handle_order_license_generation
REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_order_license_generation() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_order_license_generation() TO service_role;
