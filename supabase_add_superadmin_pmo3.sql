-- =====================================================================
-- Automind · Agregar pmo3@coperva.com como Super Admin
-- Ejecutar en: Supabase → SQL Editor
-- SEGURO de re-ejecutar (ON CONFLICT DO NOTHING).
-- =====================================================================

-- 1. Insertar como super admin (busca el user_id por email en auth.users)
INSERT INTO public.super_admins (user_id, email)
SELECT au.id, au.email
FROM auth.users au
WHERE au.email = 'pmo3@coperva.com'
ON CONFLICT (user_id) DO NOTHING;

-- 2. Verificar resultado
SELECT
  sa.email,
  sa.created_at,
  au.last_sign_in_at
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
ORDER BY sa.created_at;
