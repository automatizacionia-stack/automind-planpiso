-- =====================================================================
-- Automind · Test REAL de permisos super admin en contexto JWT
-- Este script simula exactamente lo que hace el browser con el JWT
-- del super admin. Ejecutar en Supabase → SQL Editor.
-- =====================================================================
-- IMPORTANTE: el SQL Editor corre como `postgres` (bypass RLS).
-- Para probar RLS real, usamos SET LOCAL ROLE + request.jwt.claims.
-- =====================================================================

DO $$
DECLARE
  v_sa_uuid  uuid;
  v_sa_email text;
  v_ws_id    uuid;
  v_ag_id    uuid;
  v_test_id  text := 'SA_PERMTEST_' || extract(epoch from now())::bigint;
  v_is_sa    boolean;
  v_insert_ok boolean := false;
  v_delete_ok boolean := false;
BEGIN

  -- ── 1. Obtener un super admin real ───────────────────────────
  SELECT sa.user_id, au.email
    INTO v_sa_uuid, v_sa_email
  FROM public.super_admins sa
  JOIN auth.users au ON au.id = sa.user_id
  ORDER BY sa.created_at
  LIMIT 1;

  IF v_sa_uuid IS NULL THEN
    RAISE EXCEPTION 'No hay super admins registrados en la tabla super_admins';
  END IF;

  -- ── 2. Obtener un workspace de prueba ─────────────────────────
  SELECT w.id, w.agency_id INTO v_ws_id, v_ag_id
  FROM workspaces w
  WHERE w.status = 'active'
  ORDER BY w.created_at
  LIMIT 1;

  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'No hay workspaces activos';
  END IF;

  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'Probando como super admin: % (%)', v_sa_email, v_sa_uuid;
  RAISE NOTICE 'Workspace de prueba: %', v_ws_id;
  RAISE NOTICE 'Agency ID: %', v_ag_id;
  RAISE NOTICE '───────────────────────────────────────────────────';

  -- ── 3. Simular sesión autenticada del super admin ─────────────
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'sub',  v_sa_uuid::text,
      'role', 'authenticated',
      'aud',  'authenticated'
    )::text,
    true   -- local = reset after transaction
  );
  SET LOCAL ROLE authenticated;

  -- ── 4. Test is_super_admin() ──────────────────────────────────
  SELECT is_super_admin() INTO v_is_sa;
  RAISE NOTICE 'is_super_admin() = %  ← debe ser TRUE', v_is_sa;

  IF NOT v_is_sa THEN
    RAISE NOTICE '❌ PROBLEMA: is_super_admin() retorna FALSE';
    RAISE NOTICE '   → Verificar que user_id en super_admins coincide con auth.uid()';
  ELSE
    RAISE NOTICE '✅ is_super_admin() OK';
  END IF;

  -- ── 5. Test SELECT inventario ─────────────────────────────────
  RAISE NOTICE '───────────────────────────────────────────────────';
  DECLARE
    v_count bigint;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM inventario;
    RAISE NOTICE '✅ SELECT inventario: % filas visibles', v_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ SELECT inventario falló: % %', SQLSTATE, SQLERRM;
  END;

  -- ── 6. Test INSERT inventario ─────────────────────────────────
  BEGIN
    INSERT INTO inventario (id, workspace_id, agency_id, estatus, marca)
    VALUES (v_test_id, v_ws_id, v_ag_id, 'NUEVOS', 'TEST_SA');
    v_insert_ok := true;
    RAISE NOTICE '✅ INSERT inventario: OK (id=%)', v_test_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ INSERT inventario falló: % %', SQLSTATE, SQLERRM;
    RAISE NOTICE '   Si SQLSTATE=42501 → RLS bloqueó el INSERT';
    RAISE NOTICE '   Si SQLSTATE=23503 → FK violation (agency_id o workspace_id inválido)';
  END;

  -- ── 7. Test DELETE inventario ─────────────────────────────────
  IF v_insert_ok THEN
    BEGIN
      DELETE FROM inventario WHERE id = v_test_id;
      v_delete_ok := true;
      RAISE NOTICE '✅ DELETE inventario: OK';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ DELETE inventario falló: % %', SQLSTATE, SQLERRM;
    END;
  END IF;

  -- ── 8. Test INSERT clientes ───────────────────────────────────
  RAISE NOTICE '───────────────────────────────────────────────────';
  BEGIN
    INSERT INTO clientes (nombre_completo, workspace_id, agency_id, etapa_proceso, estado_general)
    VALUES ('TEST SUPERADMIN', v_ws_id, v_ag_id, 'Prospección', 'Activo');
    RAISE NOTICE '✅ INSERT clientes: OK';
    DELETE FROM clientes WHERE nombre_completo = 'TEST SUPERADMIN' AND workspace_id = v_ws_id;
    RAISE NOTICE '✅ DELETE clientes: OK';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ INSERT/DELETE clientes falló: % %', SQLSTATE, SQLERRM;
  END;

  -- ── 9. Resumen ────────────────────────────────────────────────
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'RESUMEN:';
  RAISE NOTICE '  is_super_admin() = %', v_is_sa;
  RAISE NOTICE '  INSERT inventario = %', CASE WHEN v_insert_ok THEN '✅ OK' ELSE '❌ FAIL' END;
  RAISE NOTICE '  DELETE inventario = %', CASE WHEN v_delete_ok THEN '✅ OK' ELSE '❌ FAIL' END;

  IF NOT v_is_sa OR NOT v_insert_ok THEN
    RAISE NOTICE '';
    RAISE NOTICE '→ Correr supabase_superadmin_rls_fix2.sql para reparar';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '→ DB correcta. El problema es en el lado del browser.';
    RAISE NOTICE '→ Abrir DevTools → Console y buscar errores [saveVehicle]';
  END IF;

END $$;
