import OpenAI from "openai";
import { GenerateOptions, GenerateResult } from "./types";

interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel: string;
  providerName: string;
}

function resolveProvider(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const apiKey =
    process.env.AI_API_KEY ||
    (provider === "openai" ? process.env.OPENAI_API_KEY : "") ||
    (provider === "groq" ? process.env.GROQ_API_KEY : "") ||
    (provider === "gemini" ? process.env.GEMINI_API_KEY : "");

  if (!apiKey) {
    throw new Error(
      `AI configuration missing: No API key found for provider "${provider}". Please set AI_API_KEY (or ${provider.toUpperCase()}_API_KEY) in your environment variables.`
    );
  }

  if (provider === "groq") {
    return {
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
      defaultModel: process.env.AI_MODEL || "llama-3.3-70b-versatile",
      providerName: "Groq",
    };
  }

  if (provider === "gemini") {
    return {
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      defaultModel: process.env.AI_MODEL || "gemini-2.0-flash",
      providerName: "Google Gemini",
    };
  }

  // Default to standard OpenAI
  return {
    apiKey,
    defaultModel: process.env.AI_MODEL || "gpt-4o-mini",
    providerName: "OpenAI",
  };
}

function constructSystemPrompt(options: GenerateOptions): string {
  const typeDescriptions: Record<string, string> = {
    blog: "compelling, well-structured blog post with an engaging introduction, structured headings (H2, H3), clear paragraphs, and a takeaway conclusion",
    article: "in-depth, authoritative, well-researched article with nuanced analysis and professional commentary",
    social: "high-converting, engaging social media post with relevant hashtags, hooks, and call-to-actions",
    marketing: "persuasive, high-impact marketing copy designed to convert visitors into loyal customers",
    product: "persuasive, benefit-driven product description highlighting key features, emotional appeal, and value proposition",
    email: "polished, professional email draft with a clear subject line, compelling body, and concise call to action",
    summary: "clear, concise, bulleted executive summary distilling the key points, insights, and action items",
    general: "high-quality, insightful, articulate prose structured clearly",
  };

  const wordTargets: Record<string, string> = {
    short: "around 150 to 250 words",
    medium: "around 400 to 600 words",
    long: "around 800 to 1200 words",
  };

  const targetLength = wordTargets[options.length || "medium"] || "around 400 to 600 words";
  const desc = typeDescriptions[options.contentType] || typeDescriptions.general;

  return `You are a world-class professional SaaS AI content writer and copywriter.
Your task is to write a ${desc}.

Format requirements:
1. Always start your response with a suggested title formatted as:
Title: [Catchy, Professional Title]

2. Followed by a blank line, then the full content in clean GitHub-flavored markdown.
3. Tone of voice: ${options.tone || "professional"}.
4. Target audience: ${options.audience || "general audience"}.
5. Desired length: ${targetLength}.
6. Output language: ${options.language || "English"}.
7. Do not include meta-commentary like "Here is your blog post:" or conversational filler. Output the Title line, followed directly by the generated content.`;
}

export async function generateAIContent(options: GenerateOptions): Promise<GenerateResult> {
  const config = resolveProvider();

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    timeout: 45000, // 45 seconds timeout
    maxRetries: 2,
  });

  const systemPrompt = constructSystemPrompt(options);

  let userPrompt = "";
  if (options.mode === "improve" && options.existingContent) {
    userPrompt = `Please significantly improve, polish, and elevate the following content on the topic "${options.topic}":\n\nExisting Content:\n${options.existingContent}\n\nAdditional Instructions: ${options.instructions || "Enhance clarity, vocabulary, pacing, and impact."}`;
  } else if (options.mode === "regenerate" && options.existingContent) {
    userPrompt = `Please regenerate a fresh, alternative version on the topic "${options.topic}".\n\nPrevious Version:\n${options.existingContent}\n\nAdditional Instructions: ${options.instructions || "Offer a fresh angle, new metaphors, and different structure."}`;
  } else {
    userPrompt = `Topic or Prompt: ${options.topic}\n\nAdditional Instructions: ${options.instructions || "Ensure exceptional quality, clarity, and readability."}`;
  }

  try {
    const response = await client.chat.completions.create({
      model: config.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const choice = response.choices[0];
    const rawOutput = choice?.message?.content?.trim() || "";

    if (!rawOutput) {
      throw new Error("AI provider returned an empty response. Please try again with a refined prompt.");
    }

    // Extract title from first line if present: "Title: [title]"
    let title = "";
    let content = rawOutput;

    const titleMatch = rawOutput.match(/^Title:\s*(.+?)(?:\r?\n|$)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
      // Remove the title line from content
      content = rawOutput.replace(/^Title:\s*.+?(?:\r?\n)+/i, "").trim();
    }

    if (!title) {
      // Fallback: derive title from topic
      title = options.topic.slice(0, 60);
      if (options.topic.length > 60) title += "...";
    }

    const tokensUsed = response.usage?.total_tokens || Math.ceil((userPrompt.length + content.length) / 4);

    return {
      title,
      content,
      model: response.model || config.defaultModel,
      provider: config.providerName,
      tokensUsed,
    };
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; code?: string };

    if (err.status === 401 || err.message?.includes("401") || err.code === "invalid_api_key") {
      throw new Error(`Authentication error with ${config.providerName}: Invalid or inactive API key.`);
    }

    if (err.status === 429 || err.message?.includes("429") || err.code === "rate_limit_exceeded") {
      throw new Error(`Rate limit exceeded with ${config.providerName}. Please wait a moment before trying again.`);
    }

    if (err.message?.includes("timeout") || err.code === "ETIMEDOUT") {
      throw new Error(`Request to ${config.providerName} timed out. Please check your network or try again.`);
    }

    throw new Error(err.message || "Failed to generate AI content. Please verify your provider settings.");
  }
}
