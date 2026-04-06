import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { UICallout } from "@/lib/types";

interface UIDemoProps {
  screenshotUrl?: string;
  mockupStyle: "browser" | "desktop-app" | "mobile" | "tablet" | "floating";
  callouts?: UICallout[];
  animationIn: "fade" | "slide-up" | "slide-left" | "zoom-in" | "float-in";
  position: "full" | "right" | "left" | "center";
  primaryColor: string;
}

export const UIDemo: React.FC<UIDemoProps> = ({
  screenshotUrl,
  mockupStyle,
  callouts,
  animationIn,
  position,
  primaryColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const progress = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });

  const animStyles: Record<string, React.CSSProperties> = {
    fade: { opacity: progress },
    "slide-up": {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`,
    },
    "slide-left": {
      opacity: progress,
      transform: `translateX(${interpolate(progress, [0, 1], [80, 0])}px)`,
    },
    "zoom-in": {
      opacity: progress,
      transform: `scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
    },
    "float-in": {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px) scale(${interpolate(progress, [0, 1], [0.95, 1])})`,
    },
  };

  // Position styles
  const posStyles: Record<string, React.CSSProperties> = {
    full: { inset: 40 },
    right: { top: 40, right: 40, bottom: 40, width: "60%" },
    left: { top: 40, left: 40, bottom: 40, width: "60%" },
    center: { top: 60, left: "15%", right: "15%", bottom: 60 },
  };

  // Browser chrome mockup
  const renderMockup = (children: React.ReactNode) => {
    if (mockupStyle === "browser") {
      return (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Browser bar */}
          <div
            style={{
              height: 36,
              background: "#1e1e2e",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <div
              style={{
                flex: 1,
                height: 22,
                borderRadius: 6,
                background: "#2a2a3e",
                marginLeft: 8,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
              }}
            >
              <span style={{ fontSize: 10, color: "#666" }}>app.example.com/dashboard</span>
            </div>
          </div>
          <div style={{ flex: 1, background: "#fafafa", overflow: "hidden" }}>
            {children}
          </div>
        </div>
      );
    }

    if (mockupStyle === "mobile") {
      return (
        <div
          style={{
            width: 280,
            height: "100%",
            maxHeight: 560,
            borderRadius: 32,
            overflow: "hidden",
            border: "4px solid #2a2a3e",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          height: "100%",
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        ...posStyles[position],
        ...animStyles[animationIn],
      }}
    >
      {renderMockup(
        screenshotUrl ? (
          <Img src={screenshotUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          /* Placeholder UI mockup */
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(180deg, #f8f9fa, #e9ecef)",
              display: "flex",
              flexDirection: "column",
              padding: 20,
            }}
          >
            {/* Fake sidebar */}
            <div style={{ display: "flex", flex: 1, gap: 12 }}>
              <div style={{ width: 50, background: "#dee2e6", borderRadius: 8 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ height: 32, background: "#dee2e6", borderRadius: 6, width: "40%" }} />
                <div style={{ flex: 1, background: "#fff", borderRadius: 8, border: "1px solid #e9ecef" }}>
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ height: 12, background: "#e9ecef", borderRadius: 4, width: "80%" }} />
                    <div style={{ height: 12, background: "#e9ecef", borderRadius: 4, width: "60%" }} />
                    <div style={{ height: 40, background: `${primaryColor}20`, borderRadius: 6, marginTop: 8, border: `1px solid ${primaryColor}40` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Callout annotations */}
      {callouts?.map((callout, i) => {
        const calloutProgress = spring({
          frame: frame - 15 - i * 8,
          fps,
          config: { damping: 12, stiffness: 100 },
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${callout.x}%`,
              top: `${callout.y}%`,
              transform: `scale(${calloutProgress}) translate(-50%, -50%)`,
              opacity: calloutProgress,
            }}
          >
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `2px solid ${primaryColor}`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                animation: "pulse 2s infinite",
              }}
            />
            {/* Label */}
            {callout.label && (
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: primaryColor,
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {callout.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
