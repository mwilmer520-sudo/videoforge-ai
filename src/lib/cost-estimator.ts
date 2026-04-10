import type { Storyboard } from "./types";

/**
 * Rough cost estimates per asset, in USD. These are ballpark numbers and need
 * real calibration against actual API invoices, but they get the user in the
 * right order of magnitude before hitting render.
 */
const COST_PER_VEO_CLIP_USD = 0.5;
const COST_ELEVENLABS_PER_30S_USD = 0.15;
const COST_MUSIC_PER_RENDER_USD = 0.05;
const COST_CLAUDE_GENERATE_USD = 0.05;
const COST_CLAUDE_PROMPTS_USD = 0.02;

export interface CostBreakdown {
  veo: number;
  voice: number;
  music: number;
  claude: number;
  total: number;
  veoClipCount: number;
}

export function estimateCost(
  storyboard: Storyboard,
  options: { previewMode?: boolean } = {}
): CostBreakdown {
  const veoClipCount = options.previewMode ? 0 : storyboard.scenes.length;
  const veo = veoClipCount * COST_PER_VEO_CLIP_USD;

  const voiceDurationS = storyboard.totalDurationMs / 1000;
  const voice = (voiceDurationS / 30) * COST_ELEVENLABS_PER_30S_USD;

  const music = COST_MUSIC_PER_RENDER_USD;

  // Claude costs are sunk at concept-generation time, but include them in the
  // first-render estimate so the number reflects total spend on this video.
  const claude = COST_CLAUDE_GENERATE_USD + COST_CLAUDE_PROMPTS_USD;

  const total = veo + voice + music + claude;

  return {
    veo: round(veo),
    voice: round(voice),
    music: round(music),
    claude: round(claude),
    total: round(total),
    veoClipCount,
  };
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
