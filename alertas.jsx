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
      <div className="alert-col" style={{ flex:"0 0 120px" }}>
        <Toggle checked={rule.activa} onChange={v => onUpdate(rule.semaforo, "activa", v)} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>{rule.activa ? "Activa" : "Inactiva"}</span>
      </div>

      {/* Notificar vendedor */}
      <div className="alert-col">
        <Toggle checked={rule.notify_vendedor} onChange={v => onUpdate(rule.semaforo, "notify_vendedor", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Vendedor</span>
      </div>

      {/* Notificar gerente */}
      <div className="alert-col">
        <Toggle checked={rule.notify_gerente} onChange={v => onUpdate(rule.semaforo, "notify_gerente", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Gerente</span>
      </div>

      {/* Notificar director */}
      <div className="alert-col">
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

/* ── Fila de alerta con toggle de Telegram ──────────────────────────── */
function AlertRuleRowWithTg({ rule, onUpdate, onUpdateTg, saving }) {
  const sem = SEM_CONFIG.find(s => s.key === rule.semaforo);
  if (!sem) return null;

  return (
    <div className="alert-rule-row" style={{
      display:"flex", alignItems:"center", gap:0,
      padding:"16px 24px", borderBottom:"1px solid var(--line-2)",
      opacity: rule.activa ? 1 : .55,
    }}>
      <div style={{ flex:"0 0 220px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{sem.emoji}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"var(--ink)" }}>{sem.label}</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{sem.desc}</div>
          </div>
        </div>
      </div>
      <div className="alert-col" style={{ flex:"0 0 120px" }}>
        <Toggle checked={rule.activa} onChange={v => onUpdate(rule.semaforo, "activa", v)} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>{rule.activa ? "Activa" : "Inactiva"}</span>
      </div>
      <div className="alert-col">
        <Toggle checked={rule.notify_vendedor} onChange={v => onUpdate(rule.semaforo, "notify_vendedor", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Vendedor</span>
      </div>
      <div className="alert-col">
        <Toggle checked={rule.notify_gerente} onChange={v => onUpdate(rule.semaforo, "notify_gerente", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Gerente</span>
      </div>
      <div className="alert-col">
        <Toggle checked={rule.notify_director} onChange={v => onUpdate(rule.semaforo, "notify_director", v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, color:"var(--muted)" }}>Director</span>
      </div>
      {/* Columna Telegram */}
      <div className="alert-col">
        <Toggle checked={!!rule.telegram_enabled} onChange={v => onUpdateTg(rule.semaforo, v)} disabled={!rule.activa} />
        <span style={{ fontSize:11, display:"flex", alignItems:"center", gap:3, color:"var(--muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><path d="M21.2 2L2 10.4l7.4 2.3L20 6.4l-8.9 8.1v5.5l3.3-3.3"/></svg>
          Telegram
        </span>
      </div>
      <div style={{ flex:"0 0 40px", textAlign:"center" }}>
        {saving === rule.semaforo && (
          <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} />
        )}
      </div>
    </div>
  );
}

/* ── Tab Telegram ────────────────────────────────────────────────────── */
function TabTelegram({ usuarioActual, workspaceId, rules, onUpdateTg, saving }) {
  const [tgStatus,    setTgStatus]    = React.useState(null); // null | 'loading' | { chat_id } | 'not_linked'
  const [linkState,   setLinkState]   = React.useState(null); // null | 'loading' | { link, token } | 'error'
  const [copied,      setCopied]      = React.useState(false);
  const [testChatId,  setTestChatId]  = React.useState("");
  const [testTg,      setTestTg]      = React.useState(null); // null | 'loading' | 'ok' | 'error'

  // Comprobar si el usuario actual tiene Telegram vinculado
  React.useEffect(() => {
    checkMyTelegram();
  }, []);

  const isAgencyOwner = usuarioActual?.id === "agency-owner";

  async function checkMyTelegram() {
    setTgStatus("loading");
    try {
      const { data: { user } } = await window.DB.client.auth.getUser();
      if (!user) { setTgStatus("not_linked"); return; }
      if (isAgencyOwner) {
        // Admin: leer de admin_telegram table
        const { data } = await window.DB.client
          .from("admin_telegram")
          .select("telegram_chat_id, telegram_username")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        setTgStatus(data?.telegram_chat_id ? { chat_id: data.telegram_chat_id, username: data.telegram_username } : "not_linked");
      } else {
        const { data } = await window.DB.client
          .from("users")
          .select("telegram_chat_id, telegram_username")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        setTgStatus(data?.telegram_chat_id ? { chat_id: data.telegram_chat_id, username: data.telegram_username } : "not_linked");
      }
    } catch { setTgStatus("not_linked"); }
  }

  async function generateLink() {
    setLinkState("loading");
    try {
      // Usar RPC (Postgres function) en vez de Edge Function — más confiable
      const { data: json, error } = await window.DB.client.rpc("generate_telegram_token");
      if (error) { setLinkState({ errorMsg: error.message }); return; }
      if (json?.already_linked) {
        await checkMyTelegram();
        setLinkState(null);
      } else if (json?.link) {
        setLinkState({ link: json.link, token: json.token });
        // Refrescar estado cada 5 seg mientras el link está abierto
        const interval = setInterval(async () => {
          const { data: { user } } = await window.DB.client.auth.getUser();
          if (!user) { clearInterval(interval); return; }
          const tableName = isAgencyOwner ? "admin_telegram" : "users";
          const col = isAgencyOwner ? "auth_user_id" : "auth_user_id";
          const { data } = await window.DB.client
            .from(tableName).select("telegram_chat_id").eq(col, user.id).maybeSingle();
          if (data?.telegram_chat_id) {
            setTgStatus({ chat_id: data.telegram_chat_id });
            setLinkState(null);
            clearInterval(interval);
          }
        }, 5000);
        setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
      } else {
        setLinkState({ errorMsg: JSON.stringify(json) });
      }
    } catch(e) { setLinkState({ errorMsg: "Error: " + e.message }); }
  }

  async function disconnect() {
    if (!confirm("¿Seguro que deseas desvincular tu Telegram?")) return;
    try {
      const { data: { user } } = await window.DB.client.auth.getUser();
      if (isAgencyOwner) {
        // Admin: usar RPC para limpiar admin_telegram
        await window.DB.client.rpc("unlink_telegram");
        setTgStatus("not_linked"); setLinkState(null); return;
      } else {
        await window.DB.client.from("users")
          .update({ telegram_chat_id: null, telegram_username: null })
          .eq("auth_user_id", user.id);
      }
      setTgStatus("not_linked");
      setLinkState(null);
    } catch(e) { alert("Error al desvincular: " + e.message); }
  }

  async function sendTestTg() {
    if (!testChatId) return;
    setTestTg("loading");
    try {
      const { data: { session } } = await window.DB.client.auth.getSession();
      const res = await fetch(`${window.SUPABASE_URL}/functions/v1/send-telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": window.SUPABASE_ANON,
        },
        body: JSON.stringify({
          chat_id: testChatId,
          message: "⚫ <b>CRÍTICO · En intereses — PRUEBA</b>\n━━━━━━━━━━━━━━━━━━━━\n🚗 <b>Jetta Trendline 2026 · TEST-001</b>\n\n📅 Día <b>95</b> en piso\n📊 Plan consumido: <b>110%</b> 🔴 → ⚫\n💸 Interés acumulado: <b>$1,250.00</b>\n\nEste es un mensaje de prueba de Automind Plan Piso.",
        }),
      });
      const json = await res.json();
      setTestTg(json.ok || json.result?.ok ? "ok" : "error");
    } catch { setTestTg("error"); }
    setTimeout(() => setTestTg(null), 4000);
  }

  const isLinked = tgStatus && tgStatus !== "loading" && tgStatus !== "not_linked";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Mi cuenta ──────────────────────────────────────────────── */}
      <div className="dcard" style={{ padding:"24px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
          {/* Icono Telegram */}
          <div style={{ width:48, height:48, borderRadius:14, background:"#229ED9",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <path d="M21.2 2L2 10.4l7.4 2.3L20 6.4l-8.9 8.1v5.5l3.3-3.3"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"var(--ink)", marginBottom:3 }}>
              Mi cuenta de Telegram
            </div>
            {tgStatus === "loading" ? (
              <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} />
            ) : isLinked ? (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ background:"#dcfce7", color:"#166534", fontSize:12, fontWeight:700,
                    padding:"3px 10px", borderRadius:20, display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
                    Vinculado
                  </span>
                  {tgStatus.username && (
                    <span style={{ fontSize:13, color:"var(--muted)" }}>@{tgStatus.username}</span>
                  )}
                  <span style={{ fontSize:12, color:"var(--muted)" }}>
                    · Chat ID: <code style={{ background:"var(--bg)", padding:"1px 5px", borderRadius:4, fontSize:11 }}>
                      {tgStatus.chat_id}
                    </code>
                  </span>
                </div>
                <p style={{ margin:"0 0 12px", fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
                  Recibirás alertas en tu Telegram cuando las reglas de la derecha tengan el canal Telegram activado.
                </p>
                <button className="btn" style={{ fontSize:13, color:"#e0492f" }} onClick={disconnect}>
                  Desvincular mi Telegram
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin:"0 0 14px", fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
                  Vincula tu cuenta para recibir alertas de semáforo directamente en Telegram.
                  El proceso tarda menos de 30 segundos.
                </p>
                {!linkState && (
                  <button className="btn primary" onClick={generateLink}>
                    Conectar mi Telegram
                  </button>
                )}
                {linkState === "loading" && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--muted)" }}>
                    <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} />
                    Generando enlace…
                  </div>
                )}
                {linkState?.link && (
                  <div style={{ background:"#f0f7ff", border:"1px solid #bfdbfe",
                    borderRadius:12, padding:"16px 18px" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#1d4ed8",
                      textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
                      Paso a paso
                    </div>
                    <ol style={{ margin:"0 0 14px", paddingLeft:18, fontSize:13,
                      color:"var(--ink-2)", lineHeight:1.8, display:"flex", flexDirection:"column", gap:2 }}>
                      <li>Abre el enlace de abajo en tu dispositivo con Telegram</li>
                      <li>El bot se abrirá — presiona <strong>Iniciar</strong></li>
                      <li>Esta pantalla se actualizará automáticamente ✓</li>
                    </ol>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <a href={linkState.link} target="_blank" rel="noopener noreferrer"
                        className="btn primary" style={{ textDecoration:"none", fontSize:13 }}>
                        Abrir bot de Telegram
                      </a>
                      <button className="btn" style={{ fontSize:13 }} onClick={() => {
                        navigator.clipboard.writeText(linkState.link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}>
                        {copied ? "✓ Copiado" : "Copiar enlace"}
                      </button>
                    </div>
                    <div style={{ marginTop:10, fontSize:11, color:"var(--muted)" }}>
                      ⏰ El enlace expira en 30 minutos · Esperando confirmación…
                      <span className="login-spinner" style={{ width:10, height:10, borderWidth:2,
                        marginLeft:6, display:"inline-block", verticalAlign:"middle" }} />
                    </div>
                  </div>
                )}
                {linkState?.errorMsg && (
                  <div className="fb-err">Error: {linkState.errorMsg}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Reglas con Telegram ────────────────────────────────────── */}
      <div className="dcard">
        <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--line-2)" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:3 }}>
            ¿Cuándo enviar alertas por Telegram?
          </div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>
            Los estados con Telegram activado envían el mensaje al canal además del email — solo a usuarios que tengan su Telegram vinculado.
          </div>
        </div>
        <div className="alert-hd" style={{ display:"flex", padding:"10px 24px", gap:0 }}>
          <div style={{ flex:"0 0 220px" }}>Estado</div>
          <div style={{ flex:1, textAlign:"center" }}>Activa en email</div>
          <div style={{ flex:1, textAlign:"center", color:"#229ED9" }}>Telegram</div>
          <div style={{ flex:"0 0 40px" }}></div>
        </div>
        {rules.map(rule => {
          const sem = SEM_CONFIG.find(s => s.key === rule.semaforo);
          if (!sem) return null;
          return (
            <div key={rule.semaforo} style={{
              display:"flex", alignItems:"center", padding:"14px 24px",
              borderBottom:"1px solid var(--line-2)", opacity: rule.activa ? 1 : .55,
            }}>
              <div style={{ flex:"0 0 220px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>{sem.emoji}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{sem.label}</span>
              </div>
              <div style={{ flex:1, textAlign:"center" }}>
                <span style={{ fontSize:11, color: rule.activa ? "#1f9d57" : "var(--muted)",
                  fontWeight:600 }}>{rule.activa ? "✓ Activa" : "Inactiva"}</span>
              </div>
              <div className="alert-col" style={{ flex:1, justifyContent:"center" }}>
                <Toggle checked={!!rule.telegram_enabled} onChange={v => onUpdateTg(rule.semaforo, v)}
                  disabled={!rule.activa} />
                <span style={{ fontSize:11, color: rule.telegram_enabled ? "#229ED9" : "var(--muted)" }}>
                  {rule.telegram_enabled ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div style={{ flex:"0 0 40px", textAlign:"center" }}>
                {saving === rule.semaforo && (
                  <span className="login-spinner" style={{ width:12, height:12, borderWidth:2 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Prueba directa ─────────────────────────────────────────── */}
      <div className="dcard" style={{ padding:"20px 24px" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:4 }}>
          📱 Prueba de mensaje Telegram
        </div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>
          Ingresa un Chat ID para enviar un mensaje de prueba directamente.
          Puedes obtener tu Chat ID enviando <code style={{ background:"var(--bg)", padding:"1px 5px", borderRadius:4 }}>
            /status</code> al bot después de vincularte.
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <input type="text" value={testChatId} onChange={e => setTestChatId(e.target.value)}
            placeholder="Ej: 123456789"
            style={{ flex:1, minWidth:180, height:38, border:"1.5px solid var(--line)", borderRadius:9,
              padding:"0 12px", fontSize:14, fontFamily:"inherit", color:"var(--ink)", background:"var(--bg)" }} />
          <button className="btn primary" onClick={sendTestTg}
            disabled={testTg === "loading" || !testChatId} style={{ flexShrink:0 }}>
            {testTg === "loading"
              ? <span className="login-spinner" style={{ width:14, height:14, borderWidth:2 }} />
              : null}
            {testTg === "loading" ? " Enviando…" : "Enviar mensaje de prueba"}
          </button>
          {testTg === "ok"    && <span className="fb-ok" style={{ width:"100%" }}>✓ Mensaje enviado</span>}
          {testTg === "error" && <span className="fb-err" style={{ width:"100%" }}>Error al enviar. Verifica el chat_id y TELEGRAM_BOT_TOKEN.</span>}
        </div>
      </div>

    </div>
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
      const { data: rulesData, error: rulesErr } = await window.DB.client
        .from("alert_rules").select("*")
        .eq("workspace_id", workspaceId)
        .order("semaforo");
      // Si la lectura falló (red/RLS), NO asumir "sin reglas": antes esto
      // sobrescribía la configuración del usuario con los defaults
      if (rulesErr) throw rulesErr;
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

  async function handleUpdateTg(semaforo, value) {
    setRules(prev => prev.map(r => r.semaforo === semaforo ? {...r, telegram_enabled: value} : r));
    setSaving(semaforo);
    try {
      const rule = rules.find(r => r.semaforo === semaforo);
      await window.DB.client
        .from("alert_rules")
        .upsert({ ...rule, telegram_enabled: value, workspace_id: workspaceId },
          { onConflict: "workspace_id,semaforo" });
    } catch(e) {
      console.error(e);
      setRules(prev => prev.map(r => r.semaforo === semaforo ? {...r, telegram_enabled: !value} : r));
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
          <button className={"btn" + (tab==="reglas"?"   primary":"")} onClick={() => setTab("reglas")}>
            Reglas
          </button>
          <button className={"btn" + (tab==="telegram"?" primary":"")} onClick={() => setTab("telegram")}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M21.2 2L2 10.4l7.4 2.3L20 6.4l-8.9 8.1v5.5l3.3-3.3"/>
            </svg>
            Telegram
          </button>
          <button className={"btn" + (tab==="historial"?" primary":"")} onClick={() => { setTab("historial"); loadData(); }}>
            Historial
          </button>
        </div>
      </div>

      {/* Panel de prueba — siempre visible */}
      <div className="dcard" style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
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
          <div className={testResult.ok ? "fb-ok" : "fb-err"} style={{ width:"100%" }}>
            {testResult.msg}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:48 }}>
          <span className="login-spinner" style={{ width:28, height:28, borderWidth:3 }} />
        </div>
      ) : tab === "telegram" ? (
        <TabTelegram
          usuarioActual={usuarioActual}
          workspaceId={workspaceId}
          rules={rules}
          onUpdateTg={handleUpdateTg}
          saving={saving}
        />
      ) : tab === "reglas" ? (
        <div className="dcard">
          {/* Header tabla */}
          <div className="alert-hd">
            <div style={{ flex:"0 0 220px" }}>Estado del semáforo</div>
            <div style={{ flex:"0 0 120px", textAlign:"center" }}>Alerta activa</div>
            <div style={{ flex:1, textAlign:"center" }}>Vendedor</div>
            <div style={{ flex:1, textAlign:"center" }}>Gerente</div>
            <div style={{ flex:1, textAlign:"center" }}>Director</div>
            <div style={{ flex:1, textAlign:"center" }}>
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, color:"#229ED9" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M21.2 2L2 10.4l7.4 2.3L20 6.4l-8.9 8.1v5.5l3.3-3.3"/>
                </svg>
                Telegram
              </span>
            </div>
            <div style={{ flex:"0 0 40px" }}></div>
          </div>
          {rules.map(rule => (
            <AlertRuleRowWithTg key={rule.semaforo} rule={rule}
              onUpdate={handleUpdate} onUpdateTg={handleUpdateTg} saving={saving} />
          ))}
          <div style={{ padding:"14px 24px", fontSize:12.5, color:"var(--muted)", borderTop:"1px solid var(--line-2)" }}>
            💡 Los emails y mensajes Telegram se envían cuando un vehículo cambia de estado.
            El canal Telegram requiere que el usuario tenga su cuenta vinculada en la pestaña Telegram.
          </div>
        </div>
      ) : (
        <div className="dcard">
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
