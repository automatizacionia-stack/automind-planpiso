-- =====================================================================
-- Automind · Comprobantes de pago múltiples (JSONB)
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_comprobantes JSONB;

-- Las columnas doc_comprobante_key y doc_comprobante_nombre se mantienen
-- por compatibilidad con registros anteriores al 2026-07-22.
-- db.js los lee como fallback cuando doc_comprobantes es NULL.

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('doc_comprobantes', 'doc_comprobante_key', 'doc_comprobante_nombre');
