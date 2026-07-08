/* Automind · Super Admin — Gestión global de agencias y agencias */

/* ── Drawer: nuevo agencia ────────────────────────────────────── */
function NuevaAgenciaDrawer({ onSave, onClose }) {
  const [form, setForm] = React.useState({
    nombre:"", ciudad:"", ownerEmail:"", plan:"pro",
    accent:"#2f6fed", sidebar:"#1b2a57",
  });
  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ACCENTS  = ["#2f6fed","#1f9d57","#7a4ef0","#d9531e","#0f7a8c","#c0392b"];
  const SIDEBARS = ["#1b2a57","#15233f","#1e2530","#23304d","#2a1d52","#1a1a2e"];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError("El nombre es requerido."); return; }
    setLoading(true); setError("");
    try {
      const ag = await window.DB.createAgency(form);
      onSave(ag);
    } catch(err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const IS = { width:"100%", boxSizing:"border-box", padding:"8px 10px",
    borderRadius:8, border:"1px solid var(--line)", background:"var(--card)",
    color:"var(--ink)", fontSize:13 };

  return (
    <>
      <div className="inv-drawer-scrim" onClick={onClose} />
      <aside className="inv-drawer">
        <div className="inv-drawer-head">
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:800 }}>Nueva agencia</h2>
            <div style={{ fontSize:13, color:"var(--muted)", marginTop:2 }}>
              Crea un nuevo agencia automotriz en la plataforma
            </div>
          </div>
          <button className="icon-btn ghost" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="inv-drawer-body">
          <form id="sa-form" onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:4 }}>
                Nombre *
              </label>
              <input style={IS} value={form.nombre}
                onChange={e => set("nombre", e.target.value)}
                placeholder="Ej: Agencia Automotriz Vallarta" disabled={loading} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:4 }}>
                Ciudad
              </label>
              <input style={IS} value={form.ciudad}
                onChange={e => set("ciudad", e.target.value)}
                placeholder="Ej: Puerto Vallarta" disabled={loading} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:4 }}>
                Email del owner
              </label>
              <input type="email" style={IS} value={form.ownerEmail}
                onChange={e => set("ownerEmail", e.target.value)}
                placeholder="owner@agencia.com" disabled={loading} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>
                Color de acento
              </label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ACCENTS.map(c => (
                  <button key={c} type="button"
                    style={{ width:30, height:30, borderRadius:7, background:c, cursor:"pointer",
                      border: form.accent === c ? "3px solid var(--ink)" : "2px solid transparent" }}
                    onClick={() => set("accent", c)} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", display:"block", marginBottom:6 }}>
                Color de barra lateral
              </label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {SIDEBARS.map(c => (
                  <button key={c} type="button"
                    style={{ width:30, height:30, borderRadius:7, background:c, cursor:"pointer",
                      border: form.sidebar === c ? "3px solid var(--ink)" : "2px solid transparent" }}
                    onClick={() => set("sidebar", c)} />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ background:"var(--bg)", borderRadius:10, padding:"12px 14px",
              display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:form.accent,
                display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:15 }}>
                {(form.nombre || "??").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"var(--ink)" }}>
                  {form.nombre || "Nombre del agencia"}
                </div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>{form.ciudad || "Ciudad"}</div>
              </div>
            </div>

            {error && (
              <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(239,68,68,.08)",
                border:"1px solid rgba(239,68,68,.25)", color:"#dc2626", fontSize:13 }}>
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="inv-drawer-foot">
          <button className="btn" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn primary" form="sa-form" type="submit" disabled={loading}>
            {loading && <span className="login-spinner" style={{ width:13, height:13, borderWidth:2 }} />}
            {loading ? "Creando…" : "Crear agencia"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Modal: workspaces de una agencia ───────────────────────── */
function AgenciaWorkspacesModal({ agencia, onEntrar, onClose }) {
  const [workspaces, setWorkspaces] = React.useState(agencia.workspaces || []);
  const [loading,    setLoading]    = React.useState(false);
  const [entrando,   setEntrando]   = React.useState(null);

  async function entrar(ws) {
    setEntrando(ws.id);
    try {
      const data = await window.DB.loadAgencyData(ws.id);
      onEntrar(ws, data);
    } catch(err) {
      alert("Error al entrar: " + err.message);
      setEntrando(null);
    }
  }

  return (
    <>
      <div style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:1200,
        display:"flex", alignItems:"center", justifyContent:"center",
      }} onClick={onClose}>
        <div style={{
          background:"var(--card)", borderRadius:16, padding:"28px 28px 24px",
          width:440, maxWidth:"92vw", boxShadow:"0 20px 60px rgba(0,0,0,.25)",
          zIndex:1201,
        }} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:agencia.accent,
              display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:15, flexShrink:0 }}>
              {agencia.iniciales}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:"var(--ink)" }}>{agencia.nombre}</div>
              {agencia.ciudad && <div style={{ fontSize:12, color:"var(--muted)" }}>{agencia.ciudad}</div>}
            </div>
            <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none",
              cursor:"pointer", color:"var(--muted)", fontSize:20, lineHeight:1 }}>✕</button>
          </div>

          {/* Lista de workspaces */}
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)",
            textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
            Agencias ({workspaces.length})
          </div>

          {workspaces.length === 0 ? (
            <div style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)", fontSize:14 }}>
              Sin agencias configuradas
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:320, overflowY:"auto" }}>
              {workspaces.map(ws => (
                <button key={ws.id}
                  onClick={() => entrar(ws)}
                  disabled={!!entrando}
                  style={{
                    display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                    borderRadius:10, border:"1px solid var(--line)", background:"var(--bg)",
                    cursor:"pointer", textAlign:"left", transition:"all .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = agencia.accent; e.currentTarget.style.background = agencia.accent + "0d"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg)"; }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:agencia.accent,
                    display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:12, flexShrink:0 }}>
                    {(ws.iniciales || ws.nombre.slice(0,2)).toUpperCase()}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"var(--ink)" }}>{ws.nombre}</div>
                    {ws.ciudad && <div style={{ fontSize:11, color:"var(--muted)" }}>{ws.ciudad}</div>}
                  </div>
                  {entrando === ws.id
                    ? <span className="login-spinner" style={{ width:16, height:16, borderWidth:2 }} />
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
                        style={{ color:"var(--muted)", flexShrink:0 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                  }
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Vista principal del Super Admin ────────────────────────── */
function SuperAdminView({ userCtx, onEntrarWorkspace, onLogout }) {
  const [agencias,   setAgencias]   = React.useState([]);
  const [cargando,   setCargando]   = React.useState(true);
  const [showNueva,  setShowNueva]  = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [borrando,   setBorrando]   = React.useState(null);
  const [entrando,   setEntrando]   = React.useState(null);
  const [busqueda,   setBusqueda]   = React.useState("");
  const [confirmText, setConfirmText] = React.useState("");

  React.useEffect(() => {
    // Cargar todos los workspaces (tenants) de todas las agencias en plano
    window.DB.loadAllWorkspaces()
      .then(setAgencias)
      .catch(e => alert("Error cargando agencias: " + e.message))
      .finally(() => setCargando(false));
  }, []);

  async function eliminarAgencia(ag) {
    setBorrando(ag.id);
    try {
      // Eliminar el workspace; si era el único de su agencia padre, la elimina también
      await window.DB.deleteWorkspace(ag.id, ag.agencyId);
      setAgencias(prev => prev.filter(a => a.id !== ag.id));
    } catch(err) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setBorrando(null);
      setConfirmDel(null);
      setConfirmText("");
    }
  }

  async function entrar(ag) {
    setEntrando(ag.id);
    try {
      const data = await window.DB.loadAgencyData(ag.id);
      onEntrarWorkspace(ag, data, { id: ag.agencyId });
    } catch(err) {
      alert("Error al entrar: " + err.message);
      setEntrando(null);
    }
  }

  const filtradas = agencias.filter(a => {
    const q = busqueda.toLowerCase();
    return !q || a.nombre.toLowerCase().includes(q) || (a.ciudad || "").toLowerCase().includes(q);
  });

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg)",
      fontFamily:"Segoe UI Variable, Segoe UI, system-ui, sans-serif",
    }}>

      {/* Barra superior */}
      <div style={{
        height:56, background:"var(--card)", borderBottom:"1px solid var(--line)",
        display:"flex", alignItems:"center", padding:"0 28px", gap:16,
        position:"sticky", top:0, zIndex:100,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#2f6fed",
            display:"grid", placeItems:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.5L21 13v2.5h-7"/>
              <circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:16, color:"var(--ink)" }}>Automind</span>
        </div>

        {/* Badge Super Admin */}
        <span style={{
          padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
          background:"rgba(239,68,68,.12)", color:"#dc2626", border:"1px solid rgba(239,68,68,.25)",
        }}>
          ⚡ Super Admin
        </span>

        <div style={{ flex:1 }} />

        {/* Email */}
        <span style={{ fontSize:13, color:"var(--muted)" }}>{userCtx.email}</span>

        {/* Cerrar sesión */}
        <button onClick={onLogout} style={{
          padding:"6px 14px", borderRadius:8, border:"1px solid var(--line)",
          background:"var(--bg)", color:"var(--muted)", fontSize:13, fontWeight:600,
          cursor:"pointer", transition:"all .15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
          Cerrar sesión
        </button>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 28px" }}>

        {/* Encabezado */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:"var(--ink)" }}>
              Gestión de agencias
            </h1>
            <p style={{ margin:0, fontSize:14, color:"var(--muted)" }}>
              {agencias.length} agencia{agencias.length !== 1 ? "s" : ""} registrada{agencias.length !== 1 ? "s" : ""} en la plataforma
            </p>
          </div>
          <button onClick={() => setShowNueva(true)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"9px 18px",
            borderRadius:10, background:"#2f6fed", color:"#fff", border:"none",
            fontWeight:700, fontSize:14, cursor:"pointer",
            boxShadow:"0 2px 8px rgba(47,111,237,.3)", transition:"opacity .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
            <span style={{ fontSize:18, lineHeight:1 }}>+</span>
            Nueva agencia
          </button>
        </div>

        {/* Buscador */}
        <div style={{ position:"relative", marginBottom:24, maxWidth:360 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
            strokeLinecap="round" strokeLinejoin="round" width="15" height="15"
            style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }}>
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
          </svg>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar agencia..."
            style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px 9px 34px",
              borderRadius:10, border:"1px solid var(--line)", background:"var(--card)",
              color:"var(--ink)", fontSize:13 }}
          />
        </div>

        {/* Estado cargando */}
        {cargando && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <span className="login-spinner" style={{ width:28, height:28, borderWidth:3 }} />
          </div>
        )}

        {/* Grid de agencias */}
        {!cargando && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {filtradas.length === 0 ? (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 0",
                color:"var(--muted)", fontSize:15 }}>
                {busqueda ? `Sin resultados para "${busqueda}"` : "No hay agencias registradas."}
              </div>
            ) : filtradas.map(ag => (
              <div key={ag.id} style={{
                background:"var(--card)", borderRadius:14, border:"1px solid var(--line)",
                overflow:"hidden", display:"flex", flexDirection:"column",
                transition:"box-shadow .15s, transform .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>

                {/* Franja de color */}
                <div style={{ height:5, background:ag.accent }} />

                {/* Cuerpo */}
                <div style={{ padding:"18px 20px", flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:ag.accent,
                      display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:16, flexShrink:0 }}>
                      {ag.iniciales}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:15, color:"var(--ink)",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {ag.nombre}
                      </div>
                      {ag.ciudad && (
                        <div style={{ fontSize:12, color:"var(--muted)" }}>{ag.ciudad}</div>
                      )}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div style={{ display:"flex", gap:16, marginBottom:12 }}>
                    {ag.ownerEmail && (
                      <div style={{ fontSize:12, color:"var(--muted)", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>
                        <span style={{ display:"block", fontWeight:600, color:"var(--ink-2)",
                          overflow:"hidden", textOverflow:"ellipsis" }}>
                          {ag.ownerEmail}
                        </span>
                        owner
                      </div>
                    )}
                  </div>

                  {/* Plan badge */}
                  <span style={{
                    display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:11,
                    fontWeight:700, background:"rgba(47,111,237,.10)", color:"#2f6fed",
                  }}>
                    {(ag.plan || "pro").toUpperCase()}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ borderTop:"1px solid var(--line)", padding:"12px 20px",
                  display:"flex", gap:8 }}>
                  <button
                    onClick={() => entrar(ag)}
                    disabled={!!entrando}
                    style={{
                      flex:1, padding:"8px 0", borderRadius:8, border:"1px solid var(--line)",
                      background:"var(--bg)", color:"var(--ink)", fontSize:13, fontWeight:600,
                      cursor:"pointer", transition:"all .15s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = ag.accent; e.currentTarget.style.color = ag.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink)"; }}>
                    {entrando === ag.id
                      ? <span className="login-spinner" style={{ width:13, height:13, borderWidth:2 }} />
                      : "Entrar"}
                  </button>
                  <button
                    onClick={() => setConfirmDel(ag)}
                    disabled={borrando === ag.id}
                    style={{
                      padding:"8px 14px", borderRadius:8, border:"1px solid var(--line)",
                      background:"var(--bg)", color:"var(--muted)", fontSize:13,
                      cursor:"pointer", transition:"all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
                    {borrando === ag.id
                      ? <span className="login-spinner" style={{ width:13, height:13, borderWidth:2 }} />
                      : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer: nueva agencia */}
      {showNueva && (
        <NuevaAgenciaDrawer
          onSave={ag => {
            setAgencias(prev => [...prev, { ...ag, iniciales: ag.iniciales || ag.nombre.slice(0,2).toUpperCase(), accent: ag.accent || "#2f6fed" }]);
            setShowNueva(false);
          }}
          onClose={() => setShowNueva(false)}
        />
      )}

      {/* Confirmación de borrado */}
      {confirmDel && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1400,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{
            background:"var(--card)", borderRadius:16, padding:"28px 32px",
            width:400, maxWidth:"90vw", boxShadow:"0 20px 60px rgba(0,0,0,.3)",
          }}>
            <div style={{ fontSize:28, textAlign:"center", marginBottom:12 }}>⚠️</div>
            <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800,
              textAlign:"center", color:"var(--ink)" }}>
              ¿Eliminar agencia?
            </h3>
            <p style={{ margin:"0 0 16px", fontSize:14, color:"var(--muted)",
              textAlign:"center", lineHeight:1.5 }}>
              Se eliminará <strong style={{ color:"var(--ink)" }}>{confirmDel.nombre}</strong>{" "}
              junto con todo su inventario, usuarios y configuración.
              Esta acción <strong style={{ color:"#dc2626" }}>no se puede deshacer</strong>.
            </p>

            {/* Campo de confirmación */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700,
                color:"var(--muted)", marginBottom:6, textAlign:"center" }}>
                Escribe <span style={{ color:"#dc2626", fontFamily:"monospace", fontWeight:800 }}>BORRAR</span> para confirmar
              </label>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="BORRAR"
                autoFocus
                style={{
                  width:"100%", boxSizing:"border-box", padding:"9px 12px",
                  borderRadius:9, fontSize:14, fontWeight:700, textAlign:"center",
                  border: confirmText === "BORRAR"
                    ? "2px solid #dc2626"
                    : "1px solid var(--line)",
                  background:"var(--bg)", color:"var(--ink)", letterSpacing:".05em",
                  outline:"none",
                }}
              />
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setConfirmDel(null); setConfirmText(""); }} style={{
                flex:1, padding:"10px 0", borderRadius:9, border:"1px solid var(--line)",
                background:"var(--bg)", color:"var(--ink)", fontWeight:600,
                fontSize:14, cursor:"pointer",
              }}>
                Cancelar
              </button>
              <button
                onClick={() => eliminarAgencia(confirmDel)}
                disabled={!!borrando || confirmText !== "BORRAR"}
                style={{
                  flex:1, padding:"10px 0", borderRadius:9, border:"none",
                  background: confirmText === "BORRAR" ? "#dc2626" : "var(--line)",
                  color: confirmText === "BORRAR" ? "#fff" : "var(--muted)",
                  fontWeight:700, fontSize:14,
                  cursor: confirmText === "BORRAR" ? "pointer" : "not-allowed",
                  transition:"all .2s",
                }}>
                {borrando ? "Eliminando…" : "Eliminar agencia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SuperAdminView });
