import type { Storyboard } from "./types";

type UpdateFn = {
  updateScene: (id: string, updates: Record<string, unknown>) => void;
  updateVoiceover: (updates: Record<string, unknown>) => void;
  updateMusic: (updates: Record<string, unknown>) => void;
  setGenerationStep: (step: string) => void;
};

export interface AssetGenerationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function generateAllAssets(
  storyboard: Storyboard,
  fns: UpdateFn
): Promise<AssetGenerationResult> {
  const { scenes, voiceover, music, brief } = storyboard;
  const errors: string[] = [];
  const promises: Promise<void>[] = [];

  // 1. Generate video clips only for hero-cinematic scenes via VEO
  for (const scene of scenes) {
    if (scene.status === "ready") continue;

    // Only hero-cinematic scenes need VEO; others are Remotion-rendered
    if (scene.layout === "hero-cinematic" && scene.veoPrompt) {
      promises.push(
        (async () => {
          fns.updateScene(scene.id, { status: "generating" });
          fns.setGenerationStep(`Generating clip: ${scene.title}...`);

          try {
            const res = await fetch("/api/veo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: scene.veoPrompt,
                aspectRatio: brief.aspectRatio,
              }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "VEO failed" }));
              throw new Error(err.error || "VEO failed");
            }

            const data = await res.json();
            fns.updateScene(scene.id, {
              videoUrl: data.videoUrl,
              thumbnailUrl: data.thumbnailUrl,
              status: "ready",
            });
          } catch (e: any) {
            const msg = `Scene "${scene.title}": ${e.message || "VEO failed"}`;
            errors.push(msg);
            fns.updateScene(scene.id, { status: "error" });
          }
        })()
      );
    } else {
      // Non-VEO scenes are rendered by Remotion — mark as ready
      fns.updateScene(scene.id, { status: "ready" });
    }
  }

  // 2. Generate voiceover
  if (voiceover.status !== "ready") {
    promises.push(
      (async () => {
        fns.updateVoiceover({ status: "generating" });
        fns.setGenerationStep("Generating voiceover...");

        try {
          const res = await fetch("/api/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              script: voiceover.script,
              voiceId: voiceover.voiceId,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Voice failed" }));
            throw new Error(err.error || "Voice failed");
          }

          const data = await res.json();
          fns.updateVoiceover({ audioUrl: data.audioUrl, status: "ready" });
        } catch (e: any) {
          errors.push(`Voiceover: ${e.message || "Voice failed"}`);
          fns.updateVoiceover({ status: "error" });
        }
      })()
    );
  }

  // 3. Generate music (skip gracefully if no API key configured)
  if (music.status !== "ready") {
    promises.push(
      (async () => {
        fns.updateMusic({ status: "generating" });
        fns.setGenerationStep("Generating music...");

        try {
          const res = await fetch("/api/music", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: music.prompt,
              durationMs: storyboard.totalDurationMs,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Music failed" }));
            // If no music API configured, skip silently instead of erroring
            if (err.error?.includes("No music generation API configured")) {
              fns.updateMusic({ status: "pending" });
              return;
            }
            throw new Error(err.error || "Music failed");
          }

          const data = await res.json();
          fns.updateMusic({ audioUrl: data.audioUrl, status: "ready" });
        } catch (e: any) {
          errors.push(`Music: ${e.message || "Music failed"}`);
          fns.updateMusic({ status: "error" });
        }
      })()
    );
  }

  const results = await Promise.allSettled(promises);
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  fns.setGenerationStep("");

  return {
    total: results.length,
    succeeded,
    failed: failed + errors.length,
    errors,
  };
}
