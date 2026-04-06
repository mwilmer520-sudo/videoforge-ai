const MAX_SCRIPT_LENGTH = 5000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const script = typeof body?.script === "string" ? body.script.trim() : "";
    const voiceId = typeof body?.voiceId === "string" && body.voiceId ? body.voiceId : "JBFqnCBsd6RMkjVDRZzb";

    if (!script) {
      return Response.json({ error: "script is required" }, { status: 400 });
    }

    if (script.length > MAX_SCRIPT_LENGTH) {
      return Response.json({ error: `Script too long (max ${MAX_SCRIPT_LENGTH} chars)` }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
          },
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return Response.json({ error: "Voice generation failed" }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return Response.json({ audioUrl: audioDataUrl });
  } catch (error: any) {
    console.error("Voice route error:", error);
    return Response.json(
      { error: error.name === "TimeoutError" ? "Voice request timed out" : (error.message || "Voice error") },
      { status: 500 }
    );
  }
}
