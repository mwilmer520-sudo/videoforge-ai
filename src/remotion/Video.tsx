import React from "react";
import { AbsoluteFill, Audio, Series } from "remotion";
import { SceneComponent } from "./Scene";
import type { Storyboard } from "../lib/types";

export interface VideoProps {
  storyboard: Storyboard;
  [key: string]: unknown;
}

const FPS = 30;

export const MarketingVideo: React.FC<VideoProps> = ({ storyboard }) => {
  if (!storyboard?.scenes) return <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }} />;
  const { scenes, voiceover, music, brief } = storyboard;
  const { primaryColor, secondaryColor, fontFamily } = brief.brandKit;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <Series>
        {scenes.map((scene) => {
          const durationInFrames = Math.max(
            Math.round((scene.durationMs / 1000) * FPS),
            1
          );
          return (
            <Series.Sequence key={scene.id} durationInFrames={durationInFrames}>
              <SceneComponent
                scene={scene}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fontFamily={fontFamily}
              />
            </Series.Sequence>
          );
        })}
      </Series>

      {voiceover.audioUrl && <Audio src={voiceover.audioUrl} volume={1} />}
      {music.audioUrl && <Audio src={music.audioUrl} volume={0.25} />}
    </AbsoluteFill>
  );
};
