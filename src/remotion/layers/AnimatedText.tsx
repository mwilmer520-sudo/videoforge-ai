import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface AnimatedTextProps {
  text: string;
  style: "headline" | "subheadline" | "body" | "metric-large" | "caption" | "label";
  animation: "fade" | "typewriter" | "slide-up" | "count-up" | "pop";
  position: "center" | "top-center" | "bottom-center" | "left" | "right";
  color?: string;
  delay?: number;
  fontFamily?: string;
}

const STYLE_CONFIG = {
  headline: { fontSize: 64, fontWeight: 800, lineHeight: 1.1 },
  subheadline: { fontSize: 32, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 22, fontWeight: 400, lineHeight: 1.5 },
  "metric-large": { fontSize: 96, fontWeight: 900, lineHeight: 1 },
  caption: { fontSize: 16, fontWeight: 500, lineHeight: 1.4 },
  label: { fontSize: 14, fontWeight: 600, lineHeight: 1, letterSpacing: 2, textTransform: "uppercase" as const },
};

const POS_STYLES: Record<string, React.CSSProperties> = {
  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 60,
  },
  "top-center": {
    position: "absolute",
    top: 60,
    left: 60,
    right: 60,
    textAlign: "center",
  },
  "bottom-center": {
    position: "absolute",
    bottom: 80,
    left: 60,
    right: 60,
    textAlign: "center",
  },
  left: {
    position: "absolute",
    top: "50%",
    left: 60,
    maxWidth: "45%",
    transform: "translateY(-50%)",
  },
  right: {
    position: "absolute",
    top: "50%",
    right: 60,
    maxWidth: "45%",
    transform: "translateY(-50%)",
    textAlign: "right",
  },
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  style,
  animation,
  position,
  color = "white",
  delay = 0,
  fontFamily = "Inter, system-ui, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  const styleConfig = STYLE_CONFIG[style];
  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  if (adjustedFrame < 0) return null;

  // Typewriter: reveal characters one by one
  if (animation === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(adjustedFrame, [0, text.length * 1.5], [0, text.length], {
        extrapolateRight: "clamp",
      })
    );
    return (
      <div style={POS_STYLES[position]}>
        <span
          style={{
            ...styleConfig,
            color,
            fontFamily,
          }}
        >
          {text.slice(0, charsToShow)}
          <span
            style={{
              borderRight: `3px solid ${color}`,
              marginLeft: 2,
              opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            }}
          />
        </span>
      </div>
    );
  }

  // Count-up for numbers
  if (animation === "count-up") {
    const numMatch = text.match(/([\d,.]+)/);
    if (numMatch) {
      const targetNum = parseFloat(numMatch[1].replace(/,/g, ""));
      const currentNum = interpolate(progress, [0, 1], [0, targetNum]);
      const formatted = text.replace(
        numMatch[1],
        Number.isInteger(targetNum)
          ? Math.round(currentNum).toLocaleString()
          : currentNum.toFixed(1)
      );
      return (
        <div style={POS_STYLES[position]}>
          <span
            style={{
              ...styleConfig,
              color,
              fontFamily,
              opacity: progress,
              transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
              display: "inline-block",
            }}
          >
            {formatted}
          </span>
        </div>
      );
    }
  }

  // Standard animations
  const animStyles: Record<string, React.CSSProperties> = {
    fade: { opacity: progress },
    "slide-up": {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
    },
    pop: {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
    },
    "count-up": { opacity: progress }, // fallback
  };

  return (
    <div style={POS_STYLES[position]}>
      <span
        style={{
          ...styleConfig,
          color,
          fontFamily,
          ...animStyles[animation],
          display: "inline-block",
        }}
      >
        {text}
      </span>
    </div>
  );
};
