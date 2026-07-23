-- =====================================================================
-- Automind · Encuesta de satisfacción en prueba de manejo (#08)
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_encuesta_prueba_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_encuesta_prueba_nombre TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('doc_encuesta_prueba_key', 'doc_encuesta_prueba_nombre');
