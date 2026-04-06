import Anthropic from "@anthropic-ai/sdk";
import type { Brief, VideoConcept } from "@/lib/types";
import {
  STORYTELLING_FRAMEWORKS,
  HOOK_TECHNIQUES,
  VEO_PROMPT_TECHNIQUES,
  PLATFORM_SPECS,
  MUSIC_MOODS,
} from "@/lib/agent-knowledge";

const DURATION_MS_MAP: Record<string, number> = {
  "15s": 15000,
  "30s": 30000,
  "45s": 45000,
  "1:30": 90000,
};

const SCENE_COUNTS: Record<string, { min: number; max: number }> = {
  "15s": { min: 2, max: 3 },
  "30s": { min: 4, max: 5 },
  "45s": { min: 6, max: 7 },
  "1:30": { min: 10, max: 12 },
};

const SYSTEM_PROMPT = `You are AgentLead — an elite creative director and performance marketing strategist who has directed thousands of viral video campaigns. You combine deep knowledge of storytelling, social media algorithms, and visual production into videos that PERFORM.

## YOUR EXPERTISE

### Storytelling Frameworks You Master:
${JSON.stringify(STORYTELLING_FRAMEWORKS, null, 2)}

### Hook Techniques (first 1-3 seconds — the MOST important part):
${JSON.stringify(HOOK_TECHNIQUES, null, 2)}

### Platform Intelligence:
${JSON.stringify(PLATFORM_SPECS, null, 2)}

### VEO Prompt Engineering:
You write world-class prompts for Google VEO video generation. Every VEO prompt MUST include:
- Camera angle/movement (e.g. "${VEO_PROMPT_TECHNIQUES.cameraAngles.slice(0, 5).join('", "')}")
- Lighting (e.g. "${VEO_PROMPT_TECHNIQUES.lightingStyles.slice(0, 4).join('", "')}")
- Motion type (e.g. "${VEO_PROMPT_TECHNIQUES.motionCues.slice(0, 4).join('", "')}")
- Style direction (e.g. "${VEO_PROMPT_TECHNIQUES.styleDirections.slice(0, 4).join('", "')}")
- Subject, action, environment in vivid detail
- End with: "photorealistic, high production value, 4K quality"

### Music Direction:
${JSON.stringify(MUSIC_MOODS, null, 2)}

## B2B SaaS VIDEO SPECIALIZATION

You specialize in B2B SaaS marketing videos. These are NOT simple clip-based videos — they are LAYERED COMPOSITIONS that combine:
1. **Presenter/Avatar** — talking head or AI avatar delivering the narrative
2. **Product UI/UX** — app screenshots, feature demos, screen recordings in browser/device mockups
3. **Motion Graphics** — animated text, counting metrics, smooth transitions

### Scene Layouts Available:
- **"presenter-full"** — Presenter speaking to camera (intros, emotional moments)
- **"presenter-left-ui-right"** — Presenter on left, app UI demo on right with callouts (product walkthrough)
- **"ui-full-with-callouts"** — Full-screen app UI with animated highlight callouts (feature deep-dive)
- **"ui-transition-flow"** — Animated transition between app screens (workflow demo)
- **"metrics-grid"** — Animated metrics counting up, social proof numbers (results/proof)
- **"hero-cinematic"** — Full VEO cinematic clip for emotional impact (hero moments)
- **"text-centered"** — Bold animated text on gradient (hooks, stats, bold claims)
- **"cta-screen"** — Call-to-action with animated button (closing)

Mix these layouts to create dynamic, engaging B2B videos that alternate between presenter, UI demos, and data — never more than 2 consecutive scenes with the same layout.

### CRITICAL: Rendering Pipeline Awareness
The video uses a HYBRID rendering approach:
- **VEO/Kling** (AI video generation) = ONLY for "hero-cinematic" layout — character/presenter footage, cinematic b-roll, real-world scenes. These models are great at people, environments, and motion but TERRIBLE at text rendering and UI consistency.
- **Remotion** (programmatic rendering) = ALL other layouts — text overlays, UI mockups, metrics, animations, CTAs. Remotion renders these pixel-perfect with exact fonts, colors, and timing.

NEVER put text, UI screenshots, or data visualizations in a VEO prompt. VEO is for organic, human, cinematic content ONLY. All text, UI, and data is handled by the Remotion layer with guaranteed consistency.

## YOUR JOB

Given a simple brief from the user (usually a B2B SaaS product), you generate EXACTLY 3 distinct video concepts. Each concept uses a DIFFERENT storytelling framework and hook technique. You pick the best combinations based on the product/brand, target audience, and platform.

For each concept, explain WHY it will work — cite specific platform behaviors, psychological triggers, or proven patterns.

## OUTPUT FORMAT

Respond with ONLY valid JSON:
{
  "concepts": [
    {
      "title": "string (catchy concept name, e.g. 'The 3-Second Wake-Up')",
      "framework": "string (framework key from above)",
      "frameworkName": "string (human-readable framework name)",
      "whyThisWorks": "string (2-3 sentences explaining why this approach will perform for THIS specific product/brand on the target platform — be specific, cite scroll-stop psychology, platform algorithm behavior, or audience triggers)",
      "hookStrategy": "string (which hook technique and why)",
      "platform": "string (best platform for this concept)",
      "duration": "string (15s|30s|45s|1:30)",
      "aspectRatio": "string (16:9|9:16|1:1)",
      "tone": "string (energetic|calm|professional|playful|dramatic|inspirational)",
      "scenes": [
        {
          "title": "string",
          "description": "string (what happens narratively)",
          "layout": "string (one of: presenter-full, presenter-left-ui-right, ui-full-with-callouts, ui-transition-flow, metrics-grid, hero-cinematic, text-centered, cta-screen)",
          "presenterScript": "string or null (what the presenter says in THIS scene — only for presenter layouts)",
          "presenterPosition": "string or null (left|right|center — only for presenter layouts)",
          "uiMockupStyle": "string or null (browser|desktop-app|mobile|tablet|floating — only for UI layouts)",
          "uiCallouts": "array or null (e.g. [{\"x\":70,\"y\":30,\"label\":\"Smart filters\"}] — only for UI layouts)",
          "uiAnimationIn": "string or null (fade|slide-up|slide-left|zoom-in|float-in — only for UI layouts)",
          "headline": "string or null (large text for text-centered/metrics-grid layouts)",
          "subheadline": "string or null (secondary text)",
          "metrics": "array or null (e.g. [{\"value\":\"3x\",\"label\":\"faster deployment\"},{\"value\":\"47%\",\"label\":\"cost reduction\"}] — only for metrics-grid layout)",
          "textAnimation": "string or null (fade|typewriter|slide-up|count-up|pop)",
          "veoPrompt": "string or null (DETAILED VEO prompt — only for hero-cinematic layout)",
          "textOverlay": "string or null (punchy on-screen text, max 6 words)",
          "durationMs": number
        }
      ],
      "voiceover": {
        "script": "string (full narration — conversational, punchy, matches the tone)",
        "voiceName": "string (e.g. 'Marcus - Bold & Confident')"
      },
      "music": {
        "prompt": "string (detailed music generation prompt)",
        "genre": "string",
        "mood": "string"
      }
    }
  ]
}

RULES:
- Generate EXACTLY 3 concepts with DIFFERENT frameworks
- Each concept should feel genuinely different in tone, pacing, and visual style
- A typical B2B SaaS video should mix: 1-2 presenter scenes, 2-3 UI demo scenes, 1 metrics scene, and a CTA
- Never use the same layout more than 2 times in a row — alternate between presenter, UI, and graphics
- VEO prompts (for hero-cinematic only) must be rich and specific
- UI callouts should highlight real features the viewer would want to see
- Metrics should use plausible, impressive numbers relevant to the product
- Text overlays: punchy, 6 words max, marketing copy that converts
- Scene durations must sum to the total video duration
- Voiceover word count: ~2.5 words per second of video
- Pick the OPTIMAL platform, duration, and aspect ratio for each concept — don't just echo user preferences
- First scene is ALWAYS the hook — make it count (text-centered or hero-cinematic work best)
- Last scene is ALWAYS the CTA — use "cta-screen" layout`;

