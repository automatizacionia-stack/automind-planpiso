-- E5: Aprobación de gerente — tipo de pago
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS).

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e5_estado       TEXT DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS e5_aprobado_por TEXT,
  ADD COLUMN IF NOT EXISTS e5_fecha        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS e5_notas        TEXT;

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  IN ('e5_estado','e5_aprobado_por','e5_fecha','e5_notas')
ORDER BY column_name;
