import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { Position } from "@/lib/types";

interface FineTextProps {
  text: string;
  fontFamily?: string;
  position?: Position;
}

const POSITION_STYLES: Record<Position, React.CSSProperties> = {
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" },
  "top-center": { top: 30, left: 60, right: 60, textAlign: "center" },
  "bottom-center": { bottom: 30, left: 60, right: 60, textAlign: "center" },
  "top-left": { top: 30, left: 60, textAlign: "left" },
  "top-right": { top: 30, right: 60, textAlign: "right" },
  "bottom-left": { bottom: 30, left: 60, textAlign: "left" },
  "bottom-right": { bottom: 30, right: 60, textAlign: "right" },
};

/**
 * Fine text overlay — small, low-opacity disclaimer or asterisk text.
 * Use for legal disclaimers, "results may vary", source citations.
 */
export const FineText: React.FC<FineTextProps> = ({
  text,
  fontFamily = "Inter, system-ui, sans-serif",
  position = "bottom-center",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 0.7], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        ...POSITION_STYLES[position],
        opacity,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 400,
          color: "white",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
          letterSpacing: 0.2,
        }}
      >
        {text}
      </span>
    </div>
  );
};
