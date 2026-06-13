/* Automind · Dashboard rediseñado — layout operativo/denso */

const SEM_ORDEN = ["intereses", "vencer", "comprometido", "rotacion", "saludable"];

/* ── Helpers ────────────────────────────────────────────────── */
function avg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
}

/* ── KPI card superior ──────────────────────────────────────── */
function TopKpi({ label, value, sub, tone }) {
  const colors = {
    danger:  "#c0392b",
    warn:    "#b7770d",
    ok:      "#1a7a40",
    neutral: "var(--color-ink)",
  };
  return (
    <div style={{ background: "var(--color-bg-2,#f7f8fa)", borderRadius: 10, padding: "13px 16px" }}>
      <div style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: colors[tone] || colors.neutral }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── Card wrapper ───────────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--color-surface,#fff)",
      border: "1px solid var(--color-line,#e8e8ec)",
      borderRadius: 12,
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHead({ title, badge }) {
  return (
    <div style={{
      padding: "9px 16px",
      borderBottom: "1px solid var(--color-line,#e8e8ec)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>{title}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 10, color: "var(--color-muted)", background: "var(--color-bg-2,#f7f8fa)", padding: "2px 8px", borderRadius: 20 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── Barra apilada ──────────────────────────────────────────── */
function StackedBar({ rows }) {
  const total = rows.length || 1;
  return (
    <div style={{ padding: "10px 16px 6px" }}>
      <div style={{ height: 10, display: "flex", borderRadius: 5, overflow: "hidden", gap: 1 }}>
        {SEM_ORDEN.map(k => {
          const pct = (rows.filter(r => r.semaforo === k).length / total) * 100;
          if (!pct) return null;
          return <div key={k} style={{ width: pct + "%", background: SEM[k].sol, height: "100%" }} />;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 7 }}>
        {SEM_ORDEN.map(k => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-muted)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: SEM[k].sol, display: "inline-block", flexShrink: 0 }} />
            {SEM[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Tabla semáforo ─────────────────────────────────────────── */
function TablaSemaforo({ rows, kpis, filters, setFilters }) {
  const total  = rows.length || 1;
  const { sem } = filters;
  const setSem = k => setFilters(f => ({ ...f, sem: f.sem === k ? null : k }));

  return (
    <Card>
      <CardHead title="Estado del semáforo" badge={rows.length + " unidades"} />
      <StackedBar rows={rows} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Estado", "Unidades", "% inventario", "Distribución", "Interés acum."].map((h, i) => (
              <th key={h} style={{
                padding: "6px 16px", fontSize: 10, color: "var(--color-muted)",
                textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 500,
                textAlign: i === 0 ? "left" : "right",
                borderBottom: "1px solid var(--color-line,#e8e8ec)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SEM_ORDEN.map(k => {
            const count   = kpis[k] || 0;
            const pct     = Math.round((count / total) * 100);
            const isAct   = sem === k;
            const interesK = k === "intereses" ? (kpis.interesTotal || 0) : null;
            return (
              <tr key={k} onClick={() => setSem(k)}
                style={{ cursor: "pointer", background: isAct ? SEM[k].bg : "transparent", transition: "background .12s" }}>
                <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: SEM[k].sol, flexShrink: 0 }} />
                    {SEM[k].label}
                  </span>
                </td>
                <td style={{ padding: "9px 16px", textAlign: "right", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
                  <b style={{ fontSize: 14, color: (k === "intereses" || k === "vencer") ? "#c0392b" : "var(--color-ink)" }}>{count}</b>
                </td>
                <td style={{ padding: "9px 16px", textAlign: "right", fontSize: 12, color: "var(--color-muted)", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
                  {pct}%
                </td>
                <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
                  <div style={{ flex: 1, height: 5, background: "var(--color-bg-2,#f7f8fa)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: SEM[k].sol, borderRadius: 3 }} />
                  </div>
                </td>
                <td style={{ padding: "9px 16px", textAlign: "right", fontSize: 12, borderBottom: "1px solid var(--color-line-2,#f0f0f4)", color: interesK ? "#c0392b" : "var(--color-muted)" }}>
                  {interesK ? fmtMoney(interesK, 0) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ── Días promedio por semáforo ─────────────────────────────── */
function DiasPorSemaforo({ rows }) {
  const maxDias = Math.max(...SEM_ORDEN.map(k => avg(rows.filter(r => r.semaforo === k).map(r => r.diasEnPiso || 0))), 1);
  return (
    <Card>
      <CardHead title="Días promedio en piso" badge="por semáforo" />
      <div style={{ padding: "4px 0 6px" }}>
        {SEM_ORDEN.map(k => {
          const group = rows.filter(r => r.semaforo === k);
          const dias  = avg(group.map(r => r.diasEnPiso || 0));
          const pct   = maxDias ? (dias / maxDias) * 100 : 0;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "var(--color-ink)", width: 118, flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: SEM[k].sol, flexShrink: 0 }} />
                {SEM[k].label}
              </span>
              <div style={{ flex: 1, height: 7, background: "var(--color-bg-2,#f7f8fa)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: pct + "%", height: "100%", background: SEM[k].sol, borderRadius: 4 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 54 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-ink)" }}>{dias} días</span>
                <span style={{ fontSize: 10, color: "var(--color-muted)" }}>{group.length} uds.</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Por marca ──────────────────────────────────────────────── */
function PorMarca({ rows, filters, setFilters }) {
  const marcas = {};
  rows.forEach(r => {
    const m = r.marca || "Sin marca";
    if (!marcas[m]) marcas[m] = { total: 0, alertas: 0 };
    marcas[m].total++;
    if (r.semaforo === "intereses" || r.semaforo === "vencer") marcas[m].alertas++;
  });
  const list = Object.entries(marcas).sort((a, b) => b[1].total - a[1].total).slice(0, 7);
  return (
    <Card>
      <CardHead title="Por marca" />
      {list.map(([marca, d]) => (
        <div key={marca}
          onClick={() => setFilters(f => ({ ...f, marca: f.marca === marca ? null : marca }))}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)",
            cursor: "pointer", fontSize: 12,
            background: filters.marca === marca ? "var(--color-bg-2,#f7f8fa)" : "transparent",
          }}>
          <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{marca}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-muted)" }}>
            {d.total} uds.
            {d.alertas > 0 && (
              <span style={{ background: "#fde8e8", color: "#c0392b", fontWeight: 700, fontSize: 10, padding: "1px 7px", borderRadius: 20 }}>
                {d.alertas} ⚠
              </span>
            )}
          </span>
        </div>
      ))}
      {!list.length && <div style={{ padding: "20px 16px", color: "var(--color-muted)", fontSize: 12 }}>Sin datos</div>}
    </Card>
  );
}

/* ── Antigüedad ─────────────────────────────────────────────── */
function Antiguedad({ rows }) {
  const tramos = [
    { label: "0 – 30 días",  fn: r => r.diasEnPiso <= 30,                       color: "#1f9d57" },
    { label: "31 – 60 días", fn: r => r.diasEnPiso > 30 && r.diasEnPiso <= 60,  color: "#d99613" },
    { label: "61 – 90 días", fn: r => r.diasEnPiso > 60 && r.diasEnPiso <= 90,  color: "#e07a20" },
    { label: "91+ días",     fn: r => r.diasEnPiso > 90,                         color: "#c0392b" },
  ];
  const max = Math.max(...tramos.map(t => rows.filter(t.fn).length), 1);
  return (
    <Card>
      <CardHead title="Antigüedad del inventario" />
      {tramos.map(t => {
        const count = rows.filter(t.fn).length;
        return (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
            <span style={{ fontSize: 12, color: "var(--color-muted)", width: 90, flexShrink: 0 }}>{t.label}</span>
            <div style={{ flex: 1, height: 6, background: "var(--color-bg-2,#f7f8fa)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: ((count / max) * 100) + "%", height: "100%", background: t.color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.color, minWidth: 28, textAlign: "right" }}>{count}</span>
          </div>
        );
      })}
    </Card>
  );
}

/* ── Carga por vendedor ─────────────────────────────────────── */
function CargaVendedor({ rows, usuarios }) {
  const AVCOLORS = ["#e6f1fb:#185fa5","#eaf3de:#3b6d11","#faeeda:#854f0b","#fbeaf0:#993556","#f1efe8:#5f5e5a","#fcebe7:#a32d2d"];
  const vendedores = (usuarios || [])
    .map(v => ({
      ...v,
      total:   rows.filter(r => r.vendedorId === v.id).length,
      alertas: rows.filter(r => r.vendedorId === v.id && (r.semaforo === "intereses" || r.semaforo === "vencer")).length,
    }))
    .filter(v => v.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const sinAsignar = rows.filter(r => !r.vendedorId).length;
  const maxUnits   = Math.max(...vendedores.map(v => v.total), sinAsignar, 1);

  return (
    <Card>
      <CardHead title="Carga por vendedor" />
      {vendedores.map((v, i) => {
        const [bg, txt] = (AVCOLORS[i] || AVCOLORS[0]).split(":");
        const initials  = v.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
        return (
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px", borderBottom: "1px solid var(--color-line-2,#f0f0f4)" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: bg, color: txt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {v.nombre.split(" ").slice(0, 2).join(" ")}
            </span>
            <div style={{ width: 60, height: 5, background: "var(--color-bg-2,#f7f8fa)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: ((v.total / maxUnits) * 100) + "%", height: "100%", background: "#2f6fed", borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)", minWidth: 20, textAlign: "right" }}>{v.total}</span>
            {v.alertas > 0 && (
              <span style={{ fontSize: 10, color: "#c0392b", fontWeight: 700, minWidth: 18 }}>⚠{v.alertas}</span>
            )}
          </div>
        );
      })}
      {sinAsignar > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f7f8fa", color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>—</div>
          <span style={{ flex: 1, fontSize: 12, color: "var(--color-muted)" }}>Sin asignar</span>
          <div style={{ width: 60, height: 5, background: "var(--color-bg-2,#f7f8fa)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: ((sinAsignar / maxUnits) * 100) + "%", height: "100%", background: "#e0492f", borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#c0392b", minWidth: 20, textAlign: "right" }}>{sinAsignar}</span>
        </div>
      )}
      {!vendedores.length && !sinAsignar && (
        <div style={{ padding: "20px 16px", color: "var(--color-muted)", fontSize: 12 }}>Sin vendedores con unidades</div>
      )}
    </Card>
  );
}

/* ── Lista detallada (al fondo, collapsible) ────────────────── */
function ListaDetallada({ rows, filters, setFilters, openVehicle, usuarioActual }) {
  const [collapsed, setCollapsed] = React.useState({});
  const toggle = k => setCollapsed(c => ({ ...c, [k]: !c[k] }));

  const { sem, fin, gerente, marca } = filters;
  const filtered = rows.filter(r => {
    if (sem     && r.semaforo   !== sem)     return false;
    if (fin     && r.financiera !== fin)     return false;
    if (gerente && r.gerenteId  !== gerente) return false;
    if (marca   && r.marca      !== marca)   return false;
    return true;
  });

  const grupos = SEM_ORDEN
    .map(k => ({ k, items: filtered.filter(r => r.semaforo === k) }))
    .filter(g => g.items.length);

  const activeLabel = sem     ? SEM[sem].emoji + " " + SEM[sem].label
    : fin     ? fin
    : gerente ? "Gerente filtrado"
    : marca   ? "Marca · " + marca
    : null;

  return (
    <Card style={{ marginTop: 10 }}>
      <div style={{ padding: "9px 16px", borderBottom: "1px solid var(--color-line,#e8e8ec)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>Lista detallada</span>
          {activeLabel && (
            <button className="chip-clear" onClick={() => setFilters({ sem: null, fin: null, gerente: null, marca: null })}>
              {I.filter({ width: 12, height: 12 })} {activeLabel} · {filtered.length}
              <span className="cc-x">{I.close({ width: 11, height: 11 })}</span>
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => setCollapsed(grupos.reduce((a, g) => ({ ...a, [g.k]: true }), {}))}>Colapsar</button>
          <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => setCollapsed({})}>Expandir</button>
        </div>
      </div>
      <div className="vlist">
        <div className="vrow vhead">
          <span>Vehículo</span>
          <span className="r">Días en piso</span>
          <span className="r">Días vencidos</span>
          <span className="r">Interés acum.</span>
          <span className="r">% Plan</span>
          <span className="r">Días libres rest.</span>
          <span>Vendedor</span>
        </div>
        {grupos.map(g => (
          <React.Fragment key={g.k}>
            <button className="vgroup collapsible" style={{ "--sol": SEM[g.k].sol, "--bg": SEM[g.k].bg }} onClick={() => toggle(g.k)}>
              <span className="vg-chevron" style={{ transform: collapsed[g.k] ? "rotate(-90deg)" : "rotate(0deg)" }}>
                {I.chevron({ width: 14, height: 14, style: { transform: "rotate(90deg)" } })}
              </span>
              <span className="vg-dot" />
              <span style={{ fontWeight: 700 }}>{SEM[g.k].label}</span>
              <span className="vg-count">{g.items.length}</span>
            </button>
            {!collapsed[g.k] && g.items.map(r => {
              const usuarios = window.AUTOMIND ? window.AUTOMIND.USUARIOS || [] : [];
              const vendedor = usuarios.find(u => u.id === r.vendedorId);
              const esYo     = usuarioActual && r.vendedorId === usuarioActual.id;
              function toggleAsignar(e) {
                e.stopPropagation();
                if (!usuarioActual) return;
                r.vendedorId = esYo ? null : usuarioActual.id;
                if (window.AUTOMIND && window.AUTOMIND.enrichRowVendedor) {
                  window.AUTOMIND.enrichRowVendedor(r, window.AUTOMIND.USUARIOS || []);
                }
                if (window.DB && window.AUTOMIND && window.AUTOMIND.agencyId) {
                  window.DB.saveVehicle(window.AUTOMIND.agencyId, r).catch(err => {
                    console.error("Error guardando asignación:", err);
                    alert("No se pudo guardar la asignación.");
                  });
                }
                setFilters(f => ({ ...f }));
              }
              return (
                <button className="vrow" key={r.id} onClick={() => openVehicle(r)}>
                  <span className="v-name">
                    <b>{r.marca} {r.modelo}</b>
                    <small>{r.anio} · {r.colorExterior} · INV {r.inv}</small>
                  </span>
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
    </Card>
  );
}

/* ── Dashboard principal ────────────────────────────────────── */
function Dashboard({ rows, kpis, pivote, filters, setFilters, openVehicle, usuarioActual }) {
  const criticas   = (kpis.intereses || 0) + (kpis.vencer || 0);
  const sinAsignar = rows.filter(r => !r.vendedorId).length;
  const usuarios   = window.AUTOMIND ? window.AUTOMIND.USUARIOS || [] : [];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="page-sub">Estado general del inventario. Haz clic en cualquier fila del semáforo para filtrar la lista.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: 10 }}>
        <TopKpi label="Total inventario"             value={rows.length}                        sub="unidades en piso"                                                    tone="neutral" />
        <TopKpi label="Críticas (intereses + vencer)" value={criticas}                           sub={rows.length ? Math.round((criticas / rows.length) * 100) + "% del inventario" : "—"} tone={criticas > 0 ? "danger" : "ok"} />
        <TopKpi label="Interés acumulado"             value={fmtMoney(kpis.interesTotal || 0, 0)} sub={(kpis.intereses || 0) + " unidades generando interés"}               tone={kpis.interesTotal > 0 ? "warn" : "ok"} />
        <TopKpi label="Sin vendedor asignado"         value={sinAsignar}                         sub={rows.length ? Math.round((sinAsignar / rows.length) * 100) + "% sin asignar" : "—"} tone={sinAsignar > 5 ? "warn" : "ok"} />
      </div>

      {/* Semáforo + Días promedio */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
        <TablaSemaforo rows={rows} kpis={kpis} filters={filters} setFilters={setFilters} />
        <DiasPorSemaforo rows={rows} />
      </div>

      {/* Marca + Antigüedad + Vendedor */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <PorMarca rows={rows} filters={filters} setFilters={setFilters} />
        <Antiguedad rows={rows} />
        <CargaVendedor rows={rows} usuarios={usuarios} />
      </div>

      {/* Lista detallada */}
      <ListaDetallada rows={rows} filters={filters} setFilters={setFilters} openVehicle={openVehicle} usuarioActual={usuarioActual} />
    </div>
  );
}

Object.assign(window, { Dashboard });
