import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { rateLimiter, globalRateLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/validations";
import { supabase } from "@/lib/supabase";
import { perplexitySearch } from "@/lib/perplexity";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success: globalOk } = await globalRateLimiter.limit("global");
  if (!globalOk) {
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const { success, remaining } = await rateLimiter.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Daily demo limit reached (30 credits/day). Clone the repo to run your own instance: github.com/shireen-mvps/orbit-full-cycle-marketing" },
      { status: 429, headers: { "X-Credits-Remaining": "0" } }
    );
  }

  const body = await req.json();
  const { projectId, industry, productCategory, competitors } = body;

  if (!projectId || !industry?.trim() || !productCategory?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cleanIndustry = sanitizeInput(industry, 200);
  const cleanCategory = sanitizeInput(productCategory, 200);
  const cleanCompetitors = (
    competitors as Array<{ name: string; description?: string }>
  )
    .slice(0, 5)
    .map((c) => ({
      name: sanitizeInput(c.name, 100),
      description: sanitizeInput(c.description ?? "", 300),
    }))
    .filter((c) => c.name.trim());

  if (!cleanIndustry || !cleanCategory || cleanCompetitors.length < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("orbit_projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const competitorList = cleanCompetitors
    .map((c) => `- ${c.name}${c.description ? `: ${c.description}` : ""}`)
    .join("\n");

  // ── Perplexity live research (graceful fallback if key not set) ─────────────
  let perplexityContent = "";
  let citations: string[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const research = await perplexitySearch(
      `Market research for ${cleanCategory} in the ${cleanIndustry} industry. ` +
        `Analyze these competitors: ${cleanCompetitors.map((c) => c.name).join(", ")}. ` +
        `Cover: competitive positioning, market share estimates, recent developments, ` +
        `unmet customer needs, and emerging market opportunities. Year: ${new Date().getFullYear()}.`,
      controller.signal
    );
    clearTimeout(timeout);
    perplexityContent = research.content;
    citations = research.citations;
  } catch {
    // No Perplexity key or timeout — Claude-only analysis
  }

  const researchContext = perplexityContent
    ? `\nCurrent Market Research (use to inform your scores and analysis):\n${perplexityContent.slice(0, 2000)}\n`
    : "";

  const prompt = `You are a senior marketing strategist and competitive analyst.

Analyze this market and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Industry: ${cleanIndustry}
Product Category: ${cleanCategory}
Project/Brand Name: ${project.name}
Known Competitors:
${competitorList}
${researchContext}
Return this exact JSON structure:
{
  "summary": "2-3 sentence market overview",
  "competitorMap": [
    {
      "name": "competitor name",
      "description": "what they do and who they serve",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "priceScore": 7,
      "featureScore": 5,
      "reputationScore": 6,
      "reachScore": 4
    }
  ],
  "userBrand": {
    "name": "${project.name}",
    "priceScore": 5,
    "featureScore": 7,
    "reputationScore": 2,
    "reachScore": 2
  },
  "marketGaps": ["specific unmet need 1", "specific unmet need 2", "specific unmet need 3", "specific unmet need 4"],
  "whitespaceOpportunities": ["specific positioning opportunity 1", "specific positioning opportunity 2", "specific positioning opportunity 3"],
  "positioning": []
}

Rules:
- priceScore: 1 (free/budget) to 10 (very expensive/enterprise-only)
- featureScore: 1 (basic/low quality) to 10 (feature-rich/high quality)
- reputationScore: 1 (unknown/new) to 10 (dominant/well-established brand)
- reachScore: 1 (niche audience) to 10 (mass market/broad reach)
- userBrand: represents "${project.name}" as a new/emerging entrant vs the established competitors
- Include every competitor listed above in competitorMap
- marketGaps: specific unmet customer needs, not generic observations
- whitespaceOpportunities: concrete positioning angles to differentiate a new entrant
- Be specific to the ${cleanIndustry} / ${cleanCategory} context, not generic marketing advice
- Never use em-dashes. Use commas, colons, or periods instead.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL.fast,
      max_tokens: 2200,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    if (citations.length > 0) result.citations = citations;

    await supabase
      .from("orbit_projects")
      .update({ market_intel: result, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    return NextResponse.json(
      { data: result },
      { headers: { "X-Credits-Remaining": String(remaining) } }
    );
  } catch (err) {
    console.error("Market intel AI error:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
