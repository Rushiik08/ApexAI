import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveGenerationSchema } from "@/lib/validations/generation";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const contentType = searchParams.get("contentType") || undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const favorite = searchParams.get("favorite") === "true" ? true : undefined;
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: Prisma.GenerationWhereInput = {
      userId: session.id,
      ...(contentType && { contentType }),
      ...(favorite !== undefined && { isFavorite: favorite }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { topic: { contains: search, mode: "insensitive" } },
          { generatedContent: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    let orderBy: Prisma.GenerationOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "title") {
      orderBy = { title: "asc" };
    }

    const [total, generations] = await Promise.all([
      prisma.generation.count({ where }),
      prisma.generation.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      generations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Generations fetch error:", err.message);
    return NextResponse.json({ error: "Failed to fetch generations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const result = saveGenerationSchema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message);
      return NextResponse.json({ error: issues[0] || "Invalid generation data" }, { status: 400 });
    }

    const generation = await prisma.generation.create({
      data: {
        ...result.data,
        userId: session.id,
      },
    });

    return NextResponse.json(
      {
        message: "Generation saved successfully",
        generation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Save generation error:", err.message);
    return NextResponse.json({ error: "Failed to save generation." }, { status: 500 });
  }
}
