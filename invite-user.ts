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

    // ── 1. Crear usuario con contraseña temporal ──────────────────
    // Usamos contraseña temporal en lugar de OTP/invite links para evitar
    // problemas de tokens expirados, pre-scan de emails, y flujos PKCE.
    console.log("[invite-user] STEP 1: creando/actualizando auth user para", email);

    // Generar contraseña temporal legible: Xxxx-0000-Xxxx
    const segment = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
      const nums  = "23456789";
      return Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b, i) => i === 0
          ? chars.slice(0,26)[b % 26]           // mayúscula
          : i < 3 ? chars.slice(26)[b % 22]     // minúsculas
          : nums[b % nums.length])               // número
        .join("");
    };
    const tempPassword = `${segment()}-${segment()}-${segment()}`;

    let authUserId: string | null = null;

    // Intentar crear nuevo usuario en Auth
    const { data: newUserData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,  // confirmar email automáticamente, sin token
      user_metadata: { nombre, rol, workspace_id: workspaceId, mustChangePassword: true },
    });

    if (!createErr && newUserData?.user) {
      authUserId = newUserData.user.id;
      console.log("[invite-user] STEP 1 OK: nuevo auth user creado, id:", authUserId);
    } else {
      // Usuario ya existe en Auth — actualizar contraseña temporal y metadata
      console.log("[invite-user] STEP 1: usuario ya existe, actualizando password. Error:", createErr?.message);
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const existing = (users as any[])?.find((u: any) => u.email === email);
      authUserId = existing?.id || null;
      if (authUserId) {
        await adminClient.auth.admin.updateUserById(authUserId, {
          password: tempPassword,
          user_metadata: { nombre, rol, workspace_id: workspaceId, mustChangePassword: true },
        });
        console.log("[invite-user] STEP 1 OK: password temporal actualizada, id:", authUserId);
      } else {
        throw new Error("No se pudo crear ni encontrar el usuario en Auth: " + email);
      }
    }

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

    // ── 3. Enviar credenciales por email vía Brevo ─────────────────
    console.log("[invite-user] STEP 3: enviando credenciales a", email);
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    const siteUrl  = Deno.env.get("SITE_URL") || "https://automind-planpiso.vercel.app";
    let emailVia = "none";

    if (brevoKey) {
      try {
        const rolLabel    = rol === "director" ? "Director" : rol === "gerente" ? "Gerente" : "Vendedor";
        const rolColor    = rol === "director" ? "#2f6fed" : rol === "gerente" ? "#1f9d57" : "#d99613";
        const agencyDisplay = workspaceName || "tu agencia";

        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({
            sender: { name: "Automind Plan Piso", email: "no-reply@coperva.com" },
            to: [{ email, name: nombre }],
            subject: `Tu acceso a ${agencyDisplay} en Automind Plan Piso`,
            htmlContent: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                max-width:500px;margin:0 auto;padding:32px 20px;background:#f4f6fb">
                <div style="background:#fff;border-radius:16px;overflow:hidden;
                  box-shadow:0 2px 16px rgba(0,0,0,.08)">
                  <div style="background:#1b2a57;padding:28px 32px;text-align:center">
                    <div style="font-size:28px;margin-bottom:8px">🚗</div>
                    <div style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.3px">Automind</div>
                    <div style="color:rgba(255,255,255,.6);font-size:13px;margin-top:2px">Plan Piso</div>
                  </div>
                  <div style="padding:32px">
                    <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a2e">Hola, ${nombre} 👋</h2>
                    <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:15px">
                      Has sido invitado a unirte a
                      <strong style="color:#1a1a2e">${agencyDisplay}</strong>
                      en Automind Plan Piso como <strong>${rolLabel}</strong>.
                    </p>
                    <div style="background:#f4f6fb;border-radius:12px;padding:20px 24px;margin-bottom:24px">
                      <p style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;
                        letter-spacing:.5px;font-weight:600">Tus credenciales de acceso</p>
                      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                        <span style="color:#555;font-size:14px">Correo</span>
                        <strong style="color:#1a1a2e;font-size:14px">${email}</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between">
                        <span style="color:#555;font-size:14px">Contraseña temporal</span>
                        <strong style="color:#2f6fed;font-size:16px;letter-spacing:1px;
                          font-family:monospace">${tempPassword}</strong>
                      </div>
                    </div>
                    <div style="text-align:center;margin-bottom:20px">
                      <a href="${siteUrl}"
                        style="display:inline-block;background:#2f6fed;color:#fff;
                        text-decoration:none;padding:15px 36px;border-radius:12px;
                        font-weight:700;font-size:15px;letter-spacing:-.2px">
                        Entrar a Automind →
                      </a>
                    </div>
                    <p style="color:#aaa;font-size:12px;text-align:center;margin:0;line-height:1.6">
                      Al iniciar sesión, el sistema te pedirá cambiar tu contraseña.<br>
                      Si no esperabas esta invitación, ignora este correo.
                    </p>
                  </div>
                  <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f0f0f0;
                    text-align:center;font-size:12px;color:#bbb">
                    Automind · Plataforma de Plan Piso · Coperva
                  </div>
                </div>
              </div>`,
          }),
        });
        const brevoJson = await brevoRes.json();
        console.log("[invite-user] Brevo status:", brevoRes.status, JSON.stringify(brevoJson));
        if (brevoRes.ok) emailVia = "brevo";
        else console.warn("[invite-user] Brevo falló:", brevoJson?.message);
      } catch (brevoErr: any) {
        console.warn("[invite-user] Brevo excepción:", brevoErr.message);
      }
    }

    if (emailVia === "none") {
      console.warn("[invite-user] Email no enviado — BREVO_API_KEY no configurado o falló. Compartir contraseña manualmente.");
    }

    console.log("[invite-user] DONE: email via", emailVia, "a", email);

    return new Response(
      JSON.stringify({
        success:       true,
        user:          savedUser,
        email_via:     emailVia,
        temp_password: tempPassword,   // devuelto para mostrar en UI
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
