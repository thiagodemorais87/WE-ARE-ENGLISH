import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const speechaceKey = Deno.env.get("SPEECHACE_API_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as {
      activityId?: string;
      audioBase64?: string;
      mimeType?: string;
      referenceText?: string;
    };

    if (!body.audioBase64) {
      return new Response(JSON.stringify({ error: "audioBase64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!speechaceKey) {
      return new Response(
        JSON.stringify({
          success: true,
          score: 75,
          cefr: "B1",
          pronunciation: 78,
          fluency: 72,
          grammar: 70,
          vocabulary: 74,
          coherence: 73,
          transcript: body.referenceText ?? null,
          feedback: ["SPEECHACE_API_KEY not set — placeholder score."],
          wordScores: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const binary = Uint8Array.from(atob(body.audioBase64), (c) => c.charCodeAt(0));
    const form = new FormData();
    form.append(
      "user_audio_file",
      new Blob([binary], { type: body.mimeType || "audio/webm" }),
      "speech.webm",
    );
    if (body.referenceText) form.append("text", body.referenceText);
    form.append("key", speechaceKey);
    form.append("dialect", "en-us");

    const scoreRes = await fetch("https://api.speechace.co/api/scoring/speech/v9/json", {
      method: "POST",
      body: form,
    });

    if (!scoreRes.ok) {
      const errText = await scoreRes.text();
      return new Response(JSON.stringify({ error: `Speechace error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = (await scoreRes.json()) as Record<string, unknown>;
    const speech = (raw.speech_score ?? raw) as Record<string, unknown>;
    const overall = Number(speech.overall ?? speech.pronunciation ?? 70);

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
        transcript: (speech.transcript as string) ?? body.referenceText ?? null,
        feedback: ["Scored via Speechace."],
        wordScores: Array.isArray(speech.word_score_list)
          ? (speech.word_score_list as { word?: string; quality_score?: number }[]).map((w) => ({
              word: w.word ?? "",
              score: w.quality_score ?? null,
            }))
          : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
