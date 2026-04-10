import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface UXHighlightProps {
  /** Percentage 0-100 from the left edge */
  x: number;
  /** Percentage 0-100 from the top edge */
  y: number;
  label: string;
  primaryColor: string;
  fontFamily?: string;
}

/**
 * UX dashboard highlight — animated ring centered at (x%, y%) over the
 * underlying Veo footage, with a label callout. Reuses the callout pulse
 * pattern from UIDemo.
 *
 * Use this when the Veo footage shows a dashboard, app UI, or any specific
 * spot you want to draw attention to.
 */
export const UXHighlight: React.FC<UXHighlightProps> = ({
  x,
  y,
  label,
  primaryColor,
  fontFamily = "Inter, system-ui, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Pulsing ring
  const pulseScale = 1 + Math.sin(frame * 0.2) * 0.15;
  const pulseOpacity = 0.5 + Math.sin(frame * 0.2) * 0.3;

  return (
    <>
      {/* Ring marker */}
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
          width: 80,
          height: 80,
          borderRadius: 999,
          border: `4px solid ${primaryColor}`,
          background: `${primaryColor}20`,
          boxShadow: `0 0 30px ${primaryColor}80`,
          opacity: progress,
        }}
      />
      {/* Pulsing outer ring */}
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) scale(${pulseScale})`,
          width: 80,
          height: 80,
          borderRadius: 999,
          border: `2px solid ${primaryColor}`,
          opacity: pulseOpacity * progress,
        }}
      />
      {/* Label */}
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `calc(${y}% + 60px)`,
          transform: `translate(-50%, 0) translateY(${interpolate(progress, [0, 1], [10, 0])}px)`,
          opacity: progress,
          background: primaryColor,
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          fontFamily,
          fontSize: 16,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: `0 6px 20px ${primaryColor}60`,
        }}
      >
        {label}
      </div>
    </>
  );
};
