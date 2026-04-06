import Anthropic from "@anthropic-ai/sdk";
import type { Scene } from "@/lib/types";

const SYSTEM_PROMPT = `You are a VEO 3.1 prompt engineering specialist. You write world-class prompts for Google's VEO video generation model that produce cinematic, photorealistic video clips.

## VEO 3.1 PROMPT RULES

Every prompt MUST include ALL of these elements:
1. **Camera angle/movement** — be specific: "slow push-in close-up", "wide establishing shot with dolly movement", "low angle hero shot tracking left"
2. **Subject** — detailed description of who/what is on screen, their appearance, clothing, expression
3. **Action** — what the subject is doing, how they're moving
4. **Environment** — where the scene takes place, set design, background elements
5. **Lighting** — specific lighting setup: "golden hour warm sunlight streaming from left", "soft diffused studio key light with blue rim lighting"
6. **Style** — cinematic look: "shallow depth of field, anamorphic lens flare", "clean commercial aesthetic, high contrast"
7. **Mood/atmosphere** — emotional quality: "confident and aspirational", "warm and inviting"
8. **Quality tags** — always end with: "photorealistic, high production value, 4K cinematic quality, professional color grading"

## CONSISTENCY RULES

- Maintain visual consistency across scenes: same color palette, lighting style, and subject appearance
- If a person appears in multiple scenes, describe them identically each time (hair, clothing, features)
- Match the tone of the approved script — if the script is playful, the visuals should feel light; if dramatic, use more contrast and shadows
- Each prompt should be 40-80 words — detailed enough for VEO but not overwhelming

## WHAT NOT TO INCLUDE

- NEVER include text, words, numbers, or UI elements in prompts — VEO cannot render text consistently
- NEVER include brand logos or specific product UI — those are handled by Remotion
- Focus only on organic, human, environmental, and cinematic content

Respond with ONLY valid JSON.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scenes: Scene[] = body?.scenes;
    const script: string = body?.script;
    const tone: string = body?.tone;
    const brandColors = body?.brandColors;

    if (!scenes || !Array.isArray(scenes)) {
      return Response.json({ error: "scenes array is required" }, { status: 400 });
    }

    // Only generate prompts for hero-cinematic scenes
    const cinematicScenes = scenes.filter((s) => s.layout === "hero-cinematic");

    if (cinematicScenes.length === 0) {
      // No cinematic scenes — return scenes as-is
      return Response.json({ scenes });
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write optimized VEO 3.1 prompts for each hero-cinematic scene below.

## APPROVED SCRIPT
"${script || "No script provided"}"

## TONE
${tone || "professional"}

## BRAND COLORS (for reference — do NOT put text/UI in prompts)
Primary: ${brandColors?.primary || "#6366f1"}
Secondary: ${brandColors?.secondary || "#8b5cf6"}

## SCENES NEEDING VEO PROMPTS

${cinematicScenes
  .map(
    (s, i) => `Scene ${i + 1} (${s.title}):
- Description: ${s.description}
- Duration: ${s.durationMs}ms
- Current prompt: ${s.veoPrompt || "none"}
- Context: ${s.presenterScript || s.headline || s.textOverlay || "no additional context"}`
  )
  .join("\n\n")}

## ALL SCENES IN ORDER (for context — only write prompts for hero-cinematic scenes)
${scenes.map((s, i) => `${i + 1}. [${s.layout}] ${s.title}: ${s.description}`).join("\n")}

Return JSON:
{
  "prompts": [
    {
      "sceneId": "string (the scene ID)",
      "veoPrompt": "string (the optimized VEO prompt — 40-80 words, include camera, subject, action, environment, lighting, style, mood, quality tags)"
    }
  ]
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const rawJson = jsonMatch[1]?.trim();

    if (!rawJson) {
      return Response.json({ error: "AI response did not contain valid JSON" }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return Response.json({ error: "AI response contained malformed JSON" }, { status: 502 });
    }

    // Merge prompts back into scenes
    const promptMap = new Map(
      (parsed.prompts || []).map((p: any) => [p.sceneId, p.veoPrompt])
    );

    const updatedScenes = scenes.map((scene) => {
      if (promptMap.has(scene.id)) {
        return { ...scene, veoPrompt: promptMap.get(scene.id) };
      }
      return scene;
    });

    return Response.json({ scenes: updatedScenes });
  } catch (error: any) {
    console.error("Generate prompts error:", error);
    return Response.json(
      { error: error.message || "Failed to generate VEO prompts" },
      { status: 500 }
    );
  }
}
