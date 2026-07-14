/* Automind · Dashboard de Ventas — datos reales de Supabase */

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const $mx  = (v) => "$" + Math.round(v || 0).toLocaleString("es-MX");
const _pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

const ETAPAS_ORDEN = [
  "Prospección","Perfilamiento","Presentación","Prueba de manejo",
  "Cotización","Crédito","Expediente","Aprobación","Cierre","Pago","Entrega",
];

const ETAPA_COLOR = {
  "Prospección":    "#94a3b8",
  "Perfilamiento":  "#60a5fa",
  "Presentación":   "#818cf8",
  "Prueba de manejo":"#a78bfa",
  "Cotización":     "#f59e0b",
  "Crédito":        "#fb923c",
  "Expediente":     "#f97316",
  "Aprobación":     "#22d3ee",
  "Cierre":         "#4ade80",
  "Pago":           "#22c55e",
  "Entrega":        "#16a34a",
};

const ESTADO_CLR = {
  "Activo":           "#22c55e",
  "En espera":        "#eab308",
  "Detenido":         "#6b7280",
  "Cancelado":        "#ef4444",
  "Venta completada": "#3b82f6",
};

/* ─── Sub-componentes ────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, ico, trend }) {
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--line)",
      borderRadius:14, padding:"18px 22px",
      display:"flex", flexDirection:"column", gap:6,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ fontSize:20, lineHeight:1 }}>{ico}</div>
      <div style={{
        fontSize:28, fontWeight:800, color: color || "var(--ink)",
        lineHeight:1, fontVariantNumeric:"tabular-nums",
      }}>{value}</div>
      <div style={{ fontSize:12, color:"var(--muted)", fontWeight:500 }}>{label}</div>
      {sub && (
        <div style={{ fontSize:11, color: trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "var(--muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize:11, fontWeight:700, textTransform:"uppercase",
      letterSpacing:".08em", color:"var(--muted)", marginBottom:10,
    }}>{children}</div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--line)",
      borderRadius:14, padding:"18px 20px",
      ...style,
    }}>{children}</div>
  );
}

function EmbudoBar({ etapa, count, max, color }) {
  var pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
      <div style={{ width:110, fontSize:12, color:"var(--muted)", textAlign:"right",
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flexShrink:0 }}>
        {etapa}
      </div>
      <div style={{ flex:1, height:18, background:"var(--bg)", borderRadius:5, overflow:"hidden" }}>
        <div style={{
          height:"100%", width: pct + "%",
          background: color || "#3b82f6", borderRadius:5,
          transition:"width .6s cubic-bezier(.4,0,.2,1)",
          display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:6,
        }}>
          {count > 0 && (
            <span style={{ fontSize:10, fontWeight:800, color:"#fff", lineHeight:1 }}>{count}</span>
          )}
        </div>
      </div>
      <div style={{ width:28, fontSize:12, fontWeight:700, color:"var(--ink)",
        textAlign:"right", flexShrink:0 }}>{count}</div>
    </div>
  );
}

function DonutRing({ pct, color, size }) {
  var r   = (size || 44) / 2;
  var cx  = r;
  var cy  = r;
  var rad = r - 6;
  var circ = 2 * Math.PI * rad;
  var dash = (pct / 100) * circ;
  return (
    <svg width={size || 44} height={size || 44} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={rad} fill="none" stroke="var(--line)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={rad} fill="none"
        stroke={color || "var(--accent)"} strokeWidth={10}
        strokeDasharray={dash + " " + circ}
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray .7s ease" }} />
    </svg>
  );
}

function HBarRow({ label, count, max, color }) {
  var pct = max > 0 ? Math.max(2, Math.round((count / max) * 100)) : 2;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
      <div style={{ width:80, fontSize:12, color:"var(--muted)", flexShrink:0,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</div>
      <div style={{ flex:1, height:8, background:"var(--bg)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", width:pct+"%", background:color||"#3b82f6",
          borderRadius:4, transition:"width .5s ease" }} />
      </div>
      <div style={{ width:24, fontSize:12, fontWeight:700, color:"var(--ink)",
        textAlign:"right", flexShrink:0 }}>{count}</div>
    </div>
  );
}

/* ─── Dashboard principal ──────────────────────────────────────────────── */
function ProcesoVenta({ rows, kpis, usuarios }) {
  const [clientes,  setClientes]  = React.useState([]);
  const [cargando,  setCargando]  = React.useState(true);
  const [error,     setError]     = React.useState("");

  React.useEffect(function() {
    var aid = window.AUTOMIND && window.AUTOMIND.agencyId;
    if (!aid || !window.DB) { setCargando(false); return; }
    setCargando(true);
    window.DB.getClientes(aid)
      .then(function(lista) { setClientes(lista || []); setCargando(false); })
      .catch(function(e) { setError(e.message); setCargando(false); });
  }, []);

  /* ── Métricas derivadas ── */
  var total      = clientes.length;
  var activos    = clientes.filter(function(c){ return (c.estadoGeneral || "Activo") === "Activo"; }).length;
  var completados= clientes.filter(function(c){ return c.estadoGeneral === "Venta completada"; }).length;
  var urgentes   = clientes.filter(function(c){ return _dsc && _dsc(c.uc) > 3; }).length;
  var avanzados  = clientes.filter(function(c){
    return ["Cotización","Crédito","Expediente","Aprobación","Cierre","Pago","Entrega"].includes(c.etapa);
  }).length;
  var probProm   = total > 0
    ? Math.round(clientes.reduce(function(s,c){ return s + (c.prob||0); }, 0) / total)
    : 0;
  var montoTotal = clientes.reduce(function(s,c){ return s + (c.precioVenta||c.presupuesto||0); }, 0);

  /* Conteo por etapa */
  var etapaMap = {};
  ETAPAS_ORDEN.forEach(function(e){ etapaMap[e] = 0; });
  clientes.forEach(function(c){ if (etapaMap[c.etapa] !== undefined) etapaMap[c.etapa]++; });
  var maxEtapa = Math.max.apply(null, Object.values(etapaMap).concat([1]));

  /* Canal de origen */
  var canalMap = {};
  clientes.forEach(function(c){ var k = c.canal||"Sin canal"; canalMap[k] = (canalMap[k]||0)+1; });
  var canales = Object.entries(canalMap).sort(function(a,b){ return b[1]-a[1]; });
  var maxCanal = canales.length > 0 ? canales[0][1] : 1;

  /* Estado general */
  var estadoMap = {};
  clientes.forEach(function(c){ var k = c.estadoGeneral||"Activo"; estadoMap[k]=(estadoMap[k]||0)+1; });

  /* Asesores */
  var asesorMap = {};
  clientes.forEach(function(c){
    if (!c.asesor) return;
    if (!asesorMap[c.asesor]) asesorMap[c.asesor] = { count:0, prob:0, monto:0 };
    asesorMap[c.asesor].count++;
    asesorMap[c.asesor].prob  += c.prob||0;
    asesorMap[c.asesor].monto += c.precioVenta||c.presupuesto||0;
  });
  var asesores = Object.entries(asesorMap)
    .map(function(a){ return { nombre:a[0], count:a[1].count,
      prob:Math.round(a[1].prob/a[1].count), monto:a[1].monto }; })
    .sort(function(a,b){ return b.count - a.count; });
  var maxAsesor = asesores.length > 0 ? asesores[0].count : 1;

  /* Crédito vs Contado */
  var credito  = clientes.filter(function(c){ return c.formaPagoCot === "Crédito"; }).length;
  var contado  = clientes.filter(function(c){ return c.formaPagoCot === "Contado"; }).length;
  var sinDef   = total - credito - contado;

  /* Docs pendientes */
  var conDocsPend = clientes.filter(function(c){
    return !(c.docId && c.docId.storageKey) ||
           !(c.docLicencia && c.docLicencia.storageKey) ||
           !(c.docDomicilio && c.docDomicilio.storageKey);
  }).length;

  /* ── Render ── */
  if (cargando) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        height:"100%", flexDirection:"column", gap:12, color:"var(--muted)" }}>
        <div style={{ width:32, height:32, border:"3px solid var(--line)",
          borderTopColor:"var(--accent)", borderRadius:"50%",
          animation:"spin 0.8s linear infinite" }} />
        <span style={{ fontSize:14 }}>Cargando datos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding:32, color:"#dc2626", fontSize:14 }}>
        Error al cargar datos: {error}
      </div>
    );
  }

  var AVANCE_CLR = "#2563eb";

  return (
    <div style={{ padding:"24px 28px", maxWidth:1200, margin:"0 auto",
      display:"flex", flexDirection:"column", gap:20 }}>

      {/* ── Encabezado ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:"var(--ink)" }}>
            Dashboard de Ventas
          </h1>
          <p style={{ margin:0, color:"var(--muted)", fontSize:13 }}>
            {total} proceso{total !== 1 ? "s" : ""} en seguimiento
            {" · "} Actualizado {new Date().toLocaleDateString("es-MX",{ day:"numeric", month:"long" })}
          </p>
        </div>
        {total === 0 && (
          <div style={{ fontSize:12, padding:"6px 14px", borderRadius:8,
            background:"rgba(234,179,8,.12)", color:"#854d0e", border:"1px solid rgba(234,179,8,.3)" }}>
            Sin clientes registrados aún
          </div>
        )}
      </div>

      {/* ── KPIs ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:12 }}>
        <KpiCard ico="👥" label="Procesos activos"    value={activos}      color="var(--ink)"   />
        <KpiCard ico="🎯" label="En etapa avanzada"   value={avanzados}    color={AVANCE_CLR}
          sub={_pct(avanzados, total) + "% del total"} />
        <KpiCard ico="📈" label="Prob. promedio cierre" value={probProm + "%"}
          color={probProm >= 60 ? "#16a34a" : probProm >= 35 ? "#d97706" : "#dc2626"} />
        <KpiCard ico="⚠️" label="Seguimiento urgente" value={urgentes}
          color={urgentes > 0 ? "#dc2626" : "#16a34a"}
          sub={urgentes > 0 ? "sin contacto > 3 días" : "todo al día"} />
        <KpiCard ico="🏆" label="Ventas completadas"  value={completados}  color="#3b82f6"
          sub={conDocsPend + " con docs pendientes"} />
      </div>

      {/* ── Fila 2: Embudo + Operación ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16 }}>

        {/* Embudo de ventas */}
        <Card>
          <SectionTitle>Embudo de ventas por etapa</SectionTitle>
          {ETAPAS_ORDEN.map(function(et) {
            return (
              <EmbudoBar key={et} etapa={et} count={etapaMap[et]||0}
                max={maxEtapa} color={ETAPA_COLOR[et]} />
            );
          })}
        </Card>

        {/* Tipo de operación */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card style={{ flex:1 }}>
            <SectionTitle>Tipo de operación</SectionTitle>
            <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:4 }}>
              {[
                { lbl:"Crédito", cnt:credito, color:"#3b82f6",  ico:"💳" },
                { lbl:"Contado", cnt:contado, color:"#22c55e",  ico:"💵" },
                { lbl:"Sin definir",cnt:sinDef,color:"#9ca3af", ico:"❓" },
              ].map(function(op){
                var p = _pct(op.cnt, total);
                return (
                  <div key={op.lbl}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontSize:13, color:"var(--ink)", fontWeight:600 }}>
                        {op.ico} {op.lbl}
                      </span>
                      <span style={{ fontSize:13, fontWeight:800, color:op.color }}>{op.cnt}</span>
                    </div>
                    <div style={{ height:6, background:"var(--bg)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:p+"%", background:op.color,
                        borderRadius:3, transition:"width .5s ease" }} />
                    </div>
                    <div style={{ fontSize:10, color:"var(--muted)", marginTop:2 }}>{p}% del total</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Estado general */}
          <Card style={{ flex:1 }}>
            <SectionTitle>Estado de procesos</SectionTitle>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, paddingTop:4 }}>
              {Object.entries(ESTADO_CLR).map(function(e){
                var cnt = estadoMap[e[0]] || 0;
                if (cnt === 0) return null;
                return (
                  <div key={e[0]} style={{
                    display:"flex", alignItems:"center", gap:5,
                    padding:"5px 10px", borderRadius:8,
                    background: e[1] + "18",
                    border:"1px solid " + e[1] + "44",
                  }}>
                    <span style={{ width:7, height:7, borderRadius:"50%",
                      background:e[1], flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"var(--ink)", fontWeight:600 }}>{cnt}</span>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>{e[0]}</span>
                  </div>
                );
              })}
              {Object.values(estadoMap).every(function(v){ return !v; }) && (
                <span style={{ fontSize:12, color:"var(--muted)" }}>Sin datos</span>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Fila 3: Asesores + Canal ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16 }}>

        {/* Ranking de asesores */}
        <Card>
          <SectionTitle>Rendimiento por asesor</SectionTitle>
          {asesores.length === 0 ? (
            <div style={{ fontSize:13, color:"var(--muted)", textAlign:"center", padding:"16px 0" }}>
              Sin asesores asignados
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ color:"var(--muted)", fontSize:11 }}>
                    <th style={{ textAlign:"left",  padding:"4px 8px 8px 0", fontWeight:600 }}>Asesor</th>
                    <th style={{ textAlign:"center",padding:"4px 8px 8px",   fontWeight:600 }}>Clientes</th>
                    <th style={{ textAlign:"center",padding:"4px 8px 8px",   fontWeight:600 }}>Prob. prom.</th>
                    <th style={{ textAlign:"right", padding:"4px 0 8px 8px", fontWeight:600 }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {asesores.map(function(a, idx){
                    var barPct = _pct(a.count, maxAsesor);
                    return (
                      <tr key={a.nombre} style={{
                        borderTop:"1px solid var(--line)",
                      }}>
                        <td style={{ padding:"8px 8px 8px 0" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{
                              width:26, height:26, borderRadius:"50%", flexShrink:0,
                              background: ["#2563eb","#7c3aed","#0891b2","#059669"][idx % 4],
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:11, fontWeight:800, color:"#fff",
                            }}>
                              {a.nombre.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, color:"var(--ink)" }}>
                                {a.nombre.split(" ")[0] + " " + (a.nombre.split(" ")[1]||"")}
                              </div>
                              <div style={{ height:3, width:barPct+"%", maxWidth:80,
                                background:["#2563eb","#7c3aed","#0891b2","#059669"][idx%4],
                                borderRadius:2, marginTop:3 }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign:"center", padding:"8px", fontWeight:700,
                          color:"var(--ink)" }}>{a.count}</td>
                        <td style={{ textAlign:"center", padding:"8px" }}>
                          <span style={{
                            padding:"2px 7px", borderRadius:6, fontSize:11, fontWeight:700,
                            background: a.prob >= 60 ? "rgba(34,197,94,.12)" : a.prob >= 35 ? "rgba(234,179,8,.12)" : "rgba(239,68,68,.10)",
                            color:      a.prob >= 60 ? "#15803d"             : a.prob >= 35 ? "#854d0e"             : "#dc2626",
                          }}>{a.prob}%</span>
                        </td>
                        <td style={{ textAlign:"right", padding:"8px 0 8px 8px",
                          color:"var(--muted)", fontVariantNumeric:"tabular-nums" }}>
                          {a.monto > 0 ? $mx(a.monto) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Canal de origen */}
        <Card>
          <SectionTitle>Canal de origen</SectionTitle>
          {canales.length === 0 ? (
            <div style={{ fontSize:13, color:"var(--muted)", textAlign:"center", padding:"16px 0" }}>
              Sin datos de canal
            </div>
          ) : (
            <div style={{ paddingTop:4 }}>
              {canales.map(function(c, i){
                var colors = ["#2563eb","#7c3aed","#0891b2","#059669","#d97706","#9ca3af"];
                return (
                  <HBarRow key={c[0]} label={c[0]} count={c[1]}
                    max={maxCanal} color={colors[i % colors.length]} />
                );
              })}
            </div>
          )}

          {/* Docs pendientes */}
          <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid var(--line)" }}>
            <SectionTitle>Documentación</SectionTitle>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <DonutRing pct={total > 0 ? _pct(total-conDocsPend, total) : 0}
                color="#22c55e" size={52} />
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"var(--ink)" }}>
                  {total > 0 ? _pct(total - conDocsPend, total) : 0}%
                </div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>docs completos</div>
                {conDocsPend > 0 && (
                  <div style={{ fontSize:11, color:"#dc2626", fontWeight:600, marginTop:2 }}>
                    {conDocsPend} pendiente{conDocsPend !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
}

Object.assign(window, { ProcesoVenta });
