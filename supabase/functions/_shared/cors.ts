/** Shared CORS / auth helpers for Edge Functions. */

export function parseAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length) return list;
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
  ];
}

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = parseAllowedOrigins();
  const match = allowed.includes(origin) ? origin : allowed[0] ?? "";
  return {
    "Access-Control-Allow-Origin": match,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function jsonError(
  status: number,
  message: string,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function readJsonLimited(req: Request, maxBytes: number): Promise<unknown> {
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) > maxBytes) {
    return Promise.reject(new Error("payload_too_large"));
  }
  return req.arrayBuffer().then((buf) => {
    if (buf.byteLength > maxBytes) throw new Error("payload_too_large");
    const text = new TextDecoder().decode(buf);
    return JSON.parse(text) as unknown;
  });
}
