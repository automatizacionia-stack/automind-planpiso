/* Automind · Módulo de Colaboradores
   Organigrama interactivo, lista de usuarios y formulario de alta/edición. */

const ROL_CFG = {
  director: { label:"Director",  bg:"#e7eefc", txt:"#1c4fcc", dot:"#2f6fed" },
  gerente:  { label:"Gerente",   bg:"#e7f5ed", txt:"#0f7a40", dot:"#1f9d57" },
  vendedor: { label:"Vendedor",  bg:"#fbf2da", txt:"#9a6a06", dot:"#d99613" },
};

function RolBadge({ rol }) {
  const c = ROL_CFG[rol] || ROL_CFG.vendedor;
  return (
    <span className="rol-badge" style={{ background:c.bg, color:c.txt }}>
      <span className="rol-dot" style={{ background:c.dot }} />{c.label}
    </span>
  );
}

/* ── Nodo del organigrama ─────────────────────────────────────────────────── */
function OrgNodo({ u, usuarios, rows, activeGerente, onPickGerente, nivel }) {
  const subordinados = usuarios.filter(s => s.reportaA === u.id);
  const unidadesCount = rows.filter(r => r.vendedorId === u.id).length;
  const isActive = activeGerente === u.id;
  const dimmed   = activeGerente && u.rol === "gerente" && !isActive;

  return (
    <div className={"org-col nivel-" + nivel}>
      <div
        className={"org-nodo" + (isActive ? " active" : "") + (dimmed ? " dimmed" : "")}
        style={{ "--nd": ROL_CFG[u.rol]?.dot || "#aaa" }}
        onClick={u.rol === "gerente" ? () => onPickGerente(isActive ? null : u.id) : undefined}
        title={u.rol === "gerente" ? (isActive ? "Quitar filtro" : "Filtrar equipo") : undefined}
      >
        <div className="org-av" style={{ background: ROL_CFG[u.rol]?.dot || "#aaa" }}>
          {u.nombre.split(" ").slice(0, 2).map(w => w[0]).join("")}
        </div>
        <div className="org-info">
          <div className="org-nombre">{u.nombre}</div>
          <RolBadge rol={u.rol} />
          {unidadesCount > 0 && (
            <div className="org-unidades">{unidadesCount} unidades</div>
          )}
        </div>
        {u.rol === "gerente" && (
          <span className="org-filter-ico">
            {isActive ? I.close({ width:13, height:13 }) : I.filter({ width:13, height:13 })}
          </span>
        )}
      </div>
      {subordinados.length > 0 && (
        <div className="org-children">
          {subordinados.map(s => (
            <OrgNodo key={s.id} u={s} usuarios={usuarios} rows={rows}
              activeGerente={activeGerente} onPickGerente={onPickGerente} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Vista Organigrama ───────────────────────────────────────────────────── */
function Organigrama({ usuarios, rows, activeGerente, onPickGerente }) {
  const director = usuarios.find(u => u.rol === "director");
  if (!director) {
    return <div className="empty" style={{ padding:"40px 0", textAlign:"center" }}>Sin director registrado.</div>;
  }

  return (
    <div className="org-wrap">
      {activeGerente && (
        <div className="org-hint">
          {I.filter({ width: 14, height: 14 })} Mostrando equipo de <b>{usuarios.find(u => u.id === activeGerente)?.nombre}</b>
          <button className="org-hint-clear" onClick={() => onPickGerente(null)}>
            {I.close({ width: 12, height: 12 })} Quitar filtro
          </button>
        </div>
      )}
      <div className="org-tree">
        <OrgNodo u={director} usuarios={usuarios} rows={rows}
          activeGerente={activeGerente} onPickGerente={onPickGerente} nivel={0} />
      </div>
    </div>
  );
}

/* ── Drawer de alta / edición ────────────────────────────────────────────── */
function ColabDrawer({ u, usuarios, onSave, onClose }) {
  const [form, setForm] = React.useState(u
    ? { ...u }
    : { id:"", nombre:"", email:"", tel:"", rol:"vendedor", reportaA:"", fechaIngreso:new Date().toISOString().slice(0,10) }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isNew = !u;

  const directores = usuarios.filter(x => x.rol === "director");
  const gerentes   = usuarios.filter(x => x.rol === "gerente");
  const superiores = form.rol === "vendedor" ? gerentes : directores;

  // Auto-derivar gerente y director para mostrar en el form
  const superiorObj  = usuarios.find(x => x.id === form.reportaA) || null;
  const gerenteObj   = form.rol === "vendedor"  ? superiorObj
                     : form.rol === "gerente"   ? (form.id ? usuarios.find(x => x.id === form.id) : null)
                     : null;
  const directorObj  = form.rol === "director"  ? null
                     : form.rol === "gerente"   ? superiorObj
                     : form.rol === "vendedor"  ? (gerenteObj ? (usuarios.find(x => x.id === gerenteObj.reportaA) || null) : null)
                     : null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;
    const saved = { ...form };
    if (isNew) saved.id = form.rol[0].toUpperCase() + Date.now().toString().slice(-4);
    onSave(saved);
    onClose();
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" style={{ "--sol": ROL_CFG[form.rol]?.dot || "#2f6fed" }}>
        <div className="dr-head">
          <div>
            <div className="dr-eyebrow">{isNew ? "Nuevo colaborador" : "Editar colaborador · " + u.id}</div>
            <h2>{isNew ? "Agregar usuario" : form.nombre}</h2>
          </div>
          <button className="icon-btn ghost" onClick={onClose}>{I.close({ width:20, height:20 })}</button>
        </div>

        <form className="colab-form" onSubmit={handleSubmit}>
          <div className="cf-group">
            <label className="cf-label">Nombre completo *</label>
            <input className="cf-input" value={form.nombre} onChange={e => set("nombre", e.target.value)}
              placeholder="Ej. Carlos Mendoza" required />
          </div>

          <div className="cf-row">
            <div className="cf-group">
              <label className="cf-label">Correo electrónico *</label>
              <input className="cf-input" type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="usuario@agencia.mx" required />
            </div>
            <div className="cf-group">
              <label className="cf-label">Teléfono</label>
              <input className="cf-input" value={form.tel} onChange={e => set("tel", e.target.value)}
                placeholder="55 1234 5678" />
            </div>
          </div>

          <div className="cf-row">
            <div className="cf-group">
              <label className="cf-label">Rol *</label>
              <select className="cf-input" value={form.rol} onChange={e => { set("rol", e.target.value); set("reportaA", ""); }}>
                <option value="director">Director</option>
                <option value="gerente">Gerente</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>
            <div className="cf-group">
              <label className="cf-label">Reporta a</label>
              <select className="cf-input" value={form.reportaA || ""} onChange={e => set("reportaA", e.target.value || null)}
                disabled={form.rol === "director"}>
                <option value="">— ninguno —</option>
                {superiores.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Relaciones auto-derivadas */}
          {(gerenteObj || directorObj) && (
            <div className="cf-derived">
              {gerenteObj && (
                <div className="cf-derived-row">
                  <span className="cf-derived-lbl">Gerente asignado</span>
                  <div className="cf-derived-val">
                    <span className="cf-derived-name">{gerenteObj.nombre}</span>
                    <span className="cf-derived-email">{gerenteObj.email}</span>
                  </div>
                </div>
              )}
              {directorObj && (
                <div className="cf-derived-row">
                  <span className="cf-derived-lbl">Director</span>
                  <div className="cf-derived-val">
                    <span className="cf-derived-name">{directorObj.nombre}</span>
                    <span className="cf-derived-email">{directorObj.email}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="cf-group">
            <label className="cf-label">Fecha de ingreso</label>
            <input className="cf-input" type="date" value={form.fechaIngreso}
              onChange={e => set("fechaIngreso", e.target.value)} />
          </div>

          <div className="dr-actions">
            <button type="submit" className="btn primary">{isNew ? "Agregar colaborador" : "Guardar cambios"}</button>
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </aside>
    </>
  );
}

/* ── Vista Colaboradores principal ───────────────────────────────────────── */
function Colaboradores({ usuarios: usuariosInit, rows, usuarioActual, autoOpenForm, onAutoOpenConsumed }) {
  const [tab, setTab]     = React.useState("organigrama");
  const [usuarios, setUsuarios] = React.useState(usuariosInit || []);
  const [activeGerente, setActiveGerente] = React.useState(null);
  const [editando, setEditando] = React.useState(null);  // null = cerrado, false = nuevo, object = editar
  const [q, setQ]         = React.useState("");
  const [filtroRol, setFiltroRol] = React.useState("");

  // Sync si cambia el tenant
  React.useEffect(() => { setUsuarios(usuariosInit || []); }, [usuariosInit]);

  // Auto-abrir formulario cuando se navega desde la base de datos
  React.useEffect(() => {
    if (autoOpenForm) {
      setEditando(false);
      setTab("lista");
      onAutoOpenConsumed && onAutoOpenConsumed();
    }
  }, [autoOpenForm]);

  const director  = usuarios.filter(u => u.rol === "director");
  const gerentes  = usuarios.filter(u => u.rol === "gerente");
  const vendedores = usuarios.filter(u => u.rol === "vendedor");

  // Filtrar lista según pestaña organigrama activa y búsqueda
  const listaFiltrada = usuarios.filter(u => {
    if (activeGerente && tab === "lista") {
      const esSubordinado = u.reportaA === activeGerente || u.id === activeGerente;
      if (!esSubordinado) return false;
    }
    if (filtroRol && u.rol !== filtroRol) return false;
    if (q) {
      const txt = [u.nombre, u.email, u.rol, u.tel].join(" ").toLowerCase();
      if (!txt.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  function enriquecer(saved, lista) {
    const superior  = lista.find(x => x.id === saved.reportaA) || null;
    const gerente   = saved.rol === "vendedor"  ? superior
                    : saved.rol === "gerente"   ? saved
                    : null;
    const director  = saved.rol === "director"  ? saved
                    : saved.rol === "gerente"   ? superior
                    : saved.rol === "vendedor"  ? (gerente ? (lista.find(x => x.id === gerente.reportaA) || null) : null)
                    : null;
    return {
      ...saved,
      reportaNombre:  superior ? superior.nombre : "—",
      reportaEmail:   superior ? superior.email  : "—",
      gerenteName:    gerente  ? gerente.nombre  : "—",
      gerenteEmail:   gerente  ? gerente.email   : "—",
      directorName:   director ? director.nombre : "—",
      directorEmail:  director ? director.email  : "—",
    };
  }

  function handleSave(saved) {
    setUsuarios(prev => {
      const idx = prev.findIndex(u => u.id === saved.id);
      const enriquecido = enriquecer(saved, prev);
      let next;
      if (idx >= 0) {
        next = [...prev]; next[idx] = enriquecido;
      } else {
        next = [...prev, enriquecido];
      }
      // Sync a AUTOMIND
      if (window.AUTOMIND) {
        window.AUTOMIND.USUARIOS = next;
        const tablaColab = window.AUTOMIND.TABLAS.find(t => t.id === "colaboradores");
        if (tablaColab) tablaColab.rows = next;
      }
      return next;
    });
    // Persistir en Supabase
    if (window.DB && window.AUTOMIND && window.AUTOMIND.agencyId) {
      window.DB.saveColaborador(window.AUTOMIND.agencyId, saved).catch(err => {
        console.error("Error guardando colaborador:", err);
      });
    }
  }

  const unidadesPorVendedor = {};
  rows.forEach(r => {
    if (r.vendedorId) unidadesPorVendedor[r.vendedorId] = (unidadesPorVendedor[r.vendedorId] || 0) + 1;
  });
  const totalAsignadas = rows.filter(r => r.vendedorId).length;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Colaboradores</h1>
        <p className="page-sub">Estructura del equipo de ventas. Haz clic en un gerente del organigrama para filtrar su equipo en la lista.</p>
      </div>

      {/* Stats */}
      <div className="mini-grid colab-stats">
        <div className="mini-kpi">
          <span className="mk-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></span>
          <div className="mk-body"><span className="mk-label">Director</span><span className="mk-value">{director.length}</span></div>
        </div>
        <div className="mini-kpi">
          <span className="mk-ico" style={{ color:"#1f9d57" }}>{I.users({ width:20, height:20 })}</span>
          <div className="mk-body"><span className="mk-label">Gerentes</span><span className="mk-value">{gerentes.length}</span></div>
        </div>
        <div className="mini-kpi">
          <span className="mk-ico" style={{ color:"#d99613" }}>{I.users({ width:20, height:20 })}</span>
          <div className="mk-body"><span className="mk-label">Vendedores</span><span className="mk-value">{vendedores.length}</span></div>
        </div>
        <div className="mini-kpi">
          <span className="mk-ico" style={{ color:"#2f6fed" }}>{I.truck({ width:20, height:20 })}</span>
          <div className="mk-body"><span className="mk-label">Unidades asignadas</span><span className="mk-value">{totalAsignadas} / {rows.length}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar colab-tabs">
        <button className={"tab" + (tab === "organigrama" ? " on" : "")} onClick={() => setTab("organigrama")}>
          Organigrama
        </button>
        <button className={"tab" + (tab === "lista" ? " on" : "")} onClick={() => setTab("lista")}>
          Lista de usuarios
          {activeGerente && <span className="tab-badge">{listaFiltrada.length}</span>}
        </button>
        <div className="tab-spacer" />
        <button className="btn primary btn-sm" onClick={() => setEditando(false)}>
          + Agregar usuario
        </button>
      </div>

      {/* Organigrama */}
      {tab === "organigrama" && (
        <div className="card">
          <Organigrama usuarios={usuarios} rows={rows}
            activeGerente={activeGerente} onPickGerente={setActiveGerente} />
        </div>
      )}

      {/* Lista */}
      {tab === "lista" && (
        <div className="card">
          <div className="db-toolbar">
            <label className="search">
              {I.search({ width:16, height:16 })}
              <input placeholder="Buscar colaborador…" value={q} onChange={e => setQ(e.target.value)} />
            </label>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              <option value="">Todos los roles</option>
              <option value="director">Director</option>
              <option value="gerente">Gerente</option>
              <option value="vendedor">Vendedor</option>
            </select>
            {activeGerente && (
              <button className="chip-clear" onClick={() => setActiveGerente(null)}>
                {I.filter({ width:13, height:13 })} Equipo de {usuarios.find(u => u.id === activeGerente)?.nombre?.split(" ")[0]}
                <span className="cc-x">{I.close({ width:12, height:12 })}</span>
              </button>
            )}
            <span className="db-count">{listaFiltrada.length} colaboradores</span>
          </div>

          <div className="colab-list">
            <div className="cl-head">
              <span>Colaborador</span>
              <span>Rol</span>
              <span>Reporta a</span>
              <span className="r">Unidades</span>
              <span>Teléfono</span>
              <span>Ingreso</span>
              <span></span>
            </div>
            {listaFiltrada.map(u => {
              const superior = usuarios.find(s => s.id === u.reportaA);
              const uCount   = unidadesPorVendedor[u.id] || 0;
              const esYo     = usuarioActual && u.id === usuarioActual.id;
              return (
                <div key={u.id} className={"cl-row" + (esYo ? " yo" : "")}>
                  <div className="cl-nombre">
                    <div className="cl-av" style={{ background: ROL_CFG[u.rol]?.dot || "#aaa" }}>
                      {u.nombre.split(" ").slice(0, 2).map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div className="cl-name-txt">{u.nombre}{esYo && <span className="yo-tag">Tú</span>}</div>
                      <div className="cl-email">{u.email}</div>
                    </div>
                  </div>
                  <span><RolBadge rol={u.rol} /></span>
                  <span className="cl-sup">{superior ? superior.nombre : "—"}</span>
                  <span className="r cl-units">{uCount > 0 ? uCount : "—"}</span>
                  <span className="cl-tel">{u.tel || "—"}</span>
                  <span className="cl-fecha">{u.fechaIngreso || "—"}</span>
                  <span className="cl-actions">
                    <button className="icon-btn ghost" title="Editar" onClick={() => setEditando(u)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                        strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </span>
                </div>
              );
            })}
            {!listaFiltrada.length && <div className="empty" style={{ padding:"24px 0", textAlign:"center" }}>Sin resultados.</div>}
          </div>
        </div>
      )}

      {/* Drawer agregar / editar */}
      {editando !== null && (
        <ColabDrawer
          u={editando === false ? null : editando}
          usuarios={usuarios}
          onSave={handleSave}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { Colaboradores });
