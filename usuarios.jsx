/* Automind · Registro de usuarios
   Permite a directores y gerentes invitar nuevos usuarios a la plataforma.
   Las invitaciones se envían via Edge Function (invite-user). */

/* ROL_CFG y RolBadge viven en components.jsx (window.ROL_CFG, window.RolBadge) */

/* ── Drawer para invitar / editar usuario ─────────────────────────────────── */
function InviteDrawer({ usuarios, agencyId, usuarioActual, editTarget, onSave, onClose }) {
  const esEdicion = !!editTarget;
  const [form, setForm] = React.useState(editTarget || {
    nombre:"", email:"", tel:"", rol:"vendedor", reportaA:"", fechaIngreso:""
  });
  const [loading,    setLoading]    = React.useState(false);
  const [error,      setError]      = React.useState("");
  const [success,    setSuccess]    = React.useState(false);
  const [actionLink, setActionLink] = React.useState(null);
  const [copied,     setCopied]     = React.useState(false);

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
            email:          form.email,
            nombre:         form.nombre,
            tel:            form.tel,
            rol:            form.rol,
            reportaA:       form.reportaA || null,
            fechaIngreso:   form.fechaIngreso || null,
            workspaceId:    agencyId,
            agencyId:       window.AUTOMIND?.agencyParentId || agencyId,
            userId:         editTarget?.id || null,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al enviar invitación");
      setSuccess(true);
      onSave && onSave(json.user);
      // Siempre mostrar link copiable como respaldo al correo
      if (json.action_link) {
        setActionLink(json.action_link);
      } else {
        setTimeout(() => { setSuccess(false); onClose(); }, 1800);
      }
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
              Se intentará enviar un correo de invitación. También recibirás un enlace para compartir directamente.
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
            {success && !actionLink && (
              <div className="fb-ok" style={{ marginBottom:12 }}>
                ✓ {esEdicion ? "Cambios guardados" : "Invitación enviada correctamente"}
              </div>
            )}
            {success && actionLink && (
              <div className="inv-link-box">
                <div className="inv-link-success">✓ {esEdicion ? "Cambios guardados" : "Invitación enviada"}</div>
                <p className="inv-link-msg">
                  Se intentó enviar el correo. Comparte también este enlace con
                  <strong> {form.nombre.split(" ")[0]}</strong> por si no llega:
                </p>
                <div className="inv-link-row">
                  <input readOnly className="inv-link-input" value={actionLink} onClick={e => e.target.select()} />
                  <button type="button" className="btn primary inv-link-copy"
                    onClick={() => { navigator.clipboard.writeText(actionLink); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
                    {copied ? "✓ Copiado" : "Copiar enlace"}
                  </button>
                </div>
                <p className="inv-link-note">Expira en 24 horas · Un solo uso · Comparte por WhatsApp si prefieres</p>
              </div>
            )}
          </form>
        </div>

        <div className="inv-drawer-foot">
          <button className="btn" onClick={onClose} disabled={loading}>
            {actionLink ? "Cerrar" : "Cancelar"}
          </button>
          {!actionLink && (
            <button className="btn primary" form="invite-form" type="submit" disabled={loading}>
              {loading ? <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} /> : null}
              {loading ? "Enviando…" : esEdicion ? "Guardar cambios" : "Enviar invitación"}
            </button>
          )}
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
  const [confirmDel,   setConfirmDel]   = React.useState(null); // usuario a eliminar
  const [deleting,     setDeleting]     = React.useState(false);
  const [delError,     setDelError]     = React.useState("");
  // resendStates: { [userId]: null | 'loading' | { link: string } | 'err:<msg>' }
  const [resendStates, setResendStates] = React.useState({});
  const [resendCopied, setResendCopied] = React.useState({});

  // Permisos: director ve a todos, gerente solo a su equipo
  const visibles = usuarioActual.rol === "director" || usuarioActual.isAgencyOwner
    ? usuarios
    : usuarios.filter(u =>
        u.id === usuarioActual.id ||
        u.reportaA === usuarioActual.id ||
        u.id === usuarioActual.reportaA
      );

  const puedeInvitar  = ["director", "gerente"].includes(usuarioActual.rol) || usuarioActual.isAgencyOwner;
  const puedeEliminar = ["director", "gerente"].includes(usuarioActual.rol) || usuarioActual.isAgencyOwner;

  async function handleReenviar(u) {
    setResendStates(s => ({ ...s, [u.id]: 'loading' }));
    try {
      const { data: { session } } = await window.DB.client.auth.getSession();
      const res = await fetch(`${window.SUPABASE_URL}/functions/v1/invite-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": window.SUPABASE_ANON,
        },
        body: JSON.stringify({
          email:       u.email,
          nombre:      u.nombre,
          tel:         u.tel || "",
          rol:         u.rol,
          reportaA:    u.reportaA || null,
          workspaceId: agencyId,
          agencyId:    window.AUTOMIND?.agencyParentId || agencyId,
          userId:      u.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al reenviar");
      setResendStates(s => ({ ...s, [u.id]: { link: json.action_link || '' } }));
      // El link permanece visible 10 min para que el admin lo copie
      setTimeout(() => setResendStates(s => ({ ...s, [u.id]: null })), 600000);
    } catch(err) {
      setResendStates(s => ({ ...s, [u.id]: 'err:' + err.message }));
      setTimeout(() => setResendStates(s => ({ ...s, [u.id]: null })), 5000);
    }
  }

  async function handleDelete(u) {
    setDeleting(true);
    setDelError("");
    try {
      // Desasignar vehículos antes de borrar para no violar la FK
      const { error: fkErr } = await window.DB.client
        .from("inventario").update({ vendedor_id: null }).eq("vendedor_id", u.id);
      if (fkErr) throw new Error("No se pudieron desasignar los vehículos: " + fkErr.message);

      const { data: deleted, error } = await window.DB.client
        .from("users").delete().eq("id", u.id).select("id");
      if (error) throw new Error(error.message);
      if (!deleted || deleted.length === 0) {
        throw new Error("No se pudo eliminar el usuario. Solo directores pueden eliminar colaboradores de su workspace.");
      }
      const next = usuarios.filter(x => x.id !== u.id);
      setUsuarios(next);
      if (window.AUTOMIND) window.AUTOMIND.USUARIOS = next;
      setConfirmDel(null);
    } catch(err) {
      setDelError(err.message);
    } finally {
      setDeleting(false);
    }
  }

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
        {visibles.map(u => {
          const rs = resendStates[u.id] || null;
          const rsOk      = rs && typeof rs === 'object';
          const rsErr     = typeof rs === 'string' && rs.startsWith('err:');
          const rsLoading = rs === 'loading';
          const rsLink    = rsOk ? rs.link : null;
          return (
            <div key={u.id} className="usr-row">
              <div>
                <div className="usr-name">{u.nombre}</div>
                <div className="usr-email">{u.reportaNombre !== "—" ? `↑ ${u.reportaNombre}` : ""}</div>
              </div>
              <div className="usr-email" style={{ fontSize:13 }}>{u.email}</div>
              <div><RolBadge rol={u.rol} /></div>
              <div>
                <span className={"usr-status-badge " + (u.auth_user_id ? "activo" : "pendiente")}>
                  <span className="usr-status-badge dot" />
                  {u.auth_user_id ? "Activo" : "Pendiente"}
                </span>
              </div>
              <div style={{ display:"flex", gap:6, justifyContent:"flex-end", alignItems:"center", flexWrap:"wrap" }}>
                {u.id !== usuarioActual.id && (
                  <>
                    {puedeInvitar && (
                      <button className="btn btn-sm" title="Editar"
                        onClick={() => { setEditTarget(u); setDrawerOpen(true); }}>
                        Editar
                      </button>
                    )}

                    {/* Reenviar invitación — solo para usuarios aún pendientes */}
                    {puedeInvitar && !u.auth_user_id && (
                      <span style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                        <button
                          className="btn btn-sm"
                          title="Reenviar invitación"
                          disabled={rsLoading}
                          style={rsOk  ? { color:"#1f9d57", borderColor:"#bbf7d0", background:"#f0fdf4" }
                               : rsErr ? { color:"#e0492f", borderColor:"#fdd",    background:"#fff8f7" }
                               : {}}
                          onClick={() => handleReenviar(u)}>
                          {rsLoading
                            ? <><span className="login-spinner" style={{ width:11, height:11, borderWidth:2, display:"inline-block", verticalAlign:"middle", marginRight:4 }} />Enviando…</>
                            : rsOk
                            ? "↻ Reenviar"
                            : "Reenviar"}
                        </button>
                        {rsOk && rsLink && (
                          <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end", padding:"6px 8px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, maxWidth:220 }}>
                            <span style={{ fontSize:11, color:"#1f9d57", fontWeight:600 }}>✓ Enviado · Copia el link:</span>
                            <div style={{ display:"flex", gap:4, width:"100%" }}>
                              <input readOnly style={{ fontSize:10, flex:1, border:"1px solid #e2e8f0", borderRadius:4, padding:"2px 5px", minWidth:0 }}
                                value={rsLink} onClick={e => e.target.select()} />
                              <button className="btn btn-sm" style={{ fontSize:10, padding:"2px 8px", whiteSpace:"nowrap" }}
                                onClick={() => {
                                  navigator.clipboard.writeText(rsLink);
                                  setResendCopied(c => ({ ...c, [u.id]: true }));
                                  setTimeout(() => setResendCopied(c => ({ ...c, [u.id]: false })), 2500);
                                }}>
                                {resendCopied[u.id] ? "✓" : "Copiar"}
                              </button>
                            </div>
                          </div>
                        )}
                        {rsErr && (
                          <span style={{ fontSize:11, color:"#e0492f", maxWidth:160, textAlign:"right", lineHeight:1.3 }}>
                            {rs.slice(4).slice(0, 80)}
                          </span>
                        )}
                      </span>
                    )}

                    {puedeEliminar && (
                      <button className="btn btn-sm" title="Eliminar usuario"
                        style={{ color:"#e0492f", borderColor:"#fdd", background:"#fff8f7" }}
                        onClick={() => setConfirmDel(u)}>
                        Eliminar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal confirmación eliminar */}
      {confirmDel && (
        <>
          <div className="scrim" onClick={() => !deleting && setConfirmDel(null)} />
          <div className="del-modal">
            <div className="del-modal-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="#e0492f" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>¿Eliminar a {confirmDel.nombre}?</h3>
            <p>Se eliminará <b>{confirmDel.email}</b> del equipo. Esta acción no se puede deshacer.</p>
            {delError && (
              <div className="login-error" style={{ margin:"0 0 8px", textAlign:"left" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                  strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink:0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {delError}
              </div>
            )}
            <div className="del-modal-btns">
              <button className="btn danger" disabled={deleting} onClick={() => handleDelete(confirmDel)}>
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button className="btn" disabled={deleting}
                onClick={() => { setConfirmDel(null); setDelError(""); }}>Cancelar</button>
            </div>
          </div>
        </>
      )}

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
