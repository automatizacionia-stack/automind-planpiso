-- =====================================================================
-- Automind · Audit Log de Super Admins
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS / OR REPLACE en todo).
-- =====================================================================

-- 1. Tabla de auditoría
CREATE TABLE IF NOT EXISTS public.super_admin_audit_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  super_admin_email   TEXT NOT NULL,
  accion              TEXT NOT NULL CHECK (accion IN (
    'login',
    'entrar_workspace',
    'crear_agencia',
    'eliminar_workspace',
    'eliminar_agencia'
  )),
  target_id           UUID,           -- workspace_id o agency_id afectado
  target_nombre       TEXT,           -- nombre legible para referencia
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_ts
  ON public.super_admin_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON public.super_admin_audit_log(super_admin_user_id);

-- 2. RLS
ALTER TABLE public.super_admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo super admins pueden leer el log completo
DO $$ BEGIN
  BEGIN
    CREATE POLICY "audit_log_select" ON public.super_admin_audit_log FOR SELECT
      USING (is_super_admin());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Super admins pueden insertar sus propios registros
DO $$ BEGIN
  BEGIN
    CREATE POLICY "audit_log_insert" ON public.super_admin_audit_log FOR INSERT
      WITH CHECK (is_super_admin() AND super_admin_user_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Nadie puede modificar o borrar registros de auditoría
-- (no se crean policies UPDATE/DELETE → bloqueado por defecto)

-- 3. Verificar
SELECT
  relname AS tabla,
  relrowsecurity AS rls_activo
FROM pg_class
WHERE relname = 'super_admin_audit_log';

SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'super_admin_audit_log';
