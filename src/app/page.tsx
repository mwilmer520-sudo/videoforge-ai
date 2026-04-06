"use client";

import React, { useState } from "react";
import { BriefForm } from "@/components/storyboard/BriefForm";
import { ConceptPicker } from "@/components/storyboard/ConceptPicker";
import { StoryboardEditor } from "@/components/storyboard/StoryboardEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/lib/store";
import type { Brief } from "@/lib/types";

export default function Home() {
  const {
    concepts,
    setConcepts,
    storyboard,
    isGenerating,
    setIsGenerating,
    setGenerationStep,
    reset,
  } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (brief: Brief) => {
    setError(null);
    setIsGenerating(true);
    setGenerationStep("AgentLead is analyzing your brief...");

    try {
      setGenerationStep("Crafting 3 creative directions...");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate concepts");
      }

      const data = await res.json();
      setConcepts(data.concepts);
      setGenerationStep("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
              VideoForge<span className="text-indigo-500 dark:text-indigo-400">AI</span>
            </span>
            <AgentBadge text="AgentLead" />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {(concepts || storyboard) && (
              <button
                onClick={reset}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!concepts ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Powered by AgentLead
                </span>
              </div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Tell us what to sell.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
                  We&apos;ll show you how.
                </span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg max-w-lg mx-auto">
                Our AI creative director generates 3 distinct video concepts
                with proven storytelling frameworks, optimized hooks, and
                platform-specific strategies.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <BriefForm onSubmit={handleGenerate} />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mt-12">
              <h3 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 text-center mb-5 uppercase tracking-wider">
                AgentLead&apos;s Expertise
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: "8 Storytelling Frameworks",
                    desc: "Hook-Problem-Solution, Before-After, Social Proof Stack, Curiosity Gap, UGC-style, and more",
                    icon: "📖",
                  },
                  {
                    title: "6 Hook Techniques",
                    desc: "Pattern Interrupt, Direct Address, Controversial Take, Visual Shock, Question Hook, Result First",
                    icon: "🎯",
                  },
                  {
                    title: "6 Platform Strategies",
                    desc: "TikTok, IG Reels, YouTube Shorts, YouTube, LinkedIn, Facebook — each with unique optimization",
                    icon: "📊",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50"
                  >
                    <div className="text-xl mb-2">{f.icon}</div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {f.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <ConceptPicker />
            {storyboard && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                <StoryboardEditor />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function AgentBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
      {text}
    </span>
  );
}
