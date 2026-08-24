import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonError, readJsonLimited } from "../_shared/cors.ts";

const MAX_BODY = 32_000;
const MAX_TTS_CHARS = 8_000;

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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!elevenKey) return jsonError(503, "Audio service unavailable", cors);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return jsonError(401, "Unauthorized", cors);

    const { data: profile } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
      return jsonError(403, "Forbidden", cors);
    }

    let body: { activityId?: string; regenerate?: boolean };
    try {
      body = (await readJsonLimited(req, MAX_BODY)) as typeof body;
    } catch {
      return jsonError(413, "Payload too large", cors);
    }

    if (!body.activityId || typeof body.activityId !== "string") {
      return jsonError(400, "activityId required", cors);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: activity, error: actErr } = await admin
      .from("activities")
      .select("*")
      .eq("id", body.activityId)
      .single();

    if (actErr || !activity) return jsonError(404, "Activity not found", cors);

    if (activity.is_system && profile.role !== "admin" && body.regenerate) {
      return jsonError(403, "Forbidden", cors);
    }
    if (
      !activity.is_system &&
      activity.created_by !== userData.user.id &&
      profile.role !== "admin"
    ) {
      return jsonError(403, "Forbidden", cors);
    }

    if (activity.audio_url && !body.regenerate) {
      return new Response(JSON.stringify({ audioUrl: activity.audio_url }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const content = (activity.content ?? {}) as Record<string, unknown>;
    const text = String(
      (content.audioText as string) ||
        (content.transcript as string) ||
        (content.referenceText as string) ||
        (content.text as string) ||
        activity.title ||
        "",
    ).slice(0, MAX_TTS_CHARS);

    if (!text.trim()) return jsonError(400, "No speakable text", cors);

    const voiceId = activity.audio_voice_id || "pNInz6obpgDQGcFmaJgB";
    const modelId = activity.audio_model_id || "eleven_turbo_v2_5";

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
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    });

    let audioRes = ttsRes;
    if (!audioRes.ok && modelId === "eleven_turbo_v2_5") {
      audioRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.45, similarity_boost: 0.85 },
        }),
      });
    }

    if (!audioRes.ok) {
      console.error("elevenlabs_failed", audioRes.status);
      return jsonError(502, "Upstream audio error", cors);
    }

    const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
    if (audioBytes.byteLength > 5_000_000) {
      return jsonError(502, "Upstream audio error", cors);
    }

    const path = `${activity.id}/audio.mp3`;
    const { error: uploadErr } = await admin.storage
      .from("activity-audio")
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });

    if (uploadErr) {
      console.error("storage_upload_failed");
      return jsonError(500, "Upload failed", cors);
    }

    const { data: pub } = admin.storage.from("activity-audio").getPublicUrl(path);
    const audioUrl = pub.publicUrl;
    const usedModel = audioRes === ttsRes ? modelId : "eleven_multilingual_v2";

    await admin
      .from("activities")
      .update({
        audio_url: audioUrl,
        audio_voice_id: voiceId,
        audio_model_id: usedModel,
      })
      .eq("id", activity.id);

    return new Response(JSON.stringify({ audioUrl }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate_audio_error", e instanceof Error ? e.message : "unknown");
    return jsonError(500, "Internal error", corsHeadersFor(req));
  }
});
