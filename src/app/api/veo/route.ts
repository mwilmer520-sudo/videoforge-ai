export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GOOGLE_API_KEY not configured" }, { status: 500 });
    }

    // Call Gemini API for VEO video generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:generateVideos?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          config: {
            aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
            durationSeconds: 8,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("VEO error:", err);
      return Response.json({ error: "VEO generation failed" }, { status: 500 });
    }

    const data = await response.json();

    // VEO returns an operation — poll until done
    const operationName = data.name;
    let result = data;
    while (!result.done) {
      await new Promise((r) => setTimeout(r, 10000));
      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
      );
      result = await pollRes.json();
    }

    // Extract video URL from completed operation
    const video = result.response?.generatedVideos?.[0];
    if (!video) {
      return Response.json({ error: "No video generated" }, { status: 500 });
    }

    return Response.json({
      videoUrl: video.video?.uri || null,
      thumbnailUrl: null,
    });
  } catch (error: any) {
    console.error("VEO route error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
