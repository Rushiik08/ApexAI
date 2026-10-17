import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { generateSchema } from "@/lib/validations/generation";
import { generateAIContent } from "@/lib/ai/service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to generate content." }, { status: 401 });
    }

    // Rate limiting: max 10 generation requests per minute per user
    const rl = await checkRateLimit(`ai-gen:${session.id}`, 10, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Generation rate limit exceeded. Please wait a minute before sending another request." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message);
      return NextResponse.json({ error: issues[0] || "Invalid generation parameters" }, { status: 400 });
    }

    // Check user's generation usage for the current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [user, monthUsageCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.id },
        select: { monthlyGenerationsLimit: true, plan: true },
      }),
      prisma.usageRecord.count({
        where: {
          userId: session.id,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    const limit = user?.monthlyGenerationsLimit || 50;
    if (monthUsageCount >= limit) {
      return NextResponse.json(
        {
          error: `Monthly quota exceeded (${monthUsageCount}/${limit}). Upgrade your plan for unlimited generations.`,
          quotaExceeded: true,
        },
        { status: 403 }
      );
    }

    // Generate content using real AI provider
    const aiResult = await generateAIContent(result.data);

    // Record usage in DB
    await prisma.usageRecord.create({
      data: {
        userId: session.id,
        operation: result.data.mode || "generate",
        tokensUsed: aiResult.tokensUsed,
        modelUsed: aiResult.model,
      },
    });

    return NextResponse.json({
      title: aiResult.title,
      content: aiResult.content,
      model: aiResult.model,
      provider: aiResult.provider,
      tokensUsed: aiResult.tokensUsed,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI Generation API Error:", err.message);

    // Differentiate client-friendly messages
    if (err.message.includes("AI configuration missing")) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }

    if (err.message.includes("Rate limit exceeded") || err.message.includes("429")) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }

    return NextResponse.json(
      { error: err.message || "Failed to generate AI content. Please verify your provider configuration." },
      { status: 500 }
    );
  }
}
