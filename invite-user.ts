// Automind · Edge Function: invite-user
// Genera el link de invitación via Supabase Auth y lo envía via Brevo.
// No depende del SMTP de Supabase (que tiene límite muy bajo en plan free).

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

    const {
      email, nombre, tel, rol, reportaA, fechaIngreso,
      workspaceId, agencyId, userId,
    } = await req.json();

    if (!email || !nombre || !rol || !workspaceId) {
      throw new Error("Faltan campos: email, nombre, rol, workspaceId");
    }
    if (!["director", "gerente", "vendedor"].includes(rol)) {
      throw new Error("Rol inválido");
    }

    // ── Autorización: validar rol y tenant del invitador ─────────────
    // Antes cualquier usuario autenticado podía crear directores en
    // cualquier workspace (escalación de privilegios + cross-tenant).

    // Resolver la agencia dueña del workspace destino (server-side, no del body)
    const { data: wsRow } = await adminClient
      .from("workspaces").select("agency_id, nombre").eq("id", workspaceId).maybeSingle();
    const targetAgencyId  = wsRow?.agency_id || agencyId || workspaceId;
    const workspaceName   = wsRow?.nombre || null;

    // ¿El invitador es agency owner/admin de esa agencia?
    const { data: agencyMem } = await adminClient
      .from("agency_memberships").select("role")
      .eq("user_id", invitador.id).eq("agency_id", targetAgencyId)
      .maybeSingle();
    const esAgencyOwner = !!agencyMem;

    if (!esAgencyOwner) {
      // Cargar el perfil del invitador en la tabla users
      const { data: inviterRow } = await adminClient
        .from("users").select("rol, workspace_id, agency_id")
        .eq("auth_user_id", invitador.id).maybeSingle();
      if (!inviterRow) throw new Error("Sin permisos para invitar usuarios");
      const wsInviter = inviterRow.workspace_id || inviterRow.agency_id;
      if (wsInviter !== workspaceId) throw new Error("No puedes invitar usuarios a otro workspace");
      if (!["director", "gerente"].includes(inviterRow.rol)) {
        throw new Error("Solo directores o gerentes pueden invitar usuarios");
      }
      if (inviterRow.rol === "gerente" && rol !== "vendedor") {
        throw new Error("Un gerente solo puede invitar vendedores");
      }
    }

    const siteUrl = Deno.env.get("SITE_URL") ||
      "https://automatizacionia-stack.github.io/automind-planpiso";

    // ── 1. Generar link de invitación (sin que Supabase mande email) ─
    console.log("[invite-user] STEP 1: generando link para", email, "workspace:", workspaceId);
    let actionLink: string | null = null;
    let authUserId: string | null = null;

    // Intentar generar link tipo "invite"
    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo: siteUrl, data: { nombre, rol, workspace_id: workspaceId } },
    });

    if (!linkErr && linkData?.properties?.action_link) {
      actionLink = linkData.properties.action_link;
      authUserId = linkData.user?.id || null;
      console.log("[invite-user] STEP 1 OK: invite link generado, authUserId:", authUserId);
    } else {
      console.log("[invite-user] STEP 1: usuario ya existe en auth, linkErr:", linkErr?.message);
      // Usuario ya existe en auth — buscar su auth_user_id y generar magic link
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const existing = users?.find((u: any) => u.email === email);
      authUserId = existing?.id || null;
      console.log("[invite-user] STEP 1: auth user encontrado:", !!authUserId, "id:", authUserId);

      if (authUserId) {
        const { data: magicData, error: magicErr } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo: siteUrl },
        });
        actionLink = magicData?.properties?.action_link || null;
        console.log("[invite-user] STEP 1: magiclink generado:", !!actionLink, "magicErr:", magicErr?.message);
        if (magicErr && !actionLink) {
          const { data: recoveryData } = await adminClient.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: siteUrl },
          });
          actionLink = recoveryData?.properties?.action_link || null;
          console.log("[invite-user] STEP 1: recovery link generado:", !!actionLink);
        }
      }
    }

    if (!actionLink) throw new Error("No se pudo generar el link de acceso para " + email);

    // ── 2. Guardar en tabla users ───────────────────────────────────
    // ID con entropía real (el sufijo de timestamp podía colisionar)
    const rowId = userId ||
      (rol[0].toUpperCase() + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase());
    const userRow: any = {
      id:            rowId,
      nombre,
      email,
      tel:           tel || null,
      rol,
      reporta_a:     reportaA || null,
      fecha_ingreso: fechaIngreso || null,
      workspace_id:  workspaceId,
      agency_id:     targetAgencyId, // derivado server-side, no del body
    };
    if (authUserId) userRow.auth_user_id = authUserId;

    // Multi-tenant: buscar SIEMPRE filtrando por workspace_id.
    // El mismo email puede existir en workspaces distintos (UNIQUE es email+workspace_id).
    // Prioridad: buscar por id → buscar por (email, workspace) → insertar nuevo.
    const { data: existingById } = await adminClient
      .from("users").select("id").eq("id", userRow.id).maybeSingle();

    let savedUser, saveErr;
    if (existingById) {
      // Fila con ese id ya existe → actualizar
      ({ data: savedUser, error: saveErr } = await adminClient
        .from("users").update(userRow).eq("id", userRow.id).select().single());
    } else {
      // Buscar por email DENTRO de este workspace (no globalmente)
      const { data: existingByEmailInWorkspace } = await adminClient
        .from("users").select("id")
        .eq("email", email)
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (existingByEmailInWorkspace) {
        // Ya existe en este workspace → actualizar esa fila
        ({ data: savedUser, error: saveErr } = await adminClient
          .from("users").update({ ...userRow, id: existingByEmailInWorkspace.id })
          .eq("id", existingByEmailInWorkspace.id).select().single());
      } else {
        // No existe en este workspace → crear nueva fila (mismo email, distinto workspace = válido)
        ({ data: savedUser, error: saveErr } = await adminClient
          .from("users").insert(userRow).select().single());

        // Fallback: si el INSERT falla por constraint de unicidad (email+workspace),
        // significa que la fila existe pero no fue encontrada arriba (ej: delete
        // bloqueado silenciosamente por RLS). Actualizar la fila existente en vez de fallar.
        if (saveErr?.code === "23505") {
          const { data: staleRow } = await adminClient
            .from("users").select("id")
            .eq("email", email)
            .eq("workspace_id", workspaceId)
            .maybeSingle();
          if (staleRow) {
            ({ data: savedUser, error: saveErr } = await adminClient
              .from("users").update({ ...userRow, id: staleRow.id })
              .eq("id", staleRow.id).select().single());
          }
        }
      }
    }

    if (saveErr) throw new Error("Error DB: " + saveErr.message);
    console.log("[invite-user] STEP 2 OK: usuario guardado en DB, id:", savedUser?.id);

    // ── 3. Enviar email via Brevo con el link ───────────────────────
    console.log("[invite-user] STEP 3: enviando email a", email, "via Brevo");
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoKey) throw new Error("BREVO_API_KEY no configurado en los secrets de la Edge Function");

    const rolLabel = rol === "director" ? "Director" : rol === "gerente" ? "Gerente" : "Vendedor";
    const rolColor = rol === "director" ? "#2f6fed" : rol === "gerente" ? "#1f9d57" : "#d99613";
    const agencyDisplay = workspaceName || "tu agencia";

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": brevoKey },
      body: JSON.stringify({
        sender: { name: "Automind Plan Piso", email: "no-reply@coperva.com" },
        to: [{ email, name: nombre }],
        subject: `Te invitaron a ${agencyDisplay} en Automind Plan Piso`,
        htmlContent: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            max-width:500px;margin:0 auto;padding:32px 20px;background:#f4f6fb">
            <div style="background:#fff;border-radius:16px;overflow:hidden;
              box-shadow:0 2px 16px rgba(0,0,0,.08)">

              <!-- Header -->
              <div style="background:#1b2a57;padding:28px 32px;text-align:center">
                <div style="font-size:28px;margin-bottom:8px">🚗</div>
                <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.3px">Automind</div>
                <div style="color:rgba(255,255,255,.6);font-size:13px;margin-top:2px">Plan Piso</div>
              </div>

              <!-- Body -->
              <div style="padding:32px">
                <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a2e">
                  Hola, ${nombre} 👋
                </h2>
                <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:15px">
                  Has sido invitado a unirte a
                  <strong style="color:#1a1a2e">${agencyDisplay}</strong>
                  en la plataforma Automind Plan Piso como:
                </p>

                <!-- Rol + agencia -->
                <div style="background:#f4f6fb;border-radius:10px;padding:14px 18px;
                  margin-bottom:24px;display:flex;align-items:center;gap:12px">
                  <span style="background:${rolColor};color:#fff;font-size:12px;font-weight:700;
                    padding:4px 12px;border-radius:20px;white-space:nowrap">${rolLabel}</span>
                  <span style="font-size:13px;color:#555;font-weight:600">${agencyDisplay}</span>
                </div>

                <p style="color:#555;line-height:1.7;margin:0 0 28px;font-size:14px">
                  Haz clic en el botón para acceder a tu cuenta:
                </p>

                <!-- CTA -->
                <div style="text-align:center;margin-bottom:28px">
                  <a href="${actionLink}"
                    style="display:inline-block;background:#2f6fed;color:#fff;
                    text-decoration:none;padding:15px 36px;border-radius:12px;
                    font-weight:700;font-size:15px;letter-spacing:-.2px">
                    Entrar a Automind →
                  </a>
                </div>

                <p style="color:#aaa;font-size:12px;text-align:center;margin:0">
                  Este link expira en 24 horas. Si no esperabas esta invitación, ignora este correo.
                </p>
              </div>

              <!-- Footer -->
              <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f0f0f0;
                text-align:center;font-size:12px;color:#bbb">
                Automind · Plataforma de Plan Piso · Coperva
              </div>
            </div>
          </div>
        `,
      }),
    });

    const brevoJson = await brevoRes.json();
    console.log("[invite-user] STEP 3: Brevo status:", brevoRes.status, "response:", JSON.stringify(brevoJson));
    if (!brevoRes.ok) {
      throw new Error(`Brevo (${brevoRes.status}): ${brevoJson?.message || JSON.stringify(brevoJson)}`);
    }
    console.log("[invite-user] DONE: email enviado exitosamente a", email);

    return new Response(
      JSON.stringify({
        success:  true,
        user:     savedUser,
        email_id: brevoJson?.messageId || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
