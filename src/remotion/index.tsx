import React from "react";
import { registerRoot, Composition } from "remotion";
import { MarketingVideo, type VideoProps } from "./Video";
import type { Storyboard } from "../lib/types";

const FPS = 30;

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MarketingVideo"
        component={MarketingVideo}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          storyboard: null as unknown as Storyboard,
        }}
        calculateMetadata={async ({ props }) => {
          const sb = props.storyboard;
          if (!sb?.totalDurationMs) return {};

          const durationInFrames = Math.max(
            Math.round((sb.totalDurationMs / 1000) * FPS),
            1
          );

          let width = 1920;
          let height = 1080;
          if (sb.brief?.aspectRatio === "9:16") {
            width = 1080;
            height = 1920;
          } else if (sb.brief?.aspectRatio === "1:1") {
            width = 1080;
            height = 1080;
          }

          return { durationInFrames, width, height };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
