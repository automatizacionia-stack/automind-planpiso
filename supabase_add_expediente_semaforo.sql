-- Automind · Expediente / semáforo de documentos para el CRM de Ventas
-- Correr en Supabase SQL Editor DESPUÉS de supabase_add_clientes.sql
--
-- Alinea la tabla `clientes` a PROCESO Ventas.docx (E1-E10):
--   1. "Expediente" deja de ser una etapa del pipeline (etapa_proceso) y
--      pasa a ser un semáforo calculado a partir de estas columnas.
--   2. Se agregan las columnas de documentos que alimentan ese semáforo.
--   3. Se registra qué documentos faltantes fueron autorizados como
--      excepción por el gerente (equivalente al estado "○ Pendiente").

-- 1) Quitar "Expediente" del check constraint de etapa_proceso
--    (el nombre por default de Postgres para un check de columna es
--    <tabla>_<columna>_check; si se corrió supabase_add_clientes.sql tal
--    cual, este es el nombre real).
alter table clientes drop constraint if exists clientes_etapa_proceso_check;

alter table clientes add constraint clientes_etapa_proceso_check
  check (etapa_proceso in (
    'Prospección','Perfilamiento','Presentación','Cotización',
    'Pago','Crédito','Cierre','Entrega'
  ));

-- Migrar registros existentes que hayan quedado en "Expediente"
-- (según la spec, ese requisito corresponde a "Perfilamiento")
update clientes set etapa_proceso = 'Perfilamiento' where etapa_proceso = 'Expediente';

-- 2) Columnas de documentos del expediente
alter table clientes
  add column if not exists aviso_privacidad  boolean not null default false,
  add column if not exists identidad_cargada boolean not null default false,
  add column if not exists prueba_manejo     text check (prueba_manejo in ('completa','no_aplica','pendiente')) default 'pendiente',
  add column if not exists cotizacion_pdf    boolean not null default false,
  add column if not exists solicitud_credito text check (solicitud_credito in ('aprobado','condicionado','rechazado','pendiente','no_aplica')) default 'pendiente',
  add column if not exists contrato_firmado  boolean not null default false,
  add column if not exists facturacion       boolean not null default false,
  -- claves de DOC_DEFS (crm.jsx) autorizadas como excepción por el gerente
  add column if not exists excepciones_gerente text[] not null default '{}';

comment on column clientes.excepciones_gerente is
  'Claves de documento (avisoPrivacidad, identidadCargada, pruebaManejo, cotizacionPDF, solicitudCredito, contratoFirmado, facturacion) que el gerente autorizó avanzar como excepción sin estar completas. avisoPrivacidad NUNCA debe incluirse aquí (bloqueo duro, sin excepción posible).';
