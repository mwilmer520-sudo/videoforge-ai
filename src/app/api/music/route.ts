const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 5000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const durationMs = typeof body?.durationMs === "number" && body.durationMs > 0 ? body.durationMs : 30000;

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    // Option 1: Replicate (MusicGen)
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (replicateToken) {
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${replicateToken}`,
        },
        body: JSON.stringify({
          version:
            "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
          input: {
            prompt,
            duration: Math.min(Math.ceil(durationMs / 1000), 30),
            model_version: "stereo-melody-large",
            output_format: "mp3",
            normalization_strategy: "peak",
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Replicate error:", err);
        return Response.json({ error: "Music generation failed" }, { status: 502 });
      }

      const prediction = await response.json();

      // Poll with max attempts
      let result = prediction;
      let attempts = 0;
      while (result.status !== "succeeded" && result.status !== "failed" && attempts < MAX_POLL_ATTEMPTS) {
        attempts++;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${result.id}`,
          {
            headers: { Authorization: `Bearer ${replicateToken}` },
            signal: AbortSignal.timeout(15000),
          }
        );

        if (!pollRes.ok) {
          console.error("Replicate poll error:", pollRes.status);
          return Response.json({ error: "Music polling failed" }, { status: 502 });
        }

        result = await pollRes.json();
      }

      if (result.status === "failed") {
        return Response.json({ error: "Music generation failed" }, { status: 502 });
      }

      if (result.status !== "succeeded") {
        return Response.json({ error: "Music generation timed out" }, { status: 504 });
      }

      return Response.json({ audioUrl: result.output });
    }

    // Option 2: Mubert
    const mubertKey = process.env.MUBERT_API_KEY;
    if (mubertKey) {
      const response = await fetch("https://api-b2b.mubert.com/v2/RecordTrackTTM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "RecordTrackTTM",
          params: {
            pat: mubertKey,
            prompt,
            duration: Math.ceil(durationMs / 1000),
            format: "mp3",
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        console.error("Mubert error:", response.status);
        return Response.json({ error: "Mubert music generation failed" }, { status: 502 });
      }

      const data = await response.json();
      const downloadLink = data.data?.tasks?.[0]?.download_link;

      if (downloadLink) {
        return Response.json({ audioUrl: downloadLink });
      }

      return Response.json({ error: "Mubert returned no audio" }, { status: 502 });
    }

    return Response.json(
      { error: "No music generation API configured. Set REPLICATE_API_TOKEN or MUBERT_API_KEY." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Music route error:", error);
    return Response.json(
      { error: error.name === "TimeoutError" ? "Music request timed out" : (error.message || "Music error") },
      { status: 500 }
    );
  }
}
