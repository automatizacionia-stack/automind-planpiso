/* Automind · Configuración de Alertas por Semáforo
   Permite configurar qué cambios de semáforo generan emails
   y a qué roles (vendedor, gerente, director). */

const SEM_CONFIG = [
  { key:"intereses",    emoji:"⚫", label:"En intereses",        desc:"Vehículo ya genera interés — urgente",      color:"#2d3142" },
  { key:"vencer",       emoji:"🔴", label:"Próximo a vencer",    desc:"Vence en los próximos 15 días",             color:"#e0492f" },
  { key:"comprometido", emoji:"🟠", label:"Margen comprometido", desc:"Más del 76% del plan consumido",            color:"#e07a20" },
  { key:"rotacion",     emoji:"🟡", label:"Rotación media",      desc:"Entre 61% y 76% del plan consumido",        color:"#d99613" },
  { key:"saludable",    emoji:"🟢", label:"Margen saludable",    desc:"Menos del 61% del plan consumido",          color:"#1f9d57" },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width:42, height:24, borderRadius:12, border:"none", cursor: disabled?"default":"pointer",
        background: checked ? "var(--accent)" : "#d1d5e0",
        position:"relative", transition:"background .2s", flexShrink:0, opacity: disabled ? .4 : 1,
      }}>
      <span style={{
        position:"absolute", top:3, left: checked ? 21 : 3,
        width:18, height:18, borderRadius:"50%", background:"#fff",
        transition:"left .2s", display:"block",
        boxShadow:"0 1px 4px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

function AlertRuleRow({ rule, onUpdate, saving }) {
  const sem = SEM_CONFIG.find(s => s.key === rule.semaforo);
  if (!sem) return null;

  return (
    <div className="alert-rule-row" style={{
      display:"flex", alignItems:"center", gap:0,
      padding:"16px 24px", borderBottom:"1px solid var(--line-2)",
      opacity: rule.activa ? 1 : .55,
    }}>
      {/* Semáforo */}
      <div style={{ flex:"0 0 220px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{sem.emoji}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"var(--ink)" }}>{sem.label}</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{sem.desc}</div>
          </div>
        </div>
      </div>

      {/* Activar alerta */}
      <div style={{ flex:"0 0 120px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <Toggle checked={rule.activa} onChange={v => onUpdate(rule.semaforo, "activa", v)} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>{rule.activa ? "Activa" : "Inactiva"}</span>
      </div>

      {/* Notificar vendedor */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <Toggle checked={rule.notify_vendedor} onChange={v => onUpdate(rule.semaforo, "notify_vendedor", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Vendedor</span>
      </div>

      {/* Notificar gerente */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <Toggle checked={rule.notify_gerente} onChange={v => onUpdate(rule.semaforo, "notify_gerente", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Gerente</span>
      </div>

      {/* Notificar director */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <Toggle checked={rule.notify_director} onChange={v => onUpdate(rule.semaforo, "notify_director", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Director</span>
      </div>

      {/* Estado guardado */}
      <div style={{ flex:"0 0 60px", textAlign:"center" }}>
        {saving === rule.semaforo && (
          <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} />
        )}
      </div>
    </div>
  );
}

function LogRow({ entry }) {
  const semTo = SEM_CONFIG.find(s => s.key === entry.semaforo_to);
  const semFrom = entry.semaforo_from ? SEM_CONFIG.find(s => s.key === entry.semaforo_from) : null;
  const fecha = new Date(entry.created_at);
  const fmtDate = `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()} ${fecha.getHours()}:${String(fecha.getMinutes()).padStart(2,"0")}`;
  return (
    <tr>
      <td style={{ padding:"10px 16px", fontSize:13, color:"var(--muted)" }}>{fmtDate}</td>
      <td style={{ padding:"10px 16px", fontSize:13 }}>{entry.vehicle_desc || entry.vehicle_id}</td>
      <td style={{ padding:"10px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
          {semFrom && <span style={{ color:semFrom.color }}>{semFrom.emoji}</span>}
          {semFrom && <span style={{ color:"var(--muted)" }}>→</span>}
          <span style={{ color:semTo?.color||"#666" }}>{semTo?.emoji} {semTo?.label || entry.semaforo_to}</span>
        </div>
      </td>
      <td style={{ padding:"10px 16px", fontSize:12, color:"var(--muted)" }}>
        {(entry.sent_to||[]).join(", ") || "—"}
      </td>
    </tr>
  );
}

function ConfigAlertas({ usuarioActual }) {
  const workspaceId = window.AUTOMIND?.agencyId;
  const [rules,       setRules]       = React.useState([]);
  const [log,         setLog]         = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [saving,      setSaving]      = React.useState(null);
  const [tab,         setTab]         = React.useState("reglas");
  const [testEmail,   setTestEmail]   = React.useState(usuarioActual?.email || "");
  const [testSending, setTestSending] = React.useState(false);
  const [testResult,  setTestResult]  = React.useState(null);

  React.useEffect(() => {
    if (!workspaceId || !window.DB) return;
    loadData();
  }, [workspaceId]);

  async function loadData() {
    setLoading(true);
    try {
      // Reglas
      const { data: rulesData } = await window.DB.client
        .from("alert_rules").select("*")
        .eq("workspace_id", workspaceId)
        .order("semaforo");
      // Si no hay reglas aún, crear defaults y guardarlos en Supabase
      if (!rulesData || rulesData.length === 0) {
        const defaults = SEM_CONFIG.map(s => ({
          workspace_id:    workspaceId,
          semaforo:        s.key,
          notify_vendedor: ["comprometido","vencer","intereses"].includes(s.key),
          notify_gerente:  ["comprometido","vencer","intereses"].includes(s.key),
          notify_director: ["comprometido","vencer","intereses"].includes(s.key),
          activa:          ["comprometido","vencer","intereses"].includes(s.key),
        }));
        // Guardar en Supabase para que la Edge Function las encuentre
        await window.DB.client
          .from("alert_rules")
          .upsert(defaults, { onConflict: "workspace_id,semaforo" });
        setRules(defaults);
      } else {
        // Ordenar igual que SEM_CONFIG
        const ordered = SEM_CONFIG.map(s => rulesData.find(r => r.semaforo === s.key) || {
          workspace_id: workspaceId, semaforo: s.key,
          notify_vendedor: false, notify_gerente: false, notify_director: false, activa: false,
        });
        setRules(ordered);
      }
      // Log reciente
      const { data: logData } = await window.DB.client
        .from("alert_log").select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50);
      setLog(logData || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleUpdate(semaforo, field, value) {
    setRules(prev => prev.map(r => r.semaforo === semaforo ? {...r, [field]: value} : r));
    setSaving(semaforo);
    try {
      const rule = rules.find(r => r.semaforo === semaforo);
      const updated = { ...rule, [field]: value, workspace_id: workspaceId };
      await window.DB.client
        .from("alert_rules")
        .upsert(updated, { onConflict: "workspace_id,semaforo" });
    } catch(e) {
      console.error(e);
      // Revertir en caso de error
      setRules(prev => prev.map(r => r.semaforo === semaforo ? {...r, [field]: !value} : r));
    } finally {
      setTimeout(() => setSaving(null), 600);
    }
  }

  async function sendTestEmail() {
    if (!testEmail) return;
    setTestSending(true); setTestResult(null);
    try {
      const { data: { session } } = await window.DB.client.auth.getSession();
      const res = await fetch(`${window.SUPABASE_URL}/functions/v1/send-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": window.SUPABASE_ANON,
        },
        body: JSON.stringify({
          workspaceId,
          vehicleId:    "TEST-001",
          vehicleDesc:  "Nuevo Jetta Trendline 2026",
          vin:          "3VWCP6BU1TM016475",
          diasEnPiso:    45,
          interesAcum:   3200,
          pctPlanConsumido: 110,
          semaforoFrom: "vencer",
          semaforoTo:   "intereses",
          directorEmail: testEmail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({ ok: true, msg: "✓ Email enviado a " + testEmail });
      } else if (json.skipped) {
        setTestResult({ ok: false, msg: "Omitido: " + json.reason });
      } else {
        setTestResult({ ok: false, msg: "Error: " + (json.error || JSON.stringify(json)) });
      }
    } catch(e) {
      setTestResult({ ok: false, msg: "Error de conexión: " + e.message });
    } finally {
      setTestSending(false);
    }
  }

  return (
    <div className="usr-shell">
      <div className="usr-header">
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800 }}>Alertas de Semáforo</h1>
          <p className="page-sub" style={{ margin:0 }}>
            Configura qué cambios de estado generan correos automáticos al equipo.
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className={"btn" + (tab==="reglas"?" primary":"")} onClick={() => setTab("reglas")}>
            Reglas
          </button>
          <button className={"btn" + (tab==="historial"?" primary":"")} onClick={() => { setTab("historial"); loadData(); }}>
            Historial
          </button>
        </div>
      </div>

      {/* Panel de prueba — siempre visible */}
      <div style={{ background:"var(--card)", border:"1px solid var(--line)", borderRadius:"var(--radius)",
        padding:"20px 24px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)", flex:"0 0 auto" }}>
          🧪 Prueba de email
        </div>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={testEmail}
          onChange={e => { setTestEmail(e.target.value); setTestResult(null); }}
          style={{ flex:1, minWidth:220, height:38, border:"1.5px solid var(--line)", borderRadius:9,
            padding:"0 12px", fontSize:14, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg)" }}
        />
        <button className="btn primary" onClick={sendTestEmail} disabled={testSending || !testEmail}
          style={{ flexShrink:0 }}>
          {testSending ? <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} /> : null}
          {testSending ? " Enviando…" : "Enviar email de prueba"}
        </button>
        {testResult && (
          <div style={{ width:"100%", padding:"8px 12px", borderRadius:8, fontSize:13, fontWeight:600,
            background: testResult.ok ? "#e7f5ed" : "#fcebe7",
            color: testResult.ok ? "#0f7a40" : "#e0492f" }}>
            {testResult.msg}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:48 }}>
          <span className="login-spinner" style={{ width:28, height:28, borderWidth:3 }} />
        </div>
      ) : tab === "reglas" ? (
        <div style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--line)", overflow:"hidden" }}>
          {/* Header tabla */}
          <div style={{ display:"flex", alignItems:"center", gap:0, padding:"12px 24px",
            background:"var(--bg)", borderBottom:"1px solid var(--line)",
            fontSize:11.5, fontWeight:800, textTransform:"uppercase", letterSpacing:".05em", color:"var(--muted)" }}>
            <div style={{ flex:"0 0 220px" }}>Estado del semáforo</div>
            <div style={{ flex:"0 0 120px", textAlign:"center" }}>Alerta activa</div>
            <div style={{ flex:1, textAlign:"center" }}>Vendedor</div>
            <div style={{ flex:1, textAlign:"center" }}>Gerente</div>
            <div style={{ flex:1, textAlign:"center" }}>Director</div>
            <div style={{ flex:"0 0 60px" }}></div>
          </div>
          {rules.map(rule => (
            <AlertRuleRow key={rule.semaforo} rule={rule} onUpdate={handleUpdate} saving={saving} />
          ))}
          <div style={{ padding:"14px 24px", fontSize:12.5, color:"var(--muted)", borderTop:"1px solid var(--line-2)" }}>
            💡 Los emails se envían cuando un vehículo cambia de estado al guardar cambios o importar inventario.
            Requiere Resend configurado en las Edge Functions.
          </div>
        </div>
      ) : (
        <div style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--line)", overflow:"hidden" }}>
          {log.length === 0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center", color:"var(--muted)" }}>
              No hay alertas enviadas aún.
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"var(--bg)", borderBottom:"1px solid var(--line)" }}>
                    <th style={{ padding:"10px 16px", fontWeight:700, color:"var(--muted)", textAlign:"left", fontSize:11.5 }}>FECHA</th>
                    <th style={{ padding:"10px 16px", fontWeight:700, color:"var(--muted)", textAlign:"left", fontSize:11.5 }}>VEHÍCULO</th>
                    <th style={{ padding:"10px 16px", fontWeight:700, color:"var(--muted)", textAlign:"left", fontSize:11.5 }}>CAMBIO</th>
                    <th style={{ padding:"10px 16px", fontWeight:700, color:"var(--muted)", textAlign:"left", fontSize:11.5 }}>ENVIADO A</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map(entry => <LogRow key={entry.id} entry={entry} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ConfigAlertas });
