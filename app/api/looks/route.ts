import { NextResponse } from "next/server";
import { buildLooks, LookRequestSchema } from "@/lib/styling";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Se requiere un cuerpo JSON." }, { status: 415, headers: NO_STORE });
  }
  const announced = Number(request.headers.get("content-length") ?? 0);
  if (announced > 45000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413, headers: NO_STORE });
  }
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 45000) {
      return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413, headers: NO_STORE });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON incorrecto." }, { status: 400, headers: NO_STORE });
  }
  const parsed = LookRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa las prendas y las preferencias indicadas." }, { status: 422, headers: NO_STORE });
  }
  const result = buildLooks(parsed.data);
  return NextResponse.json({
    mode: "transparent-local-curation",
    wardrobeStoredOnServer: false,
    ...result,
    disclaimer: "Combinaciones orientativas basadas solo en tus prendas; no se ha utilizado un modelo generativo ni se han analizado imágenes.",
  }, { headers: NO_STORE });
}

export async function GET() {
  return NextResponse.json({ name: "NATALIA Outfit API", mode: "stateless", ready: true }, { headers: NO_STORE });
}
