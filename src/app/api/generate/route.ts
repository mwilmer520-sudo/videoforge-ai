import Anthropic from "@anthropic-ai/sdk";
import type { Brief, VideoConcept, OverlayElement, Scene } from "@/lib/types";
import { SCENE_DURATION_MS, DURATION_MS, DURATION_SCENE_COUNT } from "@/lib/types";
import {
  STORYTELLING_FRAMEWORKS,
  HOOK_TECHNIQUES,
  PLATFORM_SPECS,
  MUSIC_MOODS,
} from "@/lib/agent-knowledge";

const SYSTEM_PROMPT = `You are AgentLead — an elite creative director who builds viral B2B marketing videos using a layered AI rendering pipeline. You combine deep storytelling expertise with technical understanding of how the rendering stack works.

## THE RENDERING PIPELINE YOU MUST RESPECT

Every final video is composited from four layers, in this order from bottom to top:

1. **Veo3 footage layer** — every scene is exactly ONE 8-second Veo3 clip. Veo3's hard cap is 8s per generation. A 32s video = 4 scenes. A 48s video = 6 scenes. A 1:36 video = 12 scenes. No scene can be shorter or longer than 8000ms.
2. **ElevenLabs voiceover layer** — a single continuous narration spanning the full video.
3. **Closed captions layer** — on every frame, the slice of voiceover that plays during that scene is shown as captions.
4. **Remotion overlay layer** — *only when needed*, motion graphics composited on top of the Veo footage: CTA buttons, bullet lists, trust badges, fine text, UX dashboard highlights.

## YOUR RESPONSIBILITIES

### A. Generate a CHARACTER CONSISTENCY SHEET
Before writing any scenes, write a single \`characterSheet\` describing the visual continuity of the video — the people, environment, lighting, color palette, and camera style that should be consistent across every Veo clip. Example: *"32yo woman, warm friendly expression, dark navy blazer over white shirt, modern minimalist office with floor-to-ceiling windows, soft golden hour light from camera left, shallow depth of field, anamorphic lens flare, Apple-commercial aesthetic, 4K cinematic color grade."* This will be prepended to every scene's Veo prompt. Be specific so Veo3 can reproduce the same look across clips.

### B. Write veoPrompt for EVERY scene
Every scene needs a Veo3 prompt for the base footage. Veo3 is great at: people, environments, motion, cinematic shots, real-world scenes. Veo3 is terrible at: text, UI screens, brand logos, exact data. NEVER put text, words, numbers, UI mockups, or brand logos in a Veo prompt. The Remotion overlay layer handles all of that pixel-perfectly.

Each veoPrompt must include: camera angle/movement, subject, action, environment, lighting, style, mood, and end with "photorealistic, 4K cinematic, professional color grading." 40-80 words.

### C. Write captionText for EVERY scene
Every scene needs a captionText — the slice of the voiceover script that plays during this exact 8-second window. Together, all captionText fields concatenated MUST equal the voiceover.script verbatim. Average ~20 words per scene (8 seconds × ~2.5 words/second).

### D. Add overlays only when they elevate the scene
Overlays are typed graphics composited over the Veo footage. Use them sparingly — most scenes need zero overlays (just Veo footage + captions). Add overlays only when they materially improve the message:
- **cta-button** — for the final scene of the video (call-to-action)
- **bullet-list** — when listing 2-4 features or benefits
- **trust-badge** — for credibility (e.g., "Y Combinator-backed", "SOC 2 Compliant")
- **fine-text** — for legal disclaimers or asterisks
- **ux-highlight** — when the Veo footage shows a dashboard/UI and you want to highlight a specific spot with an animated ring

### E. ANTI-HALLUCINATION RULE — CRITICAL
You will be given a \`facts\` field by the user. **You may only state numerical claims, customer names, percentages, dollar amounts, or specific results that appear in the facts field or in the scraped page content.** If a fact is not provided, use directional language ("faster", "fewer hours", "more efficient", "leading", "trusted") instead of fabricating numbers. Fabricating metrics for a real customer is a brand-killing failure. Better to be vague than wrong.

## STORYTELLING & PLATFORM EXPERTISE

### Storytelling frameworks:
${JSON.stringify(STORYTELLING_FRAMEWORKS, null, 2)}

### Hook techniques (first 1-3 seconds — most important):
${JSON.stringify(HOOK_TECHNIQUES, null, 2)}

### Platform intelligence:
${JSON.stringify(PLATFORM_SPECS, null, 2)}

### Music direction:
${JSON.stringify(MUSIC_MOODS, null, 2)}

## YOUR JOB

Given a brief (usually a B2B SaaS product), generate EXACTLY 3 distinct video concepts. Each concept uses a different storytelling framework and hook technique. Pick the optimal duration for each concept from this list ONLY: 16s (2 scenes), 24s (3), 32s (4), 40s (5), 48s (6), 1:04 (8), 1:36 (12). Pick the optimal platform and aspect ratio.

## OUTPUT FORMAT

Respond with ONLY valid JSON, no markdown fences:

{
  "concepts": [
    {
      "title": "string (catchy concept name)",
      "framework": "string (framework key)",
      "frameworkName": "string (human label)",
      "whyThisWorks": "string (2-3 sentences citing platform behavior or audience triggers)",
      "hookStrategy": "string (which hook technique and why)",
      "platform": "tiktok|instagram-reels|youtube-shorts|youtube|linkedin|facebook",
      "duration": "16s|24s|32s|40s|48s|1:04|1:36",
      "aspectRatio": "16:9|9:16|1:1",
      "tone": "energetic|calm|professional|playful|dramatic|inspirational",
      "characterSheet": "string (visual consistency description, 40-80 words, see section A)",
      "scenes": [
        {
          "title": "string (3-6 word label for the scene)",
          "description": "string (one sentence narrative description of what happens)",
          "veoPrompt": "string (40-80 word Veo3 prompt — see section B — NO text/UI/numbers/logos)",
          "captionText": "string (the slice of narration spoken during this 8-second scene)",
          "overlays": [
            // optional, can be empty array
            // possible types: cta-button, bullet-list, trust-badge, fine-text, ux-highlight
            // examples:
            // {"type": "cta-button", "label": "Start Free Trial", "position": "bottom-center"}
            // {"type": "bullet-list", "bullets": ["24/7 coverage", "Instant dispatch"], "position": "bottom-center"}
            // {"type": "trust-badge", "label": "Y Combinator-backed", "position": "top-right"}
            // {"type": "fine-text", "text": "Results vary. Based on customer interviews.", "position": "bottom-center"}
            // {"type": "ux-highlight", "x": 70, "y": 40, "label": "Smart triage"}
          ]
        }
      ],
      "voiceover": {
        "script": "string (FULL narration — must equal concatenation of all captionText fields)",
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
- Scene count is determined by duration: 16s=2, 24s=3, 32s=4, 40s=5, 48s=6, 1:04=8, 1:36=12
- Every scene's veoPrompt must follow section B rules — NEVER include text/UI/logos/numbers in Veo prompts
- Every scene's captionText together must equal the voiceover.script verbatim
- The first scene should establish the hook visually
- The last scene should typically have a cta-button overlay
- Use overlays sparingly — most scenes need zero
- ANTI-HALLUCINATION: only use numbers/metrics/customer names that are in the facts field or scraped page content; otherwise use directional language
- characterSheet must be specific enough that Veo3 can reproduce the same visual style across all clips`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return Response.json({ error: "A brief description or URL is required" }, { status: 400 });
    }
    const brief = body as Brief;
    if (!brief.brandKit) {
      brief.brandKit = { primaryColor: "#6366f1", secondaryColor: "#8b5cf6", fontFamily: "Inter, system-ui, sans-serif" };
    }
    const client = new Anthropic();

    // Detect URLs in the prompt and scrape them for context
    const urlRegex = /https?:\/\/[^\s,)]+/g;
    const urls = brief.prompt.match(urlRegex) || [];
    let scrapedContext = "";

    if (urls.length > 0) {
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
      const scrapeResults = await Promise.allSettled(
        urls.slice(0, 3).map(async (url) => {
          const res = await fetch(`${baseUrl}/api/scrape`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          if (!res.ok) return null;
          return res.json();
        })
      );

      for (const result of scrapeResults) {
        if (result.status === "fulfilled" && result.value) {
          const data = result.value;
          scrapedContext += `\n\n--- Scraped from ${data.url} ---
Title: ${data.title || "N/A"}
Description: ${data.description || "N/A"}
Key headings: ${data.headings?.join(", ") || "N/A"}
Page content: ${data.content?.slice(0, 2000) || "N/A"}
---`;
        }
      }
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 12000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create 3 video concepts for:

"${brief.prompt}"
${scrapedContext ? `\n## SCRAPED WEBSITE CONTEXT\n${scrapedContext}\n\nGround the concepts in the actual product features, audience, and value props found on the site. Do NOT generate generic SaaS templates — every concept must specifically reference what this product actually does.` : ""}

${brief.facts ? `\n## VERIFIED FACTS (anti-hallucination)\nThe user has provided these as the ONLY numerical claims, customer names, and specific results you may use:\n\n${brief.facts}\n\nFor any other numerical claim, use directional language instead of inventing numbers.` : "\n## NO FACTS PROVIDED\nThe user did not provide a facts field. Use only directional language for any quantitative claim — never invent specific numbers, percentages, dollar amounts, or customer counts."}

${brief.platform ? `Preferred platform: ${brief.platform}` : "Pick the best platform per concept."}
${brief.duration ? `Preferred duration: ${brief.duration}` : "Pick the optimal duration from: 16s, 24s, 32s, 40s, 48s, 1:04, 1:36."}
${brief.tone ? `Preferred tone: ${brief.tone}` : "Pick the best tone per concept."}
Brand primary color: ${brief.brandKit.primaryColor}
Brand secondary color: ${brief.brandKit.secondaryColor}

Remember: 3 DISTINCT concepts, different frameworks, every scene exactly 8 seconds, every scene with veoPrompt + captionText, characterSheet for visual consistency, no fabricated metrics.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const rawJson = (jsonMatch[1] || text).trim();

    if (!rawJson) {
      console.error("No JSON found in Claude response:", text.slice(0, 500));
      return Response.json({ error: "AI response did not contain valid JSON" }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw:", rawJson.slice(0, 500));
      return Response.json({ error: "AI response contained malformed JSON" }, { status: 502 });
    }

    if (!parsed?.concepts || !Array.isArray(parsed.concepts) || parsed.concepts.length === 0) {
      return Response.json({ error: "AI response missing concepts array" }, { status: 502 });
    }

    // Build full concepts with IDs, enforcing the 8s scene constraint
    const concepts: VideoConcept[] = parsed.concepts.map((c: any) => {
      const totalMs = DURATION_MS[c.duration as keyof typeof DURATION_MS] || 32000;
      const expectedSceneCount = DURATION_SCENE_COUNT[c.duration as keyof typeof DURATION_SCENE_COUNT] || 4;
      const incomingScenes = Array.isArray(c.scenes) ? c.scenes : [];

      // Hard-enforce scene count and duration. If Claude returned fewer/more, truncate or pad.
      const scenes: Scene[] = [];
      for (let i = 0; i < expectedSceneCount; i++) {
        const s = incomingScenes[i] || {
          title: `Scene ${i + 1}`,
          description: "",
          veoPrompt: "",
          captionText: "",
          overlays: [],
        };
        scenes.push({
          id: crypto.randomUUID(),
          order: i,
          title: s.title || `Scene ${i + 1}`,
          description: s.description || "",
          veoPrompt: s.veoPrompt || "",
          captionText: s.captionText || "",
          overlays: Array.isArray(s.overlays) ? (s.overlays as OverlayElement[]) : [],
          durationMs: SCENE_DURATION_MS,
          status: "pending",
        });
      }

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
          characterSheet: c.characterSheet || "",
          scenes,
          voiceover: {
            script: c.voiceover?.script || scenes.map((s) => s.captionText).join(" "),
            voiceId: "JBFqnCBsd6RMkjVDRZzb",
            voiceName: c.voiceover?.voiceName || "Default Voice",
            status: "pending" as const,
          },
          music: {
            prompt: c.music?.prompt || "",
            genre: c.music?.genre || "",
            mood: c.music?.mood || "",
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
