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

/* ── Lista ────────────────────────────────────────────────────────────── */
function ListaView({ clientes, onOpen }) {
  const cols = ["Nombre","Etapa","Vehículo de interés","Presupuesto","Forma pago","Asesor","Sin contacto","Próxima acción"];
  return (
    <div className="dcard">
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"var(--bg)" }}>
              {cols.map(h => (
                <th key={h} style={{ padding:"8px 13px", textAlign:"left", fontSize:11,
                  fontWeight:700, color:"var(--muted)", borderBottom:"1px solid var(--line)",
                  whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes.map((c, i) => (
              <tr key={c.id}
                onClick={() => onOpen(c)}
                style={{ borderBottom:"1px solid var(--line)", cursor:"pointer",
                  background: i % 2 === 0 ? "transparent" : "var(--bg)" }}
                onMouseOver={e => e.currentTarget.style.background = "#f0f4ff"}
                onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--bg)"}
              >
                <td style={{ padding:"9px 13px", fontWeight:700, color:"var(--ink)", whiteSpace:"nowrap" }}>
                  {c.nombre}
                </td>
                <td style={{ padding:"9px 13px" }}><EtapaBadge etapa={c.etapa} /></td>
                <td style={{ padding:"9px 13px", color:"var(--ink-2)", fontSize:12, whiteSpace:"nowrap" }}>{c.interes}</td>
                <td style={{ padding:"9px 13px", fontWeight:600, color:"var(--ink)", whiteSpace:"nowrap" }}>
                  ${(c.presupuesto / 1000).toFixed(0)}k
                </td>
                <td style={{ padding:"9px 13px", color:"var(--muted)", whiteSpace:"nowrap" }}>{c.formaPago}</td>
                <td style={{ padding:"9px 13px", color:"var(--muted)", whiteSpace:"nowrap" }}>{c.asesor.split(" ")[0]}</td>
                <td style={{ padding:"9px 13px" }}><DiasTag dias={_dsc(c.uc)} /></td>
                <td style={{ padding:"9px 13px", color:"var(--muted)", fontSize:12, maxWidth:220,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {c.prox}
                </td>
              </tr>
            ))}
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

  const Campo = ({ label, full, children }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:4, gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".05em" }}>{label}</label>
      {children}
    </div>
  );

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
  const [clientesData, setClientesData] = React.useState(CLIENTES_DUMMY);
  const [vista, setVista]           = React.useState("kanban");
  const [seleccionado, setSeleccionado] = React.useState(null);
  const [busqueda, setBusqueda]     = React.useState("");
  const [filtroAsesor, setFiltroAsesor] = React.useState("Todos");
  const [mostrarNuevo, setMostrarNuevo] = React.useState(false);
  const [pendingData, setPendingData]   = React.useState(null);

  /* Detectar prefill desde Plan Piso al montar */
  React.useEffect(() => {
    const pending = window.AUTOMIND && window.AUTOMIND._pendingNuevoCliente;
    if (pending) {
      window.AUTOMIND._pendingNuevoCliente = null;
      setPendingData(pending);
      setMostrarNuevo(true);
    }
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

  function crearCliente(datos) {
    const hoy = new Date().toISOString().slice(0, 10);
    const nuevo = {
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
    setClientesData(prev => [nuevo, ...prev]);
    setMostrarNuevo(false);
    setPendingData(null);
    setSeleccionado(nuevo);
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
    <div style={{ padding:"24px 28px", maxWidth:1400, margin:"0 auto" }}>

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

      {/* KPIs */}
      <StatsBar clientes={clientesData} />

      {/* Controles */}
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
        {/* Tabs de vista */}
        <div style={{ display:"flex", gap:6, background:"var(--bg)", borderRadius:9, padding:4 }}>
          <TabBtn id="kanban"   label="Kanban" />
          <TabBtn id="lista"    label="Lista" />
          <TabBtn id="urgentes" label="Urgentes" badge={urgentesCount} />
        </div>

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
      </div>

      {/* Contenido de la vista */}
      {vista === "kanban"   && <KanbanView   clientes={clientes} onOpen={setSeleccionado} />}
      {vista === "lista"    && <ListaView    clientes={clientes} onOpen={setSeleccionado} />}
      {vista === "urgentes" && <UrgentesView clientes={clientes} onOpen={setSeleccionado} />}

      {/* Aviso datos demo */}
      <div style={{ marginTop:20, padding:"10px 16px", background:"#fef9c3", border:"1px solid #fde047",
        borderRadius:8, fontSize:12, color:"#854d0e", display:"flex", alignItems:"center", gap:8 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
          strokeLinejoin="round" width="15" height="15" style={{ flexShrink:0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Vista con datos de ejemplo. Conecta con la tabla <code style={{ background:"rgba(0,0,0,.07)", padding:"1px 5px", borderRadius:4 }}>clientes</code> en Supabase corriendo el archivo <code style={{ background:"rgba(0,0,0,.07)", padding:"1px 5px", borderRadius:4 }}>supabase_add_clientes.sql</code> para activar datos reales.
      </div>

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
