-- =====================================================================
-- Automind · Super Admin — Fix completo de permisos
-- Ejecutar en: Supabase → SQL Editor
-- SEGURO de re-ejecutar (DROP/CREATE idempotente).
-- =====================================================================
-- Fixes incluidos:
--   1. Agregar pmo3@coperva.com como super admin
--   2. Corregir RLS de clientes para que super admins tengan acceso total
--   3. Corregir RLS de cliente_historial para super admins
--   4. Verificar que my_workspace_ids() incluye bypass de super admin
-- =====================================================================


-- ── 1. Agregar pmo3@coperva.com como super admin ─────────────────────
INSERT INTO public.super_admins (user_id, email)
SELECT au.id, au.email
FROM auth.users au
WHERE au.email = 'pmo3@coperva.com'
ON CONFLICT (user_id) DO NOTHING;


-- ── 2. Reparar my_workspace_ids() con bypass explícito para super_admins
--    (Re-ejecutar siempre que se actualice la función)
CREATE OR REPLACE FUNCTION my_workspace_ids()
RETURNS SETOF UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  -- Super admin → todos los workspaces sin excepción
  SELECT w.id FROM workspaces w WHERE is_super_admin()
  UNION
  -- Agency owner/admin → todos los workspaces de su agencia
  SELECT w.id FROM workspaces w
  INNER JOIN agency_memberships am ON am.agency_id = w.agency_id
  WHERE am.user_id = auth.uid()
    AND am.role IN ('agency_owner','agency_admin','agency_support')
  UNION
  -- Miembro de workspace → solo sus workspaces
  SELECT wm.workspace_id FROM workspace_memberships wm
  WHERE wm.user_id = auth.uid();
$$;


-- ── 3. Reemplazar RLS de clientes por políticas que usan my_workspace_ids()
--    Las políticas originales usaban lookup directo en users (sin bypass super_admin)

DROP POLICY IF EXISTS "clientes_workspace_select" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_insert" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_update" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_delete" ON public.clientes;

CREATE POLICY "clientes_select" ON public.clientes
  FOR SELECT USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_insert" ON public.clientes
  FOR INSERT WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_update" ON public.clientes
  FOR UPDATE USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_delete" ON public.clientes
  FOR DELETE USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );


-- ── 4. Asegurar que cliente_historial permite acceso a super admins
DROP POLICY IF EXISTS "historial_select" ON public.cliente_historial;
DROP POLICY IF EXISTS "historial_insert" ON public.cliente_historial;

CREATE POLICY "historial_select" ON public.cliente_historial
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      workspace_id = ANY(SELECT my_workspace_ids())
      OR is_super_admin()
    )
  );

CREATE POLICY "historial_insert" ON public.cliente_historial
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      workspace_id = ANY(SELECT my_workspace_ids())
      OR is_super_admin()
    )
  );


-- ── 5. Verificar resultado ────────────────────────────────────────────

-- Super admins registrados
SELECT
  sa.email,
  sa.created_at::date AS desde,
  au.last_sign_in_at::date AS ultimo_login
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
ORDER BY sa.created_at;

-- Políticas activas en clientes
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'clientes'
ORDER BY policyname;
