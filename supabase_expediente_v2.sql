-- =====================================================================
-- Automind · Expediente V2 — Estado general + Historial + Pago + Entrega
-- Ejecutar en: Supabase → SQL Editor
-- SEGURO de re-ejecutar (IF NOT EXISTS / DO NOTHING).
-- =====================================================================

-- ── 1. Columna de estado general del proceso comercial ────────────────
--    Distinto de `etapa_proceso`; indica el estado macro del expediente.
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS estado_general TEXT DEFAULT 'Activo';

-- ── 2. Columnas de confirmación de pago ──────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS pago_metodo    TEXT,
  ADD COLUMN IF NOT EXISTS pago_fecha     TEXT,
  ADD COLUMN IF NOT EXISTS pago_referencia TEXT,
  ADD COLUMN IF NOT EXISTS pago_monto     NUMERIC,
  ADD COLUMN IF NOT EXISTS pago_notas     TEXT;

-- ── 3. Columnas de entrega de la unidad ──────────────────────────────
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS entrega_fecha  TEXT,
  ADD COLUMN IF NOT EXISTS entrega_km     TEXT,
  ADD COLUMN IF NOT EXISTS entrega_notas  TEXT;

-- ── 4. Tabla de historial de actividad por cliente ───────────────────
CREATE TABLE IF NOT EXISTS public.cliente_historial (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID        NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  workspace_id   UUID,
  tipo_evento    TEXT        NOT NULL,   -- 'etapa' | 'estado' | 'documento' | 'cotizacion' | 'credito' | 'aprobacion' | 'pago' | 'entrega' | 'nota' | 'vendedor'
  descripcion    TEXT        NOT NULL,
  usuario_nombre TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para consultas por cliente ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_cliente_historial_cliente
  ON public.cliente_historial (cliente_id, created_at DESC);

-- ── 5. RLS para cliente_historial ────────────────────────────────────
ALTER TABLE public.cliente_historial ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden leer historial de su workspace
DROP POLICY IF EXISTS "historial_select" ON public.cliente_historial;
CREATE POLICY "historial_select" ON public.cliente_historial
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuarios autenticados pueden insertar entradas de historial
DROP POLICY IF EXISTS "historial_insert" ON public.cliente_historial;
CREATE POLICY "historial_insert" ON public.cliente_historial
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── 6. Verificación ──────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name  IN ('estado_general','pago_metodo','pago_fecha','pago_referencia',
                       'pago_monto','pago_notas','entrega_fecha','entrega_km','entrega_notas')
ORDER BY ordinal_position;

SELECT 'cliente_historial' AS tabla,
       COUNT(*) AS filas
FROM public.cliente_historial;
