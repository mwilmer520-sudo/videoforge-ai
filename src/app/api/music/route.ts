export async function POST(req: Request) {
  try {
    const { prompt, durationMs } = await req.json();

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
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Replicate error:", err);
        return Response.json({ error: "Music generation failed" }, { status: 500 });
      }

      const prediction = await response.json();

      // Poll for completion
      let result = prediction;
      while (result.status !== "succeeded" && result.status !== "failed") {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${result.id}`,
          {
            headers: { Authorization: `Bearer ${replicateToken}` },
          }
        );
        result = await pollRes.json();
      }

      if (result.status === "failed") {
        return Response.json({ error: "Music generation failed" }, { status: 500 });
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
      });

      const data = await response.json();
      if (data.data?.tasks?.[0]?.download_link) {
        return Response.json({
          audioUrl: data.data.tasks[0].download_link,
        });
      }
    }

    return Response.json(
      { error: "No music generation API configured. Set REPLICATE_API_TOKEN or MUBERT_API_KEY." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Music route error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
