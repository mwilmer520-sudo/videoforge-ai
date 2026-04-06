"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";

export function AudioPanel() {
  const { storyboard, updateVoiceover, updateMusic } = useAppStore();

  if (!storyboard) return null;

  const { voiceover, music } = storyboard;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Voiceover */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎙</span>
            <h3 className="text-sm font-semibold text-zinc-300">Voiceover</h3>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              voiceover.status === "ready"
                ? "bg-emerald-900/50 text-emerald-400"
                : voiceover.status === "generating"
                ? "bg-amber-900/50 text-amber-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {voiceover.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">
              Script
            </label>
            <Textarea
              value={voiceover.script}
              onChange={(e) => updateVoiceover({ script: e.target.value })}
              className="text-xs bg-zinc-800 border-zinc-700 text-white min-h-[80px] resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500">Voice: </span>
              <span className="text-xs text-zinc-300">
                {voiceover.voiceName}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              onClick={() =>
                updateVoiceover({ status: "pending" })
              }
            >
              Regenerate
            </Button>
          </div>

          {voiceover.audioUrl && (
            <audio
              src={voiceover.audioUrl}
              controls
              className="w-full h-8 mt-1"
            />
          )}
        </div>
      </Card>

      {/* Music */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎵</span>
            <h3 className="text-sm font-semibold text-zinc-300">Music</h3>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              music.status === "ready"
                ? "bg-emerald-900/50 text-emerald-400"
                : music.status === "generating"
                ? "bg-amber-900/50 text-amber-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {music.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zinc-500">Genre: </span>
              <span className="text-xs text-zinc-300">{music.genre}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500">Mood: </span>
              <span className="text-xs text-zinc-300">{music.mood}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">
              Music Prompt
            </label>
            <Textarea
              value={music.prompt}
              onChange={(e) => updateMusic({ prompt: e.target.value })}
              className="text-xs bg-zinc-800 border-zinc-700 text-white min-h-[60px] resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              onClick={() => updateMusic({ status: "pending" })}
            >
              Regenerate
            </Button>
          </div>

          {music.audioUrl && (
            <audio
              src={music.audioUrl}
              controls
              className="w-full h-8 mt-1"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
