"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { generateAllAssets, type AssetGenerationResult } from "@/lib/generate-assets";
import { SceneCard } from "./SceneCard";
import { Timeline } from "./Timeline";
import { AudioPanel } from "./AudioPanel";
import { VideoPreview } from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Scene } from "@/lib/types";

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

  if (!storyboard) return null;

  const readyScenes = storyboard.scenes.filter(
    (s) => s.status === "ready"
  ).length;
  const totalScenes = storyboard.scenes.length;
  const allReady =
    readyScenes === totalScenes &&
    storyboard.voiceover.status === "ready" &&
    storyboard.music.status === "ready";

  const handleAddScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      order: storyboard.scenes.length,
      title: `Scene ${storyboard.scenes.length + 1}`,
      description: "New scene",
      layout: "text-centered",
      headline: "Your text here",
      textAnimation: "fade",
      durationMs: 5000,
      status: "pending",
    };
    addScene(newScene);
  };

  const handleGenerateAssets = async () => {
    if (!storyboard) return;
    setAssetErrors([]);
    setIsGenerating(true);

    try {
      const result: AssetGenerationResult = await generateAllAssets(storyboard, {
        updateScene,
        updateVoiceover,
        updateMusic,
        setGenerationStep,
      });

      if (result.errors.length > 0) {
        setAssetErrors(result.errors);
      }
    } catch (e: any) {
      setAssetErrors([e.message || "Asset generation failed"]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRenderVideo = () => {
    setIsRendering(true);
    setActiveTab("preview");
    // For now, switch to preview tab — server-side render pipeline is a future feature
    setTimeout(() => setIsRendering(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Storyboard</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {storyboard.brief.duration} &middot; {storyboard.brief.aspectRatio}{" "}
            &middot; {storyboard.brief.tone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-zinc-800 text-zinc-300 text-xs"
          >
            {readyScenes}/{totalScenes} scenes ready
          </Badge>
          <div className="flex bg-zinc-800 rounded-lg p-0.5" role="tablist" aria-label="View mode">
            {(["storyboard", "preview"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
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
              className="aspect-video rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors"
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

      {/* Error display */}
      {assetErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-400 mb-2">
            Some assets failed to generate:
          </h4>
          <ul className="space-y-1">
            {assetErrors.map((err, i) => (
              <li key={i} className="text-xs text-red-400/80">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            variant="secondary"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            disabled={isGenerating}
            onClick={handleGenerateAssets}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                {generationStep || "Generating..."}
              </span>
            ) : (
              "Generate All Assets"
            )}
          </Button>
          <span className="text-xs text-zinc-600">
            Calls VEO, ElevenLabs, and music generation APIs in parallel
          </span>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 disabled:opacity-40"
          disabled={!allReady || isRendering}
          onClick={handleRenderVideo}
        >
          {isRendering ? "Preparing Preview..." : "Preview Final Video"}
        </Button>
      </div>
    </div>
  );
}
