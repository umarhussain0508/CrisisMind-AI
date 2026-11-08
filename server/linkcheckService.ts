import { z } from "zod";
import { ai, MODELS } from "./gemini.js";
import { EvidenceSource, ExtractedClaim, Investigation, VerdictType } from "../src/types/index.js";

// Zod schemas for strict JSON validation
export const ExtractedClaimSchema = z.object({
  statement: z.string(),
  claimType: z.enum([
    "emergency",
    "health",
    "infrastructure",
    "weather",
    "relief_fraud",
    "public_safety",
    "general",
  ]),
  location: z.string().optional(),
  entities: z.array(z.string()),
  timeSensitivity: z.enum(["low", "medium", "high", "critical"]),
  requiresVerification: z.boolean(),
  potentialRisk: z.string(),
});

export const InvestigationAnalysisSchema = z.object({
  mainClaim: z.string(),
  claimType: z.enum([
    "emergency",
    "health",
    "infrastructure",
    "weather",
    "relief_fraud",
    "public_safety",
    "general",
  ]),
  location: z.string().optional(),
  entities: z.array(z.string()),
  timeSensitivity: z.enum(["low", "medium", "high", "critical"]),
  potentialRisk: z.string(),
  extractedClaims: z.array(ExtractedClaimSchema),
  verdict: z.enum([
    "TRUE",
    "FALSE",
    "MOSTLY TRUE",
    "PARTLY TRUE",
    "MISLEADING",
    "OUT OF CONTEXT",
    "UNVERIFIED",
    "INSUFFICIENT EVIDENCE",
  ]),
  confidenceScore: z.number().min(0).max(1),
  explanation: z.string(),
  contextAnalysis: z.string(),
  evidenceLimitations: z.array(z.string()),
  suggestedSteps: z.array(z.string()),
  searchQueries: z.array(z.string()),
});

// SSRF Protection: check if a URL points to private or restricted internal addresses
export function isSafePublicUrl(urlString: string): { safe: boolean; reason?: string } {
  try {
    const url = new URL(urlString);
    if (!["http:", "https:"].includes(url.protocol)) {
      return { safe: false, reason: "Only HTTP and HTTPS protocols are permitted." };
    }

    const hostname = url.hostname.toLowerCase();

    // Check loopback, private ranges, and metadata IPs
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0"
    ) {
      return { safe: false, reason: "Access to localhost or loopback addresses is prohibited." };
    }

    // Cloud metadata endpoint
    if (hostname === "169.254.169.254") {
      return { safe: false, reason: "Access to cloud instance metadata is blocked." };
    }

    // IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const b0 = parseInt(match[1], 10);
      const b1 = parseInt(match[2], 10);
      if (b0 === 10) return { safe: false, reason: "Private network range (10.0.0.0/8) blocked." };
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return { safe: false, reason: "Private network range (172.16.0.0/12) blocked." };
      if (b0 === 192 && b1 === 168) return { safe: false, reason: "Private network range (192.168.0.0/16) blocked." };
      if (b0 === 127) return { safe: false, reason: "Loopback range blocked." };
      if (b0 === 0) return { safe: false, reason: "Invalid IP range blocked." };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: "Invalid URL format." };
  }
}

