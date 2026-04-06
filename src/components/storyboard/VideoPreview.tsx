"use client";

import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { MarketingVideo } from "@/remotion/Video";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FPS = 30;

export function VideoPreview() {
  const { storyboard } = useAppStore();

  if (!storyboard) return null;

  const durationInFrames = Math.round(
    (storyboard.totalDurationMs / 1000) * FPS
  );

  const dimensions = useMemo(() => {
    switch (storyboard.brief.aspectRatio) {
      case "9:16":
        return { width: 1080, height: 1920 };
      case "1:1":
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  }, [storyboard.brief.aspectRatio]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300">Preview</h3>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {dimensions.width}x{dimensions.height}
          </span>
          <span>{FPS}fps</span>
          <span>{(storyboard.totalDurationMs / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden bg-black"
        style={{
          aspectRatio: `${dimensions.width}/${dimensions.height}`,
          maxHeight: storyboard.brief.aspectRatio === "9:16" ? 500 : undefined,
          margin: "0 auto",
        }}
      >
        <Player
          component={MarketingVideo}
          inputProps={{ storyboard }}
          durationInFrames={Math.max(durationInFrames, 1)}
          fps={FPS}
          compositionWidth={dimensions.width}
          compositionHeight={dimensions.height}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay={false}
        />
      </div>
    </Card>
  );
}
