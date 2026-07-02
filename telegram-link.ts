// Automind · Edge Function: telegram-link
// Genera un deep link de un solo uso para vincular Telegram con la cuenta del usuario.
// El usuario hace clic → abre el bot → envía /start <token> → el webhook lo vincula.

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
    // ── Autenticación ────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "No autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Obtener el user.id de la tabla users (≠ auth.uid) ────────────
    const { data: userRow, error: userErr } = await adminClient
      .from("users")
      .select("id, nombre, telegram_chat_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (userErr || !userRow) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado en la plataforma" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Si ya tiene Telegram vinculado, retornar ese estado
    if (userRow.telegram_chat_id) {
      return new Response(JSON.stringify({
        already_linked: true,
        chat_id: userRow.telegram_chat_id,
        nombre: userRow.nombre,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Invalidar tokens previos del usuario (evitar tokens fantasma) ─
    await adminClient
      .from("telegram_link_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", userRow.id)
      .is("used_at", null);

    // ── Crear nuevo token ─────────────────────────────────────────────
    const { data: tokenRow, error: tokenErr } = await adminClient
      .from("telegram_link_tokens")
      .insert({ user_id: userRow.id })
      .select("token")
      .single();

    if (tokenErr || !tokenRow) {
      throw new Error("No se pudo generar el token: " + tokenErr?.message);
    }

    const botUsername = Deno.env.get("TELEGRAM_BOT_USERNAME") || "AutomindPlanPisoBot";
    const deepLink    = `https://t.me/${botUsername}?start=${tokenRow.token}`;

    return new Response(
      JSON.stringify({
        link:  deepLink,
        token: tokenRow.token,
        expires_in_minutes: 30,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
