/* Automind · Capa de datos — Supabase
   Expone window.DB con todas las funciones de acceso a datos.
   Requiere: config.js (SUPABASE_URL, SUPABASE_ANON) y @supabase/supabase-js CDN
*/

(function () {
  const { createClient } = supabase;
  const client = createClient(window.SUPABASE_URL, window.SUPABASE_ANON);

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
      // Buscar en users por auth_user_id
      const { data: userRow, error: meErr } = await client
        .from("users")
        .select("*")
        .eq("auth_user_id", authData.user.id)
        .single();
      if (meErr) throw new Error("Usuario no encontrado en la plataforma.");
      me = userRow;
      workspaceId = userRow.workspace_id || userRow.agency_id;
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

    // Obtener financieras — nivel AGENCIA (no workspace)
    // Las financieras son globales para todos los workspaces de la agencia
    let financieras = [];
    try {
      // Primero obtener el agency_id del workspace
      const agencyIdForFin = workspace.agency_id || wsField;
      const { data: finData } = await client
        .from("financieras")
        .select("*")
        .eq("agency_id", agencyIdForFin)
        .eq("activa", true)
        .order("nombre");
      if (finData && finData.length > 0) {
        financieras = finData;
      } else {
        // Fallback: intentar con workspace_id/agency_id directo (schema viejo)
        const { data: finFallback } = await client
          .from("financieras")
          .select("*")
          .or(`workspace_id.eq.${wsField},agency_id.eq.${wsField}`)
          .eq("activa", true)
          .order("nombre");
        if (finFallback) financieras = finFallback;
      }
    } catch(e) { console.warn("Error cargando financieras:", e.message); }

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

    return { agency, me, usuarios: usuarios||[], rows: rows||[], financieras };
  }

  /* ── Financieras — CRUD ──────────────────────────────────────── */

  async function saveFinanciera(agencyId, fin) {
    const row = {
      id:               fin.id   || undefined,
      agency_id:        agencyId, // financieras pertenecen a la AGENCIA, no al workspace
      nombre:           fin.nombre,
      tasa:             Number(fin.tasa)            || 0,
      plazo_dias:       Number(fin.plazoDias)       || 0,
      dias_gracia_extra:Number(fin.diasGraciaExtra) || 0,
      logo_url:         fin.logoUrl || null,
      activa:           fin.activa !== false,
    };
    if (!row.id) delete row.id; // dejar que Supabase genere el UUID
    const { data, error } = await client
      .from("financieras")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteFinanciera(id) {
    // Soft delete — marcar como inactiva
    const { error } = await client
      .from("financieras")
      .update({ activa: false })
      .eq("id", id);
    if (error) throw error;
  }

  async function loadFinancieras(agencyId) {
    const { data, error } = await client
      .from("financieras")
      .select("*")
      .eq("agency_id", agencyId)
      .order("nombre");
    if (error) throw error;
    return data || [];
  }

  function financieraFromDbRow(row) {
    return {
      id:               row.id,
      nombre:           row.nombre,
      tasa:             Number(row.tasa),
      plazoDias:        Number(row.plazo_dias),
      diasGraciaExtra:  Number(row.dias_gracia_extra),
      logoUrl:          row.logo_url || null,
      activa:           row.activa,
    };
  }

  /* ── Inventario — CRUD ────────────────────────────────────── */

  async function saveVehicle(agencyId, vehicleData) {
    // Obtener semáforo anterior antes de guardar (para detectar cambios)
    let semaforoFrom = null;
    try {
      const { data: prev } = await client
        .from("inventario").select("semaforo_snapshot").eq("id", vehicleData.id).maybeSingle();
      semaforoFrom = prev?.semaforo_snapshot || null;
    } catch(e) {}

    // Extraer solo los campos de la tabla (sin campos calculados)
    const row = dbRowFromVehicle(agencyId, vehicleData);
    const { data, error } = await client
      .from("inventario")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;

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
    const row = {
      id:           userData.id,
      workspace_id: agencyId,
      agency_id:    parentId,
      nombre:       userData.nombre,
      email:        userData.email,
      tel:          userData.tel || null,
      rol:          userData.rol,
      reporta_a:    userData.reportaA || null,
      fecha_ingreso: userData.fechaIngreso || null,
    };
    const { data, error } = await client
      .from("users")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteColaborador(id) {
    const { error } = await client.from("users").delete().eq("id", id);
    if (error) throw error;
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
      color_exterior:   v.colorExterior    || null,
      color_interior:   v.colorInterior    || null,
      estatus:          v.estatus          || "NUEVOS",
      inv:              v.inv              || null,
      financiera:       v.financiera       || null,
      monto_financiado: Number(v.montoFinanciado) || 0,
      pct_interes:      Number(v.pctInteres)       || 0,
      dias_gracia_base: Number(v.diasGraciaBase)   || 0,
      dias_gracia_extra:Number(v.diasGraciaExtra)  || 0,
      plazo_dias:       Number(v.plazoDias)        || 0,
      fecha_factura:    toISO(v.fechaFactura),
      fecha_llegada:    toISO(v.fechaLlegada),
      foto_url:         v.fotoUrl          || v.foto || null,
      vendedor_id:      v.vendedorId       || null,
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
      colorExterior:   row.color_exterior   || "",
      colorInterior:   row.color_interior   || "",
      estatus:         row.estatus          || "NUEVOS",
      inv:             row.inv              || "",
      financiera:      row.financiera       || "",
      montoFinanciado: Number(row.monto_financiado)  || 0,
      pctInteres:      Number(row.pct_interes)        || 0,
      diasGraciaBase:  Number(row.dias_gracia_base)   || 0,
      diasGraciaExtra: Number(row.dias_gracia_extra)  || 0,
      plazoDias:       Number(row.plazo_dias)          || 0,
      fechaFactura:    parseDate(row.fecha_factura),
      fechaLlegada:    parseDate(row.fecha_llegada),
      foto:            row.foto_url         || null,
      fotoUrl:         row.foto_url         || null, // la UI (inventario-editor) lee fotoUrl
      vendedorId:      row.vendedor_id      || null,
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
    saveFinanciera,
    deleteFinanciera,
    loadFinancieras,
    financieraFromDbRow,
    dbRowFromVehicle,
    vehicleFromDbRow,
    colaboradorFromDbRow,
  };
})();
