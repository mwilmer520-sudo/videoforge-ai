import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface CaptionsProps {
  text: string;
  fontFamily?: string;
}

/**
 * Professional closed-caption overlay with animated word-by-word reveal.
 * Styled like TikTok/Instagram captions: bold, readable over any footage,
 * with a tight pill backdrop and staggered word appearance.
 */
export const Captions: React.FC<CaptionsProps> = ({
  text,
  fontFamily = "Inter, system-ui, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  if (!text || !text.trim()) return null;

  const words = text.trim().split(/\s+/);
  const totalWords = words.length;

  // Calculate how many frames to spend revealing each word.
  // Leave the last 20% of the scene with all words visible.
  const revealWindow = Math.floor(durationInFrames * 0.75);
  const framesPerWord = Math.max(1, Math.floor(revealWindow / totalWords));

  // Font size scales with viewport width for readability on all aspect ratios
  const fontSize = Math.round(width * 0.032);
  const isVertical = width < 1200; // 9:16

  // Group words into lines of ~4-6 words for readability
  const wordsPerLine = isVertical ? 3 : 5;
  const lines: string[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine));
  }

  // Only show 2 lines at a time (like real captions)
  const currentWordIndex = Math.min(
    Math.floor(frame / framesPerWord),
    totalWords - 1
  );
  const currentLineIndex = Math.floor(currentWordIndex / wordsPerLine);
  const visibleLines = lines.slice(
    Math.max(0, currentLineIndex - 1),
    currentLineIndex + 1
  );
  const visibleStartWord = Math.max(0, currentLineIndex - 1) * wordsPerLine;

  // Fade out at the very end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: isVertical ? "14%" : "8%",
        left: "5%",
        right: "5%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity: fadeOut,
        pointerEvents: "none",
      }}
    >
      {visibleLines.map((lineWords, lineIdx) => {
        const lineStartIdx = visibleStartWord + lineIdx * wordsPerLine;
        return (
          <div
            key={lineStartIdx}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: fontSize * 0.25,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(12px)",
              padding: `${fontSize * 0.25}px ${fontSize * 0.5}px`,
              borderRadius: fontSize * 0.35,
            }}
          >
            {lineWords.map((word, wordIdx) => {
              const globalIdx = lineStartIdx + wordIdx;
              const wordStartFrame = globalIdx * framesPerWord;
              const isRevealed = frame >= wordStartFrame;
              const isCurrentWord =
                globalIdx === currentWordIndex && frame < revealWindow;

              const wordProgress = spring({
                frame: Math.max(0, frame - wordStartFrame),
                fps,
                config: { damping: 20, stiffness: 200 },
              });

              return (
                <span
                  key={wordIdx}
                  style={{
                    fontFamily,
                    fontSize,
                    fontWeight: 800,
                    color: isCurrentWord
                      ? "#facc15" // highlighted yellow for current word
                      : isRevealed
                        ? "white"
                        : "rgba(255, 255, 255, 0.25)",
                    textShadow: isRevealed
                      ? "0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.4)"
                      : "none",
                    transform: isRevealed
                      ? `scale(${interpolate(wordProgress, [0, 1], [1.15, 1])})`
                      : "scale(1)",
                    display: "inline-block",
                    transition: "color 0.1s",
                    WebkitTextStroke: isRevealed
                      ? "0.5px rgba(0, 0, 0, 0.3)"
                      : "none",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
