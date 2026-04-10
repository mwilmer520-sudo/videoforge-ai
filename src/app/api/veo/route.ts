const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 10000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio = body?.aspectRatio;
    const firstFrameImageUrl: string | undefined = body?.firstFrameImageUrl;
    const previewMode: boolean = body?.previewMode === true;

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // Preview mode short-circuit: don't fire Veo, return placeholder
    // -------------------------------------------------------------------------
    if (previewMode) {
      return Response.json({
        videoUrl: null,
        lastFrameImageUrl: null,
        previewMode: true,
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GOOGLE_API_KEY not configured" }, { status: 500 });
    }

    // -------------------------------------------------------------------------
    // Build the request payload. If a firstFrameImageUrl was provided, attempt
    // image-to-video conditioning for frame continuity. The Gemini Veo API may
    // or may not support this on the public endpoint — we attempt it and fall
    // back to a text-only retry on failure.
    // -------------------------------------------------------------------------
    const baseInstance: Record<string, unknown> = { prompt };
    if (firstFrameImageUrl) {
      // Veo3 image-conditioning shape (best-effort; may be rejected by the
      // generativelanguage.googleapis.com endpoint — see fallback below).
      baseInstance.image = { gcsUri: firstFrameImageUrl };
    }

    const buildBody = (instance: Record<string, unknown>) =>
      JSON.stringify({
        instances: [instance],
        parameters: {
          aspectRatio: aspectRatio === "9:16" ? "9:16" : aspectRatio === "1:1" ? "1:1" : "16:9",
        },
      });

    let response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: buildBody(baseInstance),
        signal: AbortSignal.timeout(30000),
      }
    );

    // Frame-continuity fallback: if image conditioning was attempted and the
    // API rejected the payload, retry without the image field. This way we get
    // a working video even if the public endpoint doesn't support image-to-video.
    if (!response.ok && firstFrameImageUrl) {
      console.warn(
        "VEO image conditioning rejected; retrying without firstFrameImageUrl. " +
          "This is the documented fallback for frame continuity on the Gemini API endpoint."
      );
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: buildBody({ prompt }),
          signal: AbortSignal.timeout(30000),
        }
      );
    }

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

    const video =
      result.response?.generateVideoResponse?.generatedSamples?.[0];
    if (!video?.video?.uri) {
      return Response.json({ error: "No video generated" }, { status: 502 });
    }

    // -------------------------------------------------------------------------
    // Last-frame extraction for chaining into the next scene.
    // The Gemini Veo response does not currently expose a last-frame URL
    // directly. For v1, we return null and the next scene's call will fall
    // through to text-only conditioning. A v2 enhancement would extract the
    // last frame via FFmpeg server-side after downloading the MP4.
    // -------------------------------------------------------------------------
    return Response.json({
      videoUrl: video.video.uri,
      lastFrameImageUrl: null,
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
