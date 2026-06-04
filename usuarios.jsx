/* Automind · Registro de usuarios
   Permite a directores y gerentes invitar nuevos usuarios a la plataforma.
   Las invitaciones se envían via Edge Function (invite-user). */

const ROL_COLORS = {
  director: { bg:"#e8f0fd", txt:"#1a4db5", dot:"#2f6fed" },
  gerente:  { bg:"#e7f5ed", txt:"#0f7a40", dot:"#1f9d57" },
  vendedor: { bg:"#fbf2da", txt:"#9a6a06", dot:"#d99613" },
};

function RolBadgeU({ rol }) {
  const c = ROL_COLORS[rol] || ROL_COLORS.vendedor;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700,
      padding:"3px 9px", borderRadius:20, background:c.bg, color:c.txt }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {rol.charAt(0).toUpperCase() + rol.slice(1)}
    </span>
  );
}

/* ── Drawer para invitar / editar usuario ─────────────────────────────────── */
function InviteDrawer({ usuarios, agencyId, usuarioActual, editTarget, onSave, onClose }) {
  const esEdicion = !!editTarget;
  const [form, setForm] = React.useState(editTarget || {
    nombre:"", email:"", tel:"", rol:"vendedor", reportaA:"", fechaIngreso:""
  });
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Candidatos para "reporta a" según el rol seleccionado
  const superiores = form.rol === "vendedor"
    ? usuarios.filter(u => u.rol === "gerente")
    : form.rol === "gerente"
    ? usuarios.filter(u => u.rol === "director")
    : [];

  // Derivar gerente/director para preview
  const superior  = usuarios.find(u => u.id === form.reportaA) || null;
  const gerente   = form.rol === "vendedor" ? superior : form.rol === "gerente" ? { nombre: form.nombre } : null;
  const director  = form.rol === "director" ? { nombre: form.nombre }
                  : form.rol === "gerente"  ? superior
                  : gerente ? (usuarios.find(u => u.id === gerente?.reportaA) || null) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.rol) {
      setError("Nombre, correo y rol son requeridos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await window.DB.client.auth.getSession();
      const res = await fetch(
        `${window.SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": window.SUPABASE_ANON,
          },
          body: JSON.stringify({
            email:        form.email,
            nombre:       form.nombre,
            tel:          form.tel,
            rol:          form.rol,
            reportaA:     form.reportaA || null,
            fechaIngreso: form.fechaIngreso || null,
            agencyId,
            userId:       editTarget?.id || null,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al enviar invitación");
      setSuccess(true);
      onSave && onSave(json.user);
      setTimeout(() => { setSuccess(false); onClose(); }, 1800);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="inv-drawer-scrim" onClick={onClose} />
      <aside className="inv-drawer">
        <div className="inv-drawer-head">
          <h2>{esEdicion ? "Editar usuario" : "Invitar usuario"}</h2>
          <button className="icon-btn ghost" onClick={onClose}>{I.close({ width:20, height:20 })}</button>
        </div>

        <div className="inv-drawer-body">
          {!esEdicion && (
            <div className="inv-hint">
              {I.bell({ width:14, height:14, style:{ display:"inline", verticalAlign:"middle", marginRight:6 } })}
              Se enviará un correo de invitación. El usuario deberá crear su contraseña para activar su cuenta.
            </div>
          )}

          <form id="invite-form" onSubmit={handleSubmit}>
            <div className="inv-field">
              <label>Nombre completo *</label>
              <input placeholder="Ana Torres" value={form.nombre}
                onChange={e => set("nombre", e.target.value)} disabled={loading} />
            </div>
            <div className="inv-field">
              <label>Correo electrónico *</label>
              <input type="email" placeholder="atorres@agencia.mx" value={form.email}
                onChange={e => set("email", e.target.value)} disabled={loading || esEdicion} />
            </div>
            <div className="inv-field">
              <label>Teléfono</label>
              <input placeholder="55 1234 5678" value={form.tel}
                onChange={e => set("tel", e.target.value)} disabled={loading} />
            </div>
            <div className="inv-field">
              <label>Rol *</label>
              <select value={form.rol} onChange={e => { set("rol", e.target.value); set("reportaA", ""); }}
                disabled={loading || (usuarioActual.rol === "gerente")}>
                {usuarioActual.rol === "director" && <option value="director">Director</option>}
                {usuarioActual.rol === "director" && <option value="gerente">Gerente</option>}
                <option value="vendedor">Vendedor</option>
              </select>
            </div>

            {superiores.length > 0 && (
              <div className="inv-field">
                <label>Reporta a {form.rol === "vendedor" ? "(Gerente)" : "(Director)"} *</label>
                <select value={form.reportaA} onChange={e => set("reportaA", e.target.value)} disabled={loading}>
                  <option value="">— Seleccionar —</option>
                  {superiores.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="inv-field">
              <label>Fecha de ingreso</label>
              <input type="date" value={form.fechaIngreso}
                onChange={e => set("fechaIngreso", e.target.value)} disabled={loading} />
            </div>

            {/* Preview de jerarquía */}
            {(superior || form.rol === "director") && (
              <div className="inv-field">
                <label>Jerarquía resultante</label>
                <div className="inv-derived">
                  {director && (
                    <div className="inv-derived-row">
                      <span className="inv-derived-lbl">Director</span>
                      <span className="inv-derived-val">{director.nombre}</span>
                    </div>
                  )}
                  {gerente && form.rol !== "director" && (
                    <div className="inv-derived-row">
                      <span className="inv-derived-lbl">Gerente</span>
                      <span className="inv-derived-val">{gerente.nombre}</span>
                    </div>
                  )}
                  <div className="inv-derived-row">
                    <span className="inv-derived-lbl">{form.rol.charAt(0).toUpperCase()+form.rol.slice(1)}</span>
                    <span className="inv-derived-val">{form.nombre || "—"}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="login-error" style={{ marginBottom:12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background:"#e7f5ed", color:"#0f7a40", borderRadius:9, padding:"10px 14px",
                fontSize:13, fontWeight:700, marginBottom:12 }}>
                ✓ {esEdicion ? "Cambios guardados" : "Invitación enviada correctamente"}
              </div>
            )}
          </form>
        </div>

        <div className="inv-drawer-foot">
          <button className="btn" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn primary" form="invite-form" type="submit" disabled={loading}>
            {loading ? <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} /> : null}
            {loading ? "Enviando…" : esEdicion ? "Guardar cambios" : "Enviar invitación"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Vista principal ─────────────────────────────────────────────────────── */
function RegistroUsuarios({ usuarioActual }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState(null);
  const [usuarios,   setUsuarios]   = React.useState(
    window.AUTOMIND ? (window.AUTOMIND.USUARIOS || []) : []
  );

  const agencyId = window.AUTOMIND ? window.AUTOMIND.agencyId : null;

  // Permisos: director ve a todos, gerente solo a su equipo
  const visibles = usuarioActual.rol === "director"
    ? usuarios
    : usuarios.filter(u =>
        u.id === usuarioActual.id ||
        u.reportaA === usuarioActual.id ||
        u.id === usuarioActual.reportaA
      );

  const puedeInvitar = ["director", "gerente"].includes(usuarioActual.rol);

  function handleSave(savedUser) {
    if (!savedUser) return;
    const mapped = {
      id:           savedUser.id,
      nombre:       savedUser.nombre,
      email:        savedUser.email,
      tel:          savedUser.tel || "",
      rol:          savedUser.rol,
      reportaA:     savedUser.reporta_a || null,
      fechaIngreso: savedUser.fecha_ingreso || "",
      auth_user_id: savedUser.auth_user_id || null,
    };
    setUsuarios(prev => {
      const idx = prev.findIndex(u => u.id === mapped.id || u.email === mapped.email);
      const next = idx >= 0 ? [...prev.slice(0,idx), mapped, ...prev.slice(idx+1)] : [...prev, mapped];
      if (window.AUTOMIND) window.AUTOMIND.USUARIOS = next;
      return next;
    });
  }

  return (
    <div className="usr-shell">
      <div className="usr-header">
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800 }}>Registro de usuarios</h1>
          <p className="page-sub" style={{ margin:0 }}>
            Gestiona quién tiene acceso a la plataforma en tu agencia.
          </p>
        </div>
        {puedeInvitar && (
          <button className="btn primary" onClick={() => { setEditTarget(null); setDrawerOpen(true); }}>
            + Invitar usuario
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="usr-list">
        <div className="usr-list-head">
          <span>Nombre</span>
          <span>Correo</span>
          <span>Rol</span>
          <span>Estado</span>
          <span></span>
        </div>
        {visibles.length === 0 && (
          <div className="empty" style={{ padding:"32px 20px", textAlign:"center", color:"var(--muted)" }}>
            No hay usuarios registrados aún.
          </div>
        )}
        {visibles.map(u => (
          <div key={u.id} className="usr-row">
            <div>
              <div className="usr-name">{u.nombre}</div>
              <div className="usr-email">{u.reportaNombre !== "—" ? `↑ ${u.reportaNombre}` : ""}</div>
            </div>
            <div className="usr-email" style={{ fontSize:13 }}>{u.email}</div>
            <div><RolBadgeU rol={u.rol} /></div>
            <div>
              <span className={"usr-status-badge " + (u.auth_user_id ? "activo" : "pendiente")}>
                <span className="usr-status-badge dot" />
                {u.auth_user_id ? "Activo" : "Pendiente"}
              </span>
            </div>
            <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
              {puedeInvitar && u.id !== usuarioActual.id && (
                <>
                  <button className="btn btn-sm" title="Editar"
                    onClick={() => { setEditTarget(u); setDrawerOpen(true); }}>
                    Editar
                  </button>
                  {!u.auth_user_id && (
                    <button className="btn btn-sm" title="Reenviar invitación"
                      onClick={async () => {
                        try {
                          const { data: { session } } = await window.DB.client.auth.getSession();
                          await fetch(`${window.SUPABASE_URL}/functions/v1/invite-user`, {
                            method:"POST",
                            headers:{ "Content-Type":"application/json",
                              "Authorization":`Bearer ${session.access_token}`,
                              "apikey":window.SUPABASE_ANON },
                            body: JSON.stringify({ email:u.email, nombre:u.nombre, tel:u.tel,
                              rol:u.rol, reportaA:u.reportaA, agencyId, userId:u.id }),
                          });
                          alert("Invitación reenviada a " + u.email);
                        } catch(err) { alert("Error: " + err.message); }
                      }}>
                      Reenviar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {drawerOpen && (
        <InviteDrawer
          usuarios={usuarios}
          agencyId={agencyId}
          usuarioActual={usuarioActual}
          editTarget={editTarget}
          onSave={handleSave}
          onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

Object.assign(window, { RegistroUsuarios });
