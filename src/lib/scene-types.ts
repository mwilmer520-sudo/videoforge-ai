// ============================================================
// B2B SaaS Video Scene Types
// Each scene is a LAYERED composition, not a single clip.
// ============================================================

export type SceneType =
  | "presenter"          // Talking head / AI avatar with optional background
  | "ui-demo"            // App UI/UX showcase with callouts
  | "presenter-ui"       // Split: presenter on one side, UI on other
  | "motion-graphic"     // Full-screen animated text/data/graphics
  | "ui-transition"      // Animated transition between UI screens
  | "social-proof"       // Metrics, logos, testimonials with animation
  | "hero-shot"          // VEO cinematic clip (product hero moment)
  | "cta"                // Call-to-action with animated elements
  | "logo-intro";        // Brand intro/outro with animation

export interface Layer {
  type: "presenter" | "ui-screenshot" | "video-clip" | "text" | "shape" | "logo" | "metric" | "background";
  position: "full" | "left" | "right" | "center" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  zIndex: number;
}

export interface PresenterLayer extends Layer {
  type: "presenter";
  avatarStyle: "professional" | "casual" | "friendly";
  gender: "male" | "female" | "neutral";
  speakingScript: string;  // What the presenter says in this scene
}

export interface UIScreenshotLayer extends Layer {
  type: "ui-screenshot";
  screenshotUrl?: string;
  mockupStyle: "browser" | "desktop-app" | "mobile" | "tablet" | "floating";
  highlightAreas?: { x: number; y: number; w: number; h: number; label?: string }[];
  animationIn: "fade" | "slide-up" | "slide-left" | "zoom-in" | "float-in";
}

export interface TextLayer extends Layer {
  type: "text";
  content: string;
  style: "headline" | "subheadline" | "body" | "metric-large" | "caption" | "label";
  animationIn: "fade" | "typewriter" | "slide-up" | "count-up" | "pop";
  color?: string;
}

export interface MetricLayer extends Layer {
  type: "metric";
  value: string;        // e.g. "3x", "47%", "$2.1M"
  label: string;        // e.g. "faster deployment"
  animationIn: "count-up" | "pop" | "slide-up";
}

export interface ShapeLayer extends Layer {
  type: "shape";
  shape: "gradient-bg" | "blur-circle" | "line" | "arrow" | "highlight-box";
  color?: string;
}

export type AnyLayer = PresenterLayer | UIScreenshotLayer | TextLayer | MetricLayer | ShapeLayer | Layer;

// Scene layout presets for B2B SaaS
export const SCENE_LAYOUTS = {
  "presenter-full": {
    name: "Presenter Full Screen",
    description: "Presenter/avatar speaking directly to camera",
    layers: ["background", "presenter", "text"],
    aspectBest: "16:9",
  },
  "presenter-left-ui-right": {
    name: "Presenter + UI Demo",
    description: "Presenter on left 1/3, app UI on right 2/3 with callouts",
    layers: ["background", "presenter", "ui-screenshot", "text"],
    aspectBest: "16:9",
  },
  "ui-full-with-callouts": {
    name: "Full UI Demo",
    description: "App screenshot/recording fills screen with animated callouts and highlights",
    layers: ["background", "ui-screenshot", "text", "shape"],
    aspectBest: "16:9",
  },
  "ui-transition-flow": {
    name: "UI Flow Transition",
    description: "Animated transition from one app screen to another (zoom, slide, morph)",
    layers: ["background", "ui-screenshot", "ui-screenshot", "text"],
    aspectBest: "16:9",
  },
  "metrics-grid": {
    name: "Metrics / Social Proof",
    description: "Animated metrics counting up, customer logos, or testimonial quotes",
    layers: ["background", "metric", "metric", "metric", "text"],
    aspectBest: "16:9",
  },
  "hero-cinematic": {
    name: "Hero Cinematic",
    description: "Full VEO-generated cinematic clip for emotional impact moments",
    layers: ["video-clip", "text"],
    aspectBest: "16:9",
  },
  "text-centered": {
    name: "Bold Statement",
    description: "Large animated text on gradient background — for hooks, stats, or CTAs",
    layers: ["background", "text"],
    aspectBest: "any",
  },
  "cta-screen": {
    name: "CTA Screen",
    description: "Call-to-action with logo, URL, and animated button/arrow",
    layers: ["background", "logo", "text", "shape"],
    aspectBest: "any",
  },
} as const;

export type SceneLayout = keyof typeof SCENE_LAYOUTS;
