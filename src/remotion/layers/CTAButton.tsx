import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Position } from "@/lib/types";

interface CTAButtonProps {
  label: string;
  primaryColor: string;
  fontFamily?: string;
  position?: Position;
}

const POSITION_STYLES: Record<Position, React.CSSProperties> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-center": { top: 80, left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: 260, left: "50%", transform: "translateX(-50%)" },
  "top-left": { top: 80, left: 80 },
  "top-right": { top: 80, right: 80 },
  "bottom-left": { bottom: 260, left: 80 },
  "bottom-right": { bottom: 260, right: 80 },
};

/**
 * Premium CTA button with glow pulse, glassmorphism ring, and spring entrance.
 * Designed to draw the eye without overwhelming the Veo footage.
 */
export const CTAButton: React.FC<CTAButtonProps> = ({
  label,
  primaryColor,
  fontFamily = "Inter, system-ui, sans-serif",
  position = "bottom-center",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Delayed entrance — comes in after 0.5s
  const entryFrame = frame - 15;
  const entryProgress = spring({
    frame: Math.max(0, entryFrame),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Breathing glow pulse
  const glowScale = 1 + Math.sin(frame * 0.12) * 0.04;
  const glowOpacity = 0.5 + Math.sin(frame * 0.12) * 0.2;

  if (entryFrame < 0) return null;

  const basePos = POSITION_STYLES[position];
  const fontSize = Math.round(width * 0.018);
  const scale = interpolate(entryProgress, [0, 1], [0.6, 1]);

  return (
    <div
      style={{
        position: "absolute",
        ...basePos,
        transform: `${basePos.transform || ""} scale(${scale})`.trim(),
        opacity: entryProgress,
      }}
    >
      {/* Glow ring behind the button */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 20,
          background: `${primaryColor}`,
          opacity: glowOpacity * 0.3,
          filter: "blur(20px)",
          transform: `scale(${glowScale})`,
        }}
      />
      {/* Outer glass ring */}
      <div
        style={{
          position: "relative",
          padding: "3px",
          borderRadius: 16,
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80, ${primaryColor})`,
        }}
      >
        {/* Inner button */}
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            backdropFilter: "blur(10px)",
            padding: `${fontSize * 1.0}px ${fontSize * 2.8}px`,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: fontSize * 0.5,
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: fontSize * 1.1,
              fontWeight: 800,
              fontFamily,
              letterSpacing: 0.5,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            {label}
          </span>
          {/* Arrow icon */}
          <svg
            width={fontSize * 0.9}
            height={fontSize * 0.9}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
