// Edge Function: extract-document
// Extrae campos de un documento (INE o comprobante de domicilio) con Claude Haiku vision.
//
// Deploy:
//   supabase functions deploy extract-document --no-verify-jwt
//
// Secret requerido:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// El costo de la API de Anthropic corre a cargo de la plataforma Automind.

import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPT_ID = `Analiza esta identificación oficial mexicana (INE, pasaporte u otro documento de identidad).
Devuelve ÚNICAMENTE un objeto JSON válido con los campos que puedas leer con certeza.
Omite cualquier campo que no sea legible o no aplique. Estructura esperada:
{
  "nombre":          "nombre(s) de pila",
  "apellidoPaterno": "primer apellido",
  "apellidoMaterno": "segundo apellido",
  "curp":            "CURP en mayúsculas, exactamente 18 caracteres",
  "rfc":             "RFC si aparece en el documento",
  "fechaNacimiento": "DD/MM/AAAA",
  "sexo":            "H o M",
  "direccion":       "calle y número exterior/interior",
  "colonia":         "colonia o fraccionamiento",
  "ciudad":          "municipio o alcaldía",
  "estado":          "estado de la república (nombre completo)",
  "cp":              "código postal de 5 dígitos"
}
Responde SOLO con el JSON. Sin explicaciones, sin markdown.`;

const PROMPT_DOM = `Analiza este comprobante de domicilio (recibo de luz, agua, teléfono, estado de cuenta, etc.).
Devuelve ÚNICAMENTE un objeto JSON válido con los campos disponibles. Omite los que no puedas leer.
{
  "nombre":          "nombre del titular del servicio",
  "direccion":       "calle y número exterior/interior",
  "colonia":         "colonia o fraccionamiento",
  "ciudad":          "municipio o alcaldía",
  "estado":          "estado de la república (nombre completo)",
  "cp":              "código postal de 5 dígitos",
  "fechaDocumento":  "período o fecha del recibo, ej: mayo 2025"
}
Responde SOLO con el JSON. Sin explicaciones, sin markdown.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { dataUrl, mimeType, docType } = await req.json() as {
      dataUrl: string;
      mimeType: string;
      docType: "id" | "domicilio";
    };

    if (!dataUrl || !mimeType || !docType) {
      throw new Error("Parámetros faltantes: dataUrl, mimeType, docType");
    }

    // Extraer solo la parte base64 (quitar el prefijo data:…;base64,)
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "" });
    const prompt = docType === "id" ? PROMPT_ID : PROMPT_DOM;

    // Construir bloque de contenido según tipo de archivo
    type ContentBlock = Anthropic.ImageBlockParam | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } } | Anthropic.TextBlockParam;

    const blocks: ContentBlock[] = [];

    if (mimeType === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      } as any);
    } else {
      const mt = (mimeType === "image/jpg" ? "image/jpeg" : mimeType) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      blocks.push({ type: "image", source: { type: "base64", media_type: mt, data: base64 } });
    }

    blocks.push({ type: "text", text: prompt });

    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages:   [{ role: "user", content: blocks as any }],
    });

    const raw = msg.content.find((b: any) => b.type === "text")?.text ?? "";

    // Parsear JSON de la respuesta (tolerante a texto extra)
    let campos: Record<string, string> = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        // Filtrar campos vacíos
        for (const [k, v] of Object.entries(parsed)) {
          if (v && String(v).trim()) campos[k] = String(v).trim();
        }
      }
    } catch { /* devuelve objeto vacío si el JSON falla */ }

    return new Response(
      JSON.stringify({ ok: true, campos }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? "Error desconocido" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
