export type VideoDuration = "15s" | "30s" | "45s" | "1:30";
export type AspectRatio = "16:9" | "9:16" | "1:1";
export type Tone = "energetic" | "calm" | "professional" | "playful" | "dramatic" | "inspirational";
export type Platform = "tiktok" | "instagram-reels" | "youtube-shorts" | "youtube" | "linkedin" | "facebook";

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
}

// A concept is one creative direction the agent proposes
export interface VideoConcept {
  id: string;
  title: string;
  framework: string;        // e.g. "hook-problem-solution"
  frameworkName: string;     // human label
  whyThisWorks: string;     // agent explains its reasoning
  hookStrategy: string;     // which hook technique
  platform: Platform;
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  tone: Tone;
  storyboard: Storyboard;
}

export type SceneLayout =
  | "presenter-full"
  | "presenter-left-ui-right"
  | "ui-full-with-callouts"
  | "ui-transition-flow"
  | "metrics-grid"
  | "hero-cinematic"
  | "text-centered"
  | "cta-screen";

export interface UICallout {
  x: number;       // percentage 0-100
  y: number;
  label: string;
}

export interface SceneMetric {
  value: string;    // e.g. "3x", "47%", "$2.1M"
  label: string;    // e.g. "faster deployment"
}

export interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;
  layout: SceneLayout;

  // Presenter layer
  presenterScript?: string;        // What the presenter says in this scene
  presenterPosition?: "left" | "right" | "center";

  // UI/UX layer
  uiScreenshotUrl?: string;        // Uploaded or generated screenshot
  uiMockupStyle?: "browser" | "desktop-app" | "mobile" | "tablet" | "floating";
  uiCallouts?: UICallout[];
  uiAnimationIn?: "fade" | "slide-up" | "slide-left" | "zoom-in" | "float-in";

  // Motion graphics layer
  headline?: string;
  subheadline?: string;
  metrics?: SceneMetric[];
  textAnimation?: "fade" | "typewriter" | "slide-up" | "count-up" | "pop";

  // VEO cinematic layer (for hero shots)
  veoPrompt?: string;
  videoUrl?: string;
  thumbnailUrl?: string;

  // Text overlay (on top of everything)
  textOverlay?: string;

  durationMs: number;
  status: "pending" | "generating" | "ready" | "error";
}

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
  totalDurationMs: number;
  status: "draft" | "generating" | "ready" | "rendering" | "complete";
  createdAt: string;
}

export const DURATION_MS: Record<VideoDuration, number> = {
  "15s": 15000,
  "30s": 30000,
  "45s": 45000,
  "1:30": 90000,
};

export const DURATION_SCENE_COUNT: Record<VideoDuration, { min: number; max: number }> = {
  "15s": { min: 2, max: 3 },
  "30s": { min: 4, max: 5 },
  "45s": { min: 6, max: 7 },
  "1:30": { min: 10, max: 12 },
};
