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

    const body = (await req.json()) as { activityId?: string; text?: string };
    if (!body.text?.trim()) {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!speechaceKey) {
      const words = body.text.trim().split(/\s+/).length;
      return new Response(
        JSON.stringify({
          score: Math.min(100, 50 + Math.round(words / 3)),
          cefr: "B1",
          grammar: 70,
          vocabulary: 72,
          coherence: 68,
          taskResponse: 75,
          feedback: ["SPEECHACE_API_KEY not set — placeholder writing score."],
          corrections: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const form = new FormData();
    form.append("text", body.text);
    form.append("key", speechaceKey);
    form.append("dialect", "en-us");

    const scoreRes = await fetch("https://api.speechace.co/api/scoring/text/v9/json", {
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
    const textScore = (raw.text_score ?? raw) as Record<string, unknown>;
    const overall = Number(textScore.overall ?? textScore.score ?? 70);

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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
