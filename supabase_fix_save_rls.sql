-- Fix: usuarios invitados no pueden guardar vehículos de inventario
-- Causa: my_workspace_ids() solo mira workspace_memberships, no la tabla users.
--        Los usuarios invitados tienen workspace_memberships creado por invite-user.ts,
--        pero los rows de inventario tienen workspace_id = OLD_agency_uuid que puede
--        no coincidir si hay mismatch entre agencies y workspaces.
--
-- Este script expande my_workspace_ids() para incluir los workspace_ids que el usuario
-- tiene en la tabla users (flujo de invitación). Así aunque haya mismatch de UUIDs,
-- el usuario puede acceder a su propio workspace.
--
-- También agrega columna semaforo_snapshot si no existe (necesaria para saveVehicle).
--
-- Ejecutar en Supabase SQL Editor → Run.

-- ── 1. Agregar columna semaforo_snapshot si no existe ────────────────────────
alter table inventario add column if not exists semaforo_snapshot text;

-- ── 2. Expandir my_workspace_ids() para incluir tabla users ──────────────────
create or replace function my_workspace_ids()
returns setof uuid language sql stable security definer as $$
  -- Agency owner/admin → todos los workspaces de su agencia
  select w.id from workspaces w
  inner join agency_memberships am on am.agency_id = w.agency_id
  where am.user_id = auth.uid()
    and am.role in ('agency_owner','agency_admin','agency_support')
  union
  -- Miembro explícito de workspace
  select wm.workspace_id from workspace_memberships wm
  where wm.user_id = auth.uid()
  union
  -- Usuario registrado en tabla users por workspace_id (flujo de invitación)
  select u.workspace_id from users u
  where u.auth_user_id = auth.uid() and u.workspace_id is not null
  union
  -- Usuario registrado en tabla users por agency_id (compatibilidad legacy)
  select u.agency_id from users u
  where u.auth_user_id = auth.uid() and u.agency_id is not null;
$$;

-- ── 3. Backfill workspace_memberships para usuarios existentes sin membresía ──
insert into workspace_memberships (workspace_id, user_id, role)
select u.workspace_id, u.auth_user_id, 'workspace_member'
from users u
where u.auth_user_id is not null
  and u.workspace_id is not null
  and exists (select 1 from workspaces w where w.id = u.workspace_id)
on conflict (workspace_id, user_id) do nothing;

-- ── 4. Verificar resultado ────────────────────────────────────────────────────
-- Después de ejecutar, puedes verificar con:
-- select * from workspace_memberships;
-- select my_workspace_ids();  -- como el usuario autenticado
