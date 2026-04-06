"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { generateAllAssets } from "@/lib/generate-assets";
import { SceneCard } from "./SceneCard";
import { Timeline } from "./Timeline";
import { AudioPanel } from "./AudioPanel";
import { VideoPreview } from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  } = useAppStore();

  if (!storyboard) return null;

  const readyScenes = storyboard.scenes.filter(
    (s) => s.status === "ready"
  ).length;
  const totalScenes = storyboard.scenes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <div className="flex bg-zinc-800 rounded-lg p-0.5">
            {(["storyboard", "preview"] as const).map((tab) => (
              <button
                key={tab}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
              onClick={() => {
                /* TODO: add scene */
              }}
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

      {/* Action bar */}
      <div className="flex items-center justify-between bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            disabled={isGenerating}
            onClick={async () => {
              if (!storyboard) return;
              setIsGenerating(true);
              await generateAllAssets(storyboard, {
                updateScene,
                updateVoiceover,
                updateMusic,
                setGenerationStep,
              });
              setIsGenerating(false);
            }}
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
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8">
          Render Final Video
        </Button>
      </div>
    </div>
  );
}
