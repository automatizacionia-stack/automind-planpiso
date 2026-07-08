-- ============================================================
-- Migración: ON DELETE CASCADE en todas las FKs → workspaces(id)
-- Correr en Supabase SQL Editor (una sola vez)
-- ============================================================
-- Busca dinámicamente TODAS las FKs que apuntan a workspaces.id
-- y las recrea con CASCADE, sin importar el nombre exacto de la restricción.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema   = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema   = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name     = 'workspaces'
      AND ccu.column_name    = 'id'
      AND tc.table_schema    = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I DROP CONSTRAINT %I',
      r.table_name, r.constraint_name
    );
    EXECUTE format(
      'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES workspaces(id) ON DELETE CASCADE',
      r.table_name, r.constraint_name, r.column_name
    );
    RAISE NOTICE 'CASCADE añadido: %.% → workspaces.id', r.table_name, r.column_name;
  END LOOP;
END $$;