// Fetch accessible URL content with strict timeout, size limit and headers
export async function fetchWebpageContent(targetUrl: string): Promise<{
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
  isRestrictedPlatform?: boolean;
}> {
  const safety = isSafePublicUrl(targetUrl);
  if (!safety.safe) {
    return { success: false, error: safety.reason };
  }

  // Detect social platforms that routinely require login or block headless requests
  const urlObj = new URL(targetUrl);
  const host = urlObj.hostname.toLowerCase();
  const isSocialPlatform =
    host.includes("twitter.com") ||
    host.includes("x.com") ||
    host.includes("facebook.com") ||
    host.includes("instagram.com") ||
    host.includes("tiktok.com") ||
    host.includes("threads.net");

  if (isSocialPlatform) {
    return {
      success: false,
      isRestrictedPlatform: true,
      error: `Social media platform (${urlObj.hostname}) enforces authentication walls and restricts automated retrieval. Please paste the post text directly or upload a screenshot for multimodal analysis.`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CrisisMindBot/1.0; +https://crisismind.ai/bot)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        success: false,
        error: `Server responded with HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const html = await res.text();
    // Simple text extraction: remove scripts, styles, tags
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000); // Take first 12k chars

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : urlObj.hostname;

    return { success: true, content: cleanText, title };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === "AbortError" ? "Request timed out after 8 seconds." : err.message || "Failed to fetch webpage.",
    };
  }
}

export async function analyzeInvestigation(params: {
  input: string;
  inputType: "url" | "text" | "image" | "transcript";
  imageBase64?: string;
  mimeType?: string;
}): Promise<Investigation> {
  const { input, inputType, imageBase64, mimeType } = params;

  let rawContentToAnalyze = input;
  let pageTitle = "";

  if (inputType === "url") {
    const fetchResult = await fetchWebpageContent(input);
    if (!fetchResult.success) {
      if (fetchResult.isRestrictedPlatform) {
        throw new Error(fetchResult.error);
      }
      // If fetching fails, we note that we are analyzing the URL structure and domain
      rawContentToAnalyze = `Target URL: ${input}. Note: Webpage direct fetch returned: ${fetchResult.error}. Conducting evidence retrieval on this link and domain.`;
    } else {
      pageTitle = fetchResult.title || "";
      rawContentToAnalyze = `URL: ${input}\nTitle: ${pageTitle}\nWebpage Content:\n${fetchResult.content}`;
    }
  }

  // Step 1: Multimodal OCR / Extraction if Image
  let extractedImageText = "";
  if (inputType === "image" && imageBase64) {
    const ocrResponse = await ai.models.generateContent({
      model: MODELS.GENERAL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/png",
              data: imageBase64,
            },
          },
          {
            text: "Extract all visible text from this image or screenshot accurately. Identify any headline, sender, timestamps, claims, or emergency notices depicted. Be objective.",
          },
        ],
      },
    });
    extractedImageText = ocrResponse.text || "";
    rawContentToAnalyze = `Screenshot OCR Content:\n${extractedImageText}\n\nUser Context:\n${input || "User uploaded screenshot"}`;
  }

  // Step 2: Use Google Search Grounding to retrieve live authoritative evidence and citations
  let groundedEvidenceSources: EvidenceSource[] = [];
  let groundedSearchContext = "";

  try {
    const searchPrompt = `Investigate the following emergency, disaster, health, or crisis-related claim or text:
"${rawContentToAnalyze.slice(0, 2000)}"

Task:
1. Search authoritative sources, government emergency management (FEMA, NDMA, USGS, NOAA, WHO, local civil protection), official news agencies, and fact-checkers.
2. Verify if this event, bridge collapse, evacuation, disease outbreak, donation campaign, or hazard is real, verified, false, or fabricated.
3. Provide a clear, evidence-supported summary citing specific sources, agencies, and dates.`;

    const searchResponse = await ai.models.generateContent({
      model: MODELS.GENERAL,
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    groundedSearchContext = searchResponse.text || "";

    // Extract real grounding chunks from Gemini search
    const groundingChunks = (searchResponse.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    let chunkIdx = 1;
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        const uri = chunk.web.uri;
        const title = chunk.web.title || `Authoritative Source #${chunkIdx}`;
        let sourceType: EvidenceSource["sourceType"] = "news_outlet";
        if (uri.includes(".gov") || uri.includes("ndma") || uri.includes("fema") || uri.includes("who.int") || uri.includes("cdc.gov")) {
          sourceType = "official_agency";
        } else if (uri.includes("factcheck") || uri.includes("snopes") || uri.includes("reuters.com/fact-check") || uri.includes("politifact")) {
          sourceType = "fact_checker";
        } else if (uri.includes(".edu") || uri.includes("usgs.gov") || uri.includes("noaa.gov")) {
          sourceType = "scientific_body";
        }

        groundedEvidenceSources.push({
          id: `src_${chunkIdx}_${Date.now()}`,
          name: title,
          url: uri,
          sourceType,
          retrievalDate: new Date().toISOString(),
          excerpt: `Retrieved via Google Search Grounding for claim verification. Source title: ${title}`,
          stance: "contextual",
          reliabilityRating: sourceType === "official_agency" || sourceType === "scientific_body" ? "high" : "moderate",
          limitations: "Real-time web search retrieval citation.",
        });
        chunkIdx++;
      }
    }
  } catch (searchErr) {
    console.warn("Google Search Grounding notice:", searchErr);
  }

  // Step 3: Structured synthesis & claim extraction with strict JSON
  const synthesisPrompt = `You are the Lead Scientific Investigator of CrisisMind AI (WAICY 2026).
Analyze the submitted content and the retrieved search evidence to produce a strict scientific fact-check report.

Original Content Submitted:
${rawContentToAnalyze.slice(0, 4000)}

Retrieved Authoritative Evidence & Context:
${groundedSearchContext.slice(0, 4000)}

Guidelines:
- Verdict must be one of: TRUE, FALSE, MOSTLY TRUE, PARTLY TRUE, MISLEADING, OUT OF CONTEXT, UNVERIFIED, INSUFFICIENT EVIDENCE.
- Do NOT guess or invent facts. If evidence is lacking, classify as UNVERIFIED or INSUFFICIENT EVIDENCE.
- Distinguish between verified facts, predictions, opinions, satire, or panic-inducing rumors.
- Explain evidence limitations clearly.
- Calibrate confidenceScore between 0.0 and 1.0 (evidence strength).

Output pure JSON matching this exact structure:
{
  "mainClaim": "Concise summary of the primary factual claim",
  "claimType": "emergency" | "health" | "infrastructure" | "weather" | "relief_fraud" | "public_safety" | "general",
  "location": "City, region, or global context if mentioned",
  "entities": ["entity1", "entity2"],
  "timeSensitivity": "low" | "medium" | "high" | "critical",
  "potentialRisk": "Explain public panic, safety hazards, traffic jams, or fraud risk",
  "extractedClaims": [
    {
      "statement": "Sub-claim 1",
      "claimType": "infrastructure",
      "location": "Location",
      "entities": ["entity"],
      "timeSensitivity": "high",
      "requiresVerification": true,
      "potentialRisk": "Risk"
    }
  ],
  "verdict": "FALSE",
  "confidenceScore": 0.92,
  "explanation": "Clear, objective explanation of why the claim is true/false/unverified based on retrieved sources.",
  "contextAnalysis": "Broader crisis context, why this misinformation spreads (fear, recycled old media, fraud).",
  "evidenceLimitations": [
    "Limitation 1 regarding source freshness or regional specifics",
    "Limitation 2"
  ],
  "suggestedSteps": [
    "Recommended verification action for emergency responders or citizens",
    "Step 2"
  ],
  "searchQueries": ["neutral search query 1", "neutral search query 2"]
}`;

  const synthesisResponse = await ai.models.generateContent({
    model: MODELS.GENERAL,
    contents: synthesisPrompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawJson = synthesisResponse.text || "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    // Attempt to extract json block if wrapped
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse structured investigation from AI response.");
    }
  }

  // Validate with Zod
  const validated = InvestigationAnalysisSchema.parse(parsed);

  // If search grounding provided real chunks, classify their stance based on verdict
  for (const src of groundedEvidenceSources) {
    if (validated.verdict === "FALSE" || validated.verdict === "MISLEADING") {
      src.stance = "contradicting";
    } else if (validated.verdict === "TRUE" || validated.verdict === "MOSTLY TRUE") {
      src.stance = "supporting";
    }
  }

  const investigationId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const investigation: Investigation = {
    id: investigationId,
    title: validated.mainClaim.slice(0, 80),
    originalInput: input,
    inputType,
    submittedAt: new Date().toISOString(),
    mainClaim: validated.mainClaim,
    claimType: validated.claimType,
    location: validated.location,
    entities: validated.entities,
    timeSensitivity: validated.timeSensitivity,
    potentialRisk: validated.potentialRisk,
    extractedClaims: validated.extractedClaims.map((ec, idx) => ({
      id: `ec_${idx + 1}`,
      ...ec,
    })),
    verdict: validated.verdict as VerdictType,
    confidenceScore: validated.confidenceScore,
    explanation: validated.explanation,
    contextAnalysis: validated.contextAnalysis,
    evidenceLimitations: validated.evidenceLimitations,
    suggestedSteps: validated.suggestedSteps,
    evidenceSources: groundedEvidenceSources,
    imageUrl: inputType === "image" && imageBase64 ? `data:${mimeType || "image/png"};base64,${imageBase64.slice(0, 100)}...` : undefined,
  };

  return investigation;
}
