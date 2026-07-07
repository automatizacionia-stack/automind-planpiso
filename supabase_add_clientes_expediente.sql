-- Migración: campos de expediente OCR en tabla clientes
-- Correr en: Supabase SQL Editor → Primary Database

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS curp              text,
  ADD COLUMN IF NOT EXISTS rfc              text,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento  text,
  ADD COLUMN IF NOT EXISTS sexo              text,
  ADD COLUMN IF NOT EXISTS direccion         text,
  ADD COLUMN IF NOT EXISTS colonia           text,
  ADD COLUMN IF NOT EXISTS cp                text,
  ADD COLUMN IF NOT EXISTS numero_licencia   text,
  ADD COLUMN IF NOT EXISTS tipo_licencia     text,
  ADD COLUMN IF NOT EXISTS vigencia_licencia text;

COMMENT ON COLUMN clientes.curp              IS 'CURP extraído de INE o licencia (OCR)';
COMMENT ON COLUMN clientes.rfc               IS 'RFC extraído de INE (OCR)';
COMMENT ON COLUMN clientes.fecha_nacimiento  IS 'Fecha de nacimiento DD/MM/AAAA';
COMMENT ON COLUMN clientes.sexo              IS 'H o M';
COMMENT ON COLUMN clientes.direccion         IS 'Calle y número (OCR)';
COMMENT ON COLUMN clientes.colonia           IS 'Colonia (OCR)';
COMMENT ON COLUMN clientes.cp                IS 'Código postal';
COMMENT ON COLUMN clientes.numero_licencia   IS 'Número de folio de licencia (OCR)';
COMMENT ON COLUMN clientes.tipo_licencia     IS 'Tipo de licencia: A, B, C…';
COMMENT ON COLUMN clientes.vigencia_licencia IS 'Fecha de vencimiento de la licencia';
