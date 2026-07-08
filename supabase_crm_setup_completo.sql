-- =====================================================================
-- Automind · CRM Setup Completo — Todas las columnas E1-E8
-- Ejecutar en: Supabase → SQL Editor
-- SEGURO de re-ejecutar (IF NOT EXISTS en todo).
-- Si la tabla aún no existe, créala primero con supabase_add_clientes.sql
-- =====================================================================

-- 1. Campos de Expediente / OCR (E2 — INE, Licencia, Domicilio)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS curp               TEXT,
  ADD COLUMN IF NOT EXISTS rfc                TEXT,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento   TEXT,
  ADD COLUMN IF NOT EXISTS sexo               TEXT,
  ADD COLUMN IF NOT EXISTS direccion          TEXT,
  ADD COLUMN IF NOT EXISTS colonia            TEXT,
  ADD COLUMN IF NOT EXISTS cp                 TEXT,
  ADD COLUMN IF NOT EXISTS numero_licencia    TEXT,
  ADD COLUMN IF NOT EXISTS tipo_licencia      TEXT,
  ADD COLUMN IF NOT EXISTS vigencia_licencia  TEXT;

-- 2. E3 — Prueba de manejo
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS prueba_manejo      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fecha_prueba       DATE,
  ADD COLUMN IF NOT EXISTS unidad_prueba      TEXT,
  ADD COLUMN IF NOT EXISTS resultado_prueba   TEXT,
  ADD COLUMN IF NOT EXISTS obs_prueba         TEXT;

-- 3. E4 — Selección de unidad y cotización
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS unidad_id          TEXT,
  ADD COLUMN IF NOT EXISTS unidad_desc        TEXT,
  ADD COLUMN IF NOT EXISTS precio_lista       NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS descuento_monto    NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_venta       NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS forma_pago_cot     TEXT,
  ADD COLUMN IF NOT EXISTS enganche           NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS plazo_meses        INTEGER,
  ADD COLUMN IF NOT EXISTS mensualidad_est    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS notas_cot          TEXT;

-- 4. E5 — Aprobación de gerente
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e5_estado          TEXT DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS e5_aprobado_por    TEXT,
  ADD COLUMN IF NOT EXISTS e5_fecha           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS e5_notas           TEXT;

-- 5. E6 — Proceso de crédito
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e6_estado          TEXT DEFAULT 'Pendiente',
  ADD COLUMN IF NOT EXISTS e6_institucion     TEXT,
  ADD COLUMN IF NOT EXISTS e6_monto_aprobado  NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS e6_mensualidad_real NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS e6_condiciones     TEXT,
  ADD COLUMN IF NOT EXISTS e6_fecha_solicitud DATE,
  ADD COLUMN IF NOT EXISTS e6_fecha_resultado DATE;

-- 6. E7 — Validación de expediente
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e7_contrato_ok     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e7_excepcion_auth  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e7_excepcion_nota  TEXT,
  ADD COLUMN IF NOT EXISTS e7_obs             TEXT;

-- 7. E8 — Expediente: contrato firmado (Storage)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS e8_contrato_url    TEXT,
  ADD COLUMN IF NOT EXISTS e8_contrato_nombre TEXT,
  ADD COLUMN IF NOT EXISTS e8_contrato_fecha  DATE;

-- 8. Bucket de Storage para contratos firmados
INSERT INTO storage.buckets (id, name, public)
VALUES ('expedientes', 'expedientes', false)
ON CONFLICT (id) DO NOTHING;

-- 9. RLS en Storage (IF NOT EXISTS requiere Postgres 17+; en versiones anteriores
--    ignorar errores de "policy already exists")
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Autenticados pueden subir expedientes"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'expedientes');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Autenticados pueden leer expedientes"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'expedientes');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    CREATE POLICY "Autenticados pueden eliminar expedientes"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'expedientes');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 10. Verificar columnas agregadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
ORDER BY ordinal_position;
