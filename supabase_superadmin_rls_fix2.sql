-- =====================================================================
-- Automind · Super Admin RLS Fix v2
-- Problema: supabase_fix_save_rls.sql sobreescribió my_workspace_ids()
--           eliminando el bypass de super_admin. Este script lo restaura
--           y añade OR is_super_admin() a TODAS las tablas relevantes.
-- Seguro de re-ejecutar.
-- =====================================================================


-- ── 1. Restaurar my_workspace_ids() CON bypass de super admin ────────
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
  -- Miembro explícito de workspace
  SELECT wm.workspace_id FROM workspace_memberships wm
  WHERE wm.user_id = auth.uid()
  UNION
  -- Usuario registrado en tabla users por workspace_id
  SELECT u.workspace_id FROM users u
  WHERE u.auth_user_id = auth.uid() AND u.workspace_id IS NOT NULL
  UNION
  -- Usuario registrado en tabla users por agency_id (legacy)
  SELECT u.agency_id FROM users u
  WHERE u.auth_user_id = auth.uid() AND u.agency_id IS NOT NULL;
$$;


-- ── 2. Inventario: añadir is_super_admin() a todas las políticas ─────
DROP POLICY IF EXISTS "inv_select" ON inventario;
DROP POLICY IF EXISTS "inv_insert" ON inventario;
DROP POLICY IF EXISTS "inv_update" ON inventario;
DROP POLICY IF EXISTS "inv_delete" ON inventario;

CREATE POLICY "inv_select" ON inventario FOR SELECT
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "inv_insert" ON inventario FOR INSERT
  WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "inv_update" ON inventario FOR UPDATE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "inv_delete" ON inventario FOR DELETE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );


-- ── 3. Clientes: asegurar is_super_admin() en todas las políticas ────
DROP POLICY IF EXISTS "clientes_select"  ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert"  ON public.clientes;
DROP POLICY IF EXISTS "clientes_update"  ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete"  ON public.clientes;
-- también nombres alternativos que puedan existir:
DROP POLICY IF EXISTS "clientes_workspace_select" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_insert" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_update" ON public.clientes;
DROP POLICY IF EXISTS "clientes_workspace_delete" ON public.clientes;

CREATE POLICY "clientes_select" ON public.clientes FOR SELECT
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT
  WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "clientes_delete" ON public.clientes FOR DELETE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );


-- ── 4. Users: super admin puede leer/escribir usuarios de cualquier workspace
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;

CREATE POLICY "users_select" ON public.users FOR SELECT
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "users_insert" ON public.users FOR INSERT
  WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "users_update" ON public.users FOR UPDATE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "users_delete" ON public.users FOR DELETE
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR agency_id  = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );


-- ── 5. cliente_historial: super admin puede leer/escribir historial ──
DROP POLICY IF EXISTS "historial_select" ON public.cliente_historial;
DROP POLICY IF EXISTS "historial_insert" ON public.cliente_historial;

CREATE POLICY "historial_select" ON public.cliente_historial FOR SELECT
  USING (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

CREATE POLICY "historial_insert" ON public.cliente_historial FOR INSERT
  WITH CHECK (
    workspace_id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );


-- ── 6. Verificación ──────────────────────────────────────────────────

-- Super admins registrados:
SELECT sa.email, sa.created_at::date AS desde
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
ORDER BY sa.created_at;

-- Políticas activas en inventario:
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'inventario'
ORDER BY policyname;

-- Políticas activas en clientes:
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'clientes'
ORDER BY policyname;

-- Políticas activas en users:
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
