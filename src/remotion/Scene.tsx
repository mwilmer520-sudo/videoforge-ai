import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "./layers/Background";
import { UIDemo } from "./layers/UIDemo";
import { Presenter } from "./layers/Presenter";
import { AnimatedText } from "./layers/AnimatedText";
import { MetricsGrid } from "./layers/MetricsGrid";
import type { Scene as SceneType } from "@/lib/types";

interface SceneProps {
  scene: SceneType;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export const SceneComponent: React.FC<SceneProps> = ({
  scene,
  primaryColor,
  secondaryColor,
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Cross-fade transitions
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* ======= LAYOUT: Hero Cinematic ======= */}
      {scene.layout === "hero-cinematic" && (
        <>
          {scene.videoUrl ? (
            <OffthreadVideo
              src={scene.videoUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="gradient" />
          )}
          {scene.textOverlay && (
            <AnimatedText
              text={scene.textOverlay}
              style="headline"
              animation="slide-up"
              position="center"
              fontFamily={fontFamily}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Presenter Full ======= */}
      {scene.layout === "presenter-full" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="dark" />
          <Presenter
            position="center"
            avatarStyle="professional"
            speakingScript={scene.presenterScript}
            primaryColor={primaryColor}
          />
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="subheadline"
              animation="fade"
              position="bottom-center"
              fontFamily={fontFamily}
              delay={10}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Presenter + UI Demo ======= */}
      {scene.layout === "presenter-left-ui-right" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="dark" />
          <Presenter
            position={scene.presenterPosition || "left"}
            avatarStyle="professional"
            speakingScript={scene.presenterScript}
            primaryColor={primaryColor}
          />
          <UIDemo
            screenshotUrl={scene.uiScreenshotUrl}
            mockupStyle={scene.uiMockupStyle || "browser"}
            callouts={scene.uiCallouts}
            animationIn={scene.uiAnimationIn || "slide-left"}
            position="right"
            primaryColor={primaryColor}
          />
          {scene.textOverlay && (
            <AnimatedText
              text={scene.textOverlay}
              style="caption"
              animation="fade"
              position="top-center"
              fontFamily={fontFamily}
              delay={15}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Full UI Demo ======= */}
      {scene.layout === "ui-full-with-callouts" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="dark" />
          <UIDemo
            screenshotUrl={scene.uiScreenshotUrl}
            mockupStyle={scene.uiMockupStyle || "browser"}
            callouts={scene.uiCallouts}
            animationIn={scene.uiAnimationIn || "zoom-in"}
            position="center"
            primaryColor={primaryColor}
          />
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="subheadline"
              animation="slide-up"
              position="top-center"
              fontFamily={fontFamily}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: UI Transition Flow ======= */}
      {scene.layout === "ui-transition-flow" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="mesh" />
          <UIDemo
            screenshotUrl={scene.uiScreenshotUrl}
            mockupStyle={scene.uiMockupStyle || "floating"}
            callouts={scene.uiCallouts}
            animationIn="float-in"
            position="center"
            primaryColor={primaryColor}
          />
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="subheadline"
              animation="slide-up"
              position="bottom-center"
              fontFamily={fontFamily}
              delay={10}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Metrics Grid ======= */}
      {scene.layout === "metrics-grid" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="dark" />
          {scene.metrics && scene.metrics.length > 0 && (
            <MetricsGrid
              metrics={scene.metrics}
              primaryColor={primaryColor}
              fontFamily={fontFamily}
            />
          )}
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="label"
              animation="fade"
              position="top-center"
              color="rgba(255,255,255,0.5)"
              fontFamily={fontFamily}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Text Centered (Bold Statement) ======= */}
      {scene.layout === "text-centered" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="mesh" />
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="headline"
              animation={scene.textAnimation || "pop"}
              position="center"
              fontFamily={fontFamily}
            />
          )}
          {scene.subheadline && (
            <AnimatedText
              text={scene.subheadline}
              style="subheadline"
              animation="fade"
              position="bottom-center"
              color="rgba(255,255,255,0.6)"
              fontFamily={fontFamily}
              delay={15}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: Fallback for unknown layouts ======= */}
      {!["hero-cinematic", "presenter-full", "presenter-left-ui-right", "ui-full-with-callouts", "ui-transition-flow", "metrics-grid", "text-centered", "cta-screen"].includes(scene.layout) && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="dark" />
          <AnimatedText
            text={scene.title || "Scene"}
            style="headline"
            animation="fade"
            position="center"
            fontFamily={fontFamily}
          />
          {scene.description && (
            <AnimatedText
              text={scene.description}
              style="body"
              animation="fade"
              position="bottom-center"
              color="rgba(255,255,255,0.6)"
              fontFamily={fontFamily}
              delay={10}
            />
          )}
        </>
      )}

      {/* ======= LAYOUT: CTA Screen ======= */}
      {scene.layout === "cta-screen" && (
        <>
          <Background primaryColor={primaryColor} secondaryColor={secondaryColor} style="gradient" />
          {scene.headline && (
            <AnimatedText
              text={scene.headline}
              style="headline"
              animation="slide-up"
              position="center"
              fontFamily={fontFamily}
            />
          )}
          {scene.subheadline && (
            <AnimatedText
              text={scene.subheadline}
              style="subheadline"
              animation="fade"
              position="bottom-center"
              fontFamily={fontFamily}
              delay={12}
            />
          )}
          {/* CTA button */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: "50%",
              transform: `translateX(-50%) scale(${interpolate(
                frame - 20,
                [0, 15],
                [0.8, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )})`,
              opacity: interpolate(frame - 20, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              background: primaryColor,
              padding: "18px 48px",
              borderRadius: 12,
              boxShadow: `0 8px 30px ${primaryColor}50`,
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 700,
                fontFamily,
              }}
            >
              {scene.textOverlay || "Get Started Free"}
            </span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
