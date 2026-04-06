const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 10000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio = body?.aspectRatio;

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GOOGLE_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:generateVideos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          prompt,
          config: {
            aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
            durationSeconds: 8,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("VEO error:", err);
      return Response.json({ error: "VEO generation failed" }, { status: 502 });
    }

    const data = await response.json();
    const operationName = data.name;

    if (!operationName) {
      return Response.json({ error: "No operation returned from VEO" }, { status: 502 });
    }

    // Poll with timeout and error checking
    let result = data;
    let attempts = 0;
    while (!result.done && attempts < MAX_POLL_ATTEMPTS) {
      attempts++;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
        {
          headers: { "x-goog-api-key": apiKey },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!pollRes.ok) {
        console.error("VEO poll error:", pollRes.status, await pollRes.text());
        return Response.json({ error: "VEO polling failed" }, { status: 502 });
      }

      result = await pollRes.json();
    }

    if (!result.done) {
      return Response.json({ error: "VEO generation timed out" }, { status: 504 });
    }

    const video = result.response?.generatedVideos?.[0];
    if (!video?.video?.uri) {
      return Response.json({ error: "No video generated" }, { status: 502 });
    }

    return Response.json({
      videoUrl: video.video.uri,
      thumbnailUrl: null,
    });
  } catch (error: any) {
    console.error("VEO route error:", error);
    return Response.json(
      { error: error.name === "TimeoutError" ? "VEO request timed out" : (error.message || "VEO error") },
      { status: 500 }
    );
  }
}
