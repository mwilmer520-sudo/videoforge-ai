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

    if (!storyboard?.scenes?.length) {
      return Response.json({ error: "Storyboard with scenes is required" }, { status: 400 });
    }

    const outputDir = os.tmpdir();
    const propsFile = path.join(outputDir, `videoforge-props-${storyboard.id}.json`);
    const outputFile = path.join(outputDir, `videoforge-${storyboard.id}.mp4`);

    // Write props to temp file
    fs.writeFileSync(propsFile, JSON.stringify({ storyboard }));

    // Determine dimensions
    let width = 1920, height = 1080;
    if (storyboard.brief?.aspectRatio === "9:16") { width = 1080; height = 1920; }
    else if (storyboard.brief?.aspectRatio === "1:1") { width = 1080; height = 1080; }

    const fps = 30;
    const durationInFrames = Math.max(Math.round((storyboard.totalDurationMs / 1000) * fps), 1);

    const entryPoint = path.join(process.cwd(), "src", "remotion", "index.tsx");

    // Use Remotion CLI to render
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
    ].join(" ");

    try {
      execSync(cmd, {
        cwd: process.cwd(),
        timeout: 240000, // 4 min timeout
        stdio: "pipe",
      });
    } catch (renderErr: any) {
      console.error("Remotion CLI error:", renderErr.stderr?.toString() || renderErr.message);
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
