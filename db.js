/* Automind · Capa de datos — Supabase
   Expone window.DB con todas las funciones de acceso a datos.
   Requiere: config.js (SUPABASE_URL, SUPABASE_ANON) y @supabase/supabase-js CDN
*/

(function () {
  const { createClient } = supabase;
  // flowType: 'implicit' — los links de invitación redirigen con #access_token en el hash
  // (no con ?code= del flujo PKCE), que es lo que la app espera para el flujo de activación.
  const client = createClient(window.SUPABASE_URL, window.SUPABASE_ANON, {
    auth: { flowType: 'implicit' },
  });

  /* ── Auth ─────────────────────────────────────────────────── */

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function signOut() {
    await client.auth.signOut();
  }

  async function getSession() {
    const { data } = await client.auth.getSession();
    return data.session;
  }

  /* ── Multi-tenant: identificar rol del usuario ─────────────── */

  async function getUserContext() {
    const { data: authData } = await client.auth.getUser();
    if (!authData.user) throw new Error("No autenticado");
    const authUser = authData.user;

    // ¿Es super admin? (acceso total a todas las agencias)
    const { data: superAdmin } = await client
      .from("super_admins")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (superAdmin) {
      return {
        type: "super_admin",
        authUserId: authUser.id,
        email: authUser.email,
      };
    }

    // ¿Es agency owner/admin? (nivel Coperva)
    const { data: agencyMem } = await client
      .from("agency_memberships")
      .select("*, agencies(id, nombre, owner_email, plan)")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (agencyMem) {
      // Usuario de nivel agencia — puede ver todos los workspaces
      return {
        type: "agency",
        authUserId: authUser.id,
        agencyId: agencyMem.agency_id,
        agency: { ...agencyMem.agencies, name: agencyMem.agencies?.nombre },
        role: agencyMem.role,
        me: null,
      };
    }

    // ¿Es miembro de workspace?
    const { data: me, error: meErr } = await client
      .from("users")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .single();
    if (meErr) throw new Error("Usuario no encontrado. Verifica que tu correo esté registrado.");

    return {
      type: "workspace",
      authUserId: authUser.id,
      workspaceId: me.workspace_id || me.agency_id, // fallback para datos viejos
      role: me.rol,
      me,
    };
  }

  /* ── Cargar workspaces para agency owners ──────────────────── */

  async function loadWorkspaces(agencyId) {
    const { data, error } = await client
      .from("workspaces")
      .select("*")
      .eq("agency_id", agencyId)
      .eq("status", "active")
      .order("nombre");
    if (error) throw error;
    return data || [];
  }

  async function createWorkspace(agencyId, wsData) {
    const { data, error } = await client
      .from("workspaces")
      .insert({
        agency_id: agencyId,
        nombre:    wsData.nombre,
        ciudad:    wsData.ciudad || null,
        iniciales: wsData.iniciales || wsData.nombre.slice(0,3).toUpperCase(),
        accent:    wsData.accent   || "#2f6fed",
        sidebar:   wsData.sidebar  || "#1b2a57",
        status:    "active",
      })
      .select()
      .single();
    if (error) throw error;

    // Sembrar reglas de alerta por defecto para el workspace recién creado.
    // Sin esto, send-alert no encuentra reglas y omite los emails silenciosamente.
    const defaultRules = ["saludable","rotacion","comprometido","vencer","intereses"].map(sem => ({
      workspace_id:    data.id,
      semaforo:        sem,
      notify_vendedor: ["comprometido","vencer","intereses"].includes(sem),
      notify_gerente:  ["comprometido","vencer","intereses"].includes(sem),
      notify_director: ["comprometido","vencer","intereses"].includes(sem),
      activa:          ["comprometido","vencer","intereses"].includes(sem),
    }));
    await client.from("alert_rules").upsert(defaultRules, { onConflict: "workspace_id,semaforo" });

    return data;
  }

  /* ── Cargar datos de un workspace ───────────────────────────── */

  async function loadAgencyData(workspaceIdOverride) {
    const { data: authData } = await client.auth.getUser();
    if (!authData.user) throw new Error("No autenticado");

    // Resolver workspace_id: override (desde selector) o detectar automáticamente
    let workspaceId = workspaceIdOverride;
    let me = null;

    if (!workspaceId) {
      // Buscar en users por auth_user_id — puede haber múltiples filas (multi-tenant)
      const { data: userRows } = await client
        .from("users")
        .select("*")
        .eq("auth_user_id", authData.user.id);
      if (!userRows || userRows.length === 0) throw new Error("Usuario no encontrado en la plataforma.");
      // Si está en varios workspaces, tomar el primero (el selector de workspace ya maneja la elección)
      me = userRows[0];
      workspaceId = me.workspace_id || me.agency_id;
    }

    // Obtener config del workspace
    let workspace;
    try {
      const { data: ws, error: wsErr } = await client
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
      if (!wsErr && ws) {
        workspace = ws;
      }
    } catch(e) {}

    // Fallback: usar tabla agencies original
    if (!workspace) {
      const { data: ag } = await client
        .from("agencies")
        .select("*")
        .eq("id", workspaceId)
        .single();
      if (ag) workspace = ag;
    }

    if (!workspace) throw new Error("Workspace no encontrado.");

    // Si no tenemos me todavía (vino desde selector de workspace)
    if (!me) {
      const { data: userRow } = await client
        .from("users")
        .select("*")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();
      // Para agency owners puede no haber fila en users — usar datos de auth
      const raw = userRow || { auth_user_id: authData.user.id, email: authData.user.email,
        nombre: authData.user.email, rol: "director", workspace_id: workspaceId };
      me = {
        id:           raw.id || "agency-owner",
        nombre:       raw.nombre || raw.email,
        email:        raw.email,
        rol:          raw.rol || "director",
        reportaA:     raw.reporta_a || null,
        auth_user_id: raw.auth_user_id,
        workspace_id: raw.workspace_id || workspaceId,
        agency_id:    raw.agency_id,
      };
    }

    // Obtener usuarios del workspace y mapear snake_case → camelCase
    const wsField = workspace.id;
    const { data: usuariosRaw } = await client
      .from("users")
      .select("*")
      .or(`workspace_id.eq.${wsField},agency_id.eq.${wsField}`)
      .order("rol");

    // Mapear a formato camelCase para que la app pueda usar u.reportaA, u.rol, etc.
    const usuarios = (usuariosRaw || []).map(u => ({
      id:           u.id,
      nombre:       u.nombre       || "",
      email:        u.email        || "",
      tel:          u.tel          || "",
      rol:          u.rol          || "vendedor",
      reportaA:     u.reporta_a    || null,   // ← mapeo clave
      fechaIngreso: u.fecha_ingreso || "",
      auth_user_id: u.auth_user_id || null,
      agency_id:    u.agency_id    || null,
      workspace_id: u.workspace_id || null,
    }));

    // Obtener inventario
    const { data: rows } = await client
      .from("inventario")
      .select("*")
      .or(`workspace_id.eq.${wsField},agency_id.eq.${wsField}`)
      .order("created_at", { ascending: false });

    // Normalizar: workspace sirve como "agency" para el resto de la app
    const agency = {
      id:        workspace.id,
      agency_id: workspace.agency_id || workspace.id, // ← ID de la agencia raíz (Coperva)
      nombre:    workspace.nombre || workspace.name,
      ciudad:    workspace.ciudad,
      iniciales: workspace.iniciales || (workspace.nombre||workspace.name||"WS").slice(0,2).toUpperCase(),
      accent:    workspace.accent   || "#2f6fed",
      sidebar:   workspace.sidebar  || "#1b2a57",
    };

    return { agency, me, usuarios: usuarios||[], rows: rows||[] };
  }

  /* ── Inventario — CRUD ────────────────────────────────────── */

  async function saveVehicle(agencyId, vehicleData) {
    console.log("[saveVehicle] agencyId:", agencyId,
      "| agencyParentId:", window.AUTOMIND?.agencyParentId,
      "| vehicleId:", vehicleData.id);

    // Obtener semáforo anterior antes de guardar (para detectar cambios)
    let semaforoFrom = null;
    try {
      const { data: prev } = await client
        .from("inventario").select("semaforo_snapshot").eq("id", vehicleData.id).maybeSingle();
      semaforoFrom = prev?.semaforo_snapshot || null;
    } catch(e) {
      console.warn("[saveVehicle] No se pudo leer semaforo_snapshot (columna puede no existir):", e.message);
    }

    // Extraer solo los campos de la tabla (sin campos calculados)
    const row = dbRowFromVehicle(agencyId, vehicleData);
    console.log("[saveVehicle] row:", { id: row.id, workspace_id: row.workspace_id, agency_id: row.agency_id });

    // Intentar upsert (UPDATE si existe, INSERT si no)
    // Usar maybeSingle() en lugar de single() para que 0 filas no lance PGRST116
    const { data, error } = await client
      .from("inventario")
      .upsert(row, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("[saveVehicle] ERROR:", error.code, error.message, error.details);
      throw new Error(error.message || error.code || "Error guardando en Supabase");
    }

    if (!data) {
      // 0 filas: RLS bloqueó el upsert (el row no pasó inv_update/inv_insert)
      console.error("[saveVehicle] RLS bloqueó el guardado — workspace_id:", row.workspace_id, "agency_id:", row.agency_id);
      throw new Error(
        "Sin permisos para guardar este vehículo.\n" +
        "workspace_id del intento: " + row.workspace_id + "\n" +
        "Corre supabase_fix_save_rls.sql en Supabase SQL Editor."
      );
    }

    console.log("[saveVehicle] OK — guardado, id:", data?.id);

    // Detectar cambio de semáforo y disparar alerta
    const semaforoTo = vehicleData.semaforo;
    if (semaforoTo && semaforoTo !== semaforoFrom) {
      triggerSemAlert(agencyId, vehicleData, semaforoFrom, semaforoTo);
    }

    return data;
  }

  // Llama a la Edge Function send-alert en background (no bloquea el save)
  async function triggerSemAlert(workspaceId, v, semaforoFrom, semaforoTo) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) return;
      const vehicleDesc = [v.marca, v.modelo, v.anio].filter(Boolean).join(" ");
      await fetch(`${window.SUPABASE_URL}/functions/v1/send-alert`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey":         window.SUPABASE_ANON,
        },
        body: JSON.stringify({
          workspaceId,
          vehicleId:        v.id,
          vehicleDesc,
          vin:              v.vin        || null,
          diasEnPiso:       v.diasEnPiso || 0,
          interesAcum:      v.interesAcum || 0,
          pctPlanConsumido: v.pctPlanConsumido || 0,
          semaforoFrom,
          semaforoTo,
          vendedorEmail:    v.vendedorEmail  || null,
          gerenteEmail:     v.gerenteEmail   || null,
          directorEmail:    v.directorEmail  || null,
        }),
      });
    } catch(e) {
      console.warn("Alert trigger failed (non-critical):", e.message);
    }
  }

  async function deleteVehicle(id) {
    const { error } = await client.from("inventario").delete().eq("id", id);
    if (error) throw error;
  }

  async function loadInventario(agencyId) {
    const { data, error } = await client
      .from("inventario")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  /* ── Colaboradores — CRUD ─────────────────────────────────── */

  async function saveColaborador(agencyId, userData) {
    const parentId = (window.AUTOMIND && window.AUTOMIND.agencyParentId) || agencyId;
    const email = (userData.email || "").toLowerCase().trim();
    const row = {
      id:           userData.id,
      workspace_id: agencyId,
      agency_id:    parentId,
      nombre:       userData.nombre,
      email,
      tel:          userData.tel || null,
      rol:          userData.rol,
      reporta_a:    userData.reportaA || null,
      fecha_ingreso: userData.fechaIngreso || null,
    };

    // Multi-tenant: el mismo email puede existir en distintos workspaces.
    // El constraint en BD es UNIQUE(email, workspace_id).
    // Upsert por id: si la fila existe → update; si no → insert.
    const { data: existing } = await client
      .from("users").select("id").eq("id", row.id).maybeSingle();

    let data, error;
    if (existing) {
      ({ data, error } = await client.from("users").update(row).eq("id", row.id).select().single());
    } else {
      ({ data, error } = await client.from("users").insert(row).select().single());
    }

    if (error) {
      // Conflicto por (email, workspace_id): mismo email ya existe en este workspace
      if (error.code === "23505" || (error.message || "").includes("users_email_workspace_key")) {
        throw new Error("Este correo ya está registrado en este workspace. Usa un correo diferente.");
      }
      throw error;
    }
    return data;
  }

  async function deleteColaborador(id) {
    // Llama Edge Function para borrar de users + workspace_memberships + Supabase Auth
    const { data: { session } } = await client.auth.getSession();
    const res = await fetch(`${window.SUPABASE_URL}/functions/v1/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey":        window.SUPABASE_ANON,
      },
      body: JSON.stringify({ userId: id }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error al eliminar usuario");
  }

  /* ── Helper: mapear objeto de app → fila de DB ────────────── */

  function dbRowFromVehicle(agencyId, v) {
    const toISO = (d) => {
      if (!d) return null;
      if (d instanceof Date) return d.toISOString().slice(0, 10);
      if (typeof d === "string") {
        // soporta "dd/mm/yyyy" y "yyyy-mm-dd"
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
          const [dd, mm, yy] = d.split("/");
          return `${yy}-${mm}-${dd}`;
        }
        return d.slice(0, 10);
      }
      return null;
    };
    return {
      id:               v.id,
      workspace_id:     agencyId,
      agency_id:        (window.AUTOMIND && window.AUTOMIND.agencyParentId) || agencyId,
      vin:              v.vin              || null,
      marca:            v.marca            || null,
      modelo:           v.modelo           || null,
      anio:             Number(v.anio)     || null,
      descripcion:      v.descripcion      || null,
      tipo:             v.tipo             || null,
      color_exterior:   v.colorExterior    || null,
      color_interior:   v.colorInterior    || null,
      estatus:          v.estatus          || "NUEVOS",
      inv:              v.inv              || null,
      observaciones:    v.observaciones    || null,
      monto_financiado: Number(v.montoFinanciado) || 0,
      pct_interes:      Number(v.pctInteres)       || 0,
      dias_gracia_base: Number(v.diasGraciaBase)   || 0,
      dias_gracia_extra:Number(v.diasGraciaExtra)  || 0,
      plazo_dias:       Number(v.plazoDias)        || 0,
      fecha_factura:    toISO(v.fechaFactura),
      fecha_llegada:    toISO(v.fechaLlegada),
      foto_url:         v.fotoUrl          || v.foto || null,
      // multi-vendedor: guardar array completo + primer elemento en campo legacy
      vendedor_ids:     Array.isArray(v.vendedorIds) ? v.vendedorIds.filter(Boolean) : (v.vendedorId ? [v.vendedorId] : []),
      vendedor_id:      (Array.isArray(v.vendedorIds) && v.vendedorIds.filter(Boolean)[0]) || v.vendedorId || null,
      estado_venta:     v.estadoVenta      || 'DISPONIBLE',
      fecha_venta:      toISO(v.fechaVenta) || null,
      // Persistir el semáforo actual para que la detección de cambios
      // (saveVehicle → triggerSemAlert) funcione y no se re-dispare en cada guardado
      semaforo_snapshot: v.semaforo        || null,
    };
  }

  /* ── Helper: mapear fila de DB → objeto de app ────────────── */

  function vehicleFromDbRow(row) {
    const parseDate = (s) => s ? new Date(s + "T12:00:00") : null;
    return {
      id:              row.id,
      vin:             row.vin              || "",
      marca:           row.marca            || "",
      modelo:          row.modelo           || "",
      anio:            row.anio             || new Date().getFullYear(),
      descripcion:     row.descripcion      || "",
      tipo:            row.tipo             || "",
      colorExterior:   row.color_exterior   || "",
      colorInterior:   row.color_interior   || "",
      estatus:         row.estatus          || "NUEVOS",
      inv:             row.inv              || "",
      observaciones:   row.observaciones    || "",
      montoFinanciado: Number(row.monto_financiado)  || 0,
      pctInteres:      Number(row.pct_interes)        || 0,
      diasGraciaBase:  Number(row.dias_gracia_base)   || 0,
      diasGraciaExtra: Number(row.dias_gracia_extra)  || 0,
      plazoDias:       Number(row.plazo_dias)          || 0,
      fechaFactura:    parseDate(row.fecha_factura),
      fechaLlegada:    parseDate(row.fecha_llegada),
      foto:            row.foto_url         || null,
      fotoUrl:         row.foto_url         || null,
      // multi-vendedor: leer array; fallback a campo legacy si el array está vacío
      vendedorIds:     Array.isArray(row.vendedor_ids) && row.vendedor_ids.length > 0
                         ? row.vendedor_ids
                         : (row.vendedor_id ? [row.vendedor_id] : []),
      vendedorId:      (Array.isArray(row.vendedor_ids) && row.vendedor_ids[0]) || row.vendedor_id || null,
      estadoVenta:     row.estado_venta     || 'DISPONIBLE',
      fechaVenta:      parseDate(row.fecha_venta),
    };
  }

  function colaboradorFromDbRow(row) {
    return {
      id:           row.id,
      nombre:       row.nombre,
      email:        row.email,
      tel:          row.tel          || "",
      rol:          row.rol,
      reportaA:     row.reporta_a    || null,
      fechaIngreso: row.fecha_ingreso || "",
      auth_user_id: row.auth_user_id || null,
    };
  }

  /* ── Invitaciones via Edge Function ─────────────────────────── */
  async function inviteUser(payload) {
    const { data: { session } } = await client.auth.getSession();
    if (!session) throw new Error("No autenticado");
    const res = await fetch(
      `${window.SUPABASE_URL}/functions/v1/invite-user`,
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey":         window.SUPABASE_ANON,
        },
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error al invitar usuario");
    return json;
  }

  /* ── Clientes CRM ─────────────────────────────────────────── */

  function clienteFromDbRow(row) {
    return {
      id:          row.id,
      nombre:      row.nombre_completo        || "",
      tel:         row.telefono               || "",
      email:       row.email                  || "",
      tipo:        row.tipo_cliente           || "Persona física",
      canal:       row.canal_origen           || "Digital",
      fuente:      row.fuente_especifica      || "",
      interes:     row.interes_vehiculo       || "",
      presupuesto: Number(row.presupuesto_estimado) || 0,
      formaPago:   row.forma_pago             || "No definido",
      uso:         row.uso_vehiculo           || "Personal",
      etapa:       row.etapa_proceso          || "Prospección",
      asesor:      row.asesor_id              || "",
      prob:        Number(row.probabilidad_cierre) || 0,
      uc:          row.ultimo_contacto        || "",
      ciudad:      row.ciudad                 || "",
      estado:      row.estado_rep             || "",
      prox:        row.proxima_accion         || "",
      fprox:       row.fecha_proxima_accion   || "",
      notas:       row.notas                  || "",
      curp:        row.curp                  || "",
      rfc:         row.rfc                   || "",
      fechaNac:    row.fecha_nacimiento       || "",
      sexo:        row.sexo                   || "",
      direccion:   row.direccion              || "",
      colonia:     row.colonia                || "",
      cp:          row.cp                     || "",
      numLicencia: row.numero_licencia        || "",
      tipoLic:     row.tipo_licencia          || "",
      vigenciaLic:   row.vigencia_licencia      || "",
      pruebaManejo:  !!row.prueba_manejo,
      fechaPrueba:   row.fecha_prueba            || "",
      unidadPrueba:  row.unidad_prueba           || "",
      resultadoPrueba: row.resultado_prueba      || "",
      obsPrueba:     row.obs_prueba              || "",
      // E5 — Aprobación de gerente
      e5Estado:      row.e5_estado              || "Pendiente",
      e5AprobadoPor: row.e5_aprobado_por        || "",
      e5Fecha:       row.e5_fecha               || null,
      e5Notas:       row.e5_notas               || "",
      // E8 — Expediente (contrato firmado)
      e8ContratoUrl:    row.e8_contrato_url     || null,
      e8ContratoNombre: row.e8_contrato_nombre  || "",
      e8ContratoFecha:  row.e8_contrato_fecha   || "",
      // E6 — Proceso de crédito
      e6Estado:       row.e6_estado             || "Pendiente",
      e6Institucion:  row.e6_institucion        || "",
      e6MontoAprobado: Number(row.e6_monto_aprobado) || 0,
      e6MensualidadReal: Number(row.e6_mensualidad_real) || 0,
      e6Condiciones:  row.e6_condiciones        || "",
      e6FechaSolicitud: row.e6_fecha_solicitud  || "",
      e6FechaResultado: row.e6_fecha_resultado  || "",
      // E7 — Validación de expediente
      e7ContratoOk:      !!row.e7_contrato_ok,
      e7ExcepcionAuth:   !!row.e7_excepcion_auth,
      e7ExcepcionNota:   row.e7_excepcion_nota  || "",
      e7Obs:             row.e7_obs             || "",
      // E4 — Cotización
      unidadId:      row.unidad_id              || null,
      unidadDesc:    row.unidad_desc            || "",
      precioLista:   Number(row.precio_lista)   || 0,
      descuentoMonto: Number(row.descuento_monto) || 0,
      precioVenta:   Number(row.precio_venta)   || 0,
      formaPagoCot:  row.forma_pago_cot         || "Contado",
      enganche:      Number(row.enganche)       || 0,
      plazoMeses:    Number(row.plazo_meses)    || 0,
      mensualidadEst: Number(row.mensualidad_est) || 0,
      notasCot:      row.notas_cot             || "",
      createdAt:   row.created_at             || null,
    };
  }

  function dbRowFromCliente(agencyId, c) {
    var parentId = (window.AUTOMIND && window.AUTOMIND.agencyParentId) || agencyId;
    return {
      nombre_completo:      c.nombre       || null,
      telefono:             c.tel          || null,
      email:                c.email        || null,
      tipo_cliente:         c.tipo         || "Persona física",
      canal_origen:         c.canal        || "Digital",
      fuente_especifica:    c.fuente       || null,
      interes_vehiculo:     c.interes      || null,
      presupuesto_estimado: Number(c.presupuesto) || null,
      forma_pago:           c.formaPago    || "No definido",
      uso_vehiculo:         c.uso          || "Personal",
      etapa_proceso:        c.etapa        || "Prospección",
      asesor_id:            c.asesor       || null,
      probabilidad_cierre:  Number(c.prob) || null,
      ultimo_contacto:      c.uc           || null,
      ciudad:               c.ciudad       || null,
      estado_rep:           c.estado       || null,
      proxima_accion:       c.prox         || null,
      fecha_proxima_accion: c.fprox        || null,
      notas:                c.notas        || null,
      curp:                 c.curp         || null,
      rfc:                  c.rfc          || null,
      fecha_nacimiento:     c.fechaNac     || null,
      sexo:                 c.sexo         || null,
      direccion:            c.direccion    || null,
      colonia:              c.colonia      || null,
      cp:                   c.cp           || null,
      numero_licencia:      c.numLicencia  || null,
      tipo_licencia:        c.tipoLic      || null,
      vigencia_licencia:    c.vigenciaLic  || null,
      prueba_manejo:        !!c.pruebaManejo,
      fecha_prueba:         c.fechaPrueba   || null,
      unidad_prueba:        c.unidadPrueba  || null,
      resultado_prueba:     c.resultadoPrueba || null,
      obs_prueba:           c.obsPrueba     || null,
      // E5 — Aprobación de gerente
      e5_estado:            c.e5Estado      || "Pendiente",
      e5_aprobado_por:      c.e5AprobadoPor || null,
      e5_fecha:             c.e5Fecha       || null,
      e5_notas:             c.e5Notas       || null,
      // E8 — Expediente (contrato firmado)
      e8_contrato_url:    c.e8ContratoUrl    || null,
      e8_contrato_nombre: c.e8ContratoNombre || null,
      e8_contrato_fecha:  c.e8ContratoFecha  || null,
      // E6 — Proceso de crédito
      e6_estado:            c.e6Estado        || "Pendiente",
      e6_institucion:       c.e6Institucion   || null,
      e6_monto_aprobado:    Number(c.e6MontoAprobado)    || null,
      e6_mensualidad_real:  Number(c.e6MensualidadReal)  || null,
      e6_condiciones:       c.e6Condiciones   || null,
      e6_fecha_solicitud:   c.e6FechaSolicitud || null,
      e6_fecha_resultado:   c.e6FechaResultado || null,
      // E7 — Validación de expediente
      e7_contrato_ok:       !!c.e7ContratoOk,
      e7_excepcion_auth:    !!c.e7ExcepcionAuth,
      e7_excepcion_nota:    c.e7ExcepcionNota  || null,
      e7_obs:               c.e7Obs            || null,
      // E4 — Cotización
      unidad_id:            c.unidadId      || null,
      unidad_desc:          c.unidadDesc    || null,
      precio_lista:         Number(c.precioLista)  || null,
      descuento_monto:      Number(c.descuentoMonto) || 0,
      precio_venta:         Number(c.precioVenta)  || null,
      forma_pago_cot:       c.formaPagoCot  || "Contado",
      enganche:             Number(c.enganche) || null,
      plazo_meses:          Number(c.plazoMeses) || null,
      mensualidad_est:      Number(c.mensualidadEst) || null,
      notas_cot:            c.notasCot      || null,
      workspace_id:         agencyId,
      agency_id:            parentId,
    };
  }

  async function getClientes(agencyId) {
    const { data, error } = await client
      .from("clientes")
      .select("*")
      .or(`workspace_id.eq.${agencyId},agency_id.eq.${agencyId}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(clienteFromDbRow);
  }

  async function saveCliente(agencyId, clienteData) {
    const row = dbRowFromCliente(agencyId, clienteData);
    const isNew = !clienteData.id || /^c\d+$/.test(String(clienteData.id));
    if (isNew) {
      const { data, error } = await client.from("clientes").insert(row).select().single();
      if (error) throw new Error(error.message);
      return clienteFromDbRow(data);
    } else {
      const { data, error } = await client.from("clientes").upsert({ id: clienteData.id, ...row }).select().single();
      if (error) throw new Error(error.message);
      return clienteFromDbRow(data);
    }
  }

  async function deleteCliente(id) {
    const { error } = await client.from("clientes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  /* ── Super Admin: CRUD de agencias ────────────────────────── */

  async function loadAllAgencies() {
    const { data, error } = await client
      .from("agencies")
      .select("*, workspaces(id, nombre, ciudad, status)")
      .order("nombre");
    if (error) throw new Error(error.message);
    return (data || []).map(a => ({
      id:          a.id,
      nombre:      a.nombre,
      ciudad:      a.ciudad      || "",
      iniciales:   a.iniciales   || a.nombre.slice(0,2).toUpperCase(),
      accent:      a.accent      || "#2f6fed",
      sidebar:     a.sidebar     || "#1b2a57",
      ownerEmail:  a.owner_email || "",
      plan:        a.plan        || "pro",
      workspaces:  (a.workspaces || []).filter(w => w.status !== "deleted"),
      createdAt:   a.created_at  || null,
    }));
  }

  // Carga TODOS los workspaces (tenants) de todas las agencias en plano
  async function loadAllWorkspaces() {
    const { data, error } = await client
      .from("workspaces")
      .select("*")
      .neq("status", "deleted")
      .order("nombre");
    if (error) throw new Error(error.message);
    return (data || []).map(w => ({
      id:         w.id,
      nombre:     w.nombre || w.name || "",
      ciudad:     w.ciudad || "",
      iniciales:  w.iniciales || (w.nombre || "WS").slice(0, 2).toUpperCase(),
      accent:     w.accent   || "#2f6fed",
      sidebar:    w.sidebar  || "#1b2a57",
      agencyId:   w.agency_id,
      ownerEmail: w.owner_email || "",
      plan:       w.plan || "pro",
    }));
  }

  async function createAgency(agencyData) {
    const iniciales = agencyData.iniciales ||
      agencyData.nombre.split(" ").map(w => w[0]).join("").slice(0,3).toUpperCase();
    // 1. Crear registro padre en agencies
    const { data: ag, error: agErr } = await client
      .from("agencies")
      .insert({
        nombre:      agencyData.nombre,
        ciudad:      agencyData.ciudad    || null,
        iniciales,
        accent:      agencyData.accent    || "#2f6fed",
        sidebar:     agencyData.sidebar   || "#1b2a57",
        owner_email: agencyData.ownerEmail || null,
        plan:        agencyData.plan       || "pro",
      })
      .select()
      .single();
    if (agErr) throw new Error(agErr.message);
    // 2. Crear workspace (tenant) bajo la agencia con los mismos datos
    const { data: ws, error: wsErr } = await client
      .from("workspaces")
      .insert({
        agency_id:   ag.id,
        nombre:      agencyData.nombre,
        ciudad:      agencyData.ciudad    || null,
        iniciales,
        accent:      agencyData.accent    || "#2f6fed",
        sidebar:     agencyData.sidebar   || "#1b2a57",
        owner_email: agencyData.ownerEmail || null,
        status:      "active",
      })
      .select()
      .single();
    if (wsErr) throw new Error(wsErr.message);
    // Retornar el workspace (es lo que se muestra en la vista plana)
    return {
      id:         ws.id,
      nombre:     ws.nombre,
      ciudad:     ws.ciudad     || "",
      iniciales:  ws.iniciales  || ws.nombre.slice(0, 2).toUpperCase(),
      accent:     ws.accent     || "#2f6fed",
      sidebar:    ws.sidebar    || "#1b2a57",
      agencyId:   ag.id,
      ownerEmail: agencyData.ownerEmail || "",
      plan:       agencyData.plan || "pro",
    };
  }

  async function deleteAgency(agencyId) {
    // Cascadea a workspaces, users, inventario por FK ON DELETE CASCADE
    const { error } = await client
      .from("agencies")
      .delete()
      .eq("id", agencyId);
    if (error) throw new Error(error.message);
  }

  // Eliminar un workspace (tenant) y todos sus registros dependientes en orden correcto
  async function deleteWorkspace(workspaceId, agencyId) {
    const wid = workspaceId;
    // 1. Inventario (usa workspace_id o agency_id legacy)
    await client.from("inventario").delete()
      .or(`workspace_id.eq.${wid},agency_id.eq.${wid}`);
    // 2. Financieras (puede no existir, ignorar error)
    try { await client.from("financieras").delete().eq("workspace_id", wid); } catch(e) {}
    // 3. Clientes CRM (puede no existir, ignorar error)
    try { await client.from("clientes").delete().eq("workspace_id", wid); } catch(e) {}
    // 4. Reglas de alerta
    await client.from("alert_rules").delete().eq("workspace_id", wid);
    // 4. Membresías de workspace
    await client.from("workspace_memberships").delete().eq("workspace_id", wid);
    // 5. Usuarios del workspace (usuarios tabla interna, no auth)
    await client.from("users").delete()
      .or(`workspace_id.eq.${wid},agency_id.eq.${wid}`);
    // 6. Borrar el workspace
    const { error } = await client.from("workspaces").delete().eq("id", wid);
    if (error) throw new Error(error.message);
    // 7. Si era el último workspace de la agencia padre, borrar la agencia también
    if (agencyId) {
      const { data: rest } = await client.from("workspaces").select("id").eq("agency_id", agencyId);
      if (!rest || rest.length === 0) {
        await client.from("agencies").delete().eq("id", agencyId);
      }
    }
  }

  async function loadAgencyWorkspaces(agencyId) {
    const { data, error } = await client
      .from("workspaces")
      .select("*")
      .eq("agency_id", agencyId)
      .order("nombre");
    if (error) throw new Error(error.message);
    return data || [];
  }

  /* ── Exponer en window ─────────────────────────────────────── */
  window.DB = {
    client,
    signIn,
    signOut,
    getSession,
    getUserContext,
    loadWorkspaces,
    createWorkspace,
    loadAgencyData,
    saveVehicle,
    deleteVehicle,
    loadInventario,
    saveColaborador,
    deleteColaborador,
    inviteUser,
    dbRowFromVehicle,
    vehicleFromDbRow,
    colaboradorFromDbRow,
    clienteFromDbRow,
    dbRowFromCliente,
    getClientes,
    saveCliente,
    deleteCliente,
    loadAllAgencies,
    loadAllWorkspaces,
    createAgency,
    deleteAgency,
    deleteWorkspace,
    loadAgencyWorkspaces,
    storage: client.storage,
  };
})();
