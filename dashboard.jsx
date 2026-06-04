/* Automind · Vista Dashboard (Semáforo — 5 niveles) */

const SEM_ORDEN = ["intereses", "vencer", "comprometido", "rotacion", "saludable"];

function SemHeroCard({ sk, count, total, active, onClick }) {
  const c = SEM[sk];
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <button className={"sem-hero" + (active ? " active" : "")} onClick={onClick}
      style={{ "--sol": c.sol, "--bg": c.bg, "--brd": c.brd, "--txt": c.txt }}>
      <div className="sh-top">
        <span className="sh-dot" />
        <span className="sh-name">{c.emoji} {c.label}</span>
        <span className="sh-arrow">{I.arrowUR({ width: 14, height: 14 })}</span>
      </div>
      <div className="sh-num">{count}</div>
      <div className="sh-foot">
        <span className="sh-pct">{pct}% del inventario</span>
        <span className="sh-bar"><span style={{ width: pct + "%" }} /></span>
      </div>
    </button>
  );
}

function MiniKpi({ icon, label, value, active, onClick, accent }) {
  return (
    <button className={"mini-kpi" + (active ? " active" : "") + (onClick ? " clickable" : "")}
      onClick={onClick} style={accent ? { "--accent": accent } : undefined}>
      <span className="mk-ico">{icon}</span>
      <div className="mk-body">
        <span className="mk-label">{label}</span>
        <span className="mk-value">{value}</span>
      </div>
      {onClick && <span className="mk-arrow">{I.arrowUR({ width: 14, height: 14 })}</span>}
    </button>
  );
}

