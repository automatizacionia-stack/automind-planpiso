-- =====================================================================
-- Automind · Fix RLS en clientes — usar my_workspace_ids()
-- Problema: las políticas originales usaban subconsultas directas contra
-- users/agency_memberships; super admins y agency owners que entran a
-- un workspace no están en esas tablas, por lo que el INSERT fallaba.
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar.
-- =====================================================================

-- 1. Eliminar políticas anteriores
DROP POLICY IF EXISTS "clientes_workspace_select" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_insert" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_update" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_delete" ON public.clientes;

-- Por si acaso hay variantes sin sufijo "_workspace"
DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete" ON public.clientes;

-- 2. Recrear usando my_workspace_ids() — cubre workspace users,
--    agency owners/admins Y super admins (is_super_admin() ya está
--    embebido en my_workspace_ids()).
CREATE POLICY "clientes_select" ON public.clientes FOR SELECT
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id = ANY(
      SELECT w.agency_id FROM workspaces w
      WHERE w.id = ANY(SELECT my_workspace_ids())
    )
    OR is_super_admin()
  );

CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT
  WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_delete" ON public.clientes FOR DELETE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

-- 3. Verificar políticas activas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'clientes'
ORDER BY cmd;
