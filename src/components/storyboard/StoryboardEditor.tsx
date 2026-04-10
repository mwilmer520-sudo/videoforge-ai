"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { generateAllAssets, type AssetGenerationResult } from "@/lib/generate-assets";
import { estimateCost, formatUSD } from "@/lib/cost-estimator";
import { SceneCard } from "./SceneCard";
import { Timeline } from "./Timeline";
import { AudioPanel } from "./AudioPanel";
import { VideoPreview } from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Scene } from "@/lib/types";
import { SCENE_DURATION_MS } from "@/lib/types";

export function StoryboardEditor() {
  const {
    storyboard,
    selectedSceneId,
    selectScene,
    activeTab,
    setActiveTab,
    isGenerating,
    setIsGenerating,
    updateScene,
    updateVoiceover,
    updateMusic,
    setGenerationStep,
    generationStep,
    addScene,
  } = useAppStore();

  const [assetErrors, setAssetErrors] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [isWritingPrompts, setIsWritingPrompts] = useState(false);
  const [promptsApproved, setPromptsApproved] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);

  if (!storyboard) return null;

  const readyScenes = storyboard.scenes.filter(
    (s) => s.status === "ready"
  ).length;
  const totalScenes = storyboard.scenes.length;
  // Render is available when all scenes are ready (VEO failures fall back to placeholders)
  // Voiceover and music are optional
  const allReady = readyScenes === totalScenes;

  const handleAddScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      order: storyboard.scenes.length,
      title: `Scene ${storyboard.scenes.length + 1}`,
      description: "New scene",
      veoPrompt: "",
      captionText: "",
      overlays: [],
      durationMs: SCENE_DURATION_MS,
      status: "pending",
    };
    addScene(newScene);
  };

  // Every scene now needs a Veo prompt under the new architecture, so the
  // approve-prompts step always applies (no more hero-cinematic gating).
  const hasCinematicScenes = true;
  const cost = estimateCost(storyboard, { previewMode });

  const handleApproveAndWritePrompts = async () => {
    if (!storyboard) return;
    setIsWritingPrompts(true);

    try {
      const res = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: storyboard.scenes,
          characterSheet: storyboard.characterSheet,
          script: storyboard.voiceover.script,
          tone: storyboard.brief.tone,
          brandColors: {
            primary: storyboard.brief.brandKit.primaryColor,
            secondary: storyboard.brief.brandKit.secondaryColor,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Failed to generate VEO prompts");
      }

      const data = await res.json();

      // Update each scene with the new VEO prompt
      for (const scene of data.scenes) {
        if (scene.veoPrompt) {
          updateScene(scene.id, { veoPrompt: scene.veoPrompt });
        }
      }

      setPromptsApproved(true);
    } catch (e: any) {
      setAssetErrors([e.message || "Failed to generate VEO prompts"]);
    } finally {
      setIsWritingPrompts(false);
    }
  };

  const handleGenerateAssets = async () => {
    if (!storyboard) return;
    setAssetErrors([]);
    setIsGenerating(true);

    try {
      const result: AssetGenerationResult = await generateAllAssets(
        storyboard,
        {
          updateScene,
          updateVoiceover,
          updateMusic,
          setGenerationStep,
        },
        { previewMode }
      );

      if (result.errors.length > 0) {
        setAssetErrors(result.errors);
      }
    } catch (e: any) {
      setAssetErrors([e.message || "Asset generation failed"]);
    } finally {
      setIsGenerating(false);
    }
  };

  const [renderProgress, setRenderProgress] = useState("");

  const handleRenderVideo = async () => {
    if (!storyboard) return;
    setIsRendering(true);
    setRenderProgress("Bundling video composition...");

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyboard, previewMode }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Render failed" }));
        throw new Error(err.error || "Video rendering failed");
      }

      setRenderProgress("Downloading video...");

      // Download the MP4
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `videoforge-${storyboard.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setRenderProgress("");
    } catch (e: any) {
      setAssetErrors((prev) => [...prev, `Render: ${e.message}`]);
      setRenderProgress("");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Storyboard</h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            {storyboard.brief.duration} &middot; {storyboard.brief.aspectRatio}{" "}
            &middot; {storyboard.brief.tone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs"
          >
            {readyScenes}/{totalScenes} scenes ready
          </Badge>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5" role="tablist" aria-label="View mode">
            {(["storyboard", "preview"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "storyboard" ? (
        <>
          {/* Scene Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {storyboard.scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isSelected={scene.id === selectedSceneId}
                onSelect={() =>
                  selectScene(
                    scene.id === selectedSceneId ? null : scene.id
                  )
                }
              />
            ))}

            {/* Add scene button */}
            <button
              onClick={handleAddScene}
              aria-label="Add new scene"
              className="aspect-video rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium">Add Scene</span>
            </button>
          </div>

          {/* Audio Panel */}
          <AudioPanel />

          {/* Timeline */}
          <Timeline />
        </>
      ) : (
        <VideoPreview />
      )}

      {/* Step 1: Approve storyboard & generate VEO prompts */}
      {hasCinematicScenes && !promptsApproved && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                Step 1: Approve Storyboard
              </h3>
              <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1 max-w-lg">
                Review your scenes and script above. When you&apos;re happy with the structure,
                AgentLead will write optimized VEO 3.1 prompts for each cinematic scene —
                tailored to your approved script for maximum visual consistency.
              </p>
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 shrink-0"
              disabled={isWritingPrompts}
              onClick={handleApproveAndWritePrompts}
            >
              {isWritingPrompts ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  Writing VEO prompts...
                </span>
              ) : (
                "Approve & Write VEO Prompts"
              )}
            </Button>
          </div>
        </div>
      )}

      {promptsApproved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              VEO prompts written — ready to generate assets
            </span>
          </div>
        </div>
      )}

      {/* Error display */}
      {assetErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
            Some assets failed to generate:
          </h4>
          <ul className="space-y-1">
            {assetErrors.map((err, i) => (
              <li key={i} className="text-xs text-red-600/80 dark:text-red-400/80">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cost preview + preview-mode toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Estimated cost
              </h4>
              <span
                className={`text-2xl font-bold ${
                  previewMode
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {formatUSD(cost.total)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1">
              {previewMode ? (
                <>
                  Preview mode — no Veo calls. Captions + overlays only over gradient placeholders.
                </>
              ) : (
                <>
                  {cost.veoClipCount} Veo clips (${(cost.veo).toFixed(2)}) · voice (${cost.voice.toFixed(2)}) · music (${cost.music.toFixed(2)}) · Claude (${cost.claude.toFixed(2)})
                </>
              )}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Preview render (no Veo, free)
            </span>
          </label>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            disabled={isGenerating || (hasCinematicScenes && !promptsApproved)}
            onClick={handleGenerateAssets}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                {generationStep || "Generating..."}
              </span>
            ) : previewMode ? (
              "Generate voiceover + music (skip Veo)"
            ) : (
              "Generate All Assets"
            )}
          </Button>
          <span className="text-xs text-zinc-500 dark:text-zinc-600">
            {previewMode
              ? "Generates ElevenLabs voice + music. Veo skipped — Remotion will render gradients."
              : "Calls VEO, ElevenLabs, and music generation APIs"}
          </span>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 disabled:opacity-40"
          disabled={!allReady || isRendering}
          onClick={handleRenderVideo}
        >
          {isRendering ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
              {renderProgress || "Rendering..."}
            </span>
          ) : previewMode ? (
            "Render preview MP4 (free)"
          ) : (
            "Render & Download MP4"
          )}
        </Button>
      </div>
    </div>
  );
}
