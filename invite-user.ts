// Automind · Edge Function: invite-user
// Crea el usuario en Supabase Auth y envía el email de invitación via Brevo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No autorizado");

    // Cliente admin con service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar que el invitador está autenticado
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: invitador }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !invitador) throw new Error("No autenticado");

    // ── Parsear payload ─────────────────────────────────────────────
    const {
      email, nombre, tel, rol, reportaA, fechaIngreso,
      workspaceId, agencyId, userId,
    } = await req.json();

    if (!email || !nombre || !rol || !workspaceId) {
      throw new Error("Faltan campos: email, nombre, rol, workspaceId");
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://automatizacionia-stack.github.io/automind-planpiso";

    // ── 1. Crear usuario en Supabase Auth o reenviar link ──────────
    let authUserId: string | null = null;
    let emailSentBySupabase = false;

    const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: siteUrl, data: { nombre, rol, workspace_id: workspaceId } }
    );

    if (inviteErr) {
      // Usuario ya existe en Auth — generar link de recuperación para reenviar acceso
      if (inviteErr.message?.includes("already") || inviteErr.status === 422) {
        const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const existing = users?.find((u: any) => u.email === email);
        authUserId = existing?.id || null;

        // Generar magic link de recuperación y enviarlo via Brevo
        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: siteUrl },
        });
        if (linkData?.properties?.action_link) {
          // Enviar via Brevo con el link generado
          const brevoKey = Deno.env.get("BREVO_API_KEY");
          if (brevoKey) {
            await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: { "Content-Type": "application/json", "api-key": brevoKey },
              body: JSON.stringify({
                sender: { name: "Automind", email: "no-reply@coperva.com" },
                to: [{ email, name: nombre }],
                subject: "Tu acceso a Automind Plan Piso",
                htmlContent: `
                  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                    <div style="background:#2f6fed;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                      <h1 style="color:#fff;margin:0;font-size:22px">🚗 Automind</h1>
                    </div>
                    <h2 style="color:#1a1a2e">Hola, ${nombre}</h2>
                    <p style="color:#555;line-height:1.6">
                      Has sido invitado como <strong>${rol}</strong> a Automind Plan Piso.
                      Haz clic en el botón para activar o restablecer tu acceso:
                    </p>
                    <div style="text-align:center;margin:28px 0">
                      <a href="${linkData.properties.action_link}"
                        style="background:#2f6fed;color:#fff;text-decoration:none;padding:14px 32px;
                        border-radius:10px;font-weight:700;font-size:15px;display:inline-block">
                        Activar mi cuenta →
                      </a>
                    </div>
                    <p style="color:#aaa;font-size:12px;text-align:center">
                      Si no esperabas este correo, ignóralo.
                    </p>
                  </div>
                `,
              }),
            });
            emailSentBySupabase = true;
          }
        }
      } else {
        throw new Error("Error Auth: " + inviteErr.message);
      }
    } else {
      authUserId = inviteData?.user?.id || null;
      emailSentBySupabase = true; // Supabase envió el email automáticamente
    }

    // ── 2. Guardar en tabla users ───────────────────────────────────
    const rowId = userId || (rol[0].toUpperCase() + Date.now().toString().slice(-6));
    const userRow: any = {
      id:            rowId,
      nombre,
      email,
      tel:           tel || null,
      rol,
      reporta_a:     reportaA || null,
      fecha_ingreso: fechaIngreso || null,
      workspace_id:  workspaceId,
      agency_id:     agencyId || workspaceId,
    };
    if (authUserId) userRow.auth_user_id = authUserId;

    const { data: savedUser, error: saveErr } = await adminClient
      .from("users")
      .upsert(userRow, { onConflict: "id" })
      .select().single();

    if (saveErr) throw new Error("Error DB: " + saveErr.message);

    // ── 3. Enviar email de invitación via Brevo ─────────────────────
    // Supabase Auth ya envió el link de invitación automáticamente.
    // Adicionalmente enviamos un email de bienvenida via Brevo.
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoKey,
        },
        body: JSON.stringify({
          sender: { name: "Automind", email: "no-reply@coperva.com" },
          to: [{ email, name: nombre }],
          subject: "Te invitaron a Automind Plan Piso",
          htmlContent: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <div style="background:#2f6fed;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:#fff;margin:0;font-size:22px">🚗 Automind</h1>
                <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px">Plan Piso</p>
              </div>
              <h2 style="color:#1a1a2e;margin:0 0 8px">Hola, ${nombre}</h2>
              <p style="color:#555;line-height:1.6">
                Te han invitado a unirte a <strong>Automind Plan Piso</strong> como <strong>${rol}</strong>.
              </p>
              <p style="color:#555;line-height:1.6">
                Revisa tu bandeja de entrada — te llegó otro correo de Supabase con el enlace para crear tu contraseña y activar tu cuenta.
              </p>
              <p style="color:#555;line-height:1.6">
                Una vez que actives tu cuenta, entra en:<br>
                <a href="${siteUrl}" style="color:#2f6fed">${siteUrl}</a>
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
              <p style="color:#aaa;font-size:12px;text-align:center">
                Automind · Plataforma de Plan Piso
              </p>
            </div>
          `,
        }),
      }).catch(e => console.warn("Brevo error:", e.message));
    }

    return new Response(
      JSON.stringify({ success: true, user: savedUser }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
