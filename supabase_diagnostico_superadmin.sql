-- =====================================================================
-- Automind · Diagnóstico completo de permisos super admin
-- Ejecutar en Supabase → SQL Editor
-- Copia los resultados y compártelos para identificar qué falta.
-- =====================================================================

-- ── 1. Super admins registrados ──────────────────────────────────────
SELECT '1. SUPER ADMINS' AS seccion, sa.email, sa.created_at::date AS desde
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
ORDER BY sa.created_at;

-- ── 2. Cuerpo actual de my_workspace_ids() ───────────────────────────
-- Si NO dice "is_super_admin()" en la primera línea, el fix SQL no se ha corrido.
SELECT '2. my_workspace_ids BODY' AS seccion, prosrc AS cuerpo
FROM pg_proc
WHERE proname = 'my_workspace_ids';

-- ── 3. Políticas activas en inventario ──────────────────────────────
SELECT '3. INVENTARIO POLICIES' AS seccion, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'inventario'
ORDER BY policyname;

-- ── 4. Políticas activas en clientes ────────────────────────────────
SELECT '4. CLIENTES POLICIES' AS seccion, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'clientes'
ORDER BY policyname;

-- ── 5. Políticas activas en users ───────────────────────────────────
SELECT '5. USERS POLICIES' AS seccion, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
