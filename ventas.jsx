/* Automind · Proceso de Venta — dashboard con datos de ejemplo */

/* ── Datos de ejemplo ──────────────────────────────────────────── */
const VENTAS_MES = [
  { id:1, unidad:"Toyota Hilux 2024",    vin:"3TMCZ5AN1NM...", vendedor:"Juan Rodríguez",  fecha:"2026-07-01", monto:1350000, diasPiso:34, estado:"VENDIDO" },
  { id:2, unidad:"VW Tiguan 2024",       vin:"3VV2B7AX1NM...", vendedor:"María García",    fecha:"2026-06-30", monto:1180000, diasPiso:41, estado:"VENDIDO" },
  { id:3, unidad:"Nissan Frontier 2023", vin:"1N6AD0EV3NN...", vendedor:"Juan Rodríguez",  fecha:"2026-06-28", monto:1220000, diasPiso:29, estado:"VENDIDO" },
  { id:4, unidad:"Chevrolet Trax 2024",  vin:"KL79MTSL0NB...", vendedor:"María García",    fecha:"2026-06-25", monto:1040000, diasPiso:38, estado:"VENDIDO" },
  { id:5, unidad:"Ford Ranger 2024",     vin:"1FTER4EH0NL...", vendedor:"Carlos López",    fecha:"2026-06-24", monto:1290000, diasPiso:52, estado:"VENDIDO" },
  { id:6, unidad:"Kia Sportage 2024",    vin:"KNDP63A21R7...", vendedor:"Juan Rodríguez",  fecha:"2026-06-22", monto:1160000, diasPiso:47, estado:"VENDIDO" },
  { id:7, unidad:"Honda CR-V 2024",      vin:"7FARW2H81NE...", vendedor:"Ana Martínez",    fecha:"2026-06-20", monto:1100000, diasPiso:61, estado:"VENDIDO" },
  { id:8, unidad:"Mazda CX-5 2024",      vin:"JM3KFBCM1N0...", vendedor:"María García",    fecha:"2026-06-18", monto:1250000, diasPiso:44, estado:"VENDIDO" },
  { id:9, unidad:"Hyundai Tucson 2024",  vin:"5NMS24AF3NH...", vendedor:"Juan Rodríguez",  fecha:"2026-06-15", monto:1130000, diasPiso:39, estado:"VENDIDO" },
  { id:10,unidad:"Toyota RAV4 2023",     vin:"2T3P1RFV8NW...", vendedor:"Carlos López",    fecha:"2026-06-12", monto:1110000, diasPiso:58, estado:"VENDIDO" },
  { id:11,unidad:"VW Golf 2024",         vin:"1VWFE7A37DC...", vendedor:"María García",    fecha:"2026-06-10", monto:630000,  diasPiso:46, estado:"VENDIDO" },
  { id:12,unidad:"Nissan Kicks 2024",    vin:"3N1CP5CU8NL...", vendedor:"Juan Rodríguez",  fecha:"2026-06-08", monto:690000,  diasPiso:33, estado:"VENDIDO" },
];

const RANKING_VENDEDORES = [
  { nombre:"Juan Rodríguez", unidades:5, monto:5550000, diasProm:36, meta:6 },
  { nombre:"María García",   unidades:4, monto:4100000, diasProm:42, meta:5 },
  { nombre:"Carlos López",   unidades:2, monto:2400000, diasProm:55, meta:4 },
  { nombre:"Ana Martínez",   unidades:1, monto:1100000, diasProm:61, meta:3 },
];

const INVENTARIO_ESTADOS = { disponibles:38, apartados:6, vendidosMes:12 };

/* ── Helpers ────────────────────────────────────────────────────── */
const $m = (v) => "$" + Math.round(v).toLocaleString("es-MX");
const $u = (v) => v + (v === 1 ? " unidad" : " unidades");

function fmtFecha(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day:"2-digit", month:"short" });
}

function Kpi({ label, value, sub, color }) {
  return (
    <div className="dkpi">
      <div className="dkpi-label">{label}</div>
      <div className="dkpi-value" style={{ color: color || "var(--ink)", fontSize:22 }}>{value}</div>
      {sub && <div className="dkpi-sub">{sub}</div>}
    </div>
  );
}

