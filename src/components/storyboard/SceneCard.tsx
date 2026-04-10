"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { Scene } from "@/lib/types";

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: () => void;
}

export function SceneCard({ scene, isSelected, onSelect }: SceneCardProps) {
  const { updateScene, removeScene } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(scene.captionText || "");
  const [editPrompt, setEditPrompt] = useState(scene.veoPrompt || "");

  const statusColor = {
    pending: "bg-zinc-600",
    generating: "bg-amber-500 animate-pulse",
    ready: "bg-emerald-500",
    error: "bg-red-500",
  }[scene.status];

  const handleSaveEdit = () => {
    updateScene(scene.id, {
      captionText: editCaption,
      veoPrompt: editPrompt,
    });
    setIsEditing(false);
  };

  const overlayCount = scene.overlays?.length || 0;

  return (
    <Card
      onClick={onSelect}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-200 border-2 bg-white dark:bg-zinc-900 ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/20"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
      }`}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {scene.videoUrl ? (
          <video
            src={scene.videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 dark:from-zinc-800 to-zinc-200 dark:to-zinc-900">
            <div className="text-center p-3">
              <div className="text-2xl mb-1">🎬</div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                Veo3 clip
              </span>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] gap-1 bg-white/80 dark:bg-black/60 backdrop-blur-sm text-zinc-900 dark:text-white border-0">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            {scene.status}
          </Badge>
        </div>

        {/* Duration badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] bg-white/80 dark:bg-black/60 backdrop-blur-sm text-zinc-900 dark:text-white border-0 font-mono">
            {(scene.durationMs / 1000).toFixed(0)}s
          </Badge>
        </div>

        {/* Overlay count badge */}
        {overlayCount > 0 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-[10px] gap-1 bg-indigo-600/90 backdrop-blur-sm text-white border-0">
              {overlayCount} overlay{overlayCount > 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-white/80 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              updateScene(scene.id, { status: "pending" });
            }}
          >
            Regenerate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              removeScene(scene.id);
            }}
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
          {scene.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
          {scene.description}
        </p>
        {scene.captionText && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5 italic line-clamp-2">
            &ldquo;{scene.captionText}&rdquo;
          </p>
        )}
        {scene.veoPrompt && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1 line-clamp-1 font-mono">
            Veo: {scene.veoPrompt}
          </p>
        )}
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div
          className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-3 flex flex-col z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Edit Scene
          </h4>
          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">VEO Prompt</label>
          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            className="text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white mb-2 flex-1 min-h-0 resize-none"
          />
          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">
            Caption text (slice of narration)
          </label>
          <Textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            className="text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white mb-2 flex-1 min-h-0 resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-500"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-7 text-xs text-zinc-500 dark:text-zinc-400"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
