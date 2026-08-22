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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!elevenKey) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { data: profile } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as { activityId?: string; regenerate?: boolean };
    if (!body.activityId) {
      return new Response(JSON.stringify({ error: "activityId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: activity, error: actErr } = await admin
      .from("activities")
      .select("*")
      .eq("id", body.activityId)
      .single();

    if (actErr || !activity) {
      return new Response(JSON.stringify({ error: "Activity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (activity.audio_url && !body.regenerate) {
      return new Response(JSON.stringify({ audioUrl: activity.audio_url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = (activity.content ?? {}) as Record<string, unknown>;
    const text =
      (content.audioText as string) ||
      (content.transcript as string) ||
      (content.referenceText as string) ||
      (content.text as string) ||
      activity.title;

    const voiceId = activity.audio_voice_id || "EXAVITQu4vr4xnSDxMaL";
    const modelId = activity.audio_model_id || "eleven_multilingual_v2";

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return new Response(JSON.stringify({ error: `ElevenLabs error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBytes = new Uint8Array(await ttsRes.arrayBuffer());
    const path = `${activity.id}/audio.mp3`;

    const { error: uploadErr } = await admin.storage
      .from("activity-audio")
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });

    if (uploadErr) {
      return new Response(JSON.stringify({ error: uploadErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from("activity-audio").getPublicUrl(path);
    const audioUrl = pub.publicUrl;

    await admin
      .from("activities")
      .update({
        audio_url: audioUrl,
        audio_voice_id: voiceId,
        audio_model_id: modelId,
      })
      .eq("id", activity.id);

    return new Response(JSON.stringify({ audioUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
