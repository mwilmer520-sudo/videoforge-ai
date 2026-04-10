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

export interface GenerateOptions {
  /**
   * If true, skip the Veo loop entirely. Voice and music still generate.
   * Used by the "Preview render (no Veo, free)" toggle.
   */
  previewMode?: boolean;
}

export async function generateAllAssets(
  storyboard: Storyboard,
  fns: UpdateFn,
  options: GenerateOptions = {}
): Promise<AssetGenerationResult> {
  const { scenes, voiceover, music, brief } = storyboard;
  const errors: string[] = [];
  const promises: Promise<void>[] = [];

  // ===========================================================================
  // 1. Veo footage for EVERY scene (sequentially, to chain frame continuity)
  // ===========================================================================
  // We do this serially rather than in parallel because each scene's Veo call
  // optionally uses the previous scene's last frame for image-to-video
  // conditioning. This is how we get the illusion of continuous footage across
  // multiple 8-second clips.
  if (!options.previewMode) {
    promises.push(
      (async () => {
        let previousLastFrame: string | undefined;
        for (const scene of scenes) {
          if (scene.status === "ready") {
            // Skip already-rendered scenes (allows partial regeneration)
            previousLastFrame = scene.lastFrameImageUrl;
            continue;
          }

          fns.updateScene(scene.id, { status: "generating" });
          fns.setGenerationStep(`Generating Veo clip ${scene.order + 1}/${scenes.length}: ${scene.title}...`);

          try {
            const res = await fetch("/api/veo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: scene.veoPrompt,
                aspectRatio: brief.aspectRatio,
                firstFrameImageUrl: previousLastFrame, // chain from prior scene
              }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({ error: "VEO failed" }));
              throw new Error(err.error || "VEO failed");
            }

            const data = await res.json();
            fns.updateScene(scene.id, {
              videoUrl: data.videoUrl,
              lastFrameImageUrl: data.lastFrameImageUrl,
              status: "ready",
            });
            previousLastFrame = data.lastFrameImageUrl;
          } catch (e: any) {
            const msg = `Scene "${scene.title}": ${e.message || "VEO failed"} (using gradient fallback)`;
            errors.push(msg);
            // Fall back to ready with no video — Remotion will render gradient placeholder
            fns.updateScene(scene.id, { status: "ready" });
          }
        }
      })()
    );
  } else {
    // Preview mode: mark every scene ready immediately, no Veo calls
    for (const scene of scenes) {
      fns.updateScene(scene.id, { status: "ready" });
    }
  }

  // ===========================================================================
  // 2. ElevenLabs voiceover (parallel with Veo)
  // ===========================================================================
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

  // ===========================================================================
  // 3. Background music (parallel with Veo + voice)
  // ===========================================================================
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
