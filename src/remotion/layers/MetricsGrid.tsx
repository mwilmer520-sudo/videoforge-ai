import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SceneMetric } from "@/lib/types";

interface MetricsGridProps {
  metrics: SceneMetric[];
  primaryColor: string;
  fontFamily?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  primaryColor,
  fontFamily = "Inter, system-ui, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: 80,
      }}
    >
      {metrics.map((metric, i) => {
        const delay = i * 10;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 100 },
        });

        if (frame - delay < 0) return <div key={i} style={{ flex: 1 }} />;

        // Count up numeric values
        const numMatch = metric.value.match(/([\d,.]+)/);
        let displayValue = metric.value;
        if (numMatch) {
          const target = parseFloat(numMatch[1].replace(/,/g, ""));
          const current = interpolate(progress, [0, 1], [0, target]);
          displayValue = metric.value.replace(
            numMatch[1],
            Number.isInteger(target)
              ? Math.round(current).toLocaleString()
              : current.toFixed(1)
          );
        }

        return (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: primaryColor,
                fontFamily,
                lineHeight: 1,
              }}
            >
              {displayValue}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                fontFamily,
                marginTop: 12,
              }}
            >
              {metric.label}
            </div>
            {/* Underline accent */}
            <div
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                background: primaryColor,
                margin: "12px auto 0",
                opacity: 0.5,
                transform: `scaleX(${progress})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
