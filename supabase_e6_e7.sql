-- E6: Proceso de crédito + E7: Validación de expediente
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS).

ALTER TABLE public.clientes
  -- E6 — Proceso de crédito (solo aplica si forma_pago_cot = 'Crédito')
  ADD COLUMN IF NOT EXISTS e6_estado            TEXT    DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS e6_institucion       TEXT,
  ADD COLUMN IF NOT EXISTS e6_monto_aprobado    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS e6_mensualidad_real  NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS e6_condiciones       TEXT,
  ADD COLUMN IF NOT EXISTS e6_fecha_solicitud   DATE,
  ADD COLUMN IF NOT EXISTS e6_fecha_resultado   DATE,
  -- E7 — Validación de expediente
  ADD COLUMN IF NOT EXISTS e7_contrato_ok       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e7_excepcion_auth    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e7_excepcion_nota    TEXT,
  ADD COLUMN IF NOT EXISTS e7_obs               TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  IN (
    'e6_estado','e6_institucion','e6_monto_aprobado','e6_mensualidad_real',
    'e6_condiciones','e6_fecha_solicitud','e6_fecha_resultado',
    'e7_contrato_ok','e7_excepcion_auth','e7_excepcion_nota','e7_obs'
  )
ORDER BY column_name;
