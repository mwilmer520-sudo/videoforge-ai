import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Position } from "@/lib/types";

interface BulletListProps {
  bullets: string[];
  primaryColor: string;
  fontFamily?: string;
  position?: Position;
}

const CONTAINER_POS: Record<Position, React.CSSProperties> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "top-center": { top: 80, left: "50%", transform: "translateX(-50%)" },
  "bottom-center": { bottom: 240, left: "50%", transform: "translateX(-50%)" },
  "top-left": { top: 80, left: 80 },
  "top-right": { top: 80, right: 80 },
  "bottom-left": { bottom: 240, left: 80 },
  "bottom-right": { bottom: 240, right: 80 },
};

/**
 * Premium bullet list with glassmorphism backdrop, checkmark icons,
 * and staggered spring-based entrance for each item.
 */
export const BulletList: React.FC<BulletListProps> = ({
  bullets,
  primaryColor,
  fontFamily = "Inter, system-ui, sans-serif",
  position = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const fontSize = Math.round(width * 0.02);

  if (!bullets || bullets.length === 0) return null;

  // Container entrance
  const containerProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 70 },
  });

  return (
    <div
      style={{
        position: "absolute",
        ...CONTAINER_POS[position],
        display: "flex",
        flexDirection: "column",
        gap: fontSize * 0.7,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: `${fontSize * 1.2}px ${fontSize * 1.6}px`,
        borderRadius: fontSize * 0.8,
        maxWidth: "65%",
        opacity: containerProgress,
        transform: `${CONTAINER_POS[position].transform || ""} translateY(${interpolate(containerProgress, [0, 1], [20, 0])}px)`.trim(),
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
      }}
    >
      {bullets.map((bullet, i) => {
        const delay = 8 + i * 8;
        const progress = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        if (frame < delay) return <div key={i} style={{ opacity: 0, height: fontSize * 2 }} />;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: fontSize * 0.7,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [-16, 0])}px)`,
            }}
          >
            {/* Checkmark icon */}
            <div
              style={{
                width: fontSize * 1.3,
                height: fontSize * 1.3,
                borderRadius: fontSize * 0.35,
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 4px 14px ${primaryColor}40`,
              }}
            >
              <svg
                width={fontSize * 0.65}
                height={fontSize * 0.65}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span
              style={{
                fontFamily,
                fontSize: fontSize * 0.95,
                fontWeight: 600,
                color: "white",
                textShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
                lineHeight: 1.3,
              }}
            >
              {bullet}
            </span>
          </div>
        );
      })}
    </div>
  );
};
