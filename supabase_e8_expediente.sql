-- E8: Expediente — contrato firmado
-- Ejecutar en: Supabase → SQL Editor
-- Seguro re-ejecutar (IF NOT EXISTS).

-- 1. Columnas en clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e8_contrato_url     TEXT,
  ADD COLUMN IF NOT EXISTS e8_contrato_nombre  TEXT,
  ADD COLUMN IF NOT EXISTS e8_contrato_fecha   DATE;

-- 2. Crear bucket de Storage para expedientes
--    (solo si no existe ya — ejecutar una vez)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expedientes', 'expedientes', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy: usuarios autenticados pueden subir y leer sus archivos
CREATE POLICY IF NOT EXISTS "Autenticados pueden subir expedientes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'expedientes');

CREATE POLICY IF NOT EXISTS "Autenticados pueden leer expedientes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'expedientes');

CREATE POLICY IF NOT EXISTS "Autenticados pueden eliminar expedientes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'expedientes');

-- Verificar columnas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  IN ('e8_contrato_url','e8_contrato_nombre','e8_contrato_fecha')
ORDER BY column_name;
