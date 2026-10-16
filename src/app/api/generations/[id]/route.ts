import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { updateGenerationSchema } from "@/lib/validations/generation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    const generation = await prisma.generation.findUnique({
      where: { id },
    });

    if (!generation || generation.userId !== session.id) {
      return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    }

    return NextResponse.json({ generation });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Get generation error:", err.message);
    return NextResponse.json({ error: "Failed to fetch generation." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.generation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Generation not found or unauthorized." }, { status: 404 });
    }

    const body = await req.json();
    const result = updateGenerationSchema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message);
      return NextResponse.json({ error: issues[0] || "Invalid update payload" }, { status: 400 });
    }

    const updated = await prisma.generation.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      message: "Generation updated successfully",
      generation: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Update generation error:", err.message);
    return NextResponse.json({ error: "Failed to update generation." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.generation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.id) {
      return NextResponse.json({ error: "Generation not found or unauthorized." }, { status: 404 });
    }

    await prisma.generation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Generation deleted successfully." });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Delete generation error:", err.message);
    return NextResponse.json({ error: "Failed to delete generation." }, { status: 500 });
  }
}
