// ============================================================
// AgentLead: Marketing Video Intelligence
// The agent IS the creative director — it knows what works.
// ============================================================

export const STORYTELLING_FRAMEWORKS = {
  "hook-problem-solution": {
    name: "Hook → Problem → Solution → CTA",
    description:
      "Open with a pattern-interrupt hook, agitate the pain point, present the product as the solution, close with urgency.",
    bestFor: ["product launches", "SaaS", "DTC brands", "apps"],
    platforms: ["Instagram Reels", "TikTok", "YouTube Shorts"],
    example:
      "Stop scrolling. You're wasting 3 hours a day on email. [Product] cuts that to 15 minutes. Try it free.",
  },
  "before-after": {
    name: "Before → After → Bridge",
    description:
      "Show the painful 'before' state, the aspirational 'after', then reveal the product as the bridge between them.",
    bestFor: ["fitness", "beauty", "home improvement", "productivity tools"],
    platforms: ["Instagram Reels", "TikTok", "Facebook"],
    example:
      "Monday morning without [Product]... vs Monday morning WITH [Product]. The difference? Everything.",
  },
  "social-proof-stack": {
    name: "Social Proof Stack",
    description:
      "Lead with a bold claim, stack 3-4 rapid testimonials/stats, end with an irresistible offer. Trust-first selling.",
    bestFor: ["established brands", "services", "B2B", "courses"],
    platforms: ["LinkedIn", "YouTube", "Facebook"],
    example:
      "10,000 teams switched this quarter. Here's why. [Testimonial 1] [Testimonial 2] [Stat]. Join them.",
  },
  "storytelling-arc": {
    name: "Mini Story Arc",
    description:
      "Character + conflict + resolution in under 60 seconds. Emotional connection drives action. The product is the hero's tool.",
    bestFor: ["lifestyle brands", "nonprofits", "premium products"],
    platforms: ["YouTube", "Instagram", "TikTok"],
    example:
      "She almost gave up on her dream bakery. Then she found [Product]. Now she serves 200 customers a day.",
  },
  "listicle-rapid": {
    name: "Rapid-Fire Listicle",
    description:
      "3-5 reasons / tips / features shown rapid-fire with punchy text overlays. High retention, very shareable.",
    bestFor: ["tech products", "apps", "educational content", "tools"],
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    example:
      "5 things [Product] does that you didn't know: 1... 2... 3... 4... 5... Link in bio.",
  },
  "curiosity-gap": {
    name: "Curiosity Gap",
    description:
      "Open with an incomplete or surprising statement that forces the viewer to keep watching. Reveal the payoff at the end.",
    bestFor: ["viral content", "brand awareness", "launches"],
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    example:
      "This one change doubled our revenue in 30 days... [build tension through scenes] ...we started using [Product].",
  },
  "ugc-authentic": {
    name: "UGC / Authentic Feel",
    description:
      "Designed to look and feel like user-generated content. Casual, handheld feel. Relatable narrator. Anti-polished aesthetic.",
    bestFor: ["DTC brands", "apps", "Gen Z targeting", "beauty", "food"],
    platforms: ["TikTok", "Instagram Reels"],
    example:
      "OK so I just tried this thing and I'm literally obsessed... [casual walkthrough] ...you NEED this.",
  },
  "comparison-battle": {
    name: "Comparison / Us vs Them",
    description:
      "Side-by-side or sequential comparison showing why your product wins. Works best when the difference is visual and obvious.",
    bestFor: ["competitive markets", "tech", "tools", "food & beverage"],
    platforms: ["YouTube", "TikTok", "Instagram"],
    example:
      "Regular coffee maker: 10 minutes, bitter. [Product]: 30 seconds, perfect. Every. Single. Time.",
  },
} as const;

export const HOOK_TECHNIQUES = [
  {
    name: "Pattern Interrupt",
    description: "Start with something unexpected — a bold claim, weird visual, or jarring contrast",
    examples: ["Wait, don't buy another [category] until you see this", "This is the worst advice I ever got (and why it worked)"],
  },
  {
    name: "Direct Address",
    description: "Call out the target audience directly in the first 2 seconds",
    examples: ["Founders who are still doing [X] manually...", "If you're a [role] making under [amount]..."],
  },
  {
    name: "Controversial Take",
    description: "Lead with a spicy opinion that stops the scroll",
    examples: ["[Popular product] is a waste of money. Here's what to use instead.", "Nobody needs a [category]. Fight me."],
  },
  {
    name: "Visual Shock",
    description: "Start with an extreme close-up, unusual angle, or visually striking moment",
    examples: ["Extreme slow-mo pour", "Unexpected scale comparison", "Satisfying destruction/transformation"],
  },
  {
    name: "Question Hook",
    description: "Ask a question the viewer can't help but answer mentally",
    examples: ["What if you never had to [pain point] again?", "How much time did you waste on [X] this week?"],
  },
  {
    name: "Result First",
    description: "Show the end result immediately, then rewind to show how",
    examples: ["This is what $0 ad spend looks like (show results, then explain)", "End result first, then 'let me show you how'"],
  },
];

