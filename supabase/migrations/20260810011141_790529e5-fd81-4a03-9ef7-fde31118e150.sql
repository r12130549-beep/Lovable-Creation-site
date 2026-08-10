-- Revoke execute from all versions of has_role and order handlers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure as proc_name
        FROM pg_proc 
        WHERE proname IN ('has_role', 'handle_order_license_generation')
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.proc_name || ' FROM authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION ' || r.proc_name || ' TO service_role';
    END LOOP;
END $$;
