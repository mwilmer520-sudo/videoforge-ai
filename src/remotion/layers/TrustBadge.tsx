import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Position } from "@/lib/types";

interface TrustBadgeProps {
  label: string;
  subLabel?: string;
  primaryColor: string;
  fontFamily?: string;
  position?: Position;
}

const POSITION_STYLES: Record<Position, React.CSSProperties> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-center": { top: 50, left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: 200, left: "50%", transform: "translateX(-50%)" },
  "top-left": { top: 50, left: 50 },
  "top-right": { top: 50, right: 50 },
  "bottom-left": { bottom: 200, left: 50 },
  "bottom-right": { bottom: 200, right: 50 },
};

/**
 * Premium trust badge — frosted glass pill with verified checkmark,
 * subtle border gradient, and gentle float animation. Communicates
 * credibility without dominating the scene.
 */
export const TrustBadge: React.FC<TrustBadgeProps> = ({
  label,
  subLabel,
  primaryColor,
  fontFamily = "Inter, system-ui, sans-serif",
  position = "top-right",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const fontSize = Math.round(width * 0.012);

  // Spring entrance
  const progress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Gentle floating motion
  const floatY = Math.sin(frame * 0.08) * 3;

  // Shimmer across the badge
  const shimmerX = interpolate(frame % 120, [0, 120], [-100, 200]);

  const baseStyle = POSITION_STYLES[position];
  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        position: "absolute",
        ...baseStyle,
        transform: `${baseStyle.transform || ""} scale(${scale}) translateY(${floatY}px)`.trim(),
        opacity: progress,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 999,
          background: `${primaryColor}20`,
          filter: "blur(12px)",
        }}
      />
      {/* Badge container */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: fontSize * 0.8,
          padding: `${fontSize * 0.75}px ${fontSize * 1.4}px`,
          borderRadius: 999,
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          overflow: "hidden",
        }}
      >
        {/* Shimmer effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: shimmerX,
            width: 60,
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
        {/* Verified icon */}
        <div
          style={{
            width: fontSize * 1.8,
            height: fontSize * 1.8,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 4px 12px ${primaryColor}50`,
          }}
        >
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
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, position: "relative" }}>
          <span
            style={{
              fontFamily,
              fontSize: fontSize * 1.05,
              fontWeight: 700,
              color: "white",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          {subLabel && (
            <span
              style={{
                fontFamily,
                fontSize: fontSize * 0.75,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.65)",
                marginTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              {subLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
