DO $$ 
BEGIN
    -- Fix orders table user_id FK
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'orders_user_id_fkey') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
    END IF;

    -- Fix licenses table user_id FK
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'licenses_user_id_fkey') THEN
        ALTER TABLE public.licenses 
        ADD CONSTRAINT licenses_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
    END IF;
END $$;
