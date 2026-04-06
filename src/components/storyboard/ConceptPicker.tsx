"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import type { VideoConcept } from "@/lib/types";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  "instagram-reels": "IG Reels",
  "youtube-shorts": "YT Shorts",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

const CONCEPT_COLORS = [
  { gradient: "from-indigo-600 to-violet-700", accent: "bg-indigo-500", ring: "ring-indigo-500" },
  { gradient: "from-rose-600 to-orange-600", accent: "bg-rose-500", ring: "ring-rose-500" },
  { gradient: "from-emerald-600 to-teal-600", accent: "bg-emerald-500", ring: "ring-emerald-500" },
];

export function ConceptPicker() {
  const { concepts, selectedConceptId, selectConcept } = useAppStore();

  if (!concepts) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Your Creative Directions
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
          AgentLead analyzed your brief and crafted 3 distinct approaches.
          Each uses a different storytelling strategy optimized for performance.
          Pick the one that resonates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {concepts.map((concept, i) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            colorScheme={CONCEPT_COLORS[i]}
            index={i}
            isSelected={concept.id === selectedConceptId}
            onSelect={() => selectConcept(concept.id)}
          />
        ))}
      </div>

      {selectedConceptId && (
        <div className="text-center pt-2">
          <p className="text-sm text-zinc-500">
            Scroll down to edit the storyboard, or pick a different direction above.
          </p>
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  concept,
  colorScheme,
  index,
  isSelected,
  onSelect,
}: {
  concept: VideoConcept;
  colorScheme: (typeof CONCEPT_COLORS)[0];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Concept ${index + 1}: ${concept.title}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={`group cursor-pointer transition-all duration-300 overflow-hidden border-2 bg-zinc-900 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isSelected
          ? `${colorScheme.ring} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 border-transparent`
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
      }`}
    >
      {/* Header gradient */}
      <div
        className={`bg-gradient-to-r ${colorScheme.gradient} p-5 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
              Concept {index + 1}
            </Badge>
            <div className="flex gap-1.5">
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                {PLATFORM_LABELS[concept.platform] || concept.platform}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm font-mono">
                {concept.duration}
              </Badge>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">
            {concept.title}
          </h3>
          <p className="text-white/70 text-xs mt-1">{concept.frameworkName}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Why this works */}
        <div>
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Why This Works
          </h4>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {concept.whyThisWorks}
          </p>
        </div>

        {/* Hook strategy */}
        <div>
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Hook Strategy
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {concept.hookStrategy}
          </p>
        </div>

        {/* Scene preview strip */}
        <div>
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Scene Flow ({concept.storyboard.scenes.length} scenes)
          </h4>
          <div className="flex gap-1">
            {concept.storyboard.scenes.map((scene, si) => {
              const widthPct =
                (scene.durationMs / concept.storyboard.totalDurationMs) * 100;
              return (
                <div
                  key={scene.id}
                  className={`h-8 rounded ${colorScheme.accent} flex items-center justify-center group/scene relative`}
                  style={{
                    width: `${widthPct}%`,
                    opacity: 0.4 + (si / concept.storyboard.scenes.length) * 0.6,
                  }}
                  title={`${scene.title}: ${scene.description}`}
                >
                  <span className="text-[8px] text-white/80 font-medium truncate px-0.5">
                    {si + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Script preview */}
        <div>
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Script Preview
          </h4>
          <p className="text-xs text-zinc-500 italic line-clamp-3 leading-relaxed">
            &ldquo;{concept.storyboard.voiceover.script}&rdquo;
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] capitalize"
          >
            {concept.tone}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]"
          >
            {concept.aspectRatio}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px]"
          >
            {concept.storyboard.music.genre}
          </Badge>
        </div>

        {/* Selection indicator */}
        <div
          className={`w-full text-center py-2 rounded-md text-xs font-semibold transition-all ${
            isSelected
              ? `bg-gradient-to-r ${colorScheme.gradient} text-white`
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {isSelected ? "Selected — Edit Below" : "Click to Use This Concept"}
        </div>
      </div>
    </Card>
  );
}
