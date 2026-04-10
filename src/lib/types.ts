// =============================================================================
// VideoForge AI — Type definitions
// =============================================================================
// Architecture: every scene = one ~8s Veo3 clip (base layer) + closed captions
// (always) + ElevenLabs voiceover (audio) + optional Remotion overlay graphics
// (CTA buttons, bullets, trust badges, fine text, UX dashboard highlights).
// =============================================================================

export type VideoDuration = "16s" | "24s" | "32s" | "40s" | "48s" | "1:04" | "1:36";
export type AspectRatio = "16:9" | "9:16" | "1:1";
export type Tone = "energetic" | "calm" | "professional" | "playful" | "dramatic" | "inspirational";
export type Platform = "tiktok" | "instagram-reels" | "youtube-shorts" | "youtube" | "linkedin" | "facebook";

// Veo3 hard cap: each clip is ~8 seconds. All scenes must be exactly this long.
export const SCENE_DURATION_MS = 8000;

export interface BrandKit {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface Brief {
  prompt: string;
  platform?: Platform;
  duration?: VideoDuration;
  aspectRatio?: AspectRatio;
  tone?: Tone;
  brandKit: BrandKit;
  /**
   * User-provided facts (real metrics, customer names, real claims).
   * The /api/generate system prompt forbids Claude from fabricating any
   * numerical claim that isn't grounded in this field or the scraped page.
   */
  facts?: string;
}

// =============================================================================
// Overlay elements — Remotion graphics layered on top of the Veo footage
// =============================================================================

export type Position = "center" | "top-center" | "bottom-center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface CTAButtonOverlay {
  type: "cta-button";
  label: string;
  position?: Position;
}

export interface BulletListOverlay {
  type: "bullet-list";
  bullets: string[];
  position?: Position;
}

export interface TrustBadgeOverlay {
  type: "trust-badge";
  label: string;
  subLabel?: string;
  position?: Position;
}

export interface FineTextOverlay {
  type: "fine-text";
  text: string;
  position?: Position;
}

export interface UXHighlightOverlay {
  type: "ux-highlight";
  /** Percentage 0-100 — where on screen the highlight ring centers */
  x: number;
  y: number;
  label: string;
}

export type OverlayElement =
  | CTAButtonOverlay
  | BulletListOverlay
  | TrustBadgeOverlay
  | FineTextOverlay
  | UXHighlightOverlay;

// =============================================================================
// Scene — one ~8s segment of the final video
// =============================================================================

export interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;

  /** Required. Veo3 prompt for the base footage layer of this scene. */
  veoPrompt: string;

  /** Required. Closed-caption text shown over this scene (slice of the narration). */
  captionText: string;

  /** Optional Remotion overlay graphics composited on top of the Veo footage. */
  overlays: OverlayElement[];

  /** URL of the Veo-generated MP4. Populated by generate-assets.ts. */
  videoUrl?: string;

  /** Optional first-frame image URL for Veo3 image-to-video conditioning (frame continuity). */
  firstFrameImageUrl?: string;

  /** Optional last-frame image URL extracted after Veo generation, used as
   *  firstFrameImageUrl for the next scene. */
  lastFrameImageUrl?: string;

  /** Always exactly SCENE_DURATION_MS (8000ms). Carried for compatibility with Remotion's per-sequence duration. */
  durationMs: number;

  status: "pending" | "generating" | "ready" | "error";
}

// =============================================================================
// Voiceover, Music, Storyboard
// =============================================================================

export interface Voiceover {
  script: string;
  voiceId: string;
  voiceName: string;
  audioUrl?: string;
  durationMs?: number;
  status: "pending" | "generating" | "ready" | "error";
}

export interface MusicTrack {
  prompt: string;
  genre: string;
  mood: string;
  audioUrl?: string;
  durationMs?: number;
  status: "pending" | "generating" | "ready" | "error";
}

export interface Storyboard {
  id: string;
  brief: Brief;
  scenes: Scene[];
  voiceover: Voiceover;
  music: MusicTrack;
  /**
   * Visual consistency description, generated once per storyboard.
   * Prepended verbatim to every scene's Veo prompt so the presenter,
   * environment, lighting, and color palette stay consistent across clips.
   */
  characterSheet: string;
  totalDurationMs: number;
  status: "draft" | "generating" | "ready" | "rendering" | "complete";
  createdAt: string;
}

// A concept is one creative direction the agent proposes
export interface VideoConcept {
  id: string;
  title: string;
  framework: string;
  frameworkName: string;
  whyThisWorks: string;
  hookStrategy: string;
  platform: Platform;
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  tone: Tone;
  storyboard: Storyboard;
}

// =============================================================================
// Duration → scene count (locked to 8s multiples)
// =============================================================================

export const DURATION_MS: Record<VideoDuration, number> = {
  "16s": 16000,
  "24s": 24000,
  "32s": 32000,
  "40s": 40000,
  "48s": 48000,
  "1:04": 64000,
  "1:36": 96000,
};

export const DURATION_SCENE_COUNT: Record<VideoDuration, number> = {
  "16s": 2,
  "24s": 3,
  "32s": 4,
  "40s": 5,
  "48s": 6,
  "1:04": 8,
  "1:36": 12,
};
