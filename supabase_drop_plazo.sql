-- =====================================================================
-- Automind · Eliminar columna plazo_dias de inventario
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.inventario DROP COLUMN IF EXISTS plazo_dias;

-- Verificar
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'inventario' AND column_name = 'plazo_dias';
-- Debe devolver 0 filas
