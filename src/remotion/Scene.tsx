import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "./layers/Background";
import { Captions } from "./layers/Captions";
import { CTAButton } from "./layers/CTAButton";
import { BulletList } from "./layers/BulletList";
import { TrustBadge } from "./layers/TrustBadge";
import { FineText } from "./layers/FineText";
import { UXHighlight } from "./layers/UXHighlight";
import type { Scene as SceneType, OverlayElement } from "@/lib/types";

interface SceneProps {
  scene: SceneType;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

/**
 * Single 8-second scene composite. Layers from bottom to top:
 *   1. Veo3 footage (or premium animated placeholder if videoUrl is missing)
 *   2. Subtle vignette for depth
 *   3. Closed captions (always rendered — word-by-word animated reveal)
 *   4. Overlay graphics from scene.overlays[]
 *
 * Smooth cross-fade transitions at scene boundaries.
 */
export const SceneComponent: React.FC<SceneProps> = ({
  scene,
  primaryColor,
  secondaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Cinematic cross-fade: 0.5s fade in, 0.3s fade out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 9, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle Ken Burns zoom for more cinematic feel on both Veo + placeholder
  const kenBurns = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* ===== Layer 1: Base footage or premium placeholder ===== */}
      <AbsoluteFill style={{ transform: `scale(${kenBurns})` }}>
        {scene.videoUrl ? (
          <OffthreadVideo
            src={scene.videoUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Background
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            style="dark"
          />
        )}
      </AbsoluteFill>

      {/* ===== Layer 1.5: Cinematic vignette for depth ===== */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ===== Layer 2: Closed captions (word-by-word reveal) ===== */}
      <Captions text={scene.captionText} fontFamily={fontFamily} />

      {/* ===== Layer 3: Overlay graphics ===== */}
      {scene.overlays?.map((overlay, i) => (
        <OverlayRenderer
          key={i}
          overlay={overlay}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
        />
      ))}
    </AbsoluteFill>
  );
};

interface OverlayRendererProps {
  overlay: OverlayElement;
  primaryColor: string;
  fontFamily: string;
}

const OverlayRenderer: React.FC<OverlayRendererProps> = ({
  overlay,
  primaryColor,
  fontFamily,
}) => {
  switch (overlay.type) {
    case "cta-button":
      return (
        <CTAButton
          label={overlay.label}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          position={overlay.position}
        />
      );
    case "bullet-list":
      return (
        <BulletList
          bullets={overlay.bullets}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          position={overlay.position}
        />
      );
    case "trust-badge":
      return (
        <TrustBadge
          label={overlay.label}
          subLabel={overlay.subLabel}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
          position={overlay.position}
        />
      );
    case "fine-text":
      return (
        <FineText
          text={overlay.text}
          fontFamily={fontFamily}
          position={overlay.position}
        />
      );
    case "ux-highlight":
      return (
        <UXHighlight
          x={overlay.x}
          y={overlay.y}
          label={overlay.label}
          primaryColor={primaryColor}
          fontFamily={fontFamily}
        />
      );
    default:
      return null;
  }
};
