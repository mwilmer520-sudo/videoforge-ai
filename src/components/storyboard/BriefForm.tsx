"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { Brief, Platform } from "@/lib/types";

const PLATFORMS: { value: Platform | "auto"; label: string; icon: string }[] = [
  { value: "auto", label: "AI Decides", icon: "🤖" },
  { value: "tiktok", label: "TikTok", icon: "📱" },
  { value: "instagram-reels", label: "IG Reels", icon: "📸" },
  { value: "youtube-shorts", label: "YT Shorts", icon: "🎬" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
];

export function BriefForm({
  onSubmit,
}: {
  onSubmit: (brief: Brief) => void;
}) {
  const { isGenerating, generationStep } = useAppStore();
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform | "auto">("auto");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");

  const isUrl = /^https?:\/\//i.test(input.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      prompt: input.trim(),
      platform: platform === "auto" ? undefined : platform,
      brandKit: {
        primaryColor,
        secondaryColor,
        fontFamily: "Inter, system-ui, sans-serif",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Main input — URL or description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Paste your URL or describe your product
        </label>
        <Input
          type="text"
          placeholder="https://yourproduct.com  or  'AI-powered project management for remote teams'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-12 text-base bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          required
        />
        {isUrl && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            URL detected — AgentLead will scrape your site to understand your product, features, and messaging.
          </p>
        )}
        {!isUrl && input.trim() && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
            Tip: paste a URL for best results — the agent will analyze your site automatically.
          </p>
        )}
      </div>

      {/* Platform selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Target Platform
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlatform(p.value)}
              aria-pressed={platform === p.value}
              className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                platform === p.value
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="text-sm">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        {showAdvanced ? "Hide" : "Show"} advanced options
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-1">
          {/* Extra context */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Additional context (optional)
            </label>
            <Textarea
              placeholder="Any specific messaging, target audience, or features to highlight..."
              className="min-h-[60px] text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none"
              onChange={(e) => {
                if (e.target.value) {
                  setInput((prev) => {
                    const base = prev.split("\n---\n")[0];
                    return `${base}\n---\n${e.target.value}`;
                  });
                }
              }}
            />
          </div>

          {/* Brand Colors */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Brand Colors
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  aria-label="Primary brand color"
                />
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Primary</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  aria-label="Secondary brand color"
                />
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Secondary</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isGenerating || !input.trim()}
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
