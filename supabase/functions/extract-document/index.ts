// Edge Function: extract-document
// Extrae campos de un documento (INE o comprobante de domicilio) con OpenAI GPT-4o-mini vision.
//
// Deploy:
//   supabase functions deploy extract-document --no-verify-jwt
//
// Secret ya configurado (clave de OpenAI guardada bajo este nombre):
//   ANTHROPIC_API_KEY   ← contiene la API key de OpenAI

import OpenAI from "npm:openai@^4.56.0";

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
Responde SOLO con el JSON. Sin explicaciones, sin markdown, sin bloques de código.`;

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
Responde SOLO con el JSON. Sin explicaciones, sin markdown, sin bloques de código.`;

const PROMPT_LIC = `Analiza esta licencia de conducir mexicana.
Devuelve ÚNICAMENTE un objeto JSON válido con los campos que puedas leer con certeza.
Omite cualquier campo que no sea legible o no aplique. Estructura esperada:
{
  "nombre":          "nombre(s) de pila",
  "apellidoPaterno": "primer apellido",
  "apellidoMaterno": "segundo apellido",
  "curp":            "CURP en mayúsculas, exactamente 18 caracteres",
  "fechaNacimiento": "DD/MM/AAAA",
  "sexo":            "H o M",
  "numeroLicencia":  "número de folio o licencia",
  "tipoLicencia":    "tipo: A, B, C, D, E, etc.",
  "vigencia":        "fecha de vencimiento DD/MM/AAAA",
  "estado":          "estado emisor de la licencia"
}
Responde SOLO con el JSON. Sin explicaciones, sin markdown, sin bloques de código.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { dataUrl, mimeType, docType } = await req.json() as {
      dataUrl: string;
      mimeType: string;
      docType: "id" | "domicilio" | "licencia";
    };

    if (!dataUrl || !mimeType || !docType) {
      throw new Error("Parámetros faltantes: dataUrl, mimeType, docType");
    }

    // PDFs no soportados en la API de visión de OpenAI — pedir imagen
    if (mimeType === "application/pdf") {
      return new Response(
        JSON.stringify({ ok: false, error: "Para la extracción IA sube una foto (JPG/PNG) del documento." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // La clave de OpenAI está guardada bajo el nombre ANTHROPIC_API_KEY en Supabase Secrets
    const client = new OpenAI({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "" });
    const prompt  = docType === "id" ? PROMPT_ID : docType === "licencia" ? PROMPT_LIC : PROMPT_DOM;

    const completion = await client.chat.completions.create({
      model:      "gpt-4o-mini",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          { type: "text",      text: prompt },
        ],
      }],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Parsear JSON tolerando texto extra que el modelo pueda agregar
    let campos: Record<string, string> = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        for (const [k, v] of Object.entries(parsed)) {
          if (v && String(v).trim()) campos[k] = String(v).trim();
        }
      }
    } catch { /* devuelve objeto vacío si el parse falla */ }

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
