-- =====================================================================
-- Automind · Agregar todos los super admins confirmados
-- Ejecutar en: Supabase → SQL Editor
-- Seguro de re-ejecutar (ON CONFLICT DO NOTHING).
-- =====================================================================

INSERT INTO public.super_admins (user_id, email)
SELECT au.id, au.email FROM auth.users au
WHERE au.email IN (
  'pmo3@coperva.com',
  'otellez@coperva.com',
  'automatizacion.ia@coperva.com',
  'ricardo.avalos@optimasystems.ai'
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar resultado
SELECT sa.email, sa.created_at::date AS desde, au.last_sign_in_at::date AS ultimo_login
FROM public.super_admins sa
JOIN auth.users au ON au.id = sa.user_id
ORDER BY sa.created_at;
