export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return Response.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
      }
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VideoForgeAI/1.0; +https://videoforge.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });

    if (!response.ok) {
      return Response.json({ error: `Failed to fetch URL (${response.status})` }, { status: 502 });
    }

    const html = await response.text();

    // Extract useful content from HTML
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    const metaDescription =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]?.trim() ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i)?.[1]?.trim() ||
      "";
    const ogTitle =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]?.trim() || "";
    const ogDescription =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]?.trim() || "";
    const ogImage =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]?.trim() || "";

    // Extract visible text (strip tags, scripts, styles)
    const bodyContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000); // Limit to 3000 chars

    // Extract h1, h2 headings
    const headings = [
      ...(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []),
      ...(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []),
    ]
      .map((h) => h.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .slice(0, 10);

    return Response.json({
      url,
      title: ogTitle || title,
      description: ogDescription || metaDescription,
      image: ogImage,
      headings,
      content: bodyContent,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return Response.json(
      { error: error.name === "TimeoutError" ? "URL took too long to load" : (error.message || "Failed to scrape URL") },
      { status: 500 }
    );
  }
}
