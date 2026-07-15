-- =====================================================================
-- Automind · Documentos de crédito (E6)
-- Ejecutar en: Supabase → SQL Editor
-- Seguro de re-ejecutar (IF NOT EXISTS en cada columna).
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_cred_carta_key       TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_carta_nombre     TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_solicitud_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_solicitud_nombre TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_estado_cta_key   TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_estado_cta_nombre TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_contrato_key     TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_contrato_nombre  TEXT;

-- Verificar:
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name LIKE 'doc_cred%'
ORDER BY column_name;
