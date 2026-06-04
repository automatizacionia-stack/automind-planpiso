-- ============================================================
--  Automind · Financieras — Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── 1. Tabla ─────────────────────────────────────────────────
create table if not exists financieras (
  id               uuid primary key default uuid_generate_v4(),
  agency_id        uuid not null references agencies(id) on delete cascade,
  nombre           text not null,
  tasa             numeric not null default 0.14,   -- tasa anual, ej: 0.14 = 14%
  plazo_dias       int  not null default 90,        -- días de gracia base
  dias_gracia_extra int not null default 0,
  logo_url         text,
  activa           boolean not null default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (agency_id, nombre)
);

-- Trigger updated_at
create trigger trg_financieras_updated
  before update on financieras
  for each row execute procedure set_updated_at();

-- Índice
create index if not exists idx_financieras_agency on financieras(agency_id);

-- ── 2. Row Level Security ─────────────────────────────────────
alter table financieras enable row level security;

create policy "fin_select" on financieras for select
  using (agency_id = my_agency_id());

create policy "fin_insert" on financieras for insert
  with check (agency_id = my_agency_id());

create policy "fin_update" on financieras for update
  using (agency_id = my_agency_id());

create policy "fin_delete" on financieras for delete
  using (agency_id = my_agency_id());

-- ── 3. Seed — Coperva para ambas agencias demo ───────────────
-- Agencia 1: Grupo Automotriz Vallarta
insert into financieras (agency_id, nombre, tasa, plazo_dias, dias_gracia_extra) values
  ('00000000-0000-0000-0000-000000000001', 'Coperva',      0.14, 90,  0),
  ('00000000-0000-0000-0000-000000000001', 'BBVA',         0.15, 60,  0),
  ('00000000-0000-0000-0000-000000000001', 'Banorte',      0.13, 90,  15),
  ('00000000-0000-0000-0000-000000000001', 'Santander',    0.16, 60,  0),
  ('00000000-0000-0000-0000-000000000001', 'HSBC',         0.14, 75,  0)
on conflict (agency_id, nombre) do nothing;

-- Agencia 2: Agencia Monterrey Norte
insert into financieras (agency_id, nombre, tasa, plazo_dias, dias_gracia_extra) values
  ('00000000-0000-0000-0000-000000000002', 'Coperva',      0.14, 90,  0),
  ('00000000-0000-0000-0000-000000000002', 'BBVA',         0.15, 60,  0),
  ('00000000-0000-0000-0000-000000000002', 'Banorte',      0.13, 90,  15)
on conflict (agency_id, nombre) do nothing;

-- ── FIN ──────────────────────────────────────────────────────