export const VEO_PROMPT_TECHNIQUES = {
  cameraAngles: [
    "extreme close-up",
    "close-up",
    "medium shot",
    "wide establishing shot",
    "low angle hero shot",
    "high angle overhead",
    "tracking shot following subject",
    "dolly zoom",
    "slow push-in",
    "pull-back reveal",
    "POV first-person",
    "over-the-shoulder",
    "Dutch angle",
    "crane shot rising",
  ],
  lightingStyles: [
    "golden hour warm sunlight",
    "soft diffused studio lighting",
    "dramatic side lighting with deep shadows",
    "neon-lit cyberpunk atmosphere",
    "clean bright commercial lighting",
    "moody backlit silhouette",
    "natural window light",
    "ring light beauty setup",
    "volumetric light rays through haze",
  ],
  motionCues: [
    "slow motion",
    "timelapse",
    "smooth steadicam movement",
    "handheld organic movement",
    "static locked-off tripod",
    "whip pan transition",
    "parallax depth movement",
    "orbiting around subject",
  ],
  styleDirections: [
    "cinematic film look with shallow depth of field",
    "clean minimal commercial aesthetic",
    "raw authentic documentary style",
    "high-energy fast-paced montage",
    "dreamy ethereal soft focus",
    "bold graphic pop-art style",
    "luxury premium with rich colors",
    "warm nostalgic vintage film grain",
  ],
};

export const PLATFORM_SPECS = {
  "tiktok": {
    name: "TikTok",
    aspectRatio: "9:16" as const,
    maxDuration: 60,
    sweetSpots: [15, 30],
    tips: [
      "First 1-2 seconds are everything — hook immediately",
      "Use trending audio patterns even if custom music",
      "Text overlays are essential — 80% watch without sound",
      "Raw/authentic beats polished every time",
      "End with a loop point for rewatches",
    ],
  },
  "instagram-reels": {
    name: "Instagram Reels",
    aspectRatio: "9:16" as const,
    maxDuration: 90,
    sweetSpots: [15, 30],
    tips: [
      "Strong visual hook in first frame (it's the thumbnail)",
      "Slightly more polished than TikTok",
      "Use on-screen text for accessibility",
      "Include clear CTA — 'link in bio' or 'save this'",
    ],
  },
  "youtube-shorts": {
    name: "YouTube Shorts",
    aspectRatio: "9:16" as const,
    maxDuration: 60,
    sweetSpots: [30, 45],
    tips: [
      "First 3 seconds determine if viewer stays",
      "Slightly more informational content performs well",
      "Can be longer than TikTok — use the time for value",
      "Subscribe CTA works better here than other platforms",
    ],
  },
  "youtube": {
    name: "YouTube",
    aspectRatio: "16:9" as const,
    maxDuration: 90,
    sweetSpots: [30, 45, 90],
    tips: [
      "Higher production value expected",
      "Can tell a longer story — use full arc",
      "Pre-roll ads: front-load the value, hook in 5s",
      "Include brand watermark throughout",
    ],
  },
  "linkedin": {
    name: "LinkedIn",
    aspectRatio: "16:9" as const,
    maxDuration: 90,
    sweetSpots: [30, 45],
    tips: [
      "Professional but not boring — show personality",
      "Data and results resonate strongly",
      "Thought leadership angle > hard sell",
      "Captions are mandatory — most watch on mute at work",
    ],
  },
  "facebook": {
    name: "Facebook",
    aspectRatio: "1:1" as const,
    maxDuration: 60,
    sweetSpots: [15, 30],
    tips: [
      "Square format gets 78% more real estate in feed",
      "Autoplay without sound — text overlays critical",
      "Emotional content outperforms informational",
      "Strong thumbnail/first frame for feed stopping",
    ],
  },
};

export const MUSIC_MOODS = {
  energetic: {
    genres: ["electronic pop", "upbeat indie", "future bass"],
    bpm: "120-140",
    instruments: "synths, driving drums, bass drops",
    prompt: "upbeat energetic commercial music, modern pop electronic, driving rhythm, positive vibes",
  },
  calm: {
    genres: ["ambient", "acoustic", "lo-fi"],
    bpm: "70-90",
    instruments: "piano, soft guitar, subtle pads",
    prompt: "calm gentle ambient music, soft piano and acoustic guitar, warm and soothing, minimal",
  },
  professional: {
    genres: ["corporate", "light electronic", "modern classical"],
    bpm: "90-110",
    instruments: "clean piano, light percussion, strings",
    prompt: "professional corporate background music, clean and modern, light percussion, inspiring",
  },
  playful: {
    genres: ["quirky pop", "chiptune-inspired", "funk"],
    bpm: "110-130",
    instruments: "pizzicato, quirky synths, snappy percussion",
    prompt: "playful fun quirky music, bouncy rhythm, cheerful and lighthearted, whimsical",
  },
  dramatic: {
    genres: ["cinematic", "orchestral", "dark electronic"],
    bpm: "80-120",
    instruments: "orchestral hits, deep bass, building strings",
    prompt: "dramatic cinematic music, building tension, orchestral swells, powerful and intense",
  },
  inspirational: {
    genres: ["uplifting pop", "indie anthem", "modern orchestral"],
    bpm: "100-120",
    instruments: "piano build, soaring strings, gentle drums building",
    prompt: "inspirational uplifting music, emotional piano building to full orchestra, hopeful and triumphant",
  },
};
