/* Automind · CRM de Clientes — Pipeline de ventas */

/* ── Configuración de etapas ─────────────────────────────────────────── */
const ETAPAS_CRM = [
  "Prospección","Perfilamiento","Presentación","Cotización",
  "Expediente","Pago","Crédito","Cierre"
];

const ETAPA_CFG = {
  "Prospección":   { bg:"#dbeafe", txt:"#1d4ed8", dot:"#3b82f6" },
  "Perfilamiento": { bg:"#f3e8ff", txt:"#6d28d9", dot:"#8b5cf6" },
  "Presentación":  { bg:"#ffedd5", txt:"#c2410c", dot:"#f97316" },
  "Cotización":    { bg:"#fef9c3", txt:"#854d0e", dot:"#eab308" },
  "Expediente":    { bg:"#fce7f3", txt:"#9d174d", dot:"#ec4899" },
  "Pago":          { bg:"#dcfce7", txt:"#166534", dot:"#22c55e" },
  "Crédito":       { bg:"#fef3c7", txt:"#92400e", dot:"#f59e0b" },
  "Cierre":        { bg:"#d1fae5", txt:"#065f46", dot:"#059669" },
};

/* ── 20 clientes de muestra ──────────────────────────────────────────── */
function _dsc(iso) {
  if (!iso) return 99;
  return Math.round((new Date() - new Date(iso + "T12:00:00")) / 86400000);
}
function _fmtFechaCRM(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"2-digit" });
}

const CLIENTES_DUMMY = [
  { id:"c01", nombre:"Carlos Méndez Ruiz",        tel:"555-234-1000", email:"c.mendez@gmail.com",       tipo:"Persona física", canal:"Digital",     fuente:"Facebook Ads",       interes:"Toyota Hilux 2024",     presupuesto:1350000, formaPago:"Crédito",    uso:"Trabajo",  etapa:"Cotización",    asesor:"Juan Rodríguez", prob:60, uc:"2026-06-28", ciudad:"Monterrey",   estado:"N.L.",  prox:"Enviar cotización actualizada",     fprox:"2026-07-03", notas:"Interesado en negro, preguntó por plan Toyota." },
  { id:"c02", nombre:"María Elena Soto García",    tel:"555-876-2200", email:"mesoto@outlook.com",       tipo:"Persona física", canal:"Piso",        fuente:"Visita directa",      interes:"VW Tiguan 2024",        presupuesto:1180000, formaPago:"Contado",    uso:"Familiar", etapa:"Presentación",  asesor:"María García",   prob:70, uc:"2026-06-30", ciudad:"Guadalajara", estado:"Jal.",  prox:"Agendar prueba de manejo",          fprox:"2026-07-02", notas:"Vino con su esposo. Quieren asientos de piel." },
  { id:"c03", nombre:"Alejandro Gutiérrez Luna",   tel:"555-445-3300", email:"alex.gl@hotmail.com",      tipo:"Persona física", canal:"Referido",    fuente:"Ref. Carlos M.",       interes:"Nissan Frontier 2023",  presupuesto:1100000, formaPago:"Crédito",    uso:"Trabajo",  etapa:"Perfilamiento", asesor:"Carlos López",   prob:50, uc:"2026-06-29", ciudad:"Monterrey",   estado:"N.L.",  prox:"Solicitar documentos de crédito",   fprox:"2026-07-04", notas:"Empresa de construcción, necesita 3 camionetas." },
  { id:"c04", nombre:"Patricia Morales Vega",      tel:"555-312-4400", email:"pmorales@yahoo.com",       tipo:"Persona física", canal:"Digital",     fuente:"Google Ads",          interes:"Chevrolet Trax 2024",   presupuesto: 680000, formaPago:"No definido",uso:"Personal", etapa:"Prospección",   asesor:"Ana Martínez",   prob:20, uc:"2026-06-25", ciudad:"CDMX",        estado:"CDMX",  prox:"Llamar para conocer necesidades",   fprox:"2026-07-01", notas:"Dejó datos en formulario web. Sin contacto previo." },
  { id:"c05", nombre:"Roberto Hernández Castro",   tel:"555-567-5500", email:"rh.castro@gmail.com",      tipo:"Persona moral",  canal:"Marketplace", fuente:"MercadoAutos",        interes:"Ford Ranger 2024",      presupuesto:1290000, formaPago:"Crédito",    uso:"Trabajo",  etapa:"Expediente",    asesor:"Juan Rodríguez", prob:80, uc:"2026-07-01", ciudad:"San Pedro",   estado:"N.L.",  prox:"Recibir acta constitutiva",         fprox:"2026-07-05", notas:"Empresa de logística. RFC requerido." },
  { id:"c06", nombre:"Lucía Ramírez Torres",       tel:"555-789-6600", email:"lucia.rt@icloud.com",      tipo:"Persona física", canal:"Piso",        fuente:"Visita directa",      interes:"Kia Sportage 2024",     presupuesto:1160000, formaPago:"Crédito",    uso:"Familiar", etapa:"Cotización",    asesor:"María García",   prob:55, uc:"2026-06-27", ciudad:"Guadalajara", estado:"Jal.",  prox:"Comparar con Honda CR-V",           fprox:"2026-07-03", notas:"Decidida entre Kia y Honda. Precio es clave." },
  { id:"c07", nombre:"Fernando Castillo Ponce",    tel:"555-901-7700", email:"fcastillo@gmail.com",      tipo:"Persona física", canal:"Digital",     fuente:"Instagram",           interes:"Honda CR-V 2024",       presupuesto:1100000, formaPago:"Contado",    uso:"Personal", etapa:"Perfilamiento", asesor:"Ana Martínez",   prob:40, uc:"2026-06-30", ciudad:"Querétaro",   estado:"Qro.", prox:"Agendar demostración 360°",        fprox:"2026-07-02", notas:"Viaja mucho. Quiere rastreo GPS incluido." },
  { id:"c08", nombre:"Daniela Flores Ortega",      tel:"555-234-8800", email:"dflores@protonmail.com",   tipo:"Persona física", canal:"Referido",    fuente:"Ref. María García",   interes:"Mazda CX-5 2024",       presupuesto:1250000, formaPago:"Crédito",    uso:"Familiar", etapa:"Prospección",   asesor:"Juan Rodríguez", prob:15, uc:"2026-06-20", ciudad:"Monterrey",   estado:"N.L.",  prox:"Enviar brochure digital",           fprox:"2026-07-02", notas:"Primera vez comprando, necesita orientación." },
  { id:"c09", nombre:"Jorge Alberto Núñez",        tel:"555-678-9900", email:"janunez@gmail.com",        tipo:"Persona física", canal:"Piso",        fuente:"Visita directa",      interes:"Hyundai Tucson 2024",   presupuesto:1130000, formaPago:"Crédito",    uso:"Familiar", etapa:"Pago",          asesor:"Carlos López",   prob:90, uc:"2026-07-01", ciudad:"Saltillo",    estado:"Coah.", prox:"Confirmar depósito inicial",        fprox:"2026-07-02", notas:"Cheque ya emitido, pendiente depositar." },
  { id:"c10", nombre:"Sofía Delgado Ibarra",       tel:"555-112-1010", email:"sofia.di@gmail.com",       tipo:"Persona física", canal:"Digital",     fuente:"TikTok",              interes:"Toyota RAV4 2023",      presupuesto:1110000, formaPago:"No definido",uso:"Personal", etapa:"Prospección",   asesor:"Ana Martínez",   prob:10, uc:"2026-06-22", ciudad:"CDMX",        estado:"CDMX",  prox:"Primer llamada de seguimiento",     fprox:"2026-07-01", notas:"Vio video en TikTok. Primera compra." },
  { id:"c11", nombre:"Miguel Ángel Pérez Sala",    tel:"555-345-1111", email:"maperez@gmail.com",        tipo:"Persona física", canal:"Piso",        fuente:"Visita directa",      interes:"VW Golf 2024",          presupuesto: 630000, formaPago:"Contado",    uso:"Personal", etapa:"Cierre",        asesor:"María García",   prob:95, uc:"2026-07-01", ciudad:"Guadalajara", estado:"Jal.",  prox:"Firmar contrato y agendar entrega", fprox:"2026-07-03", notas:"Todo aprobado. Solo falta firma." },
  { id:"c12", nombre:"Gabriela López Montes",      tel:"555-678-1212", email:"glopez@hotmail.com",       tipo:"Persona física", canal:"Digital",     fuente:"Facebook Ads",        interes:"Nissan Kicks 2024",     presupuesto: 690000, formaPago:"Crédito",    uso:"Personal", etapa:"Perfilamiento", asesor:"Juan Rodríguez", prob:35, uc:"2026-06-28", ciudad:"Culiacán",    estado:"Sin.", prox:"Evaluar enganche mínimo",           fprox:"2026-07-04", notas:"Busca mensualidad baja. Enganche limitado." },
  { id:"c13", nombre:"Diego Martínez Vera",        tel:"555-901-1313", email:"dmv@protonmail.com",       tipo:"Persona física", canal:"Marketplace", fuente:"Kavak",               interes:"Toyota Hilux 2024",     presupuesto:1400000, formaPago:"Contado",    uso:"Trabajo",  etapa:"Cotización",    asesor:"Carlos López",   prob:65, uc:"2026-06-25", ciudad:"Chihuahua",   estado:"Chih.", prox:"Negociar precio final",             fprox:"2026-07-02", notas:"Comparando vs Ranger. Precio muy sensible." },
  { id:"c14", nombre:"Valentina Rosas Jiménez",    tel:"555-234-1414", email:"vrosas@icloud.com",        tipo:"Persona física", canal:"Referido",    fuente:"Ref. Fernando C.",     interes:"Honda CR-V 2024",       presupuesto:1050000, formaPago:"Crédito",    uso:"Familiar", etapa:"Presentación",  asesor:"Ana Martínez",   prob:50, uc:"2026-06-30", ciudad:"Querétaro",   estado:"Qro.", prox:"Segunda visita con familia",        fprox:"2026-07-05", notas:"Traerá a los hijos para la decisión." },
  { id:"c15", nombre:"Héctor Gómez Vargas",        tel:"555-567-1515", email:"hgomez@gmail.com",         tipo:"Persona moral",  canal:"Piso",        fuente:"Visita directa",      interes:"Chevrolet Silverado",   presupuesto:1800000, formaPago:"Crédito",    uso:"Trabajo",  etapa:"Expediente",    asesor:"Juan Rodríguez", prob:75, uc:"2026-06-29", ciudad:"Monterrey",   estado:"N.L.",  prox:"Enviar documentos empresa",         fprox:"2026-07-03", notas:"Flota de 2 unidades. Descuento por volumen." },
  { id:"c16", nombre:"Andrea Domínguez Cruz",      tel:"555-789-1616", email:"adominguez@yahoo.com",     tipo:"Persona física", canal:"Digital",     fuente:"Google Ads",          interes:"VW Tiguan 2024",        presupuesto:1200000, formaPago:"No definido",uso:"Personal", etapa:"Prospección",   asesor:"María García",   prob:25, uc:"2026-06-18", ciudad:"Puebla",      estado:"Pue.", prox:"Confirmar disponibilidad color",    fprox:"2026-07-01", notas:"Quiere blanco perlado. Alta demanda ese color." },
  { id:"c17", nombre:"Emilio Vargas Herrera",      tel:"555-012-1717", email:"evargas@gmail.com",        tipo:"Persona física", canal:"Digital",     fuente:"WhatsApp Business",   interes:"Ford Ranger 2024",      presupuesto:1290000, formaPago:"Crédito",    uso:"Trabajo",  etapa:"Crédito",       asesor:"Carlos López",   prob:85, uc:"2026-07-01", ciudad:"Torreón",     estado:"Coah.", prox:"Esperar resolución banco",          fprox:"2026-07-07", notas:"En revisión con Scotiabank. Buen historial." },
  { id:"c18", nombre:"Natalia Reyes Alvarado",     tel:"555-345-1818", email:"nreyes@hotmail.com",       tipo:"Persona física", canal:"Piso",        fuente:"Visita directa",      interes:"Kia Sportage 2024",     presupuesto: 980000, formaPago:"Contado",    uso:"Familiar", etapa:"Perfilamiento", asesor:"Ana Martínez",   prob:45, uc:"2026-06-26", ciudad:"Mérida",      estado:"Yuc.", prox:"Confirmar color y accesorios",      fprox:"2026-07-04", notas:"Pago en efectivo. Decide en una semana." },
  { id:"c19", nombre:"Rodrigo Castañeda Lima",     tel:"555-678-1919", email:"rcastaneda@gmail.com",     tipo:"Persona física", canal:"Referido",    fuente:"Ref. Diego M.",        interes:"Toyota RAV4 2024",      presupuesto:1100000, formaPago:"Crédito",    uso:"Personal", etapa:"Prospección",   asesor:"Juan Rodríguez", prob:20, uc:"2026-06-15", ciudad:"Guadalajara", estado:"Jal.",  prox:"Enviar información inicial",        fprox:"2026-07-02", notas:"Llegó por referencia. Sin cualificar aún." },
  { id:"c20", nombre:"Isabella Guzmán Prado",      tel:"555-901-2020", email:"iguzman@protonmail.com",   tipo:"Persona física", canal:"Marketplace", fuente:"AutoTrader",          interes:"Mazda CX-5 2024",       presupuesto:1280000, formaPago:"Crédito",    uso:"Personal", etapa:"Presentación",  asesor:"María García",   prob:60, uc:"2026-06-29", ciudad:"CDMX",        estado:"CDMX",  prox:"Cotizar garantía extendida",        fprox:"2026-07-03", notas:"Muy detallista. Preguntó por garantía y seguro." },
];

/* ── Componentes pequeños ─────────────────────────────────────────────── */
function EtapaBadge({ etapa }) {
  const c = ETAPA_CFG[etapa] || { bg:"#f3f4f6", txt:"#4b5563", dot:"#9ca3af" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 9px",
      borderRadius:20, fontSize:11, fontWeight:700, background:c.bg, color:c.txt, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }} />
      {etapa}
    </span>
  );
}

function CanalTag({ canal }) {
  const colores = { "Digital":"#3b82f6","Piso":"#8b5cf6","Referido":"#22c55e","Marketplace":"#f59e0b","Otro":"#94a3b8" };
  const color = colores[canal] || "#94a3b8";
  return (
    <span style={{ display:"inline-flex", padding:"1px 8px", borderRadius:20, fontSize:10,
      fontWeight:700, background:color + "1a", color, whiteSpace:"nowrap" }}>
      {canal}
    </span>
  );
}

function DiasTag({ dias }) {
  const color = dias === 0 ? "#22c55e" : dias <= 3 ? "#d99613" : "#e0492f";
  const bg    = dias === 0 ? "#dcfce7" : dias <= 3 ? "#fef9c3" : "#fee2e2";
  return (
    <span style={{ display:"inline-flex", padding:"1px 8px", borderRadius:20, fontSize:11,
      fontWeight:700, background:bg, color }}>
      {dias === 0 ? "hoy" : dias + "d"}
    </span>
  );
}

