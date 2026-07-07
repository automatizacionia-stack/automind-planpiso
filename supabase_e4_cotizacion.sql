-- E4: Selección de unidad + Cotización
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS).
-- NOTA: unidad_id es TEXT (no UUID) porque inventario.id es de tipo text.

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS unidad_id         TEXT,
  ADD COLUMN IF NOT EXISTS unidad_desc       TEXT,
  ADD COLUMN IF NOT EXISTS precio_lista      NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS descuento_monto   NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_venta      NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS forma_pago_cot    TEXT,
  ADD COLUMN IF NOT EXISTS enganche          NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS plazo_meses       INTEGER,
  ADD COLUMN IF NOT EXISTS mensualidad_est   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS notas_cot         TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  IN (
    'unidad_id','unidad_desc','precio_lista','descuento_monto',
    'precio_venta','forma_pago_cot','enganche','plazo_meses',
    'mensualidad_est','notas_cot'
  )
ORDER BY column_name;
