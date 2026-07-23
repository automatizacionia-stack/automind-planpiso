-- =====================================================================
-- Automind · Agregar documento RFC a clientes
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_rfc_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_rfc_nombre TEXT;

-- Verificar
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('doc_rfc_key', 'doc_rfc_nombre');
