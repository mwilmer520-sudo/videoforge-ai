import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import type { Storyboard } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const storyboard: Storyboard = body?.storyboard;
    const previewMode: boolean = body?.previewMode === true;

    if (!storyboard?.scenes?.length) {
      return Response.json({ error: "Storyboard with scenes is required" }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // Preview mode: clear all videoUrls so Scene.tsx falls back to gradient
    // placeholders. Captions and overlays still render — this lets users
    // iterate on layout/copy without spending money on Veo clips.
    // -------------------------------------------------------------------------
    const renderStoryboard: Storyboard = previewMode
      ? {
          ...storyboard,
          scenes: storyboard.scenes.map((s) => ({ ...s, videoUrl: undefined })),
        }
      : storyboard;

    const outputDir = os.tmpdir();
    // Store downloaded clips in public/ so Remotion's dev server can serve them.
    // OffthreadVideo resolves src as URLs on its internal server (localhost:3001),
    // so local paths must be reachable from the public directory.
    const assetDir = path.join(process.cwd(), "public", "temp", storyboard.id);
    fs.mkdirSync(assetDir, { recursive: true });
    const propsFile = path.join(outputDir, `videoforge-props-${storyboard.id}.json`);
    const outputFile = path.join(outputDir, `videoforge-${storyboard.id}.mp4`);

    // -------------------------------------------------------------------------
    // Download remote video assets to local temp files. Veo returns URLs on
    // generativelanguage.googleapis.com which require the x-goog-api-key
    // header. Remotion's OffthreadVideo does plain fetches (no auth headers),
    // so we download first and swap to local file:// paths.
    // -------------------------------------------------------------------------
    const localStoryboard: Storyboard = {
      ...renderStoryboard,
      scenes: await Promise.all(
        renderStoryboard.scenes.map(async (scene, i) => {
          if (!scene.videoUrl) return scene;
          try {
            const apiKey = process.env.GOOGLE_API_KEY;
            const headers: Record<string, string> = {};
            if (apiKey && scene.videoUrl.includes("googleapis.com")) {
              headers["x-goog-api-key"] = apiKey;
            }
            const res = await fetch(scene.videoUrl, { headers, signal: AbortSignal.timeout(60000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            const localPath = path.join(assetDir, `scene-${i}.mp4`);
            fs.writeFileSync(localPath, buf);
            console.log(`Downloaded scene ${i} (${(buf.length / 1024 / 1024).toFixed(1)}MB) → ${localPath}`);
            // Serve via Next.js dev server (public/ → root). Remotion's
            // OffthreadVideo can fetch HTTP URLs from localhost.
            const baseUrl = process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000";
            return { ...scene, videoUrl: `${baseUrl}/temp/${storyboard.id}/scene-${i}.mp4` };
          } catch (e: any) {
            console.warn(`Failed to download scene ${i} video: ${e.message} — using placeholder`);
            return { ...scene, videoUrl: undefined };
          }
        })
      ),
    };

    // Write props to temp file
    fs.writeFileSync(propsFile, JSON.stringify({ storyboard: localStoryboard }));

    // Determine dimensions
    let width = 1920, height = 1080;
    if (storyboard.brief?.aspectRatio === "9:16") { width = 1080; height = 1920; }
    else if (storyboard.brief?.aspectRatio === "1:1") { width = 1080; height = 1080; }

    const fps = 30;
    const durationInFrames = Math.max(Math.round((storyboard.totalDurationMs / 1000) * fps), 1);

    const entryPoint = path.join(process.cwd(), "src", "remotion", "index.tsx");

    // Use Remotion CLI to render.
    // Use system FFmpeg instead of Remotion's bundled one — the bundled
    // @remotion/compositor-darwin-x64 was compiled for macOS 15 and crashes
    // on older macOS versions (missing _AVCaptureDeviceTypeContinuityCamera).
    const cmd = [
      "npx", "remotion", "render",
      entryPoint,
      "MarketingVideo",
      outputFile,
      "--props", propsFile,
      "--codec", "h264",
      "--width", String(width),
      "--height", String(height),
      "--fps", String(fps),
      "--frames", `0-${durationInFrames - 1}`,
      "--ffmpeg-executable", "/usr/local/bin/ffmpeg",
      "--ffprobe-executable", "/usr/local/bin/ffprobe",
      "--audio-codec", "mp3",
    ].join(" ");

    // Use spawn (async) instead of execSync. Remotion's OffthreadVideo fetches
    // video files from localhost:3000 during render. If we block the event loop
    // with execSync, Next.js can't serve those files and Remotion times out.
    try {
      await new Promise<void>((resolve, reject) => {
        const args = cmd.split(" ").slice(1); // drop "npx"
        const child = spawn("npx", args, {
          cwd: process.cwd(),
          stdio: "pipe",
        });
        let stderr = "";
        child.stderr?.on("data", (data: Buffer) => { stderr += data.toString(); });
        child.on("close", (code) => {
          if (code === 0) resolve();
          else {
            console.error("Remotion CLI error:", stderr);
            reject(new Error(`Remotion exited with code ${code}`));
          }
        });
        child.on("error", reject);
        // 4 minute timeout
        setTimeout(() => {
          child.kill("SIGTERM");
          reject(new Error("Remotion render timed out (240s)"));
        }, 240000);
      });
    } catch (renderErr: any) {
      console.error("Render failed:", renderErr.message);
      return Response.json(
        { error: "Video rendering failed — check server logs" },
        { status: 500 }
      );
    }

    if (!fs.existsSync(outputFile)) {
      return Response.json({ error: "Render produced no output file" }, { status: 500 });
    }

    const videoBuffer = fs.readFileSync(outputFile);

    // Cleanup
    try { fs.unlinkSync(propsFile); } catch {}
    try { fs.unlinkSync(outputFile); } catch {}
    try { fs.rmSync(assetDir, { recursive: true, force: true }); } catch {}

    return new Response(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="videoforge-${storyboard.id}.mp4"`,
        "Content-Length": String(videoBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("Render error:", error);
    return Response.json(
      { error: error.message || "Video rendering failed" },
      { status: 500 }
    );
  }
}