function Dashboard({ rows, kpis, pivote, filters, setFilters, openVehicle, usuarioActual }) {
  const { sem, fin, gerente } = filters;
  const setSem     = (v) => setFilters((f) => ({ ...f, sem: v }));
  const setFin     = (v) => setFilters((f) => ({ ...f, fin: v }));
  const setGerente = (v) => setFilters((f) => ({ ...f, gerente: v }));

  const filtered = rows.filter((r) => {
    if (sem     && r.semaforo      !== sem)     return false;
    if (fin     && r.financiera    !== fin)      return false;
    if (gerente && r.gerenteId     !== gerente)  return false;
    return true;
  });

  // KPIs de asignación
  const asignadas    = rows.filter(r => r.vendedorId).length;
  const sinAsignar   = rows.length - asignadas;

  // Lista única de gerentes que tienen unidades
  const gerentesConUnidades = [...new Set(rows.filter(r => r.gerenteId).map(r => r.gerenteId))]
    .map(id => ({ id, nombre: rows.find(r => r.gerenteId === id)?.gerenteNombre || id }));

  const segs = SEM_ORDEN.map(k => ({
    key: k, label: SEM[k].label, value: kpis[k] || 0, color: SEM[k].sol,
  }));

  const grupos = SEM_ORDEN
    .map((k) => ({ k, items: filtered.filter((r) => r.semaforo === k) }))
    .filter((g) => g.items.length);

  const activeFilterLabel = sem
    ? SEM[sem].emoji + " " + SEM[sem].label
    : fin  ? fin
    : gerente ? ("Equipo · " + (gerentesConUnidades.find(g => g.id === gerente)?.nombre || gerente))
    : null;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Análisis y Urgencia de Vehículos por Semáforo</h1>
        <p className="page-sub">
          Estado del inventario según el porcentaje del plan de gracia consumido.
          Cada número se deriva de fórmulas auditables en la <b>Base de datos</b>.
        </p>
      </div>

      {/* Semáforo 5 niveles */}
      <div className="block-label">Estado del semáforo</div>
      <div className="sem-grid">
        {SEM_ORDEN.map(sk => (
          <SemHeroCard key={sk} sk={sk} count={kpis[sk] || 0} total={kpis.total}
            active={sem === sk} onClick={() => setSem(sem === sk ? null : sk)} />
        ))}
      </div>

      {/* KPIs financieros */}
      <div className="block-label">Indicadores financieros</div>
      <div className="mini-grid">
        <MiniKpi icon={I.clock({ width: 20, height: 20 })}
          label="En intereses + próx. vencer"
          value={((kpis.intereses||0) + (kpis.vencer||0)) + " unidades"}
          accent="#e0492f"
          active={sem === "intereses" || sem === "vencer"}
          onClick={() => setSem(sem === "vencer" ? null : "vencer")} />
        <MiniKpi icon={I.coins({ width: 20, height: 20 })}
          label="Unidades generando interés"
          value={(kpis.intereses||0) + " activas"}
          accent="#2d3142"
          active={sem === "intereses"}
          onClick={() => setSem(sem === "intereses" ? null : "intereses")} />
        <MiniKpi icon={I.coins({ width: 20, height: 20 })}
          label="Interés acumulado total"
          value={fmtMoney(kpis.interesTotal || 0, 2)}
          accent="#2f6fed" />
        <MiniKpi icon={I.clock({ width: 20, height: 20 })}
          label="Monto total en piso"
          value={fmtMoney(kpis.montoTotal || 0)}
          accent="#1f9d57" />
      </div>

      {/* Asignación por jerarquía */}
      <div className="block-label">Asignación por jerarquía</div>
      <div className="mini-grid">
        <MiniKpi icon={I.users({ width:20, height:20 })}
          label="Unidades asignadas"
          value={asignadas + " / " + rows.length}
          accent="#1f9d57" />
        <MiniKpi icon={I.truck({ width:20, height:20 })}
          label="Sin vendedor asignado"
          value={sinAsignar + " unidades"}
          accent={sinAsignar > 0 ? "#e0492f" : "#1f9d57"} />
        {gerentesConUnidades.map(g => (
          <MiniKpi key={g.id}
            icon={I.users({ width:20, height:20 })}
            label={"Equipo · " + g.nombre.split(" ")[0]}
            value={rows.filter(r => r.gerenteId === g.id).length + " unidades"}
            accent="#2f6fed"
            active={gerente === g.id}
            onClick={() => setGerente(gerente === g.id ? null : g.id)} />
        ))}
      </div>

      {/* Distribución + Por marca */}
      {(() => {
        // Calcular distribución por marca
        const marcas = {};
        rows.forEach(r => {
          const m = r.marca || "Sin marca";
          if (!marcas[m]) marcas[m] = { total:0, intereses:0, vencer:0, comprometido:0, rotacion:0, saludable:0, interesTotal:0 };
          marcas[m].total++;
          if (r.semaforo) marcas[m][r.semaforo] = (marcas[m][r.semaforo]||0)+1;
          marcas[m].interesTotal += r.interesAcum||0;
        });
        const marcasList = Object.entries(marcas).sort((a,b)=>b[1].total-a[1].total).slice(0,8);

        // Top 10 más urgentes
        const urgentes = [...rows]
          .filter(r => r.semaforo === "intereses" || r.semaforo === "vencer")
          .sort((a,b) => (b.diasVencidos||0) - (a.diasVencidos||0) || (b.pctPlanConsumido||0) - (a.pctPlanConsumido||0))
          .slice(0,10);

        return (
          <>
            <div className="two-col">
              <div className="card">
                <div className="card-head">
                  <h3>Distribución por semáforo</h3>
                  <span className="card-desc">5 niveles según % del plan consumido. Clic para filtrar.</span>
                </div>
                <Donut segs={segs} activeKey={sem} onPick={setSem} />
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Inventario por marca</h3>
                  <span className="card-desc">Unidades y alerta por marca. Clic para filtrar.</span>
                </div>
                <div style={{ overflowY:"auto", maxHeight:320 }}>
                  {marcasList.map(([marca, data]) => {
                    const alertas = (data.intereses||0) + (data.vencer||0);
                    const pct = rows.length ? Math.round(data.total/rows.length*100) : 0;
                    return (
                      <div key={marca} style={{ display:"flex", alignItems:"center", gap:10,
                        padding:"9px 20px", borderBottom:"1px solid var(--line-2)", cursor:"pointer",
                        transition:"background .12s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}
                        onClick={() => setFilters(f=>({...f, marca: f.marca===marca?null:marca}))}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{marca}</div>
                          <div style={{ fontSize:12, color:"var(--muted)" }}>{data.total} unidades · {pct}%</div>
                        </div>
                        <div style={{ flex:2, height:8, background:"var(--line-2)", borderRadius:4, overflow:"hidden", display:"flex" }}>
                          {SEM_ORDEN.map(k => data[k] ? (
                            <div key={k} style={{ width:(data[k]/data.total*100)+'%', background:SEM[k].sol }} />
                          ) : null)}
                        </div>
                        {alertas > 0 && (
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"#fcebe7",
                            display:"grid", placeItems:"center", fontSize:12, fontWeight:800, color:"#e0492f", flexShrink:0 }}>
                            {alertas}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {marcasList.length === 0 && (
                    <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--muted)" }}>Sin datos de marca</div>
                  )}
                </div>
              </div>
            </div>

            {/* Antigüedad */}
            <div className="card">
              <div className="card-head">
                <h3>Antigüedad del inventario</h3>
                <span className="card-desc">Unidades por tramo de días en piso.</span>
              </div>
              <AgingHistogram rows={rows} />
            </div>

            {/* Top urgentes */}
            {urgentes.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <h3>⚠️ Unidades urgentes</h3>
                  <span className="card-desc">Vehículos en intereses o próximos a vencer — requieren acción inmediata.</span>
                </div>
                <div className="pivot-scroll">
                  <table className="pivot">
                    <thead>
                      <tr>
                        <th className="pl">VIN / ID</th>
                        <th>Marca · Modelo</th>
                        <th>Estado</th>
                        <th>Días en piso</th>
                        <th>Días vencidos</th>
                        <th>Interés acum.</th>
                        <th>Vendedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urgentes.map(r => (
                        <tr key={r.id} style={{ cursor:"pointer" }} onClick={() => openVehicle(r)}>
                          <td className="pl" style={{ fontFamily:"monospace", fontSize:12 }}>{r.vin || r.id}</td>
                          <td>{[r.marca, r.modelo].filter(Boolean).join(" ") || "—"}</td>
                          <td>
                            <span className="sem-chip" style={{ background:SEM[r.semaforo]?.bg, color:SEM[r.semaforo]?.txt, fontSize:12 }}>
                              <span className="sc-dot" style={{ background:SEM[r.semaforo]?.sol }} />
                              {SEM[r.semaforo]?.label}
                            </span>
                          </td>
                          <td className="num">{r.diasEnPiso}</td>
                          <td className={"num" + (r.diasVencidos>0?" neg":"")}>{r.diasVencidos||0}</td>
                          <td className={"num" + (r.interesAcum>0?" neg":"")}>{fmtMoney(r.interesAcum||0,2)}</td>
                          <td style={{ fontSize:13, color:"var(--muted)" }}>{r.vendedorNombre||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Lista detallada */}
      {(() => {
        const [collapsed, setCollapsed] = React.useState({});
        const toggle = (k) => setCollapsed(c => ({...c, [k]: !c[k]}));
        return (
      <div className="card">
        <div className="card-head between">
          <div>
            <h3>Lista detallada de vehículos</h3>
            <span className="card-desc">Clic en el grupo para expandir · Clic en una unidad para ver el desglose.</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {activeFilterLabel && (
              <button className="chip-clear" onClick={() => setFilters({ sem: null, fin: null, gerente: null })}>
                {I.filter({ width: 13, height: 13 })} {activeFilterLabel} · {filtered.length}
                <span className="cc-x">{I.close({ width: 12, height: 12 })}</span>
              </button>
            )}
            <button className="btn btn-sm" style={{ fontSize:12 }}
              onClick={() => setCollapsed(grupos.reduce((a,g)=>({...a,[g.k]:true}),{}))}>
              Colapsar todo
            </button>
            <button className="btn btn-sm" style={{ fontSize:12 }}
              onClick={() => setCollapsed({})}>
              Expandir todo
            </button>
          </div>
        </div>

        <div className="vlist">
          <div className="vrow vhead">
            <span style={{ width:32 }}></span>
            <span>Vehículo</span>
            <span className="r">Días en piso</span>
            <span className="r">Días vencidos</span>
            <span className="r">Interés acum.</span>
            <span className="r">% Plan</span>
            <span className="r">Días libres rest.</span>
            <span>Vendedor</span>
          </div>
          {grupos.map((g) => (
            <React.Fragment key={g.k}>
              <button className="vgroup collapsible" style={{ "--sol": SEM[g.k].sol, "--bg": SEM[g.k].bg }}
                onClick={() => toggle(g.k)}>
                <span className="vg-chevron" style={{ transform: collapsed[g.k] ? "rotate(-90deg)" : "rotate(0deg)" }}>
                  {I.chevron({ width:14, height:14, style:{ transform:"rotate(90deg)" } })}
                </span>
                <span className="vg-dot" />
                <span style={{ fontWeight:700 }}>{SEM[g.k].label}</span>
                <span className="vg-count">{g.items.length}</span>
              </button>
              {!collapsed[g.k] && g.items.map((r) => {
                const usuarios = window.AUTOMIND ? window.AUTOMIND.USUARIOS || [] : [];
                const vendedor = usuarios.find(u => u.id === r.vendedorId);
                const esYo = usuarioActual && r.vendedorId === usuarioActual.id;
                function toggleAsignar(e) {
                  e.stopPropagation();
                  if (!usuarioActual) return;
                  r.vendedorId = esYo ? null : usuarioActual.id;
                  // Re-enriquecer fila con jerarquía actualizada
                  if (window.AUTOMIND && window.AUTOMIND.enrichRowVendedor) {
                    window.AUTOMIND.enrichRowVendedor(r, window.AUTOMIND.USUARIOS || []);
                  }
                  setFilters(f => ({ ...f }));
                }
                return (
                  <button className="vrow" key={r.id} onClick={() => openVehicle(r)}>
                    <span className="v-name">
                      <b>{r.marca} {r.modelo}</b>
                      <small>{r.anio} · {r.colorExterior} · INV {r.inv}</small>
                    </span>
                    <span className="v-fin">{r.financiera}</span>
                    <span className="r">{r.diasEnPiso}</span>
                    <span className={"r " + (r.diasVencidos > 0 ? "neg" : "")}>{r.diasVencidos || "—"}</span>
                    <span className="r">{fmtMoney(r.interesAcum)}</span>
                    <span className={"r " + (r.pctPlanConsumido > 100 ? "neg" : r.pctPlanConsumido > 76 ? "warn" : "")}>
                      {r.pctPlanConsumido}%
                    </span>
                    <span className={"r " + (r.diasLibresRestantes < 0 ? "neg" : r.diasLibresRestantes <= 15 ? "warn" : "")}>
                      {r.diasLibresRestantes}
                    </span>
                    <span className="v-vendedor" onClick={e => e.stopPropagation()}>
                      {vendedor ? (
                        <span className={"vend-chip" + (esYo ? " yo" : "")}>
                          <span className="vend-names">
                            <span className="vend-vend">{vendedor.nombre.split(" ")[0]}</span>
                            {r.gerenteNombre && <span className="vend-ger">{r.gerenteNombre.split(" ")[0]}</span>}
                          </span>
                          {esYo && usuarioActual.rol !== "director" && (
                            <button className="vend-remove" onClick={toggleAsignar} title="Desasignar">×</button>
                          )}
                        </span>
                      ) : (
                        usuarioActual && usuarioActual.rol !== "director" ? (
                          <button className="btn-asignar-sm" onClick={toggleAsignar}>Asignarme</button>
                        ) : <span className="vend-none">—</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
          {!filtered.length && <div className="empty">Sin unidades para este filtro.</div>}
        </div>
      </div>
        );
      })()}
    </div>
  );
}

Object.assign(window, { Dashboard });
