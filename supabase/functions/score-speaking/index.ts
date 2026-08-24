import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonError, readJsonLimited } from "../_shared/cors.ts";

const MAX_BODY = 3_500_000; // ~2.5MB base64 audio
const MAX_REF_CHARS = 2_000;

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

    let body: {
      activityId?: string;
      attemptId?: string;
      audioBase64?: string;
      mimeType?: string;
      referenceText?: string;
    };
    try {
      body = (await readJsonLimited(req, MAX_BODY)) as typeof body;
    } catch {
      return jsonError(413, "Payload too large", cors);
    }

    if (!body.audioBase64 || typeof body.audioBase64 !== "string") {
      return jsonError(400, "audioBase64 required", cors);
    }
    if (body.audioBase64.length > 3_000_000) {
      return jsonError(413, "Payload too large", cors);
    }

    if (!speechaceKey) return jsonError(503, "Scoring service unavailable", cors);

    const ref = String(body.referenceText ?? "").slice(0, MAX_REF_CHARS);
    const mime = String(body.mimeType || "audio/webm").slice(0, 64);

    let binary: Uint8Array;
    try {
      binary = Uint8Array.from(atob(body.audioBase64), (c) => c.charCodeAt(0));
    } catch {
      return jsonError(400, "Invalid audio payload", cors);
    }

    const form = new FormData();
    form.append("user_audio_file", new Blob([binary], { type: mime }), "speech.webm");
    if (ref) form.append("text", ref);
    form.append("key", speechaceKey);
    form.append("dialect", "en-us");

    const scoreRes = await fetch("https://api.speechace.co/api/scoring/speech/v9/json", {
      method: "POST",
      body: form,
    });

    if (!scoreRes.ok) {
      console.error("speechace_speaking_failed", scoreRes.status);
      return jsonError(502, "Upstream scoring error", cors);
    }

    const raw = (await scoreRes.json()) as Record<string, unknown>;
    const speech = (raw.speech_score ?? raw) as Record<string, unknown>;
    const overall = Math.max(0, Math.min(100, Number(speech.overall ?? speech.pronunciation ?? 0)));

    return new Response(
      JSON.stringify({
        success: true,
        score: overall,
        cefr: (speech.cefr_level as string) ?? null,
        pronunciation: Number(speech.pronunciation ?? overall),
        fluency: Number(speech.fluency ?? overall),
        grammar: Number(speech.grammar ?? null),
        vocabulary: Number(speech.vocab ?? speech.vocabulary ?? null),
        coherence: Number(speech.coherence ?? null),
        transcript: ((speech.transcript as string) ?? ref) || null,
        feedback: ["Scored via Speechace."],
        wordScores: Array.isArray(speech.word_score_list)
          ? (speech.word_score_list as { word?: string; quality_score?: number }[])
              .slice(0, 100)
              .map((w) => ({ word: w.word ?? "", score: w.quality_score ?? null }))
          : [],
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("score_speaking_error", e instanceof Error ? e.message : "unknown");
    return jsonError(500, "Internal error", corsHeadersFor(req));
  }
});
