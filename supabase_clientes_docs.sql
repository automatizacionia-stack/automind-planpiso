-- =====================================================================
-- Automind · Persistencia de documentos del cliente (E2)
-- Agrega columnas para guardar las rutas de Storage de los documentos
-- subidos: INE/Identificación, Licencia y Comprobante de domicilio.
-- Ejecutar en: Supabase → SQL Editor
-- SEGURO de re-ejecutar (IF NOT EXISTS).
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_id_key     TEXT,   -- ruta en bucket expedientes
  ADD COLUMN IF NOT EXISTS doc_id_nombre  TEXT,   -- nombre original del archivo
  ADD COLUMN IF NOT EXISTS doc_lic_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_lic_nombre TEXT,
  ADD COLUMN IF NOT EXISTS doc_dom_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_dom_nombre TEXT;

-- Verificar columnas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  LIKE 'doc_%'
ORDER BY ordinal_position;