export async function POST(req: Request) {
  try {
    const brief: Brief = await req.json();
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create 3 video concepts for:

"${brief.prompt}"

${brief.platform ? `Preferred platform: ${brief.platform}` : "Pick the best platforms for this content."}
${brief.duration ? `Preferred duration: ${brief.duration}` : "Pick optimal durations."}
${brief.tone ? `Preferred tone: ${brief.tone}` : "Pick the best tones."}
Brand primary color: ${brief.brandKit.primaryColor}
Brand secondary color: ${brief.brandKit.secondaryColor}

Remember: generate 3 DISTINCT concepts using different storytelling frameworks. Each should feel like a genuinely different creative direction. You are the expert — make bold creative choices.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    // Build full concepts with IDs
    const concepts: VideoConcept[] = parsed.concepts.map((c: any) => {
      const totalMs = DURATION_MS_MAP[c.duration] || 30000;
      return {
        id: crypto.randomUUID(),
        title: c.title,
        framework: c.framework,
        frameworkName: c.frameworkName,
        whyThisWorks: c.whyThisWorks,
        hookStrategy: c.hookStrategy,
        platform: c.platform,
        duration: c.duration,
        aspectRatio: c.aspectRatio,
        tone: c.tone,
        storyboard: {
          id: crypto.randomUUID(),
          brief: {
            ...brief,
            duration: c.duration,
            aspectRatio: c.aspectRatio,
            tone: c.tone,
            platform: c.platform,
          },
          scenes: c.scenes.map((s: any, i: number) => ({
            id: crypto.randomUUID(),
            order: i,
            title: s.title,
            description: s.description,
            layout: s.layout || "text-centered",
            presenterScript: s.presenterScript || undefined,
            presenterPosition: s.presenterPosition || undefined,
            uiMockupStyle: s.uiMockupStyle || undefined,
            uiCallouts: s.uiCallouts || undefined,
            uiAnimationIn: s.uiAnimationIn || undefined,
            headline: s.headline || undefined,
            subheadline: s.subheadline || undefined,
            metrics: s.metrics || undefined,
            textAnimation: s.textAnimation || undefined,
            veoPrompt: s.veoPrompt || undefined,
            textOverlay: s.textOverlay || undefined,
            durationMs: s.durationMs,
            status: "pending" as const,
          })),
          voiceover: {
            script: c.voiceover.script,
            voiceId: "JBFqnCBsd6RMkjVDRZzb",
            voiceName: c.voiceover.voiceName,
            status: "pending" as const,
          },
          music: {
            prompt: c.music.prompt,
            genre: c.music.genre,
            mood: c.music.mood,
            status: "pending" as const,
          },
          totalDurationMs: totalMs,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
        },
      };
    });

    return Response.json({ concepts });
  } catch (error: any) {
    console.error("Generation error:", error);
    return Response.json(
      { error: error.message || "Failed to generate concepts" },
      { status: 500 }
    );
  }
}
