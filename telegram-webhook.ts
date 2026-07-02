// Automind · Edge Function: telegram-webhook
// Recibe actualizaciones de Telegram via webhook.
// Maneja los comandos del bot y vincula cuentas de usuario.
// Soporta usuarios de workspace (tabla users) Y agency owners (tabla agencies).
//
// Secrets requeridos en Supabase:
//   TELEGRAM_BOT_TOKEN      — token del bot (@BotFather)
//   TELEGRAM_WEBHOOK_SECRET — string aleatorio para validar que el request viene de Telegram
//
// Comandos soportados:
//   /start <token>  — vincula la cuenta de Telegram con el usuario de Automind
//   /status         — muestra si la cuenta está vinculada
//   /desconectar    — desvincula la cuenta (elimina telegram_chat_id)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // ── Validar que el request viene de Telegram ─────────────────────
  const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (webhookSecret) {
    const providedSecret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (providedSecret !== webhookSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Solo procesar mensajes de texto
  const message = update.message;
  if (!message?.text) return new Response("ok");

  const chatId   = String(message.chat.id);
  const fromUser = message.from;
  const text     = message.text.trim();

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

  /** Envía un mensaje HTML al chat */
  async function reply(html: string) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── /start ───────────────────────────────────────────────────────
  if (text.startsWith("/start")) {
    const linkToken = text.replace("/start", "").trim();

    if (!linkToken) {
      await reply(
        `👋 <b>Hola${fromUser?.first_name ? ", " + fromUser.first_name : ""}!</b>\n\n` +
        `Soy el bot de notificaciones de <b>Automind Plan Piso</b>.\n\n` +
        `Para recibir alertas de semáforo aquí, entra a la plataforma y vincula ` +
        `tu cuenta desde <b>Alertas → Telegram → Conectar mi cuenta</b>.`
      );
      return new Response("ok");
    }

    // Validar token — incluir entity_type y auth_user_id
    const { data: tokenRow } = await adminClient
      .from("telegram_link_tokens")
      .select("id, user_id, auth_user_id, entity_type, used_at, expires_at")
      .eq("token", linkToken)
      .maybeSingle();

    if (!tokenRow) {
      await reply("❌ El enlace no es válido. Genera uno nuevo desde la plataforma.");
      return new Response("ok");
    }

    if (tokenRow.used_at) {
      await reply("⚠️ Este enlace ya fue utilizado. Genera uno nuevo desde la plataforma.");
      return new Response("ok");
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      await reply("⏰ El enlace expiró (válido por 30 minutos). Genera uno nuevo desde la plataforma.");
      return new Response("ok");
    }

    const entityType = tokenRow.entity_type || "workspace_user";

    // ─ AGENCY OWNER: guardar en agencies ──────────────────────────
    if (entityType === "agency_owner") {
      const { data: agencyMembership } = await adminClient
        .from("agency_memberships")
        .select("agency_id, agencies(name)")
        .eq("user_id", tokenRow.auth_user_id)
        .maybeSingle();

      if (agencyMembership) {
        await adminClient
          .from("agencies")
          .update({
            telegram_chat_id: parseInt(chatId),
            telegram_username: fromUser?.username || null,
          })
          .eq("id", agencyMembership.agency_id);
      }

      await adminClient
        .from("telegram_link_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenRow.id);

      const agencyName = (agencyMembership?.agencies as any)?.name || "la agencia";

      await reply(
        `✅ <b>¡Cuenta vinculada exitosamente!</b>\n\n` +
        `A partir de ahora recibirás aquí las alertas de semáforo de ` +
        `<b>Automind Plan Piso · ${agencyName}</b>.\n\n` +
        `Envía <b>/status</b> para ver tu estado de vinculación.\n` +
        `Envía <b>/desconectar</b> para desvincular.`
      );
      return new Response("ok");
    }

    // ─ WORKSPACE USER: guardar en users ───────────────────────────

    // Verificar que ese chat_id no esté ya vinculado a otro usuario
    const { data: existing } = await adminClient
      .from("users")
      .select("id, nombre")
      .eq("telegram_chat_id", chatId)
      .maybeSingle();

    if (existing && existing.id !== tokenRow.user_id) {
      await reply(
        "⚠️ Este Telegram ya está vinculado a otra cuenta de Automind.\n\n" +
        "Desconéctalo primero enviando <b>/desconectar</b>."
      );
      return new Response("ok");
    }

    await adminClient
      .from("users")
      .update({
        telegram_chat_id: parseInt(chatId),
        telegram_username: fromUser?.username || null,
      })
      .eq("id", tokenRow.user_id);

    await adminClient
      .from("telegram_link_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    const { data: userRow } = await adminClient
      .from("users")
      .select("nombre")
      .eq("id", tokenRow.user_id)
      .single();

    await reply(
      `✅ <b>¡Cuenta vinculada exitosamente!</b>\n\n` +
      `Hola <b>${userRow?.nombre || "usuario"}</b>, a partir de ahora recibirás ` +
      `aquí las alertas de semáforo de <b>Automind Plan Piso</b> cuando una ` +
      `unidad cambie de estado.\n\n` +
      `Envía <b>/status</b> para ver tu estado de vinculación.`
    );

    return new Response("ok");
  }

  // ── /status ──────────────────────────────────────────────────────
  if (text === "/status") {
    // Buscar en users primero
    const { data: userRow } = await adminClient
      .from("users")
      .select("nombre, email")
      .eq("telegram_chat_id", parseInt(chatId))
      .maybeSingle();

    if (userRow) {
      await reply(
        `✅ <b>Cuenta vinculada</b>\n\n` +
        `👤 ${userRow.nombre}\n` +
        `📧 ${userRow.email}\n\n` +
        `Estás recibiendo alertas de Automind Plan Piso en este chat.\n\n` +
        `Envía <b>/desconectar</b> para desvincular.`
      );
      return new Response("ok");
    }

    // Buscar en agencies (agency owner)
    const { data: agencyRow } = await adminClient
      .from("agencies")
      .select("name, telegram_username")
      .eq("telegram_chat_id", parseInt(chatId))
      .maybeSingle();

    if (agencyRow) {
      await reply(
        `✅ <b>Cuenta vinculada (Admin)</b>\n\n` +
        `🏢 ${agencyRow.name}\n` +
        `${agencyRow.telegram_username ? "@" + agencyRow.telegram_username + "\n" : ""}` +
        `\nEstás recibiendo alertas de Automind Plan Piso en este chat.\n\n` +
        `Envía <b>/desconectar</b> para desvincular.`
      );
      return new Response("ok");
    }

    await reply(
      `❌ <b>Sin cuenta vinculada</b>\n\n` +
      `Este Telegram no está conectado a ningún usuario de Automind.\n\n` +
      `Entra a la plataforma → <b>Alertas → Telegram</b> para vincularlo.`
    );
    return new Response("ok");
  }

  // ── /desconectar ─────────────────────────────────────────────────
  if (text === "/desconectar" || text === "/disconnect") {
    // Buscar en users
    const { data: userRow } = await adminClient
      .from("users")
      .select("id, nombre")
      .eq("telegram_chat_id", parseInt(chatId))
      .maybeSingle();

    if (userRow) {
      await adminClient
        .from("users")
        .update({ telegram_chat_id: null, telegram_username: null })
        .eq("id", userRow.id);

      await reply(
        `✅ <b>Cuenta desvinculada</b>\n\n` +
        `${userRow.nombre}, ya no recibirás alertas en este chat.\n\n` +
        `Para volver a vincular, entra a la plataforma → <b>Alertas → Telegram</b>.`
      );
      return new Response("ok");
    }

    // Buscar en agencies
    const { data: agencyRow } = await adminClient
      .from("agencies")
      .select("id, name")
      .eq("telegram_chat_id", parseInt(chatId))
      .maybeSingle();

    if (agencyRow) {
      await adminClient
        .from("agencies")
        .update({ telegram_chat_id: null, telegram_username: null })
        .eq("id", agencyRow.id);

      await reply(
        `✅ <b>Cuenta desvinculada</b>\n\n` +
        `${agencyRow.name}, ya no recibirás alertas en este chat.\n\n` +
        `Para volver a vincular, entra a la plataforma → <b>Alertas → Telegram</b>.`
      );
      return new Response("ok");
    }

    await reply("ℹ️ No hay ninguna cuenta vinculada a este Telegram.");
    return new Response("ok");
  }

  // ── Comando no reconocido ─────────────────────────────────────────
  if (text.startsWith("/")) {
    await reply(
      `Comandos disponibles:\n\n` +
      `<b>/status</b> — Ver estado de vinculación\n` +
      `<b>/desconectar</b> — Desvincular cuenta`
    );
  }

  return new Response("ok");
});
