import Anthropic from "@anthropic-ai/sdk";
import type { Scene } from "@/lib/types";

const SYSTEM_PROMPT = `You are a VEO 3.1 prompt engineering specialist. You write world-class prompts for Google's VEO video generation model that produce cinematic, photorealistic 8-second clips.

## VEO 3.1 PROMPT RULES

Every prompt MUST include ALL of these elements:
1. **Camera angle/movement** — be specific: "slow push-in close-up", "wide establishing shot with dolly movement", "low angle hero shot tracking left"
2. **Subject** — detailed description of who/what is on screen, their appearance, clothing, expression
3. **Action** — what the subject is doing, how they're moving (8 seconds of motion)
4. **Environment** — where the scene takes place, set design, background elements
5. **Lighting** — specific lighting setup: "golden hour warm sunlight streaming from left", "soft diffused studio key light with blue rim lighting"
6. **Style** — cinematic look: "shallow depth of field, anamorphic lens flare", "clean commercial aesthetic, high contrast"
7. **Mood/atmosphere** — emotional quality: "confident and aspirational", "warm and inviting"
8. **Quality tags** — always end with: "photorealistic, high production value, 4K cinematic quality, professional color grading"

## CONSISTENCY RULES — CRITICAL

- The user will give you a CHARACTER SHEET describing the visual continuity of the entire video. You MUST start every prompt with this character sheet verbatim, then add the scene-specific direction. This is how Veo3 stays visually consistent across multiple clips.
- If a person appears in multiple scenes, the character sheet describes them once — keep them identical.
- Match the tone of the approved script — playful = light visuals, dramatic = high contrast and shadows.
- Each prompt should be 80-120 words total (character sheet + scene direction).

## WHAT NOT TO INCLUDE

- NEVER include text, words, numbers, or UI elements in prompts — VEO cannot render text consistently
- NEVER include brand logos or specific product UI — those are handled by the Remotion overlay layer
- Focus only on organic, human, environmental, and cinematic content

Respond with ONLY valid JSON, no markdown fences.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const scenes: Scene[] = body?.scenes;
    const characterSheet: string = body?.characterSheet || "";
    const script: string = body?.script;
    const tone: string = body?.tone;
    const brandColors = body?.brandColors;

    if (!scenes || !Array.isArray(scenes)) {
      return Response.json({ error: "scenes array is required" }, { status: 400 });
    }

    // Loop ALL scenes — every scene needs a Veo prompt under the new architecture
    if (scenes.length === 0) {
      return Response.json({ scenes });
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Write optimized VEO 3.1 prompts for each scene below. Each scene is exactly 8 seconds.

## CHARACTER SHEET (prepend to every prompt verbatim)
${characterSheet || "(none provided — write self-contained prompts that establish a consistent visual style)"}

## APPROVED SCRIPT (full narration, for tone reference)
"${script || "No script provided"}"

## TONE
${tone || "professional"}

## BRAND COLORS (for reference — do NOT put text/UI in prompts)
Primary: ${brandColors?.primary || "#6366f1"}
Secondary: ${brandColors?.secondary || "#8b5cf6"}

## SCENES NEEDING VEO PROMPTS (write one for each)

${scenes
  .map(
    (s, i) => `Scene ${i + 1} (${s.title}):
- ID: ${s.id}
- Description: ${s.description}
- Caption (what's spoken during this 8s): ${s.captionText || "no caption"}
- Current draft prompt: ${s.veoPrompt || "none"}`
  )
  .join("\n\n")}

Return JSON:
{
  "prompts": [
    {
      "sceneId": "string (the scene ID from above)",
      "veoPrompt": "string (character sheet verbatim + scene-specific direction, 80-120 words total, includes all 8 required elements, NO text/UI/numbers/logos)"
    }
  ]
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const rawJson = (jsonMatch[1] || text).trim();

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
    const promptMap = new Map<string, string>(
      (parsed.prompts || []).map((p: any) => [p.sceneId, p.veoPrompt] as [string, string])
    );

    const updatedScenes = scenes.map((scene) => {
      if (promptMap.has(scene.id)) {
        return { ...scene, veoPrompt: promptMap.get(scene.id) || scene.veoPrompt };
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
