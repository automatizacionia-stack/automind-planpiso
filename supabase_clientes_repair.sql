-- =====================================================================
-- Automind · CRM Clientes — Reparación completa (#13)
-- Agrega TODAS las columnas que db.js espera y que pueden faltar en
-- la BD si no se ejecutaron todos los archivos SQL individuales.
-- SEGURO de re-ejecutar: usa IF NOT EXISTS en cada columna.
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

-- ── 1. Documentos de identidad y domicilio (E2) ──────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_id_key             TEXT,
  ADD COLUMN IF NOT EXISTS doc_id_nombre          TEXT,
  ADD COLUMN IF NOT EXISTS doc_lic_key            TEXT,
  ADD COLUMN IF NOT EXISTS doc_lic_nombre         TEXT,
  ADD COLUMN IF NOT EXISTS doc_dom_key            TEXT,
  ADD COLUMN IF NOT EXISTS doc_dom_nombre         TEXT,
  ADD COLUMN IF NOT EXISTS doc_rfc_key            TEXT,
  ADD COLUMN IF NOT EXISTS doc_rfc_nombre         TEXT;

-- ── 2. Documentos de prueba de manejo (E3) ───────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_ev_prueba_key      TEXT,
  ADD COLUMN IF NOT EXISTS doc_ev_prueba_nombre   TEXT,
  ADD COLUMN IF NOT EXISTS doc_encuesta_prueba_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_encuesta_prueba_nombre TEXT;

-- ── 3. Factura sin valor (E7/Expediente) — CRÍTICO ───────────────────
--    Esta columna faltaba en todos los archivos SQL previos y causaba
--    el error de guardado reportado durante la capacitación.
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_factura_key        TEXT,
  ADD COLUMN IF NOT EXISTS doc_factura_nombre     TEXT;

-- ── 4. Comprobantes de pago (E9 / Liquidación) ───────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_comprobante_key    TEXT,   -- legacy (un solo archivo)
  ADD COLUMN IF NOT EXISTS doc_comprobante_nombre TEXT,   -- legacy
  ADD COLUMN IF NOT EXISTS doc_comprobantes       JSONB;  -- array múltiple (actual)

-- ── 5. Documentos de crédito (E6) ────────────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS doc_cred_carta_key         TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_carta_nombre      TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_solicitud_key     TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_solicitud_nombre  TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_estado_cta_key    TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_estado_cta_nombre TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_contrato_key      TEXT,
  ADD COLUMN IF NOT EXISTS doc_cred_contrato_nombre   TEXT;

-- ── 6. Estado general del cliente ────────────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS estado_general         TEXT    DEFAULT 'Activo';

-- ── 7. Pago / Liquidación ────────────────────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS pago_metodo            TEXT,
  ADD COLUMN IF NOT EXISTS pago_fecha             TEXT,
  ADD COLUMN IF NOT EXISTS pago_referencia        TEXT,
  ADD COLUMN IF NOT EXISTS pago_monto             NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS pago_notas             TEXT;

-- ── 8. Entrega ───────────────────────────────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS entrega_fecha          TEXT,
  ADD COLUMN IF NOT EXISTS entrega_km             TEXT,
  ADD COLUMN IF NOT EXISTS entrega_notas          TEXT;

-- ── Verificación final — debe mostrar todas las columnas anteriores ──
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name IN (
    'doc_id_key','doc_lic_key','doc_dom_key','doc_rfc_key',
    'doc_ev_prueba_key','doc_encuesta_prueba_key',
    'doc_factura_key',
    'doc_comprobante_key','doc_comprobantes',
    'doc_cred_carta_key','doc_cred_solicitud_key',
    'doc_cred_estado_cta_key','doc_cred_contrato_key',
    'estado_general',
    'pago_metodo','pago_fecha','pago_monto',
    'entrega_fecha','entrega_km','entrega_notas'
  )
ORDER BY column_name;
