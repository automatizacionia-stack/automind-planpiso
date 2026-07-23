-- =====================================================================
-- Automind · Diagnóstico rápido — función + INSERT checks
-- Ejecutar en Supabase → SQL Editor
-- =====================================================================

-- 1. ¿my_workspace_ids tiene el bypass de super admin?
SELECT
  CASE
    WHEN prosrc ILIKE '%is_super_admin%' THEN '✅ SÍ tiene bypass super_admin'
    ELSE '❌ NO tiene bypass — hay que correr supabase_superadmin_rls_fix2.sql'
  END AS estado_funcion
FROM pg_proc
WHERE proname = 'my_workspace_ids';

-- 2. WITH CHECK de todas las políticas INSERT (lo que realmente bloquea inserts)
SELECT
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename IN ('inventario', 'clientes', 'users')
  AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- 3. ¿Los super admins tienen workspace_memberships en algún workspace?
--    (si no tienen, my_workspace_ids() regresa vacío para ellos — necesitan is_super_admin())
SELECT
  sa.email,
  COUNT(wm.workspace_id) AS num_memberships
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
LEFT JOIN public.workspace_memberships wm ON wm.user_id = sa.user_id
GROUP BY sa.email
ORDER BY sa.email;