/* ── Barra de distribución ──────────────────────────────────────── */
function DistribucionBar() {
  const { disponibles, apartados, vendidosMes } = INVENTARIO_ESTADOS;
  const total = disponibles + apartados + vendidosMes;
  const segs = [
    { label:"Disponibles", n:disponibles, color:"#22c55e" },
    { label:"Apartados",   n:apartados,   color:"#f97316" },
    { label:"Vendidos",    n:vendidosMes, color:"#8b5cf6" },
  ];
  return (
    <div>
      <div style={{ display:"flex", borderRadius:6, overflow:"hidden", height:12, gap:2, marginBottom:10 }}>
        {segs.map(s => (
          <div key={s.label} style={{ width:`${(s.n/total)*100}%`, background:s.color }} />
        ))}
      </div>
      <div style={{ display:"flex", gap:16 }}>
        {segs.map(s => (
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, display:"inline-block", flexShrink:0 }} />
            <span style={{ fontSize:12, color:"var(--muted)" }}>{s.label}</span>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Ranking vendedores ─────────────────────────────────────────── */
function RankingVendedores() {
  const max = Math.max(...RANKING_VENDEDORES.map(v => v.unidades));
  const medallas = ["🥇","🥈","🥉",""];
  return (
    <div className="dcard">
      <div className="dcard-h">
        <span className="dcard-title">Ranking de vendedores</span>
        <span className="dcard-badge">Julio 2026</span>
      </div>
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {RANKING_VENDEDORES.map((v, i) => {
          const pct = Math.round((v.unidades / v.meta) * 100);
          const barPct = Math.round((v.unidades / max) * 100);
          return (
            <div key={v.nombre}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16, width:22, textAlign:"center" }}>{medallas[i]}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{v.nombre}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{$m(v.monto)} · prom. {v.diasProm} días</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:18, fontWeight:800, color: v.unidades >= v.meta ? "#1f9d57" : "var(--ink)" }}>
                    {v.unidades}
                  </span>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>/{v.meta}</span>
                </div>
              </div>
              <div style={{ height:5, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:3,
                  width: barPct + "%",
                  background: pct >= 100 ? "#1f9d57" : pct >= 70 ? "#d99613" : "#2f6fed",
                  transition:"width .4s ease"
                }} />
              </div>
              <div style={{ fontSize:10, color:"var(--muted)", marginTop:3, textAlign:"right" }}>
                {pct}% de meta
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tabla de ventas recientes ──────────────────────────────────── */
function TablaVentas({ rows }) {
  return (
    <div className="dcard">
      <div className="dcard-h">
        <span className="dcard-title">Ventas del mes</span>
        <span className="dcard-badge">{rows.length} registros</span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"var(--bg)" }}>
              {["Unidad","Vendedor","Fecha","Días piso","Monto"].map(h => (
                <th key={h} style={{ padding:"7px 14px", textAlign:"left", fontSize:11,
                  fontWeight:700, color:"var(--muted)", borderBottom:"1px solid var(--line)",
                  whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom:"1px solid var(--line)",
                background: i % 2 === 0 ? "transparent" : "var(--bg)" }}>
                <td style={{ padding:"9px 14px", color:"var(--ink)", fontWeight:600 }}>{r.unidad}</td>
                <td style={{ padding:"9px 14px", color:"var(--muted)" }}>{r.vendedor}</td>
                <td style={{ padding:"9px 14px", color:"var(--muted)", whiteSpace:"nowrap" }}>{fmtFecha(r.fecha)}</td>
                <td style={{ padding:"9px 14px", textAlign:"center" }}>
                  <span style={{
                    background: r.diasPiso <= 40 ? "#dcfce7" : r.diasPiso <= 55 ? "#fef9c3" : "#fee2e2",
                    color:      r.diasPiso <= 40 ? "#166534" : r.diasPiso <= 55 ? "#854d0e" : "#991b1b",
                    fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20
                  }}>{r.diasPiso}d</span>
                </td>
                <td style={{ padding:"9px 14px", fontWeight:700, color:"var(--ink)", textAlign:"right", whiteSpace:"nowrap" }}>
                  {$m(r.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Vista principal ────────────────────────────────────────────── */
function ProcesoVenta({ rows, kpis, usuarios }) {
  const totalMonto   = VENTAS_MES.reduce((s, v) => s + v.monto, 0);
  const ticketProm   = Math.round(totalMonto / VENTAS_MES.length);
  const diasProm     = Math.round(VENTAS_MES.reduce((s, v) => s + v.diasPiso, 0) / VENTAS_MES.length);

  return (
    <div style={{ padding:"24px 28px", maxWidth:1100, margin:"0 auto" }}>

      {/* Encabezado */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:"0 0 3px", fontSize:22, fontWeight:800 }}>Proceso de Venta</h1>
        <p style={{ margin:0, color:"var(--muted)", fontSize:14 }}>
          Métricas del mes · Julio 2026 · <span style={{ color:"#8b5cf6", fontWeight:600 }}>Datos de ejemplo</span>
        </p>
      </div>

      {/* KPIs */}
      <div className="dkpi-grid" style={{ marginBottom:16 }}>
        <Kpi label="Vendidos este mes"   value={VENTAS_MES.length}    sub="unidades" color="#8b5cf6" />
        <Kpi label="Monto total"         value={$m(totalMonto)}       sub="en ventas" />
        <Kpi label="Ticket promedio"     value={$m(ticketProm)}       sub="por unidad" />
        <Kpi label="Días prom. en piso"  value={diasProm + " días"}   sub="antes de venta"
          color={diasProm <= 45 ? "#1f9d57" : diasProm <= 60 ? "#d99613" : "#e0492f"} />
      </div>

      {/* Distribución del inventario */}
      <div className="dcard" style={{ marginBottom:16 }}>
        <div className="dcard-h">
          <span className="dcard-title">Estado del inventario</span>
          <span className="dcard-badge">
            {INVENTARIO_ESTADOS.disponibles + INVENTARIO_ESTADOS.apartados + INVENTARIO_ESTADOS.vendidosMes} unidades totales
          </span>
        </div>
        <div style={{ padding:"14px 16px" }}>
          <DistribucionBar />
        </div>
      </div>

      {/* Ranking + tabla */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16, alignItems:"start" }}>
        <RankingVendedores />
        <TablaVentas rows={VENTAS_MES.slice(0, 8)} />
      </div>

      {/* Aviso datos dummy */}
      <div style={{ marginTop:20, padding:"10px 16px", background:"#fef9c3", border:"1px solid #fde047",
        borderRadius:8, fontSize:12, color:"#854d0e", display:"flex", alignItems:"center", gap:8 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
          strokeLinejoin="round" width="15" height="15" style={{ flexShrink:0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Esta vista muestra datos de ejemplo. La integración con datos reales se conectará al módulo de inventario cuando se active el flujo de venta.
      </div>

    </div>
  );
}

Object.assign(window, { ProcesoVenta });
