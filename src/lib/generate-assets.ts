import type { Storyboard } from "./types";

type UpdateFn = {
  updateScene: (id: string, updates: Record<string, unknown>) => void;
  updateVoiceover: (updates: Record<string, unknown>) => void;
  updateMusic: (updates: Record<string, unknown>) => void;
  setGenerationStep: (step: string) => void;
};

export async function generateAllAssets(
  storyboard: Storyboard,
  fns: UpdateFn
) {
  const { scenes, voiceover, music, brief } = storyboard;

  // Generate all in parallel: scenes (video clips), voiceover, music
  const promises: Promise<void>[] = [];

  // 1. Generate video clips for each scene via VEO
  for (const scene of scenes) {
    if (scene.status === "ready") continue;

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

          if (!res.ok) throw new Error("VEO failed");
          const data = await res.json();

          fns.updateScene(scene.id, {
            videoUrl: data.videoUrl,
            thumbnailUrl: data.thumbnailUrl,
            status: "ready",
          });
        } catch {
          fns.updateScene(scene.id, { status: "error" });
        }
      })()
    );
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

          if (!res.ok) throw new Error("Voice failed");
          const data = await res.json();

          fns.updateVoiceover({
            audioUrl: data.audioUrl,
            status: "ready",
          });
        } catch {
          fns.updateVoiceover({ status: "error" });
        }
      })()
    );
  }

  // 3. Generate music
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

          if (!res.ok) throw new Error("Music failed");
          const data = await res.json();

          fns.updateMusic({
            audioUrl: data.audioUrl,
            status: "ready",
          });
        } catch {
          fns.updateMusic({ status: "error" });
        }
      })()
    );
  }

  await Promise.allSettled(promises);
  fns.setGenerationStep("");
}
