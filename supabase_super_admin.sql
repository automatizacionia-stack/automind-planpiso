-- =====================================================================
-- Automind · Super Admin
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS / OR REPLACE en todo).
-- =====================================================================

-- 1. Tabla super_admins
CREATE TABLE IF NOT EXISTS public.super_admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- 2. RLS en super_admins: solo el propio usuario se puede ver
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN
    CREATE POLICY "super_admins_self_select" ON public.super_admins FOR SELECT
      USING (user_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3. Función helper is_super_admin()
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()
  );
$$;

-- 4. Actualizar my_workspace_ids() para incluir bypass de super admin
CREATE OR REPLACE FUNCTION my_workspace_ids()
RETURNS SETOF UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  -- Super admin → todos los workspaces
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

-- 5. Actualizar policy de agencies para super admin
DROP POLICY IF EXISTS "agencies_select" ON agencies;
CREATE POLICY "agencies_select" ON agencies FOR SELECT
  USING (
    id = my_agency_id_new()
    OR is_super_admin()
  );

-- Crear/eliminar agencias (solo super admin)
DO $$ BEGIN
  BEGIN
    CREATE POLICY "agencies_insert_super_admin" ON agencies FOR INSERT
      WITH CHECK (is_super_admin());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "agencies_update_super_admin" ON agencies FOR UPDATE
      USING (is_super_admin());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "agencies_delete_super_admin" ON agencies FOR DELETE
      USING (is_super_admin());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 6. Actualizar policy de workspaces para super admin
DROP POLICY IF EXISTS "workspaces_select" ON workspaces;
CREATE POLICY "workspaces_select" ON workspaces FOR SELECT
  USING (
    id = ANY(SELECT my_workspace_ids())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "workspaces_insert" ON workspaces;
CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT
  WITH CHECK (
    (agency_id = my_agency_id_new() AND is_agency_admin())
    OR is_super_admin()
  );

DO $$ BEGIN
  BEGIN
    CREATE POLICY "workspaces_delete_super_admin" ON workspaces FOR DELETE
      USING (is_super_admin());
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 7. Super admin puede ver todas las agency_memberships
DROP POLICY IF EXISTS "agency_mem_select" ON agency_memberships;
CREATE POLICY "agency_mem_select" ON agency_memberships FOR SELECT
  USING (
    agency_id = my_agency_id_new()
    OR is_super_admin()
  );

-- 8. Agregar automatizacion.ia@coperva.com como super admin
--    (requiere que el usuario ya exista en auth.users — crear primero en
--     Supabase Dashboard → Authentication → Users → Invite user)
INSERT INTO public.super_admins (user_id, email)
SELECT au.id, au.email
FROM auth.users au
WHERE au.email = 'automatizacion.ia@coperva.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verificar
SELECT
  sa.email,
  sa.created_at,
  au.email AS auth_email,
  au.last_sign_in_at
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id;