function ProbBar({ valor }) {
  const color = valor >= 70 ? "#22c55e" : valor >= 40 ? "#d99613" : "#e0492f";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:5, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:valor + "%", background:color, borderRadius:3, transition:"width .4s" }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:28 }}>{valor}%</span>
    </div>
  );
}

function Ini({ nombre, bg }) {
  const iniciales = nombre.split(" ").slice(0,2).map(w => w[0] || "").join("").toUpperCase();
  return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:bg || "var(--accent)",
      color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:12, fontWeight:700, flexShrink:0 }}>
      {iniciales}
    </div>
  );
}

/* ── Stats top bar ────────────────────────────────────────────────────── */
function StatsBar({ clientes }) {
  const total      = clientes.length;
  const urgentes   = clientes.filter(c => _dsc(c.uc) > 3).length;
  const enCierre   = clientes.filter(c => ["Cierre","Pago","Expediente"].includes(c.etapa)).length;
  const probProm   = total > 0 ? Math.round(clientes.reduce((s, c) => s + c.prob, 0) / total) : 0;

  const stat = (label, value, color) => (
    <div className="dkpi">
      <div className="dkpi-label">{label}</div>
      <div className="dkpi-value" style={{ color: color || "var(--ink)", fontSize:22 }}>{value}</div>
    </div>
  );

  return (
    <div className="dkpi-grid" style={{ marginBottom:16 }}>
      {stat("Total clientes",     total)}
      {stat("Seguimiento urgente",urgentes,   urgentes > 0 ? "#e0492f" : "#1f9d57")}
      {stat("En etapa avanzada",  enCierre,   enCierre > 0 ? "#1f9d57" : "var(--muted)")}
      {stat("Prob. promedio",     probProm + "%", probProm >= 60 ? "#1f9d57" : probProm >= 35 ? "#d99613" : "#e0492f")}
    </div>
  );
}

