-- =====================================================================
-- Automind · CRM Clientes — Verificación automática de contacto (#01)
-- Agrega columnas para registrar si el teléfono (WhatsApp) y el correo
-- del cliente han sido verificados por API.
-- SEGURO de re-ejecutar: usa IF NOT EXISTS en cada columna.
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS tel_verificado_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tel_verificado_metodo   TEXT,    -- 'twilio_wa', 'formato_mx', 'no_verificado'
  ADD COLUMN IF NOT EXISTS email_verificado_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verificado_metodo TEXT;   -- 'mx_lookup', 'no_verificado'

-- Verificación: deben aparecer las 4 columnas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'clientes'
  AND column_name IN (
    'tel_verificado_at', 'tel_verificado_metodo',
    'email_verificado_at', 'email_verificado_metodo'
  )
ORDER BY column_name;
