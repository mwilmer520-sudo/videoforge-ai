import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface PresenterProps {
  position: "left" | "right" | "center";
  avatarStyle: "professional" | "casual" | "friendly";
  speakingScript?: string;
  primaryColor: string;
}

export const Presenter: React.FC<PresenterProps> = ({
  position,
  avatarStyle,
  speakingScript,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });

  // Position mapping
  const posStyles: Record<string, React.CSSProperties> = {
    left: {
      left: 40,
      bottom: 40,
      width: "30%",
      transform: `translateX(${interpolate(slideIn, [0, 1], [-60, 0])}px)`,
    },
    right: {
      right: 40,
      bottom: 40,
      width: "30%",
      transform: `translateX(${interpolate(slideIn, [0, 1], [60, 0])}px)`,
    },
    center: {
      left: "25%",
      right: "25%",
      bottom: 40,
      transform: `translateY(${interpolate(slideIn, [0, 1], [40, 0])}px)`,
    },
  };

  // Subtle speaking animation (mouth indicator)
  const speakingPulse = Math.sin(frame * 0.5) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: "absolute",
        ...posStyles[position],
        opacity: slideIn,
        zIndex: 10,
      }}
    >
      <div
        style={{
          aspectRatio: "3/4",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        {/* Placeholder avatar — will be replaced with HeyGen/D-ID video */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(180deg, ${primaryColor}40, #1a1a2e)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Head */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #e8d5b7, #c4a882)`,
              marginBottom: 8,
            }}
          />
          {/* Body */}
          <div
            style={{
              width: 120,
              height: 60,
              borderRadius: "60px 60px 0 0",
              background:
                avatarStyle === "professional"
                  ? "#2a2a3e"
                  : avatarStyle === "casual"
                  ? "#3a5a8c"
                  : "#4a6741",
            }}
          />
          {/* Speaking indicator */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 3,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: interpolate(
                    Math.sin(frame * 0.3 + i * 1.2),
                    [-1, 1],
                    [4, 16]
                  ),
                  borderRadius: 2,
                  background: primaryColor,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>

        {/* Name label */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            padding: "20px 12px 10px",
          }}
        >
          <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>
            {avatarStyle === "professional"
              ? "AI Presenter"
              : avatarStyle === "casual"
              ? "Product Expert"
              : "Your Guide"}
          </span>
        </div>
      </div>
    </div>
  );
};
