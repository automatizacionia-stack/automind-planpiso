-- E3: campos de prueba de manejo en tabla clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS prueba_manejo      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fecha_prueba       text,
  ADD COLUMN IF NOT EXISTS unidad_prueba      text,
  ADD COLUMN IF NOT EXISTS resultado_prueba   text,
  ADD COLUMN IF NOT EXISTS obs_prueba         text;
