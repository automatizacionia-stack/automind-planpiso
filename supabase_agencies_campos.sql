-- =====================================================================
-- Automind · Campos legales y de contacto en agencies
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS en todo).
-- =====================================================================

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS razon_social    TEXT,
  ADD COLUMN IF NOT EXISTS rfc             TEXT,
  ADD COLUMN IF NOT EXISTS marca           TEXT,
  ADD COLUMN IF NOT EXISTS calle           TEXT,
  ADD COLUMN IF NOT EXISTS colonia         TEXT,
  ADD COLUMN IF NOT EXISTS municipio       TEXT,
  ADD COLUMN IF NOT EXISTS cp              TEXT,
  ADD COLUMN IF NOT EXISTS estado          TEXT,
  ADD COLUMN IF NOT EXISTS rep_legal_nombre TEXT,
  ADD COLUMN IF NOT EXISTS rep_legal_email  TEXT;

-- Verificar columnas agregadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'agencies'
ORDER BY ordinal_position;
