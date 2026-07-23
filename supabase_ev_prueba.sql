-- =====================================================================
-- Automind · Evidencia de prueba de manejo en clientes
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_ev_prueba_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_ev_prueba_nombre TEXT;

-- Verificar
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('doc_ev_prueba_key', 'doc_ev_prueba_nombre');
