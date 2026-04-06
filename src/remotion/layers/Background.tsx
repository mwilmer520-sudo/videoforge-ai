import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface BackgroundProps {
  primaryColor: string;
  secondaryColor: string;
  style?: "gradient" | "solid" | "mesh" | "dark";
}

export const Background: React.FC<BackgroundProps> = ({
  primaryColor,
  secondaryColor,
  style = "gradient",
}) => {
  const frame = useCurrentFrame();
  const gradientAngle = interpolate(frame, [0, 300], [135, 180], {
    extrapolateRight: "clamp",
  });

  if (style === "dark") {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
        {/* Subtle animated gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${primaryColor}15, transparent 70%)`,
            top: -100,
            right: -100,
            transform: `translate(${Math.sin(frame / 60) * 20}px, ${Math.cos(frame / 60) * 20}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${secondaryColor}10, transparent 70%)`,
            bottom: -50,
            left: -50,
            transform: `translate(${Math.cos(frame / 80) * 15}px, ${Math.sin(frame / 80) * 15}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (style === "mesh") {
    return (
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(at 20% 30%, ${primaryColor}30 0%, transparent 50%),
            radial-gradient(at 80% 70%, ${secondaryColor}25 0%, transparent 50%),
            radial-gradient(at 50% 50%, ${primaryColor}10 0%, transparent 80%),
            #0a0a0f
          `,
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${primaryColor}, ${secondaryColor}, #0a0a0f)`,
      }}
    />
  );
};