/* ── Kanban ───────────────────────────────────────────────────────────── */
function KanbanCard({ c, onClick }) {
  const dias = _dsc(c.uc);
  const avColores = ["#2f6fed","#1f9d57","#d99613","#e0492f","#7c3aed"];
  const av = avColores[["Juan Rodríguez","María García","Carlos López","Ana Martínez"].indexOf(c.asesor) % 5] || "#2f6fed";
  return (
    <div onClick={() => onClick(c)} style={{
      background:"var(--card)", border:"1px solid var(--line)", borderRadius:10,
      padding:"12px 14px", cursor:"pointer", transition:"box-shadow .15s",
      display:"flex", flexDirection:"column", gap:8,
    }}
    onMouseOver={e => e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.08)"}
    onMouseOut={e => e.currentTarget.style.boxShadow="none"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)", lineHeight:1.3 }}>{c.nombre}</span>
        <DiasTag dias={dias} />
      </div>
      <div style={{ fontSize:11, color:"var(--muted)", display:"flex", gap:5, alignItems:"center" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.5L21 13v2.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>
        {c.interes}
      </div>
      <div style={{ fontSize:12, color:"var(--ink-2)", fontWeight:600 }}>
        ${(c.presupuesto / 1000000).toFixed(2)}M · {c.formaPago}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
        <CanalTag canal={c.canal} />
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <Ini nombre={c.asesor} bg={av} />
          <span style={{ fontSize:10, color:"var(--muted)" }}>{c.asesor.split(" ")[0]}</span>
        </div>
      </div>
      <ProbBar valor={c.prob} />
    </div>
  );
}

function KanbanView({ clientes, onOpen }) {
  return (
    <div style={{ overflowX:"auto", paddingBottom:12 }}>
      <div style={{ display:"flex", gap:12, minWidth:"max-content", alignItems:"flex-start" }}>
        {ETAPAS_CRM.map(etapa => {
          const cols = clientes.filter(c => c.etapa === etapa);
          const cfg  = ETAPA_CFG[etapa];
          return (
            <div key={etapa} style={{ width:220, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8,
                padding:"5px 10px", borderRadius:7, background:cfg.bg }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
                <span style={{ fontSize:11, fontWeight:700, color:cfg.txt, flex:1 }}>{etapa}</span>
                <span style={{ fontSize:11, fontWeight:700, color:cfg.txt, background:"rgba(0,0,0,.08)",
                  borderRadius:20, padding:"1px 7px" }}>{cols.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {cols.length === 0 ? (
                  <div style={{ border:"1.5px dashed var(--line)", borderRadius:10, padding:"20px 12px",
                    textAlign:"center", color:"var(--muted)", fontSize:12 }}>
                    Sin clientes
                  </div>
                ) : cols.map(c => <KanbanCard key={c.id} c={c} onClick={onOpen} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Lista (grid estilo inventario) ──────────────────────────────────── */
const COLS_CRM = [
  { key:"nombre",      titulo:"Nombre",             w:210 },
  { key:"etapa",       titulo:"Etapa",              w:130 },
  { key:"interes",     titulo:"Vehículo",           w:175 },
  { key:"presupuesto", titulo:"Presupuesto",        w:110, align:"right" },
  { key:"formaPago",   titulo:"Pago",               w:90  },
  { key:"prob",        titulo:"Prob.",              w:100, align:"center" },
  { key:"asesor",      titulo:"Asesor",             w:115 },
  { key:"uc",          titulo:"Sin contacto",       w:100, align:"center" },
  { key:"ciudad",      titulo:"Ciudad",             w:100 },
  { key:"prox",        titulo:"Próxima acción",     w:260 },
];

function ListaGrid({ clientes, onOpen }) {
  const [filtroEtapa, setFiltroEtapa] = React.useState("");
  const [sort, setSort] = React.useState({ key:"uc", dir:1 });

  const toggleSort = (key) =>
    setSort(prev => prev.key === key ? { key, dir: -prev.dir } : { key, dir: 1 });

  const filtered = filtroEtapa ? clientes.filter(c => c.etapa === filtroEtapa) : clientes;

  const sorted = [...filtered].sort((a, b) => {
    let va = a[sort.key], vb = b[sort.key];
    if (sort.key === "uc") { va = _dsc(a.uc); vb = _dsc(b.uc); }
    if (sort.key === "presupuesto" || sort.key === "prob") { va = Number(va); vb = Number(vb); }
    if (typeof va === "string") return sort.dir * va.localeCompare(vb, "es");
    return sort.dir * ((va || 0) - (vb || 0));
  });

  const thStyle = (col) => ({
    width: col.w, padding:"6px 11px", textAlign: col.align || "left",
    fontSize:11, fontWeight:700, color:"var(--muted)", cursor:"pointer",
    userSelect:"none", whiteSpace:"nowrap", position:"sticky", top:0,
    background:"var(--bg)", borderBottom:"1px solid var(--line)",
    borderRight:"1px solid var(--line)",
  });

  const SortIco = ({ ckey }) => {
    if (sort.key !== ckey) return <span style={{ color:"var(--line)", marginLeft:3, fontSize:10 }}>⇅</span>;
    return <span style={{ color:"var(--accent)", marginLeft:3, fontSize:10 }}>{sort.dir > 0 ? "↑" : "↓"}</span>;
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
        <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)}
          style={{ padding:"5px 10px", border:"1px solid var(--line)", borderRadius:7,
            fontSize:12, background:"var(--card)", color:"var(--ink)", fontFamily:"inherit",
            cursor:"pointer", outline:"none" }}>
          <option value="">Todas las etapas</option>
          {ETAPAS_CRM.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span style={{ fontSize:12, color:"var(--muted)", marginLeft:4 }}>
          {sorted.length} cliente{sorted.length !== 1 ? "s" : ""}
          {filtroEtapa ? ` en ${filtroEtapa}` : ""}
        </span>
        <span style={{ fontSize:11, color:"var(--muted)", marginLeft:"auto" }}>
          Clic en columna para ordenar
        </span>
      </div>

      {/* Grid */}
      <div style={{ overflowX:"auto", borderRadius:8, border:"1px solid var(--line)",
        background:"var(--card)", maxHeight:"calc(100vh - 320px)", overflowY:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr>
              {/* columna # */}
              <th style={{ width:38, padding:"6px 8px", textAlign:"center", fontSize:11,
                fontWeight:700, color:"var(--muted)", position:"sticky", top:0,
                background:"var(--bg)", borderBottom:"1px solid var(--line)",
                borderRight:"2px solid var(--line)" }}>#</th>
              {COLS_CRM.map(col => (
                <th key={col.key} style={thStyle(col)} onClick={() => toggleSort(col.key)}>
                  {col.titulo}<SortIco ckey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={COLS_CRM.length + 1}
                style={{ padding:"32px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
                Sin resultados
              </td></tr>
            ) : sorted.map((c, ri) => {
              const dias = _dsc(c.uc);
              const tdB  = { borderRight:"1px solid var(--line)" };
              return (
                <tr key={c.id}
                  onClick={() => onOpen(c)}
                  style={{ borderBottom:"1px solid var(--line)", cursor:"pointer" }}
                  onMouseOver={e => e.currentTarget.style.background = "#f0f4ff"}
                  onMouseOut={e => e.currentTarget.style.background = ""}>

                  {/* # */}
                  <td style={{ padding:"5px 8px", textAlign:"center", fontSize:11,
                    color:"var(--muted)", borderRight:"2px solid var(--line)",
                    fontVariantNumeric:"tabular-nums", background:"var(--bg)", userSelect:"none" }}>
                    <span style={{ display:"block" }}>{ri + 1}</span>
                    <span style={{ fontSize:9, color:"var(--accent)", letterSpacing:0 }}>↗</span>
                  </td>

                  {/* Nombre */}
                  <td style={{ padding:"5px 11px", fontWeight:700, color:"var(--ink)",
                    whiteSpace:"nowrap", ...tdB }}>
                    <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontSize:9, fontWeight:800, padding:"1px 4px", borderRadius:3, flexShrink:0,
                        background: c.tipo === "Persona moral" ? "#f3e8ff" : "#eff6ff",
                        color:      c.tipo === "Persona moral" ? "#7c3aed"  : "#1d4ed8" }}>
                        {c.tipo === "Persona moral" ? "PM" : "PF"}
                      </span>
                      {c.nombre}
                    </span>
                  </td>

                  {/* Etapa */}
                  <td style={{ padding:"5px 11px", ...tdB }}>
                    <EtapaBadge etapa={c.etapa} />
                  </td>

                  {/* Vehículo */}
                  <td style={{ padding:"5px 11px", color:"var(--ink-2)",
                    maxWidth:175, overflow:"hidden", textOverflow:"ellipsis",
                    whiteSpace:"nowrap", ...tdB }}>
                    {c.interes || "—"}
                  </td>

                  {/* Presupuesto */}
                  <td style={{ padding:"5px 11px", textAlign:"right", fontWeight:600,
                    color:"var(--ink)", whiteSpace:"nowrap",
                    fontVariantNumeric:"tabular-nums", ...tdB }}>
                    ${(c.presupuesto / 1000).toFixed(0)}k
                  </td>

                  {/* Pago */}
                  <td style={{ padding:"5px 11px", color:"var(--muted)", whiteSpace:"nowrap", ...tdB }}>
                    {c.formaPago}
                  </td>

                  {/* Prob */}
                  <td style={{ padding:"5px 11px", ...tdB }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ flex:1, height:4, background:"var(--line)", borderRadius:3,
                        overflow:"hidden", minWidth:32 }}>
                        <div style={{ height:"100%", width: c.prob + "%", borderRadius:3,
                          background: c.prob >= 70 ? "#22c55e" : c.prob >= 40 ? "#d99613" : "#e0492f" }} />
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, minWidth:26, textAlign:"right",
                        color: c.prob >= 70 ? "#1f9d57" : c.prob >= 40 ? "#d99613" : "#e0492f" }}>
                        {c.prob}%
                      </span>
                    </div>
                  </td>

                  {/* Asesor */}
                  <td style={{ padding:"5px 11px", color:"var(--muted)", whiteSpace:"nowrap", ...tdB }}>
                    {c.asesor.split(" ")[0]}
                  </td>

                  {/* Sin contacto */}
                  <td style={{ padding:"5px 11px", textAlign:"center", ...tdB }}>
                    <DiasTag dias={dias} />
                  </td>

                  {/* Ciudad */}
                  <td style={{ padding:"5px 11px", color:"var(--muted)", whiteSpace:"nowrap", ...tdB }}>
                    {c.ciudad || "—"}
                  </td>

                  {/* Próxima acción */}
                  <td style={{ padding:"5px 11px", color:"var(--muted)", fontSize:11,
                    maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.prox}
                    {c.fprox && (
                      <span style={{ marginLeft:5,
                        color: _dsc(c.fprox) < 0 ? "#e0492f" : "var(--line)" }}>
                        · {_fmtFechaCRM(c.fprox)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Urgentes ─────────────────────────────────────────────────────────── */
function UrgentesView({ clientes, onOpen }) {
  const urgentes = clientes
    .filter(c => _dsc(c.uc) > 3)
    .sort((a, b) => _dsc(b.uc) - _dsc(a.uc));

  if (urgentes.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
        <div style={{ fontSize:15, fontWeight:700 }}>Sin seguimiento pendiente</div>
        <div style={{ fontSize:13, marginTop:6 }}>Todos los clientes tienen contacto reciente (≤ 3 días).</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:12, fontSize:13, color:"#e0492f", fontWeight:600, display:"flex", alignItems:"center", gap:7 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {urgentes.length} cliente{urgentes.length !== 1 ? "s" : ""} sin contacto por más de 3 días
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
        {urgentes.map(c => {
          const dias = _dsc(c.uc);
          const cfg  = ETAPA_CFG[c.etapa] || {};
          return (
            <div key={c.id} onClick={() => onOpen(c)} style={{
              background:"var(--card)", border:"1.5px solid #fecaca", borderRadius:10,
              padding:"14px 16px", cursor:"pointer", transition:"box-shadow .15s",
              display:"flex", flexDirection:"column", gap:10,
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(224,73,47,.12)"}
            onMouseOut={e => e.currentTarget.style.boxShadow="none"}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>{c.nombre}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
                    {c.asesor} · {c.ciudad}
                  </div>
                </div>
                <span style={{ background:"#fee2e2", color:"#991b1b", fontSize:12, fontWeight:700,
                  padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
                  {dias}d sin contacto
                </span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <EtapaBadge etapa={c.etapa} />
                <span style={{ fontSize:12, color:"var(--ink-2)", fontWeight:600 }}>{c.interes}</span>
              </div>
              <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:7, padding:"8px 10px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#c2410c", textTransform:"uppercase", letterSpacing:".05em", marginBottom:3 }}>
                  Próxima acción
                </div>
                <div style={{ fontSize:12, color:"var(--ink-2)" }}>
                  {c.prox} · <span style={{ color:"#c2410c", fontWeight:600 }}>{_fmtFechaCRM(c.fprox)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Item de cliente en panel lateral ───────────────────────────────────── */
function ClienteListItem({ c, active, onClick }) {
  const cfg = ETAPA_CFG[c.etapa] || { dot:"#94a3b8" };
  const avColores = ["#2f6fed","#8b5cf6","#1f9d57","#d97706","#e0492f"];
  const avColor = avColores[c.nombre.charCodeAt(0) % avColores.length];
  const initials = c.nombre.split(" ").filter(Boolean).slice(0,2).map(w => w[0] || "").join("").toUpperCase();
  return (
    <button className={"vie-item" + (active ? " active" : "")} onClick={onClick}>
      <div className="vie-thumb">
        <div className="vie-thumb-ph" style={{
          background:avColor, color:"#fff", fontSize:13, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center",
          width:"100%", height:"100%", borderRadius:8,
        }}>
          {initials}
        </div>
      </div>
      <div className="vie-meta">
        <div className="vie-vin" style={{ fontFamily:"inherit" }}>{c.tel || c.email || c.canal}</div>
        <div className="vie-desc">{c.nombre}</div>
        <div className="vie-sub">{c.interes || "Sin vehículo de interés"}</div>
      </div>
      <span className="vie-dot" style={{ background:cfg.dot }} title={c.etapa} />
    </button>
  );
}

/* ── Etiquetas legibles de campos extraídos ──────────────────────────────── */
const CAMPO_LABEL = {
  nombre:"Nombre", apellidoPaterno:"Apellido paterno", apellidoMaterno:"Apellido materno",
  curp:"CURP", rfc:"RFC", fechaNacimiento:"Fecha de nacimiento", sexo:"Sexo",
  direccion:"Dirección", colonia:"Colonia", ciudad:"Ciudad", estado:"Estado",
  cp:"C.P.", fechaDocumento:"Período del recibo",
};

/* Renderiza la primera página de un PDF a JPEG usando PDF.js (cargado en index.html) */
function _pdfToImageDataUrl(dataUrl) {
  return new Promise(function(resolve, reject) {
    var pdfjsLib = window["pdfjs-dist/build/pdf"];
    if (!pdfjsLib) { reject(new Error("PDF.js no disponible - recarga la pagina")); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
    pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
      pdf.getPage(1).then(function(page) {
        var viewport = page.getViewport({ scale: 2.0 });
        var canvas = document.createElement("canvas");
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise
          .then(function() { resolve(canvas.toDataURL("image/jpeg", 0.88)); })
          .catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
}

/* Redimensiona una imagen a máx. 1200px para no saturar la Edge Function */
function _resizeDataUrl(dataUrl, mimeType) {
  return new Promise(function(resolve) {
    if (mimeType === "application/pdf") { resolve(dataUrl); return; }
    var img = new Image();
    img.onload = function() {
      var MAX = 1200;
      var w = img.width, h = img.height;
      if (w <= MAX && h <= MAX) { resolve(dataUrl); return; }
      var ratio = Math.min(MAX / w, MAX / h);
      w = Math.round(w * ratio); h = Math.round(h * ratio);
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = function() { resolve(dataUrl); };
    img.src = dataUrl;
  });
}

/* ── Helper: convierte dataUrl a Blob sin fetch() ───────────────────────── */
function _dataUrlToBlob(dataUrl) {
  var arr  = dataUrl.split(",");
  var mime = arr[0].match(/:(.*?);/)[1];
  var raw  = atob(arr[1]);
  var buf  = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

/* ── Zona de carga de documento con extracción IA ────────────────────────── */
function DocUpload({ label, sublabel, docType, value, onChange, onExtract }) {
  const [dragging,    setDragging]    = React.useState(false);
  const [extrayendo,  setExtrayendo]  = React.useState(false);
  const [campos,      setCampos]      = React.useState(null);   // null | {} | {k:v}
  const [errExt,      setErrExt]      = React.useState(null);
  const [subiendoDoc, setSubiendoDoc] = React.useState(false);
  const inputRef = React.useRef(null);

  /* Resetear extracción cuando el doc cambia */
  React.useEffect(() => { setCampos(null); setErrExt(null); }, [value && value.name]);

  async function _uploadDocToStorage(file, dataUrl) {
    try {
      if (!window.DB || !window.DB.storage) return null;
      var ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
      var key  = "clientes/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      var blob = _dataUrlToBlob(dataUrl);
      var { error } = await window.DB.storage
        .from("expedientes")
        .upload(key, blob, { contentType: file.type, upsert: false });
      if (error) throw error;
      return key;
    } catch(e) {
      console.warn("DocUpload storage upload failed:", e.message);
      return null;
    }
  }

  function handleFile(file) {
    if (!file) return;
    var allowed = ["image/jpeg","image/jpg","image/png","application/pdf"];
    if (!allowed.includes(file.type)) { alert("Formato no permitido. Usa JPG, PNG o PDF."); return; }
    var reader = new FileReader();
    reader.onload = async function(e) {
      var dataUrl = e.target.result;
      var fileData = { name: file.name, type: file.type, dataUrl: dataUrl, cargadoEn: new Date().toISOString() };
      onChange(fileData);           // inmediato — disponible para OCR
      setSubiendoDoc(true);
      var key = await _uploadDocToStorage(file, dataUrl);
      setSubiendoDoc(false);
      if (key) onChange({ ...fileData, storageKey: key });
    };
    reader.readAsDataURL(file);
  }

  async function extraer() {
    if (!value || extrayendo) return;
    setExtrayendo(true); setCampos(null); setErrExt(null);
    try {
      /* Si es PDF, renderizar pagina 1 a imagen antes de enviar */
      var rawUrl  = value.dataUrl;
      var rawMime = value.type;
      if (value.type === "application/pdf") {
        rawUrl  = await _pdfToImageDataUrl(value.dataUrl);
        rawMime = "image/jpeg";
      }
      var dataUrlEnviar = await _resizeDataUrl(rawUrl, rawMime);
      var supaUrl  = window.SUPABASE_URL;
      var supaAnon = window.SUPABASE_ANON;
      var resp = await fetch(supaUrl + "/functions/v1/extract-document", {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":"Bearer " + supaAnon },
        body: JSON.stringify({ dataUrl: dataUrlEnviar, mimeType: rawMime, docType: docType }),
      });
      var data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error en el servidor");
      setCampos(data.campos || {});
    } catch(e) {
      setErrExt(e.message || "Error al extraer");
    } finally {
      setExtrayendo(false);
    }
  }

  function aplicar() {
    if (onExtract && campos) onExtract(campos);
    setCampos(null);
  }

  var isSaved = !!(value && value.storageKey && !value.dataUrl);
  var isImage = value && value.type && value.type.startsWith("image/");
  var tieneCampos = campos && Object.keys(campos).length > 0;

  var btnBase = { fontSize:11, fontWeight:600, border:"none", background:"none",
    cursor:"pointer", padding:"2px 6px", flexShrink:0, borderRadius:4 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

      {/* Etiqueta */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <span style={{ fontSize:12, fontWeight:700, color:"var(--ink-2)" }}>{label}</span>
        {sublabel && <span style={{ fontSize:10, color:"var(--muted)" }}>{sublabel}</span>}
      </div>

      {value ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

          {/* ── Preview ── */}
          <div style={{ border:"1px solid var(--line)", borderRadius:9, overflow:"hidden", background:"var(--bg)" }}>

            {isSaved ? (
              /* Restaurado desde BD — sólo nombre + badge verde */
              <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, background:"#d1fae5", borderRadius:6,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, fontSize:20, color:"#059669" }}>✓</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value.name}</div>
                  <div style={{ fontSize:11, color:"#059669", marginTop:2 }}>Guardado en expediente</div>
                </div>
              </div>
            ) : isImage ? (
              <div style={{ background:"#111", maxHeight:160, overflow:"hidden",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <img src={value.dataUrl} alt={value.name}
                  style={{ width:"100%", maxHeight:160, objectFit:"contain", display:"block" }} />
              </div>
            ) : (
              <div style={{ padding:"16px 14px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:46, background:"#fee2e2", borderRadius:6,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e0492f" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                    <line x1="9" y1="17" x2="15" y2="17"/>
                  </svg>
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {value.name}
                  </div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>PDF</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ padding:"7px 12px", borderTop:"1px solid var(--line)",
              display:"flex", alignItems:"center", gap:4, background:"var(--card)" }}>
              <span style={{ fontSize:11, color:"var(--muted)", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{value.name}</span>
              {subiendoDoc && (
                <span style={{ fontSize:10, color:"var(--muted)", display:"flex",
                  alignItems:"center", gap:3 }}>
                  <span style={{ width:10, height:10, border:"1.5px solid var(--line)",
                    borderTopColor:"var(--accent)", borderRadius:"50%",
                    display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                  Guardando…
                </span>
              )}
              {!subiendoDoc && value.storageKey && (
                <span style={{ fontSize:10, color:"#059669", fontWeight:700 }}>✓ guardado</span>
              )}
              <button onClick={() => onChange(null)} style={{ ...btnBase, color:"#e0492f" }}>Quitar</button>
              <button onClick={() => inputRef.current && inputRef.current.click()}
                style={{ ...btnBase, color:"var(--muted)" }}>Reemplazar</button>
            </div>
            <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display:"none" }}
              onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} />
          </div>

          {/* ── Botón Extraer con IA ── */}
          {value && value.dataUrl && !campos && !extrayendo && (
            <button onClick={extraer}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                padding:"9px 14px", border:"1.5px solid #c4b5fd", borderRadius:8,
                background:"#f5f3ff", color:"#6d28d9", fontSize:12, fontWeight:700,
                cursor:"pointer", transition:"all .15s" }}
              onMouseOver={e => { e.currentTarget.style.background="#ede9fe"; }}
              onMouseOut={e => { e.currentTarget.style.background="#f5f3ff"; }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
              Extraer información con IA
            </button>
          )}

          {/* ── Cargando ── */}
          {extrayendo && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              background:"#f5f3ff", border:"1.5px solid #c4b5fd", borderRadius:8 }}>
              <div style={{ width:14, height:14, border:"2px solid #c4b5fd",
                borderTopColor:"#7c3aed", borderRadius:"50%",
                animation:"spin 0.7s linear infinite", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"#6d28d9", fontWeight:600 }}>
                Analizando documento…
              </span>
            </div>
          )}

          {/* ── Error de extracción ── */}
          {errExt && (
            <div style={{ padding:"10px 14px", background:"#fff5f5", border:"1.5px solid #fecaca",
              borderRadius:8, fontSize:12, color:"#991b1b",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>Error: {errExt}</span>
              <button onClick={() => setErrExt(null)}
                style={{ border:"none", background:"none", color:"#991b1b", cursor:"pointer", fontSize:13 }}>✕</button>
            </div>
          )}

          {/* ── Resultado de extracción ── */}
          {campos !== null && !extrayendo && (
            <div style={{ border:"1.5px solid #a7f3d0", borderRadius:9, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"9px 14px", background:"#ecfdf5",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                  <span style={{ fontSize:12, fontWeight:700, color:"#065f46" }}>
                    {tieneCampos ? "Información extraída" : "Sin datos detectados"}
                  </span>
                </div>
                <button onClick={() => setCampos(null)}
                  style={{ border:"none", background:"none", color:"#6b7280", cursor:"pointer", fontSize:13 }}>✕</button>
              </div>

              {/* Campos */}
              {tieneCampos ? (
                <div style={{ background:"var(--card)" }}>
                  <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:6 }}>
                    {Object.entries(campos).map(function(entry) {
                      var k = entry[0], v = entry[1];
                      var etiqueta = CAMPO_LABEL[k] || k;
                      return (
                        <div key={k} style={{ display:"flex", gap:8, fontSize:12 }}>
                          <span style={{ color:"var(--muted)", minWidth:130, flexShrink:0 }}>{etiqueta}</span>
                          <span style={{ fontWeight:600, color:"var(--ink)" }}>{v}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Aplicar */}
                  <div style={{ padding:"9px 14px", borderTop:"1px solid #a7f3d0", background:"#f0fdf4" }}>
                    <button onClick={aplicar}
                      style={{ width:"100%", padding:"7px", border:"none", borderRadius:7,
                        background:"#059669", color:"#fff", fontSize:12, fontWeight:700,
                        cursor:"pointer" }}>
                      Aplicar al formulario
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding:"14px", background:"var(--card)", fontSize:12, color:"var(--muted)",
                  textAlign:"center" }}>
                  No se pudo leer información del documento. Intenta con una imagen más clara.
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ── Zona de drop vacía ── */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current && inputRef.current.click()}
          style={{ border:"2px dashed " + (dragging ? "var(--accent)" : "var(--line)"),
            borderRadius:9, padding:"30px 16px", textAlign:"center", cursor:"pointer",
            transition:"all .15s", background: dragging ? "#eff6ff" : "var(--bg)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={dragging ? "var(--accent)" : "var(--muted)"}
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.4 }}>
            Arrastra aquí o{" "}
            <span style={{ color:"var(--accent)", fontWeight:600 }}>haz clic para seleccionar</span>
          </div>
          <div style={{ fontSize:11, color:"var(--muted)", opacity:.7 }}>JPG · PNG · PDF</div>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display:"none" }}
            onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

/* ── Modal selector de unidad desde inventario Plan Piso ──────────────────── */
function UnitPickerModal({ onSelect, onClose }) {
  var [q, setQ] = React.useState("");
  var rows = (window.AUTOMIND && window.AUTOMIND.ROWS) || [];
  var COLOR_SEM = {
    saludable:"#22c55e", rotacion:"#d99613", comprometido:"#f97316",
    vencer:"#e0492f",    intereses:"#374151",
  };
  var filtradas = rows.filter(function(r) {
    if (!q) return true;
    var txt = [r.marca, r.modelo, r.anio, r.vin, r.color].filter(Boolean).join(" ").toLowerCase();
    return txt.includes(q.toLowerCase());
  });
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
      zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={onClose}>
      <div style={{
        background:"var(--card)", borderRadius:14, width:640, maxWidth:"92vw",
        maxHeight:"75vh", display:"flex", flexDirection:"column", overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,.35)",
      }} onClick={function(e){ e.stopPropagation(); }}>
        <div style={{
          padding:"16px 20px", borderBottom:"1px solid var(--line)",
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:15, fontWeight:700, color:"var(--ink)", flex:1 }}>
            Seleccionar unidad del inventario
          </span>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:18, color:"var(--muted)", lineHeight:1, padding:0,
          }}>✕</button>
        </div>
        <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--line)" }}>
          <input autoFocus placeholder="Buscar por marca, modelo, año o VIN…"
            value={q} onChange={function(e){ setQ(e.target.value); }}
            style={{
              width:"100%", padding:"8px 12px", fontSize:14, boxSizing:"border-box",
              border:"1px solid var(--line)", borderRadius:8,
              background:"var(--bg)", color:"var(--ink)", outline:"none", fontFamily:"inherit",
            }} />
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {rows.length === 0 && (
            <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
              El inventario Plan Piso no está cargado en esta sesión.<br/>
              <span style={{ fontSize:12, opacity:.7 }}>Entra a Plan Piso primero para cargar los datos.</span>
            </div>
          )}
          {rows.length > 0 && filtradas.length === 0 && (
            <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>
              Sin resultados para «{q}»
            </div>
          )}
          {filtradas.map(function(r) {
            var desc = [r.marca, r.modelo, r.anio].filter(Boolean).join(" ");
            if (r.vin) desc += " · " + r.vin;
            var dotColor = COLOR_SEM[r.semaforo] || "#9ca3af";
            return (
              <div key={r.id}
                onClick={function(){ onSelect({ id: r.id, desc: desc, precio: r.montoFinanciado || 0 }); }}
                style={{
                  padding:"11px 20px", display:"flex", alignItems:"center", gap:12,
                  cursor:"pointer", borderBottom:"1px solid var(--line)", transition:"background .12s",
                }}
                onMouseEnter={function(e){ e.currentTarget.style.background="var(--bg)"; }}
                onMouseLeave={function(e){ e.currentTarget.style.background=""; }}
              >
                <span style={{ width:10, height:10, borderRadius:"50%", background:dotColor, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{desc}</div>
                  {r.color && <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>{r.color}</div>}
                </div>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:.5, textTransform:"uppercase", color:dotColor,
                }}>{r.semaforo || ""}</span>
              </div>
            );
          })}
        </div>
        {filtradas.length > 0 && (
          <div style={{ padding:"8px 20px", borderTop:"1px solid var(--line)", fontSize:11, color:"var(--muted)" }}>
            {filtradas.length} unidad{filtradas.length !== 1 ? "es" : ""} en inventario
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sección colapsable + campo de formulario (nivel módulo para estabilidad de hooks) ── */
function Sec({ ico, titulo, children, defaultOpen }) {
  var [open, setOpen] = React.useState(defaultOpen ? true : false);
  return (
    <div className="ef-seccion" style={{ overflow:"hidden" }}>
      <div className="ef-sec-head"
        onClick={function(){ setOpen(function(o){ return !o; }); }}
        style={{ cursor:"pointer", userSelect:"none", display:"flex",
          alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          <span style={{ display:"flex", alignItems:"center", color:"var(--muted)" }}>{ico}</span>
          <span style={{ marginLeft:6 }}>{titulo}</span>
        </div>
        <span style={{
          display:"flex", alignItems:"center", color:"var(--muted)",
          transition:"transform .2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>
      {open && <div className="ef-grid">{children}</div>}
    </div>
  );
}

function Fld({ label, full, req, children }) {
  return (
    <div className="ef-field" style={{ gridColumn: full ? "1/-1" : undefined }}>
      <label className="ef-label">{label}{req && <span className="ef-req"> *</span>}</label>
      {children}
    </div>
  );
}

/* ── Resumen de expediente (panel fijo arriba del form) ──────────────────── */
function _buildExpedienteItems(form) {
  var esCredito = form.formaPagoCot === "Crédito";
  var items = [
    { label:"Nombre completo",    ok:!!(form.nombre),                                       req:true  },
    { label:"Teléfono / email",   ok:!!(form.tel || form.email),                            req:true  },
    { label:"CURP (18 car.)",     ok:!!(form.curp && form.curp.length === 18),              req:false },
    { label:"RFC",                ok:!!(form.rfc),                                          req:false },
    { label:"Domicilio",          ok:!!(form.direccion && form.colonia && form.cp),         req:false },
    { label:"INE / Identificación", ok:!!(form.docId && (form.docId.storageKey || form.docId.dataUrl)), req:false },
    { label:"Licencia de manejar",  ok:!!(form.docLicencia && (form.docLicencia.storageKey || form.docLicencia.dataUrl)), req:false },
    { label:"Comprobante domicilio",ok:!!(form.docDomicilio && (form.docDomicilio.storageKey || form.docDomicilio.dataUrl)), req:false },
    { label:"Unidad seleccionada",ok:!!(form.unidadId),                                    req:true  },
    { label:"Cotización / precio", ok:!!(form.precioVenta > 0),                            req:true  },
    { label:"Aprobación gerente", ok: form.e5Estado === "Aprobado",                        req:true  },
  ];
  if (esCredito) {
    items.push({ label:"Resultado crédito E6", ok: form.e6Estado === "Aprobado" || form.e6Estado === "Condicional", req:true });
  }
  items.push({ label:"Contrato revisado", ok:!!form.e7ContratoOk, req:false, manual:true });
  return items;
}

function ExpedienteResumen({ form }) {
  var items = _buildExpedienteItems(form);
  var hayRojo    = items.some(function(x){ return x.req && !x.ok && !form.e7ExcepcionAuth; });
  var hayAmarillo= !hayRojo && items.some(function(x){ return !x.ok; });
  var semColor   = hayRojo ? "#ef4444" : hayAmarillo ? "#eab308" : "#22c55e";
  var semLabel   = hayRojo ? "Incompleto" : hayAmarillo ? "Pendiente" : "Completo";
  var semBg      = hayRojo ? "rgba(239,68,68,.06)" : hayAmarillo ? "rgba(234,179,8,.06)" : "rgba(34,197,94,.06)";
  var pend       = items.filter(function(x){ return !x.ok; }).length;

  return (
    <div style={{
      padding:"10px 20px 12px", borderBottom:"1px solid var(--line)", background:semBg,
    }}>
      {/* ── Cabecera ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:".04em",
          color:"var(--ink-2)", textTransform:"uppercase" }}>
          Expediente
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {pend > 0 && (
            <span style={{ fontSize:10, color:"var(--muted)" }}>
              {pend} {pend === 1 ? "pendiente" : "pendientes"}
            </span>
          )}
          <span style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"3px 10px 3px 7px", borderRadius:999,
            background: semColor + "20", border:"1px solid " + semColor + "55",
            fontSize:11, fontWeight:700, color:semColor,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:semColor,
              boxShadow:"0 0 5px " + semColor }} />
            {semLabel}
          </span>
        </div>
      </div>
      {/* ── Grid de ítems ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))",
        gap:"3px 6px",
      }}>
        {items.map(function(it, idx) {
          var dot  = it.ok ? "#22c55e" : (it.req && !form.e7ExcepcionAuth) ? "#ef4444" : "#94a3b8";
          var icon = it.ok ? "✓" : (it.req && !form.e7ExcepcionAuth) ? "✗" : "○";
          return (
            <div key={idx} style={{ display:"flex", alignItems:"center", gap:5, padding:"2px 0" }}>
              <span style={{
                width:15, height:15, borderRadius:3, flexShrink:0,
                background: dot + "20", border:"1px solid " + dot + "80",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:900, color:dot,
              }}>{icon}</span>
              <span style={{
                fontSize:11,
                color: it.ok ? "var(--ink)" : (it.req && !form.e7ExcepcionAuth) ? "#991b1b" : "var(--muted)",
                fontWeight: (it.req && !it.ok && !form.e7ExcepcionAuth) ? 600 : 400,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stepper de etapas ────────────────────────────────────────────────────── */
function EtapaStepper({ etapaActual, onCambiar }) {
  var idx = ETAPAS_CRM.indexOf(etapaActual);
  return (
    <div style={{
      padding:"14px 20px 10px",
      borderBottom:"1px solid var(--line)",
      background:"var(--card)",
    }}>
      <div style={{
        display:"flex", alignItems:"flex-start",
        overflowX:"auto", paddingBottom:2,
      }}>
        {ETAPAS_CRM.map(function(etapa, i) {
          var completada = i < idx;
          var activa     = i === idx;
          var futura     = i > idx;
          var cfg        = ETAPA_CFG[etapa] || { dot:"#9ca3af", bg:"#f3f4f6", txt:"#6b7280" };
          var dotBorder  = activa ? cfg.dot : completada ? "#1f9d57" : "var(--line)";
          var dotBg      = activa ? cfg.dot : completada ? "#1f9d57" : "var(--card)";
          var lblColor   = activa ? cfg.txt : completada ? "#065f46" : "var(--muted)";
          var lblBg      = activa ? cfg.bg  : "transparent";
          var lineColor  = i < idx ? "#1f9d57" : "var(--line)";

          return (
            <React.Fragment key={etapa}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flexShrink:0 }}>
                {/* Dot / botón */}
                <button
                  type="button"
                  onClick={function(){ onCambiar(etapa); }}
                  title={"Mover a: " + etapa}
                  style={{
                    width:28, height:28, borderRadius:"50%",
                    border:"2px solid " + dotBorder,
                    background: dotBg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", outline:"none", transition:"all .18s",
                    boxShadow: activa ? ("0 0 0 4px " + cfg.dot + "28") : "none",
                    flexShrink:0,
                  }}
                >
                  {completada ? (
                    /* Checkmark para etapas completadas */
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8"
                      strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <span style={{
                      width: activa ? 9 : 7, height: activa ? 9 : 7,
                      borderRadius:"50%",
                      background: activa ? "#fff" : (futura ? "var(--line)" : dotBg),
                      display:"block", transition:"all .18s",
                    }} />
                  )}
                </button>

                {/* Label */}
                <span style={{
                  fontSize:9.5, fontWeight: activa ? 800 : completada ? 600 : 500,
                  color: lblColor, whiteSpace:"nowrap",
                  padding: activa ? "2px 7px" : "1px 2px",
                  borderRadius:5, background: lblBg,
                  letterSpacing: activa ? ".01em" : "normal",
                  transition:"all .18s",
                }}>
                  {etapa}
                </span>
              </div>

              {/* Línea conectora */}
              {i < ETAPAS_CRM.length - 1 && (
                <div style={{
                  height:2, flex:1, minWidth:8,
                  background: lineColor,
                  marginTop:13,
                  borderRadius:2,
                  transition:"background .3s",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ── Editor split‑panel de clientes (espejo de inventario‑editor) ────────── */
function ClienteEditor({ clientes, defaultSelId, onUpdate }) {
  const primer = defaultSelId
    ? (clientes.find(c => c.id === defaultSelId) || clientes[0])
    : clientes[0];

  const [selId, setSelId] = React.useState(primer ? primer.id : null);
  const [form,  setForm]  = React.useState(primer ? { ...primer } : null);
  const [dirty, setDirty] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [q,     setQ]     = React.useState("");
  const [showUnitPicker, setShowUnitPicker] = React.useState(false);
  const [e8Subiendo, setE8Subiendo] = React.useState(false);
  const [e8ErrSub,   setE8ErrSub]   = React.useState('');

  /* Auto-seleccionar cuando llega un cliente recién creado */
  React.useEffect(() => {
    if (!defaultSelId) return;
    const c = clientes.find(x => x.id === defaultSelId);
    if (!c) return;
    setSelId(defaultSelId);
    setForm({ ...c });
    setDirty(false); setSaved(false);
  }, [defaultSelId]);

  /* Resincronizar form si el array cambia y no hay edición en vuelo */
  React.useEffect(() => {
    if (!dirty && selId) {
      const c = clientes.find(x => x.id === selId);
      if (c) setForm({ ...c });
    }
  }, [clientes]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setDirty(true); setSaved(false); };

  function selectCliente(id) {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Descartar?")) return;
    const c = clientes.find(x => x.id === id);
    setSelId(id);
    setForm(c ? { ...c } : null);
    setDirty(false); setSaved(false);
  }

  async function handleSave() {
    if (!form) return;
    try {
      /* ── Subir documentos pendientes a Storage antes de guardar ── */
      var formToSave = Object.assign({}, form);
      var docCampos = [
        { key:"docId",        label:"INE"          },
        { key:"docLicencia",  label:"Licencia"     },
        { key:"docDomicilio", label:"Comprobante"  },
      ];
      for (var i = 0; i < docCampos.length; i++) {
        var dc  = docCampos[i];
        var doc = formToSave[dc.key];
        if (doc && doc.dataUrl && !doc.storageKey && window.DB && window.DB.storage) {
          try {
            var ext  = doc.type === "application/pdf" ? "pdf" : doc.type === "image/png" ? "png" : "jpg";
            var key  = "clientes/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
            var blob = _dataUrlToBlob(doc.dataUrl);
            var upResult = await window.DB.storage
              .from("expedientes")
              .upload(key, blob, { contentType: doc.type, upsert: false });
            if (!upResult.error) {
              /* Guardar sin el dataUrl para no inflar la BD */
              formToSave[dc.key] = { name: doc.name, type: doc.type, storageKey: key, cargadoEn: doc.cargadoEn };
              setForm(function(p) {
                var updated = Object.assign({}, p);
                updated[dc.key] = formToSave[dc.key];
                return updated;
              });
            } else {
              console.warn("[CRM] Upload " + dc.label + " falló:", upResult.error.message);
            }
          } catch(eDoc) {
            console.warn("[CRM] Upload " + dc.label + " error:", eDoc.message);
          }
        }
      }
      await (onUpdate && onUpdate(formToSave));
      setDirty(false); setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch(e) {
      /* El error ya se muestra en onClienteUpdate */
    }
  }

  /* Aplica los campos extraídos por IA al formulario del cliente */
  function aplicarCampos(extractedCampos, fuente) {
    setForm(function(prev) {
      var upd = {};
      if (fuente === "id") {
        var partes = [extractedCampos.nombre, extractedCampos.apellidoPaterno, extractedCampos.apellidoMaterno].filter(Boolean);
        if (partes.length && !prev.nombre) upd.nombre   = partes.join(" ");
        if (extractedCampos.curp)          upd.curp     = extractedCampos.curp;
        if (extractedCampos.rfc)           upd.rfc      = extractedCampos.rfc;
        if (extractedCampos.fechaNacimiento) upd.fechaNac = extractedCampos.fechaNacimiento;
        if (extractedCampos.sexo)          upd.sexo     = extractedCampos.sexo;
        if (extractedCampos.direccion)     upd.direccion= extractedCampos.direccion;
        if (extractedCampos.colonia)       upd.colonia  = extractedCampos.colonia;
        if (extractedCampos.ciudad && !prev.ciudad) upd.ciudad = extractedCampos.ciudad;
        if (extractedCampos.estado && !prev.estado) upd.estado = extractedCampos.estado;
        if (extractedCampos.cp)            upd.cp       = extractedCampos.cp;
      }
      if (fuente === "domicilio") {
        if (extractedCampos.ciudad && !prev.ciudad) upd.ciudad   = extractedCampos.ciudad;
        if (extractedCampos.estado && !prev.estado) upd.estado   = extractedCampos.estado;
        if (extractedCampos.cp && !prev.cp)         upd.cp       = extractedCampos.cp;
        if (extractedCampos.direccion && !prev.direccion) upd.direccion = extractedCampos.direccion;
        if (extractedCampos.colonia && !prev.colonia)     upd.colonia   = extractedCampos.colonia;
      }
      if (fuente === "licencia") {
        if (extractedCampos.curp && !prev.curp) upd.curp = extractedCampos.curp;
        if (extractedCampos.nombre && !prev.nombre) {
          var partes = [extractedCampos.nombre, extractedCampos.apellidoPaterno, extractedCampos.apellidoMaterno].filter(Boolean);
          if (partes.length) upd.nombre = partes.join(" ");
        }
        if (extractedCampos.fechaNacimiento && !prev.fechaNac) upd.fechaNac   = extractedCampos.fechaNacimiento;
        if (extractedCampos.numeroLicencia)  upd.numLicencia = extractedCampos.numeroLicencia;
        if (extractedCampos.tipoLicencia)    upd.tipoLic     = extractedCampos.tipoLicencia;
        if (extractedCampos.vigencia)        upd.vigenciaLic = extractedCampos.vigencia;
      }
      // Guardar todos los datos crudos para referencia
      var clave = fuente === "id" ? "datosId" : fuente === "licencia" ? "datosLicencia" : "datosDomicilio";
      upd[clave] = extractedCampos;
      return Object.assign({}, prev, upd);
    });
    setDirty(true);
  }

  const filtrados = q
    ? clientes.filter(c => [c.nombre, c.tel, c.email, c.interes, c.ciudad, c.asesor]
        .join(" ").toLowerCase().includes(q.toLowerCase()))
    : clientes;

  const asesoresOpc = [...new Set(clientes.map(c => c.asesor).filter(Boolean))];

  const IS = {
    width:"100%", padding:"7px 10px", border:"1px solid var(--line)",
    borderRadius:7, fontSize:13, background:"var(--bg)", color:"var(--ink)",
    outline:"none", fontFamily:"inherit",
  };

  /* Iconos SVG inline */
  const ICO_PERSONA = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>);
  const ICO_PIN     = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>);
  const ICO_AUTO    = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.5L21 13v2.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>);
  const ICO_PROCESO = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
  const ICO_LINK    = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>);
  const ICO_DOC     = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>);

  return (
    <div className="inv-editor-shell">

      {/* ── Panel izquierdo ────────────────────────────────────────────────── */}
      <div className="inv-list-panel">
        <div className="inv-list-head">
          <label className="search">
            {I.search({ width:15, height:15 })}
            <input placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />
          </label>
        </div>
        <div className="inv-list-body">
          {filtrados.length === 0
            ? <div style={{ padding:"24px 16px", color:"var(--muted)", fontSize:13 }}>Sin resultados.</div>
            : filtrados.map(c => (
              <ClienteListItem key={c.id} c={c} active={c.id === selId}
                onClick={() => selectCliente(c.id)} />
            ))
          }
        </div>
        <div className="inv-list-foot">
          {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Panel derecho ─────────────────────────────────────────────────── */}
      {form ? (
        <div className="inv-form-panel">

          <div className="inv-form-head">
            <div style={{ minWidth:0 }}>
              <div className="inv-form-vin">{form.nombre || "Nuevo cliente"}</div>
              <div className="inv-form-sub" style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                <span style={{ color:"var(--muted)", fontSize:12 }}>{form.tipo}</span>
              </div>
            </div>
            <div className="inv-form-actions">
              {saved && <span style={{ fontSize:12, color:"#1f9d57", fontWeight:600 }}>✓ Guardado</span>}
              <button className="btn primary" onClick={handleSave} disabled={!dirty}
                style={{ opacity:dirty ? 1 : .45, cursor:dirty ? "pointer" : "not-allowed" }}>
                Guardar
              </button>
            </div>
          </div>

          {/* ── Stepper de etapas ── */}
          <EtapaStepper etapaActual={form.etapa || "Prospección"} onCambiar={v => set("etapa", v)} />

          {/* ── Resumen de expediente (siempre visible) ── */}
          <ExpedienteResumen form={form} />

          <div className="inv-form-scroll">

            {/* § DATOS DEL CLIENTE */}
            <Sec ico={ICO_PERSONA} titulo="Datos del cliente">
              <Fld label="Nombre completo" req full>
                <input className="ef-input" style={IS} value={form.nombre || ""} onChange={e => set("nombre", e.target.value)} />
              </Fld>
              <Fld label="Tipo">
                <select className="ef-select" style={IS} value={form.tipo || "Persona física"} onChange={e => set("tipo", e.target.value)}>
                  <option>Persona física</option>
                  <option>Persona moral</option>
                </select>
              </Fld>
              <Fld label="Teléfono">
                <input className="ef-input" style={IS} value={form.tel || ""} onChange={e => set("tel", e.target.value)} placeholder="555-000-0000" />
              </Fld>
              <Fld label="Email">
                <input className="ef-input" style={IS} value={form.email || ""} onChange={e => set("email", e.target.value)} placeholder="correo@ejemplo.com" />
              </Fld>
            </Sec>

            {/* § DOCUMENTOS DEL CLIENTE */}
            <Sec ico={ICO_DOC} titulo="Documentos del cliente">
              <div style={{ gridColumn:"1/-1" }}>
                <DocUpload
                  label="Identificación oficial"
                  sublabel="INE · Pasaporte"
                  docType="id"
                  value={form.docId || null}
                  onChange={v => set("docId", v)}
                  onExtract={campos => aplicarCampos(campos, "id")}
                />
              </div>
              <div style={{ gridColumn:"1/-1", marginTop:4 }}>
                <DocUpload
                  label="Licencia de conducir"
                  sublabel="Licencia de conducir vigente"
                  docType="licencia"
                  value={form.docLicencia || null}
                  onChange={v => set("docLicencia", v)}
                  onExtract={campos => aplicarCampos(campos, "licencia")}
                />
              </div>
              <div style={{ gridColumn:"1/-1", marginTop:4 }}>
                <DocUpload
                  label="Comprobante de domicilio"
                  sublabel="Recibo de agua · luz · teléfono"
                  docType="domicilio"
                  value={form.docDomicilio || null}
                  onChange={v => set("docDomicilio", v)}
                  onExtract={campos => aplicarCampos(campos, "domicilio")}
                />
              </div>

              {/* Panel: Datos OCR confirmados */}
              {(form.datosId || form.datosLicencia || form.datosDomicilio) && (
                <div style={{ gridColumn:"1/-1", marginTop:8, padding:"12px 14px",
                  background:"var(--bg)", border:"1px solid var(--line)", borderRadius:10 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)",
                    textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                    Datos OCR confirmados
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 18px" }}>
                    {[
                      { lbl:"CURP",      val: form.curp },
                      { lbl:"RFC",       val: form.rfc },
                      { lbl:"Nac.",      val: form.fechaNac },
                      { lbl:"Sexo",      val: form.sexo },
                      { lbl:"Licencia #",val: form.numLicencia },
                      { lbl:"Tipo lic.", val: form.tipoLic },
                      { lbl:"Vigencia",  val: form.vigenciaLic },
                      { lbl:"C.P.",      val: form.cp },
                    ].filter(x => x.val).map(x => (
                      <div key={x.lbl} style={{ fontSize:12 }}>
                        <span style={{ color:"var(--muted)", marginRight:4 }}>{x.lbl}:</span>
                        <span style={{ fontWeight:600, color:"var(--ink)", fontFamily:"monospace" }}>{x.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Sec>

            {/* § EXPEDIENTE (campos OCR) */}
            <Sec ico="🪪" titulo="Datos del expediente">
              <Fld label="CURP" full>
                <input className="ef-input" style={{...IS, fontFamily:"monospace", letterSpacing:1}} value={form.curp || ""}
                  onChange={e => set("curp", e.target.value.toUpperCase())}
                  placeholder="18 caracteres" maxLength={18} />
              </Fld>
              <Fld label="RFC">
                <input className="ef-input" style={{...IS, fontFamily:"monospace"}} value={form.rfc || ""}
                  onChange={e => set("rfc", e.target.value.toUpperCase())} placeholder="RFC con homoclave" />
              </Fld>
              <Fld label="Fecha de nacimiento">
                <input className="ef-input" style={IS} value={form.fechaNac || ""}
                  onChange={e => set("fechaNac", e.target.value)} placeholder="DD/MM/AAAA" />
              </Fld>
              <Fld label="Sexo">
                <select className="ef-select" style={IS} value={form.sexo || ""}
                  onChange={e => set("sexo", e.target.value)}>
                  <option value="">—</option>
                  <option value="H">Hombre (H)</option>
                  <option value="M">Mujer (M)</option>
                </select>
              </Fld>
              <Fld label="Dirección" full>
                <input className="ef-input" style={IS} value={form.direccion || ""}
                  onChange={e => set("direccion", e.target.value)} placeholder="Calle y número" />
              </Fld>
              <Fld label="Colonia">
                <input className="ef-input" style={IS} value={form.colonia || ""}
                  onChange={e => set("colonia", e.target.value)} placeholder="Colonia o fracc." />
              </Fld>
              <Fld label="C.P.">
                <input className="ef-input" style={IS} value={form.cp || ""}
                  onChange={e => set("cp", e.target.value)} placeholder="00000" maxLength={5} />
              </Fld>
              <Fld label="# Licencia">
                <input className="ef-input" style={{...IS, fontFamily:"monospace"}} value={form.numLicencia || ""}
                  onChange={e => set("numLicencia", e.target.value)} placeholder="Número de folio" />
              </Fld>
              <Fld label="Tipo licencia">
                <input className="ef-input" style={IS} value={form.tipoLic || ""}
                  onChange={e => set("tipoLic", e.target.value)} placeholder="A, B, C…" />
              </Fld>
              <Fld label="Vigencia licencia">
                <input className="ef-input" style={IS} value={form.vigenciaLic || ""}
                  onChange={e => set("vigenciaLic", e.target.value)} placeholder="DD/MM/AAAA" />
              </Fld>
            </Sec>

            {/* § ORIGEN */}
            <Sec ico={ICO_PIN} titulo="Origen del prospecto">
              <Fld label="Canal">
                <select className="ef-select" style={IS} value={form.canal || "Digital"} onChange={e => set("canal", e.target.value)}>
                  {["Digital","Piso","Referido","Marketplace","Otro"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fld>
              <Fld label="Fuente específica">
                <input className="ef-input" style={IS} value={form.fuente || ""} onChange={e => set("fuente", e.target.value)} placeholder="Facebook Ads, visita, etc." />
              </Fld>
              <Fld label="Ciudad">
                <input className="ef-input" style={IS} value={form.ciudad || ""} onChange={e => set("ciudad", e.target.value)} />
              </Fld>
              <Fld label="Estado">
                <input className="ef-input" style={IS} value={form.estado || ""} onChange={e => set("estado", e.target.value)} placeholder="N.L., Jal., CDMX…" />
              </Fld>
            </Sec>

            {/* § PERFIL COMERCIAL */}
            <Sec ico={ICO_AUTO} titulo="Perfil comercial">
              <Fld label="Vehículo de interés" full>
                <input className="ef-input" style={IS} value={form.interes || ""} onChange={e => set("interes", e.target.value)} placeholder="Marca, modelo, año" />
              </Fld>
              <Fld label="Presupuesto estimado">
                <input type="number" className="ef-input" style={IS}
                  value={form.presupuesto || ""}
                  onChange={e => set("presupuesto", Number(e.target.value))} />
              </Fld>
              <Fld label="Forma de pago">
                <select className="ef-select" style={IS} value={form.formaPago || "No definido"} onChange={e => set("formaPago", e.target.value)}>
                  {["No definido","Contado","Crédito"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fld>
              <Fld label="Uso del vehículo">
                <select className="ef-select" style={IS} value={form.uso || "Personal"} onChange={e => set("uso", e.target.value)}>
                  {["Personal","Trabajo","Familiar"].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fld>
            </Sec>

            {/* § E3 — PRUEBA DE MANEJO */}
            <Sec ico="🚗" titulo="Prueba de manejo">
              <Fld label="¿Se realizó prueba?" full>
                <div style={{ display:"flex", gap:8 }}>
                  {["Sí","No"].map(op => (
                    <button key={op} type="button"
                      onClick={() => set("pruebaManejo", op === "Sí")}
                      style={{
                        padding:"6px 20px", borderRadius:8, fontSize:13, fontWeight:600,
                        border:"1px solid var(--line)", cursor:"pointer", transition:"all .15s",
                        background: (op === "Sí") === !!form.pruebaManejo
                          ? "var(--accent)" : "var(--card)",
                        color: (op === "Sí") === !!form.pruebaManejo ? "#fff" : "var(--muted)",
                      }}>
                      {op}
                    </button>
                  ))}
                </div>
              </Fld>
              {form.pruebaManejo && (<>
                <Fld label="Fecha de prueba">
                  <input type="date" className="ef-input" style={IS}
                    value={form.fechaPrueba || ""}
                    onChange={e => set("fechaPrueba", e.target.value)} />
                </Fld>
                <Fld label="Unidad utilizada">
                  <input className="ef-input" style={IS}
                    value={form.unidadPrueba || ""}
                    onChange={e => set("unidadPrueba", e.target.value)}
                    placeholder="Marca, modelo, año o VIN" />
                </Fld>
                <Fld label="Resultado">
                  <select className="ef-select" style={IS}
                    value={form.resultadoPrueba || ""}
                    onChange={e => set("resultadoPrueba", e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    <option value="Positivo">✅ Positivo — cliente interesado</option>
                    <option value="Neutral">⚪ Neutral — duda sobre la unidad</option>
                    <option value="Negativo">❌ Negativo — no convenció</option>
                  </select>
                </Fld>
                <Fld label="Observaciones del asesor" full>
                  <textarea className="ef-input"
                    style={{ ...IS, minHeight:72, resize:"vertical" }}
                    value={form.obsPrueba || ""}
                    onChange={e => set("obsPrueba", e.target.value)}
                    placeholder="Preferencias detectadas, objeciones, próximo paso…" />
                </Fld>
              </>)}
            </Sec>

            {/* § E4 — SELECCIÓN DE UNIDAD + COTIZACIÓN */}
            <Sec ico={ICO_AUTO} titulo="Selección de unidad y cotización">
              <Fld label="Unidad seleccionada" full>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {form.unidadDesc ? (
                    <div style={{
                      flex:1, padding:"7px 10px", borderRadius:7,
                      border:"1px solid var(--line)", background:"var(--bg)",
                      fontSize:13, color:"var(--ink)", fontWeight:600,
                    }}>{form.unidadDesc}</div>
                  ) : (
                    <div style={{
                      flex:1, padding:"7px 10px", borderRadius:7,
                      border:"1px dashed var(--line)", background:"transparent",
                      fontSize:13, color:"var(--muted)", fontStyle:"italic",
                    }}>Sin unidad seleccionada</div>
                  )}
                  <button type="button" onClick={() => setShowUnitPicker(true)} style={{
                    padding:"7px 14px", borderRadius:7, border:"1px solid var(--accent)",
                    background:"transparent", color:"var(--accent)",
                    fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0,
                  }}>{form.unidadDesc ? "Cambiar" : "Buscar unidad"}</button>
                  {form.unidadDesc && (
                    <button type="button"
                      onClick={() => { set("unidadId", null); set("unidadDesc", ""); }}
                      style={{
                        padding:"7px 10px", borderRadius:7,
                        border:"1px solid var(--line)", background:"transparent",
                        color:"var(--muted)", fontSize:12, cursor:"pointer", flexShrink:0,
                      }}>✕</button>
                  )}
                </div>
              </Fld>

              <Fld label="Precio de lista ($)">
                <input type="number" className="ef-input" style={IS} min="0" step="1000"
                  value={form.precioLista || ""}
                  placeholder="0"
                  onChange={e => {
                    var pl = Number(e.target.value) || 0;
                    var dm = Number(form.descuentoMonto) || 0;
                    set("precioLista", pl);
                    set("precioVenta", Math.max(0, pl - dm));
                    var pl2 = Number(form.plazoMeses) || 0;
                    var eng = Number(form.enganche) || 0;
                    if (pl2 > 0) set("mensualidadEst", Math.round((Math.max(0, pl - dm) - eng) / pl2));
                  }} />
              </Fld>

              <Fld label="Descuento ($)">
                <input type="number" className="ef-input" style={IS} min="0" step="500"
                  value={form.descuentoMonto || ""}
                  placeholder="0"
                  onChange={e => {
                    var dm = Number(e.target.value) || 0;
                    var pl = Number(form.precioLista) || 0;
                    var pv = Math.max(0, pl - dm);
                    set("descuentoMonto", dm);
                    set("precioVenta", pv);
                    var meses = Number(form.plazoMeses) || 0;
                    var eng = Number(form.enganche) || 0;
                    if (meses > 0) set("mensualidadEst", Math.round((pv - eng) / meses));
                  }} />
              </Fld>

              <Fld label="Precio de venta ($)">
                <input type="number" className="ef-input"
                  style={{ ...IS, fontWeight:700, color:"var(--accent)" }}
                  min="0" step="1000"
                  value={form.precioVenta || ""}
                  placeholder="0"
                  onChange={e => {
                    var pv = Number(e.target.value) || 0;
                    var pl = Number(form.precioLista) || 0;
                    set("precioVenta", pv);
                    set("descuentoMonto", Math.max(0, pl - pv));
                    var meses = Number(form.plazoMeses) || 0;
                    var eng = Number(form.enganche) || 0;
                    if (meses > 0) set("mensualidadEst", Math.round((pv - eng) / meses));
                  }} />
              </Fld>

              <Fld label="Forma de pago" full>
                <div style={{ display:"flex", gap:8 }}>
                  {["Contado","Crédito"].map(op => (
                    <button key={op} type="button"
                      onClick={() => set("formaPagoCot", op)}
                      style={{
                        padding:"6px 20px", borderRadius:8, fontSize:13, fontWeight:600,
                        border:"1px solid var(--line)", cursor:"pointer", transition:"all .15s",
                        background: form.formaPagoCot === op ? "var(--accent)" : "var(--card)",
                        color: form.formaPagoCot === op ? "#fff" : "var(--muted)",
                      }}>{op}</button>
                  ))}
                </div>
              </Fld>

              {form.formaPagoCot === "Crédito" && (<>
                <Fld label="Enganche ($)">
                  <input type="number" className="ef-input" style={IS} min="0" step="1000"
                    value={form.enganche || ""}
                    placeholder="0"
                    onChange={e => {
                      var eng = Number(e.target.value) || 0;
                      set("enganche", eng);
                      var pv = Number(form.precioVenta) || 0;
                      var meses = Number(form.plazoMeses) || 0;
                      if (meses > 0) set("mensualidadEst", Math.round((pv - eng) / meses));
                    }} />
                </Fld>
                <Fld label="Plazo">
                  <select className="ef-select" style={IS}
                    value={form.plazoMeses || ""}
                    onChange={e => {
                      var meses = Number(e.target.value) || 0;
                      set("plazoMeses", meses);
                      var pv = Number(form.precioVenta) || 0;
                      var eng = Number(form.enganche) || 0;
                      if (meses > 0) set("mensualidadEst", Math.round((pv - eng) / meses));
                    }}>
                    <option value="">— Seleccionar —</option>
                    {[12,18,24,36,48,60,72].map(m => (
                      <option key={m} value={m}>{m} meses</option>
                    ))}
                  </select>
                </Fld>
                <Fld label="Mensualidad estimada" full>
                  <div style={{
                    padding:"7px 10px", borderRadius:7, border:"1px solid var(--line)",
                    background:"var(--bg)", fontSize:14, fontWeight:700, color:"var(--accent)",
                  }}>
                    {form.mensualidadEst > 0
                      ? "$" + Number(form.mensualidadEst).toLocaleString("es-MX")
                      : <span style={{ fontWeight:400, fontSize:12, color:"var(--muted)" }}>
                          Se calcula al ingresar enganche y plazo
                        </span>
                    }
                  </div>
                </Fld>
              </>)}

              <Fld label="Notas de cotización" full>
                <textarea className="ef-input"
                  style={{ ...IS, minHeight:64, resize:"vertical" }}
                  value={form.notasCot || ""}
                  onChange={e => set("notasCot", e.target.value)}
                  placeholder="Versión solicitada, accesorios incluidos, condiciones especiales…" />
              </Fld>
            </Sec>

            {/* § E5 — APROBACIÓN DE GERENTE */}
            {(function() {
              var estado   = form.e5Estado || "Pendiente";
              var tipoPago = form.formaPagoCot || "No definido";
              var ICO_CHK  = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>);
              var COLOR_E5 = {
                "Pendiente":            { bg:"rgba(156,163,175,.12)", txt:"#6b7280", dot:"#9ca3af" },
                "Enviado a aprobación": { bg:"rgba(59,130,246,.10)",  txt:"#3b82f6", dot:"#3b82f6" },
                "Aprobado":             { bg:"rgba(34,197,94,.12)",   txt:"#16a34a", dot:"#22c55e" },
                "Rechazado":            { bg:"rgba(239,68,68,.10)",   txt:"#dc2626", dot:"#ef4444" },
              };
              var cfg = COLOR_E5[estado] || COLOR_E5["Pendiente"];
              function accion(nuevoEstado, quien) {
                set("e5Estado",      nuevoEstado);
                set("e5AprobadoPor", quien || "");
                set("e5Fecha",       new Date().toISOString());
              }
              var montoStr = tipoPago === "Crédito" ? "" : "";
              return (
                <Sec ico={ICO_CHK} titulo="Aprobación de gerente (E5)">
                  <Fld label="Tipo de pago solicitado" full>
                    <div style={{
                      padding:"8px 12px", borderRadius:7, border:"1px solid var(--line)",
                      background:"var(--bg)", fontSize:13, display:"flex", alignItems:"center", gap:8,
                    }}>
                      <span style={{ fontSize:16 }}>{tipoPago === "Crédito" ? "💳" : "💵"}</span>
                      <span style={{ fontWeight:600, color:"var(--ink)" }}>{tipoPago}</span>
                      {tipoPago === "Crédito" && form.plazoMeses > 0 && (
                        <span style={{ fontSize:12, color:"var(--muted)" }}>
                          {" · "}{form.plazoMeses} meses{" · Enganche $"}{Number(form.enganche || 0).toLocaleString("es-MX")}
                        </span>
                      )}
                      {tipoPago !== "Crédito" && form.precioVenta > 0 && (
                        <span style={{ fontSize:12, color:"var(--muted)" }}>
                          {" · $"}{Number(form.precioVenta).toLocaleString("es-MX")}{" de contado"}
                        </span>
                      )}
                    </div>
                  </Fld>
                  <Fld label="Estado de aprobación" full>
                    <div style={{
                      padding:"8px 12px", borderRadius:7, border:"1px solid var(--line)",
                      background:cfg.bg, display:"flex", alignItems:"center", gap:8,
                    }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
                      <span style={{ fontWeight:700, fontSize:13, color:cfg.txt }}>{estado}</span>
                      {form.e5AprobadoPor && (
                        <span style={{ fontSize:12, color:"var(--muted)", marginLeft:"auto" }}>
                          {form.e5AprobadoPor}
                          {form.e5Fecha && (" · " + new Date(form.e5Fecha).toLocaleDateString("es-MX"))}
                        </span>
                      )}
                    </div>
                  </Fld>
                  {(estado === "Pendiente" || estado === "Rechazado") && (
                    <Fld label="Acción del asesor" full>
                      <button type="button"
                        onClick={() => accion("Enviado a aprobación", "")}
                        style={{
                          padding:"8px 18px", borderRadius:8, border:"1px solid #3b82f6",
                          background:"rgba(59,130,246,.08)", color:"#3b82f6",
                          fontSize:13, fontWeight:600, cursor:"pointer",
                        }}>
                        Enviar a aprobación del gerente
                      </button>
                    </Fld>
                  )}
                  {estado === "Enviado a aprobación" && (
                    <Fld label="Decisión del gerente" full>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <button type="button" onClick={() => accion("Aprobado", "Gerente")}
                          style={{
                            padding:"8px 20px", borderRadius:8, border:"1px solid #22c55e",
                            background:"rgba(34,197,94,.10)", color:"#16a34a",
                            fontSize:13, fontWeight:600, cursor:"pointer",
                          }}>Aprobar</button>
                        <button type="button" onClick={() => accion("Rechazado", "Gerente")}
                          style={{
                            padding:"8px 20px", borderRadius:8, border:"1px solid #ef4444",
                            background:"rgba(239,68,68,.08)", color:"#dc2626",
                            fontSize:13, fontWeight:600, cursor:"pointer",
                          }}>Rechazar</button>
                      </div>
                    </Fld>
                  )}
                  {estado === "Aprobado" && (
                    <Fld label="Siguiente paso" full>
                      <div style={{
                        padding:"8px 12px", borderRadius:7, fontSize:13,
                        background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.3)",
                        color:"#15803d", fontWeight:500,
                      }}>
                        {tipoPago === "Crédito"
                          ? "→ E6: Proceso de crédito (Servicios Financieros)"
                          : "→ E7: Validación de expediente"}
                      </div>
                    </Fld>
                  )}
                  <Fld label="Observaciones" full>
                    <textarea className="ef-input"
                      style={{ ...IS, minHeight:56, resize:"vertical" }}
                      value={form.e5Notas || ""}
                      onChange={e => set("e5Notas", e.target.value)}
                      placeholder="Motivo de rechazo, condiciones especiales, instrucciones al asesor..." />
                  </Fld>
                </Sec>
              );
            })()}

            {/* § E6 — PROCESO DE CRÉDITO */}
            {form.formaPagoCot === "Crédito" && (function() {
              var ICO_BANK = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M3 10l9-7 9 7"/><line x1="12" y1="10" x2="12" y2="21"/></svg>);
              var ESTADOS_E6 = ["Pendiente","En revisión","Aprobado","Rechazado","Condicional"];
              var COLOR_E6 = {
                "Pendiente":     { bg:"rgba(156,163,175,.12)", txt:"#6b7280", dot:"#9ca3af" },
                "En revisión":   { bg:"rgba(59,130,246,.10)",  txt:"#3b82f6", dot:"#3b82f6" },
                "Aprobado":      { bg:"rgba(34,197,94,.12)",   txt:"#16a34a", dot:"#22c55e" },
                "Rechazado":     { bg:"rgba(239,68,68,.10)",   txt:"#dc2626", dot:"#ef4444" },
                "Condicional":   { bg:"rgba(234,179,8,.12)",   txt:"#854d0e", dot:"#eab308" },
              };
              var estad = form.e6Estado || "Pendiente";
              var cfg6  = COLOR_E6[estad] || COLOR_E6["Pendiente"];
              return (
                <Sec ico={ICO_BANK} titulo="Proceso de crédito (E6)">
                  <Fld label="Estado del crédito" full>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {ESTADOS_E6.map(op => (
                        <button key={op} type="button" onClick={() => set("e6Estado", op)}
                          style={{
                            padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:600,
                            border:"1px solid var(--line)", cursor:"pointer", transition:"all .15s",
                            background: estad === op ? COLOR_E6[op].dot : "var(--card)",
                            color:       estad === op ? "#fff"           : "var(--muted)",
                          }}>{op}</button>
                      ))}
                    </div>
                  </Fld>
                  <Fld label="Institución financiera">
                    <input className="ef-input" style={IS}
                      value={form.e6Institucion || ""}
                      onChange={e => set("e6Institucion", e.target.value)}
                      placeholder="Banco, financiera o SOFOM..." />
                  </Fld>
                  <Fld label="Fecha solicitud">
                    <input type="date" className="ef-input" style={IS}
                      value={form.e6FechaSolicitud || ""}
                      onChange={e => set("e6FechaSolicitud", e.target.value)} />
                  </Fld>
                  <Fld label="Fecha resultado">
                    <input type="date" className="ef-input" style={IS}
                      value={form.e6FechaResultado || ""}
                      onChange={e => set("e6FechaResultado", e.target.value)} />
                  </Fld>
                  <Fld label="Monto aprobado ($)">
                    <input type="number" className="ef-input" style={IS} min="0" step="1000"
                      value={form.e6MontoAprobado || ""}
                      placeholder="0"
                      onChange={e => set("e6MontoAprobado", Number(e.target.value) || 0)} />
                  </Fld>
                  <Fld label="Mensualidad real del banco ($)">
                    <input type="number" className="ef-input"
                      style={{ ...IS, fontWeight:700, color:"var(--accent)" }}
                      min="0" step="100"
                      value={form.e6MensualidadReal || ""}
                      placeholder="0"
                      onChange={e => set("e6MensualidadReal", Number(e.target.value) || 0)} />
                  </Fld>
                  <Fld label="Condiciones / observaciones" full>
                    <textarea className="ef-input"
                      style={{ ...IS, minHeight:64, resize:"vertical" }}
                      value={form.e6Condiciones || ""}
                      onChange={e => set("e6Condiciones", e.target.value)}
                      placeholder="Tasa, seguro de vida, condición de aprobación..." />
                  </Fld>
                </Sec>
              );
            })()}

            {/* § E7 — VALIDACIÓN DE EXPEDIENTE */}
            {(function() {
              var ICO_CLIP = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>);
              var items = _buildExpedienteItems(form);

              var hayRojo    = items.some(function(x){ return x.req && !x.ok && !form.e7ExcepcionAuth; });
              var hayAmarillo= !hayRojo && items.some(function(x){ return !x.ok; });
              var semColor   = hayRojo ? "#ef4444" : hayAmarillo ? "#eab308" : "#22c55e";
              var semLabel   = hayRojo ? "Expediente incompleto" : hayAmarillo ? "Expediente pendiente" : "Expediente completo";
              var semBg      = hayRojo ? "rgba(239,68,68,.10)" : hayAmarillo ? "rgba(234,179,8,.10)" : "rgba(34,197,94,.10)";
              var semBorder  = hayRojo ? "rgba(239,68,68,.35)" : hayAmarillo ? "rgba(234,179,8,.35)" : "rgba(34,197,94,.35)";
              return (
                <Sec ico={ICO_CLIP} titulo="Validación de expediente (E7)">
                  <Fld label="Estado del expediente" full>
                    <div style={{
                      padding:"10px 14px", borderRadius:8,
                      border:"1px solid " + semBorder, background:semBg,
                      display:"flex", alignItems:"center", gap:10,
                    }}>
                      <span style={{
                        width:14, height:14, borderRadius:"50%", background:semColor, flexShrink:0,
                        boxShadow:"0 0 6px " + semColor,
                      }} />
                      <span style={{ fontWeight:700, fontSize:13, color:semColor }}>{semLabel}</span>
                    </div>
                  </Fld>
                  <Fld label="Checklist de expediente" full>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {items.map(function(it, idx) {
                        var dot  = it.ok ? "#22c55e" : it.req ? "#ef4444" : "#eab308";
                        var icon = it.ok ? "✓" : it.req ? "✗" : "○";
                        return (
                          <div key={idx}
                            onClick={it.manual ? function(){ set("e7ContratoOk", !form.e7ContratoOk); } : undefined}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0",
                              cursor: it.manual ? "pointer" : "default" }}>
                            <span style={{
                              width:18, height:18, borderRadius:4, background:dot + "22",
                              border:"1px solid " + dot, display:"flex", alignItems:"center",
                              justifyContent:"center", fontSize:10, fontWeight:800,
                              color:dot, flexShrink:0,
                            }}>{icon}</span>
                            <span style={{ fontSize:12, color: it.ok ? "var(--ink)" : "var(--muted)",
                              fontWeight: it.req && !it.ok ? 600 : 400 }}>
                              {it.label}{it.req && !it.ok ? " *" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Fld>
                  {(hayRojo || hayAmarillo) && (
                    <Fld label="Excepción autorizada por gerente" full>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:form.e7ExcepcionAuth ? 6 : 0 }}>
                        <button type="button"
                          onClick={() => set("e7ExcepcionAuth", !form.e7ExcepcionAuth)}
                          style={{
                            padding:"5px 14px", borderRadius:7, fontSize:12, fontWeight:600,
                            border:"1px solid " + (form.e7ExcepcionAuth ? "#f59e0b" : "var(--line)"),
                            background: form.e7ExcepcionAuth ? "rgba(245,158,11,.12)" : "var(--card)",
                            color: form.e7ExcepcionAuth ? "#92400e" : "var(--muted)", cursor:"pointer",
                          }}>
                          {form.e7ExcepcionAuth ? "✓ Excepción autorizada" : "Autorizar excepción"}
                        </button>
                      </div>
                      {form.e7ExcepcionAuth && (
                        <input className="ef-input" style={IS}
                          value={form.e7ExcepcionNota || ""}
                          onChange={e => set("e7ExcepcionNota", e.target.value)}
                          placeholder="Motivo de la excepción..." />
                      )}
                    </Fld>
                  )}
                  <Fld label="Observaciones del expediente" full>
                    <textarea className="ef-input"
                      style={{ ...IS, minHeight:56, resize:"vertical" }}
                      value={form.e7Obs || ""}
                      onChange={e => set("e7Obs", e.target.value)}
                      placeholder="Notas sobre documentos faltantes, próximos pasos..." />
                  </Fld>
                </Sec>
              );
            })()}

            {/* § E8 — EXPEDIENTE */}
            {(function() {
              var ICO_EXP = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>);
              var subiendo    = e8Subiendo;
              var setSubiendo = setE8Subiendo;
              var errSub      = e8ErrSub;
              var setErrSub   = setE8ErrSub;

              async function handleContrato(file) {
                if (!file) return;
                if (!window.DB || !window.DB.storage) { setErrSub("Storage no disponible"); return; }
                var agencyId = window.AUTOMIND && window.AUTOMIND.agencyId;
                if (!agencyId || !form.id) { setErrSub("Guarda el cliente primero"); return; }
                setSubiendo(true); setErrSub("");
                var ext  = file.name.split(".").pop().toLowerCase();
                var path = agencyId + "/" + form.id + "/contrato_" + Date.now() + "." + ext;
                var { error } = await window.DB.storage.from("expedientes").upload(path, file, { upsert: true });
                if (error) { setErrSub(error.message); setSubiendo(false); return; }
                var { data: urlData } = window.DB.storage.from("expedientes").getPublicUrl(path);
                var url = (urlData && urlData.publicUrl) || path;
                set("e8ContratoUrl",    url);
                set("e8ContratoNombre", file.name);
                set("e8ContratoFecha",  new Date().toISOString().slice(0, 10));
                setSubiendo(false);
              }

              return (
                <Sec ico={ICO_EXP} titulo="Expediente">
                  {/* Contrato firmado */}
                  <Fld label="Contrato firmado" full>
                    {form.e8ContratoUrl ? (
                      <div style={{
                        padding:"10px 12px", borderRadius:8, border:"1px solid rgba(34,197,94,.4)",
                        background:"rgba(34,197,94,.06)", display:"flex", alignItems:"center", gap:10,
                      }}>
                        <span style={{ fontSize:20 }}>📄</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"var(--ink)",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {form.e8ContratoNombre || "Contrato firmado"}
                          </div>
                          {form.e8ContratoFecha && (
                            <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>
                              Cargado el {new Date(form.e8ContratoFecha + "T12:00:00").toLocaleDateString("es-MX", { day:"numeric", month:"long", year:"numeric" })}
                            </div>
                          )}
                        </div>
                        <a href={form.e8ContratoUrl} target="_blank" rel="noopener noreferrer"
                          style={{
                            padding:"5px 12px", borderRadius:7, border:"1px solid var(--accent)",
                            background:"transparent", color:"var(--accent)",
                            fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0,
                          }}>Ver</a>
                        <button type="button"
                          onClick={() => { set("e8ContratoUrl", null); set("e8ContratoNombre", ""); set("e8ContratoFecha", ""); }}
                          style={{
                            background:"none", border:"none", cursor:"pointer",
                            color:"var(--muted)", fontSize:16, flexShrink:0, padding:"0 4px",
                          }}>✕</button>
                      </div>
                    ) : (
                      <label style={{
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                        gap:6, padding:"20px 16px", borderRadius:8, cursor:"pointer",
                        border:"1.5px dashed var(--line)", background:"var(--bg)", transition:"border-color .15s",
                      }}
                        onMouseEnter={function(e){ e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onMouseLeave={function(e){ e.currentTarget.style.borderColor = "var(--line)"; }}>
                        <span style={{ fontSize:28, opacity:.5 }}>📎</span>
                        <span style={{ fontSize:13, color:"var(--muted)", fontWeight:500 }}>
                          {subiendo ? "Subiendo..." : "Cargar contrato firmado"}
                        </span>
                        <span style={{ fontSize:11, color:"var(--muted)", opacity:.7 }}>PDF · JPG · PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }}
                          disabled={subiendo}
                          onChange={function(e){ handleContrato(e.target.files[0]); e.target.value = ""; }} />
                      </label>
                    )}
                    {errSub && (
                      <div style={{ marginTop:6, fontSize:12, color:"#dc2626", padding:"6px 10px",
                        borderRadius:6, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)" }}>
                        {errSub}
                      </div>
                    )}
                  </Fld>
                </Sec>
              );
            })()}

            {/* § PROCESO DE VENTA */}
            <Sec ico={ICO_PROCESO} titulo="Proceso de venta">
              <Fld label="Etapa">
                <select className="ef-select" style={IS} value={form.etapa || "Prospección"} onChange={e => set("etapa", e.target.value)}>
                  {ETAPAS_CRM.map(e => <option key={e}>{e}</option>)}
                </select>
              </Fld>
              <Fld label="Probabilidad de cierre">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <input type="number" min="0" max="100" className="ef-input"
                    style={{ ...IS, width:72 }}
                    value={form.prob || 0}
                    onChange={e => set("prob", Math.min(100, Math.max(0, Number(e.target.value))))} />
                  <div style={{ flex:1, height:6, background:"var(--line)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:3, transition:"width .3s",
                      width:(form.prob || 0) + "%",
                      background:(form.prob||0) >= 70 ? "#22c55e" : (form.prob||0) >= 40 ? "#d99613" : "#e0492f",
                    }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, minWidth:30,
                    color:(form.prob||0) >= 70 ? "#1f9d57" : (form.prob||0) >= 40 ? "#d99613" : "#e0492f" }}>
                    {form.prob || 0}%
                  </span>
                </div>
              </Fld>
              <Fld label="Asesor asignado" full>
                <select className="ef-select" style={IS} value={form.asesor || ""} onChange={e => set("asesor", e.target.value)}>
                  {asesoresOpc.map(a => <option key={a}>{a}</option>)}
                </select>
              </Fld>
              <Fld label="Próxima acción" full>
                <input className="ef-input" style={IS} value={form.prox || ""} onChange={e => set("prox", e.target.value)} />
              </Fld>
              <Fld label="Fecha próxima acción">
                <input type="date" className="ef-input" style={IS} value={form.fprox || ""} onChange={e => set("fprox", e.target.value)} />
              </Fld>
              <Fld label="Último contacto">
                <input type="date" className="ef-input" style={IS} value={form.uc || ""} onChange={e => set("uc", e.target.value)} />
              </Fld>
              <Fld label="Notas" full>
                <textarea className="ef-input"
                  style={{ ...IS, minHeight:76, resize:"vertical" }}
                  value={form.notas || ""}
                  onChange={e => set("notas", e.target.value)} />
              </Fld>
            </Sec>

            {/* § UNIDAD VINCULADA (desde Plan Piso) */}
            {form.vinVinculado && (
              <Sec ico={ICO_LINK} titulo="Unidad vinculada (Plan Piso)">
                <Fld label="VIN" full>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                    background:"var(--bg)", borderRadius:8, border:"1px solid var(--line)" }}>
                    {ICO_AUTO}
                    <code style={{ fontSize:13, fontWeight:700, color:"var(--ink)", letterSpacing:.5 }}>
                      {form.vinVinculado}
                    </code>
                  </div>
                </Fld>
              </Sec>
            )}

          </div>
        </div>
      ) : (
        <div className="inv-form-panel"
          style={{ display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:12, color:"var(--muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" width="52" height="52" style={{ opacity:.25 }}>
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span style={{ fontSize:14, fontWeight:600 }}>Selecciona un cliente</span>
        </div>
      )}

      {/* Modal de selección de unidad (E4) */}
      {showUnitPicker && (
        <UnitPickerModal
          onSelect={function(u) {
            set("unidadId",   u.id);
            set("unidadDesc", u.desc);
            // Auto-rellenar precio de lista si la unidad lo trae
            if (u.precio > 0) {
              set("precioLista",     u.precio);
              set("precioVenta",     u.precio);
              set("descuentoMonto",  0);
              // Recalcular mensualidad si ya hay enganche y plazo
              var eng   = Number(form.enganche)    || 0;
              var meses = Number(form.plazoMeses)  || 0;
              if (meses > 0) set("mensualidadEst", Math.round((u.precio - eng) / meses));
            }
            setShowUnitPicker(false);
          }}
          onClose={() => setShowUnitPicker(false)}
        />
      )}

    </div>
  );
}

/* ── Drawer de detalle ─────────────────────────────────────────────────── */
function ClienteDrawer({ c, onClose }) {
  if (!c) return null;
  const dias = _dsc(c.uc);
  const cfg  = ETAPA_CFG[c.etapa] || {};

  const Field = ({ label, value }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
      <div style={{ fontSize:10, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</div>
      <div style={{ fontSize:13, color:"var(--ink)", fontWeight:500 }}>{value || "—"}</div>
    </div>
  );

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        {/* Cabecera */}
        <div className="dr-head">
          <div>
            <div className="dr-eyebrow">{c.id} · {c.canal} · {c.ciudad}, {c.estado}</div>
            <h2 style={{ margin:"4px 0 2px", fontSize:18 }}>{c.nombre}</h2>
            <div className="dr-meta">{c.tipo} · {c.uso}</div>
          </div>
          <button className="icon-btn ghost" onClick={onClose}>{I.close({ width: 20, height: 20 })}</button>
        </div>

        {/* Etapa + días sin contacto */}
        <div style={{ padding:"12px 20px", display:"flex", gap:10, alignItems:"center",
          borderBottom:"1px solid var(--line)", background: dias > 3 ? "#fff5f5" : "transparent" }}>
          <EtapaBadge etapa={c.etapa} />
          <span style={{ flex:1 }} />
          <DiasTag dias={dias} />
          <span style={{ fontSize:12, color: dias > 3 ? "#e0492f" : "var(--muted)" }}>
            {dias === 0 ? "Contactado hoy" : `Último contacto hace ${dias} día${dias !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Probabilidad */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
            letterSpacing:".06em", marginBottom:8 }}>Probabilidad de cierre</div>
          <ProbBar valor={c.prob} />
        </div>

        {/* Datos de contacto */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
            letterSpacing:".06em", marginBottom:12 }}>Contacto</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="Teléfono" value={c.tel} />
            <Field label="Email"    value={c.email} />
          </div>
        </div>

        {/* Perfil comercial */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
            letterSpacing:".06em", marginBottom:12 }}>Perfil comercial</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="Vehículo de interés" value={c.interes} />
            <Field label="Presupuesto estimado" value={"$" + c.presupuesto.toLocaleString("es-MX")} />
            <Field label="Forma de pago" value={c.formaPago} />
            <Field label="Uso del vehículo" value={c.uso} />
          </div>
        </div>

        {/* Origen */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
            letterSpacing:".06em", marginBottom:12 }}>Origen del prospecto</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="Canal" value={c.canal} />
            <Field label="Fuente específica" value={c.fuente} />
          </div>
        </div>

        {/* Seguimiento */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
            letterSpacing:".06em", marginBottom:12 }}>Seguimiento</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <Field label="Asesor" value={c.asesor} />
            <Field label="Último contacto" value={_fmtFechaCRM(c.uc)} />
          </div>
          <div style={{ background: dias > 3 ? "#fff5f5" : "var(--bg)", border:"1px solid var(--line)",
            borderRadius:8, padding:"10px 12px" }}>
            <div style={{ fontSize:10, fontWeight:700, color: dias > 3 ? "#c2410c" : "var(--muted)",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Próxima acción</div>
            <div style={{ fontSize:13, color:"var(--ink)", fontWeight:600 }}>{c.prox}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{_fmtFechaCRM(c.fprox)}</div>
          </div>
        </div>

        {/* Notas */}
        {c.notas && (
          <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--line)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase",
              letterSpacing:".06em", marginBottom:8 }}>Notas</div>
            <div style={{ fontSize:13, color:"var(--ink-2)", lineHeight:1.6, background:"var(--bg)",
              borderRadius:8, padding:"10px 12px" }}>{c.notas}</div>
          </div>
        )}

        <div className="dr-actions">
          <button className="btn primary"
            onClick={() => window.open("tel:" + c.tel.replace(/\D/g,""), "_self")}>
            Llamar
          </button>
          <button className="btn"
            onClick={() => window.open("https://wa.me/52" + c.tel.replace(/\D/g,""), "_blank")}>
            WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}

/* Campo helper — definido FUERA del modal para evitar re-mount en cada render */
function _NuevoCampo({ label, full, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".05em" }}>{label}</label>
      {children}
    </div>
  );
}

/* ── Modal "Nuevo cliente" ─────────────────────────────────────────────
   Crea un registro local con los campos del pipeline. Con datos reales
   esto haría un INSERT contra la tabla `clientes` de Supabase.
   initialData: objeto opcional con prefill desde Plan Piso (vin, interes…) */
function NuevoClienteModal({ onClose, onCreate, asesores, initialData }) {
  const asesorOpciones = asesores.filter(a => a !== "Todos");
  const ini = initialData || {};
  const [f, setF] = React.useState({
    nombre:"", tel:"", email:"", tipo:"Persona física",
    canal:        ini.canal        || "Digital",
    fuente:       "",
    interes:      ini.interes      || "",
    presupuesto:  ini.presupuesto  || "",
    formaPago:"No definido", uso:"Personal", ciudad:"", estado:"",
    asesor: ini.asesor && asesorOpciones.includes(ini.asesor) ? ini.asesor : (asesorOpciones[0] || ""),
    vinVinculado:  ini.vinVinculado  || "",
    inventarioId:  ini.inventarioId  || null,
  });
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const puedeCrear = f.nombre.trim().length > 0;

  const inputStyle = { width:"100%", padding:"7px 10px", border:"1px solid var(--line)",
    borderRadius:7, fontSize:13, background:"var(--card)", color:"var(--ink)",
    outline:"none", fontFamily:"inherit" };

  const Campo = _NuevoCampo;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        background:"var(--card)", borderRadius:12, width:"min(560px, 92vw)", maxHeight:"88vh",
        overflowY:"auto", zIndex:1000, boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>

        <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--line)",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:17 }}>Nuevo cliente</h2>
          <button className="icon-btn ghost" onClick={onClose}>{I.close({ width:18, height:18 })}</button>
        </div>

        {/* Banner de contexto cuando llega desde Plan Piso */}
        {ini.inventarioId && ini._ctx && (
          <div style={{ margin:"12px 22px 0", padding:"9px 13px", background:"#eff6ff",
            border:"1px solid #bfdbfe", borderRadius:8, fontSize:12, color:"#1d4ed8",
            display:"flex", alignItems:"center", gap:10 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round" width="15" height="15" style={{ flexShrink:0 }}>
              <path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.5L21 13v2.5h-7"/>
              <circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>
            </svg>
            <span>
              Desde piso · <b>{ini.interes}</b>
              {ini._ctx.colorExterior ? ` · ${ini._ctx.colorExterior}` : ""}
              {ini.vinVinculado ? <span style={{ marginLeft:6, fontFamily:"monospace", fontSize:11,
                background:"#dbeafe", padding:"1px 5px", borderRadius:4 }}>{ini.vinVinculado}</span> : null}
              <span style={{ marginLeft:8, fontWeight:700,
                color: ini._ctx.semaforo === "intereses" ? "#991b1b"
                     : ini._ctx.semaforo === "vencer"    ? "#c2410c"
                     : ini._ctx.semaforo === "comprometido" ? "#d97706" : "#166534" }}>
                · Día {ini._ctx.diasEnPiso} en piso
              </span>
            </span>
          </div>
        )}

        <div style={{ padding:"18px 22px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Campo label="Nombre completo *" full>
            <input style={inputStyle} value={f.nombre} onChange={set("nombre")} placeholder="Nombre y apellidos" autoFocus />
          </Campo>
          <Campo label="Teléfono">
            <input style={inputStyle} value={f.tel} onChange={set("tel")} placeholder="555-000-0000" />
          </Campo>
          <Campo label="Email">
            <input style={inputStyle} value={f.email} onChange={set("email")} placeholder="correo@ejemplo.com" />
          </Campo>
          <Campo label="Tipo de cliente">
            <select style={inputStyle} value={f.tipo} onChange={set("tipo")}>
              <option>Persona física</option><option>Persona moral</option>
            </select>
          </Campo>
          <Campo label="Canal de origen">
            <select style={inputStyle} value={f.canal} onChange={set("canal")}>
              {["Digital","Piso","Referido","Marketplace","Otro"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Fuente específica">
            <input style={inputStyle} value={f.fuente} onChange={set("fuente")} placeholder="Facebook Ads, visita directa…" />
          </Campo>
          <Campo label="Vehículo de interés">
            <input style={inputStyle} value={f.interes} onChange={set("interes")} placeholder="Marca, modelo, año" />
          </Campo>
          <Campo label="Presupuesto estimado">
            <input type="number" style={inputStyle} value={f.presupuesto} onChange={set("presupuesto")} placeholder="0" />
          </Campo>
          <Campo label="Forma de pago">
            <select style={inputStyle} value={f.formaPago} onChange={set("formaPago")}>
              {["No definido","Contado","Crédito"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Uso del vehículo">
            <select style={inputStyle} value={f.uso} onChange={set("uso")}>
              {["Personal","Trabajo","Familiar"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Campo>
          <Campo label="Ciudad">
            <input style={inputStyle} value={f.ciudad} onChange={set("ciudad")} />
          </Campo>
          <Campo label="Estado">
            <input style={inputStyle} value={f.estado} onChange={set("estado")} placeholder="Ej. N.L., Jal." />
          </Campo>
          <Campo label="Asesor asignado" full>
            <select style={inputStyle} value={f.asesor} onChange={set("asesor")}>
              {asesorOpciones.map(o => <option key={o}>{o}</option>)}
            </select>
          </Campo>
        </div>

        <div style={{ padding:"14px 22px", borderTop:"1px solid var(--line)",
          display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" disabled={!puedeCrear}
            style={{ opacity: puedeCrear ? 1 : .5, cursor: puedeCrear ? "pointer" : "not-allowed" }}
            onClick={() => puedeCrear && onCreate(f)}>
            Crear cliente
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Componente principal CRMClientes ────────────────────────────────── */
function CRMClientes({ rows, kpis, usuarios }) {
  const [clientesData, setClientesData] = React.useState([]);
  const [cargando,     setCargando]     = React.useState(false);
  const [errorCrm,     setErrorCrm]     = React.useState(null);
  const [vista, setVista]           = React.useState("editor");
  const [seleccionado, setSeleccionado] = React.useState(null);
  const [busqueda, setBusqueda]     = React.useState("");
  const [filtroAsesor, setFiltroAsesor] = React.useState("Todos");
  const [mostrarNuevo, setMostrarNuevo] = React.useState(false);
  const [pendingData, setPendingData]   = React.useState(null);
  const [editorSelId, setEditorSelId]   = React.useState(null);

  /* Detectar prefill desde Plan Piso al montar */
  React.useEffect(() => {
    const pending = window.AUTOMIND && window.AUTOMIND._pendingNuevoCliente;
    if (pending) {
      window.AUTOMIND._pendingNuevoCliente = null;
      setPendingData(pending);
      setMostrarNuevo(true);
    }
  }, []);

  /* Cargar clientes reales desde Supabase */
  React.useEffect(() => {
    var agencyId = window.AUTOMIND && window.AUTOMIND.agencyId;
    if (!agencyId || !window.DB) return;
    setCargando(true);
    setErrorCrm(null);
    window.DB.getClientes(agencyId)
      .then(function(lista) { setClientesData(lista); })
      .catch(function(err)  { console.error("[CRM] Error cargando clientes:", err); setErrorCrm("No se pudieron cargar los clientes."); })
      .finally(function()   { setCargando(false); });
  }, []);

  const asesores = ["Todos", ...Array.from(new Set(clientesData.map(c => c.asesor)))];

  const clientes = clientesData.filter(c => {
    const q = busqueda.toLowerCase();
    const matchBusq = !q ||
      c.nombre.toLowerCase().includes(q) ||
      c.interes.toLowerCase().includes(q) ||
      c.ciudad.toLowerCase().includes(q);
    const matchAsesor = filtroAsesor === "Todos" || c.asesor === filtroAsesor;
    return matchBusq && matchAsesor;
  });

  const urgentesCount = clientesData.filter(c => _dsc(c.uc) > 3).length;

  async function crearCliente(datos) {
    const hoy = new Date().toISOString().slice(0, 10);
    var nuevo = {
      id: "c" + Date.now(),
      nombre: datos.nombre.trim(),
      tel: datos.tel, email: datos.email, tipo: datos.tipo, canal: datos.canal,
      fuente: datos.fuente, interes: datos.interes,
      presupuesto: Number(datos.presupuesto) || 0,
      formaPago: datos.formaPago, uso: datos.uso,
      etapa: "Prospección", asesor: datos.asesor || "Sin asignar",
      prob: 10, uc: hoy, ciudad: datos.ciudad, estado: datos.estado,
      prox: "Primer contacto", fprox: hoy, notas: "",
      vinVinculado: datos.vinVinculado || null,
      inventarioId: datos.inventarioId || null,
    };
    /* Guardar en Supabase — reemplaza ID temporal con UUID real */
    var agencyId = window.AUTOMIND && window.AUTOMIND.agencyId;
    if (agencyId && window.DB) {
      try {
        var guardado = await window.DB.saveCliente(agencyId, nuevo);
        nuevo = Object.assign({}, guardado, {
          vinVinculado: datos.vinVinculado || null,
          inventarioId: datos.inventarioId || null,
        });
      } catch(e) {
        console.error("[CRM] Error guardando cliente:", e);
        window.alert(
          "⚠️ Error al guardar el cliente en la base de datos:\n\n" +
          (e.message || String(e)) +
          "\n\nPosible causa: falta ejecutar las migraciones SQL en Supabase.\n" +
          "Corre el archivo supabase_crm_setup_completo.sql en Supabase → SQL Editor."
        );
        return; /* no agregar a la lista si no se guardó */
      }
    }
    setClientesData(prev => [nuevo, ...prev]);
    setMostrarNuevo(false);
    setPendingData(null);
    setSeleccionado(nuevo);
    setEditorSelId(nuevo.id);
    setVista("editor");
  }

  async function onClienteUpdate(updated) {
    /* Actualizar estado local optimistamente */
    setClientesData(prev => prev.map(c => c.id === updated.id ? updated : c));
    /* Persistir en Supabase */
    var agencyId = window.AUTOMIND && window.AUTOMIND.agencyId;
    if (!agencyId || !window.DB) return;
    try {
      await window.DB.saveCliente(agencyId, updated);
    } catch(e) {
      console.error("[CRM] Error guardando cliente:", e);
      /* Revertir estado local */
      setClientesData(prev => prev.map(c => c.id === updated.id ? updated : c));
      window.alert("Error al guardar: " + (e.message || e));
    }
  }

  const TabBtn = ({ id, label, badge }) => (
    <button onClick={() => setVista(id)} style={{
      padding:"6px 14px", borderRadius:7, fontSize:13, fontWeight:600, border:"none",
      cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all .15s",
      background: vista === id ? "var(--accent)" : "var(--card)",
      color:       vista === id ? "#fff"         : "var(--muted)",
      boxShadow:   vista === id ? "0 2px 8px rgba(47,111,237,.22)" : "none",
    }}>
      {label}
      {badge > 0 && (
        <span style={{ background: vista === id ? "rgba(255,255,255,.25)" : "#fee2e2",
          color: vista === id ? "#fff" : "#991b1b",
          fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:20 }}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div style={{ padding: vista === "editor" ? "24px 28px 0" : "24px 28px", maxWidth:1400, margin:"0 auto" }}>

      {/* Encabezado */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ margin:"0 0 3px", fontSize:22, fontWeight:800 }}>CRM de Clientes</h1>
          <p style={{ margin:0, color:"var(--muted)", fontSize:14 }}>
            Pipeline de ventas · <span style={{ color:"#8b5cf6", fontWeight:600 }}>Datos de ejemplo</span>
          </p>
        </div>
        <button className="btn primary" style={{ display:"flex", alignItems:"center", gap:7 }}
          onClick={() => setMostrarNuevo(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            strokeLinejoin="round" width="15" height="15"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo cliente
        </button>
      </div>

      {/* KPIs — solo en vistas secundarias */}
      {vista !== "editor" && <StatsBar clientes={clientesData} />}

      {/* Controles */}
      <div style={{ display:"flex", gap:10, marginBottom: vista === "editor" ? 12 : 16,
        alignItems:"center", flexWrap:"wrap" }}>
        {/* Tabs de vista */}
        <div style={{ display:"flex", gap:6, background:"var(--bg)", borderRadius:9, padding:4 }}>
          <TabBtn id="editor"   label="Editor" />
          <TabBtn id="kanban"   label="Kanban" />
          <TabBtn id="lista"    label="Lista" />
          <TabBtn id="urgentes" label="Urgentes" badge={urgentesCount} />
        </div>

        {/* Búsqueda y filtro asesor — solo para vistas que no tienen buscador propio */}
        {vista !== "editor" && (
          <>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--muted)" }}>
                  {I.search({ width:14, height:14 })}
                </span>
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, vehículo, ciudad…"
                  style={{ width:"100%", padding:"7px 10px 7px 32px", border:"1px solid var(--line)",
                    borderRadius:7, fontSize:13, background:"var(--card)", color:"var(--ink)",
                    outline:"none", fontFamily:"inherit" }} />
              </div>
            </div>
            <select value={filtroAsesor} onChange={e => setFiltroAsesor(e.target.value)}
              style={{ padding:"7px 10px", border:"1px solid var(--line)", borderRadius:7,
                fontSize:13, background:"var(--card)", color:"var(--ink)", fontFamily:"inherit",
                cursor:"pointer", outline:"none" }}>
              {asesores.map(a => <option key={a}>{a}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Contenido de la vista */}
      {vista === "editor"   && (
        <ClienteEditor
          clientes={clientesData}
          defaultSelId={editorSelId}
          onUpdate={onClienteUpdate}
        />
      )}
      {vista === "kanban"   && <KanbanView   clientes={clientes} onOpen={setSeleccionado} />}
      {vista === "lista"    && <ListaGrid    clientes={clientes} onOpen={setSeleccionado} />}
      {vista === "urgentes" && <UrgentesView clientes={clientes} onOpen={setSeleccionado} />}

      {/* Estado cargando / vacío / error */}
      {cargando && (
        <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)", fontSize:14 }}>
          Cargando clientes…
        </div>
      )}
      {!cargando && errorCrm && (
        <div style={{ marginTop:16, padding:"12px 16px", background:"#fff5f5",
          border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#991b1b" }}>
          {errorCrm}
        </div>
      )}
      {!cargando && !errorCrm && clientesData.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 20px", color:"var(--muted)" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>&#128101;</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Sin clientes aún</div>
          <div style={{ fontSize:13 }}>Crea el primer cliente con el botón "Nuevo cliente".</div>
        </div>
      )}

      {/* Drawer de detalle */}
      <ClienteDrawer c={seleccionado} onClose={() => setSeleccionado(null)} />

      {/* Modal nuevo cliente (con prefill opcional desde Plan Piso) */}
      {mostrarNuevo && (
        <NuevoClienteModal
          asesores={asesores}
          onClose={() => { setMostrarNuevo(false); setPendingData(null); }}
          onCreate={crearCliente}
          initialData={pendingData}
        />
      )}
    </div>
  );
}

Object.assign(window, { CRMClientes });
