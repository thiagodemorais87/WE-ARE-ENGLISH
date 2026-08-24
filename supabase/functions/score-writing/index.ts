import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonError, readJsonLimited } from "../_shared/cors.ts";

const MAX_BODY = 64_000;
const MAX_TEXT = 8_000;

Deno.serve(async (req) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonError(401, "Unauthorized", cors);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const speechaceKey = Deno.env.get("SPEECHACE_API_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return jsonError(401, "Unauthorized", cors);

    let body: { activityId?: string; text?: string };
    try {
      body = (await readJsonLimited(req, MAX_BODY)) as typeof body;
    } catch {
      return jsonError(413, "Payload too large", cors);
    }

    const text = String(body.text ?? "").trim();
    if (!text) return jsonError(400, "text required", cors);
    if (text.length > MAX_TEXT) return jsonError(413, "Payload too large", cors);

    if (!speechaceKey) return jsonError(503, "Scoring service unavailable", cors);

    const form = new FormData();
    form.append("text", text);
    form.append("key", speechaceKey);
    form.append("dialect", "en-us");

    const scoreRes = await fetch("https://api.speechace.co/api/scoring/text/v9/json", {
      method: "POST",
      body: form,
    });

    if (!scoreRes.ok) {
      console.error("speechace_writing_failed", scoreRes.status);
      return jsonError(502, "Upstream scoring error", cors);
    }

    const raw = (await scoreRes.json()) as Record<string, unknown>;
    const textScore = (raw.text_score ?? raw) as Record<string, unknown>;
    const overall = Math.max(0, Math.min(100, Number(textScore.overall ?? textScore.score ?? 0)));

    return new Response(
      JSON.stringify({
        score: overall,
        cefr: (textScore.cefr_level as string) ?? null,
        grammar: Number(textScore.grammar ?? overall),
        vocabulary: Number(textScore.vocab ?? textScore.vocabulary ?? overall),
        coherence: Number(textScore.coherence ?? overall),
        taskResponse: Number(textScore.task_response ?? overall),
        feedback: ["Scored via Speechace writing."],
        corrections: [],
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("score_writing_error", e instanceof Error ? e.message : "unknown");
    return jsonError(500, "Internal error", corsHeadersFor(req));
  }
});
