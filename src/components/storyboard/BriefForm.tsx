"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { Brief, Platform } from "@/lib/types";

const PLATFORMS: { value: Platform | "auto"; label: string; icon: string }[] = [
  { value: "auto", label: "Let AI Decide", icon: "🤖" },
  { value: "tiktok", label: "TikTok", icon: "📱" },
  { value: "instagram-reels", label: "IG Reels", icon: "📸" },
  { value: "youtube-shorts", label: "YT Shorts", icon: "🎬" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "facebook", label: "Facebook", icon: "👥" },
];

export function BriefForm({
  onSubmit,
}: {
  onSubmit: (brief: Brief) => void;
}) {
  const { isGenerating, generationStep } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform | "auto">("auto");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      prompt,
      platform: platform === "auto" ? undefined : platform,
      brandKit: {
        primaryColor,
        secondaryColor,
        fontFamily: "Inter, system-ui, sans-serif",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt — the main input */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          What are you promoting?
        </label>
        <Textarea
          placeholder="Tell the agent about your product, brand, or message. Be as simple or detailed as you want — AgentLead will handle the creative strategy.

Examples:
• 'A premium coffee subscription called BeanBox — we deliver freshly roasted beans weekly'
• 'Launch video for our new AI fitness app that creates custom workout plans'
• 'Brand awareness campaign for an eco-friendly cleaning products line'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[140px] bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none text-sm leading-relaxed"
          required
        />
        <p className="text-[11px] text-zinc-600 mt-1.5">
          The agent will analyze your brief and generate 3 distinct creative directions with different storytelling strategies, optimized for performance.
        </p>
      </div>

      {/* Platform selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Target Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlatform(p.value)}
              aria-pressed={platform === p.value}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                platform === p.value
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 mt-1.5">
          &ldquo;Let AI Decide&rdquo; = agent picks the best platform for each concept based on your content.
        </p>
      </div>

      {/* Brand Colors — compact */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Brand Colors <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              aria-label="Primary brand color"
            />
            <span className="text-xs text-zinc-500">Primary</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              aria-label="Secondary brand color"
            />
            <span className="text-xs text-zinc-500">Secondary</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 text-base shadow-lg shadow-indigo-500/20"
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {generationStep || "AgentLead is thinking..."}
          </span>
        ) : (
          "Generate 3 Creative Directions"
        )}
      </Button>
    </form>
  );
}
