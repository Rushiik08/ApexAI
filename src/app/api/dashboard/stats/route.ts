import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      user,
      totalGenerations,
      favoriteCount,
      monthGenerationsCount,
      tokenAgg,
      contentTypeGroups,
      recentGenerations,
      recentUsageRecords,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.id },
        select: { monthlyGenerationsLimit: true, plan: true, name: true, email: true },
      }),
      prisma.generation.count({
        where: { userId: session.id },
      }),
      prisma.generation.count({
        where: { userId: session.id, isFavorite: true },
      }),
      prisma.usageRecord.count({
        where: {
          userId: session.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.usageRecord.aggregate({
        where: { userId: session.id },
        _sum: { tokensUsed: true },
      }),
      prisma.generation.groupBy({
        by: ["contentType"],
        where: { userId: session.id },
        _count: { id: true },
      }),
      prisma.generation.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          contentType: true,
          topic: true,
          createdAt: true,
          isFavorite: true,
        },
      }),
      prisma.usageRecord.findMany({
        where: {
          userId: session.id,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          createdAt: true,
          tokensUsed: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Build 7-day activity map
    const dayMap: Record<string, { date: string; count: number; tokens: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      dayMap[dateKey] = { date: label, count: 0, tokens: 0 };
    }

    recentUsageRecords.forEach((record) => {
      const dateKey = record.createdAt.toISOString().split("T")[0];
      if (dayMap[dateKey]) {
        dayMap[dateKey].count += 1;
        dayMap[dateKey].tokens += record.tokensUsed;
      }
    });

    const activityData = Object.values(dayMap);

    const typeBreakdown = contentTypeGroups.map((g) => ({
      type: g.contentType,
      count: g._count.id,
    }));

    return NextResponse.json({
      stats: {
        totalGenerations,
        favoriteCount,
        monthlyUsage: monthGenerationsCount,
        monthlyLimit: user?.monthlyGenerationsLimit || 50,
        plan: user?.plan || "free",
        totalTokens: tokenAgg._sum.tokensUsed || 0,
      },
      typeBreakdown,
      recentGenerations,
      activityData,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Dashboard stats error:", err.message);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics." }, { status: 500 });
  }
}
