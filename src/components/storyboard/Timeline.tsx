"use client";

import React from "react";
import { useAppStore } from "@/lib/store";

export function Timeline() {
  const { storyboard, selectedSceneId, selectScene } = useAppStore();

  if (!storyboard) return null;

  const totalMs = storyboard.totalDurationMs;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300">Timeline</h3>
        <span className="text-xs text-zinc-500 font-mono">
          {(totalMs / 1000).toFixed(1)}s total
        </span>
      </div>

      {/* Scene track */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 w-16 shrink-0">
            Scenes
          </span>
          <div className="flex-1 flex h-10 rounded-lg overflow-hidden gap-0.5">
            {storyboard.scenes.map((scene, i) => {
              const widthPct = (scene.durationMs / totalMs) * 100;
              const isSelected = scene.id === selectedSceneId;
              const colors = [
                "bg-indigo-600",
                "bg-violet-600",
                "bg-purple-600",
                "bg-fuchsia-600",
                "bg-pink-600",
                "bg-rose-600",
                "bg-indigo-500",
                "bg-violet-500",
                "bg-purple-500",
                "bg-fuchsia-500",
                "bg-pink-500",
                "bg-rose-500",
              ];

              return (
                <button
                  key={scene.id}
                  onClick={() => selectScene(scene.id)}
                  className={`${colors[i % colors.length]} relative flex items-center justify-center transition-all ${
                    isSelected ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 z-10" : "hover:brightness-110"
                  }`}
                  style={{ width: `${widthPct}%` }}
                  title={`${scene.title} (${(scene.durationMs / 1000).toFixed(1)}s)`}
                >
                  <span className="text-[10px] text-white/90 font-medium truncate px-1">
                    {scene.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voiceover track */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 w-16 shrink-0">
            Voice
          </span>
          <div className="flex-1 h-6 rounded-lg overflow-hidden">
            <div
              className={`h-full flex items-center px-2 ${
                storyboard.voiceover.status === "ready"
                  ? "bg-emerald-900/50"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-[10px] text-zinc-400 truncate">
                {storyboard.voiceover.status === "ready"
                  ? `${storyboard.voiceover.voiceName} — "${storyboard.voiceover.script.slice(0, 50)}..."`
                  : storyboard.voiceover.status === "generating"
                  ? "Generating voiceover..."
                  : "Voiceover pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Music track */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 w-16 shrink-0">
            Music
          </span>
          <div className="flex-1 h-6 rounded-lg overflow-hidden">
            <div
              className={`h-full flex items-center px-2 ${
                storyboard.music.status === "ready"
                  ? "bg-amber-900/50"
                  : "bg-zinc-800"
              }`}
            >
              <span className="text-[10px] text-zinc-400 truncate">
                {storyboard.music.status === "ready"
                  ? `${storyboard.music.genre} — ${storyboard.music.mood}`
                  : storyboard.music.status === "generating"
                  ? "Generating music..."
                  : "Music pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Time markers */}
      <div className="flex items-center gap-1 mt-2">
        <span className="w-16 shrink-0" />
        <div className="flex-1 flex justify-between">
          {Array.from(
            { length: Math.min(Math.ceil(totalMs / 5000) + 1, 20) },
            (_, i) => (
              <span key={i} className="text-[9px] text-zinc-600 font-mono">
                {i * 5 < totalMs / 1000
                  ? `${Math.floor((i * 5) / 60)}:${String(
                      (i * 5) % 60
                    ).padStart(2, "0")}`
                  : ""}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
