import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { getSession, setSessionCookie, createSessionToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/validations/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        monthlyGenerationsLimit: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    unstable_rethrow(error);
    const err = error as Error;
    console.error("Profile GET error:", err.message);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();

    // Check if updating password
    if (body.currentPassword && body.newPassword) {
      const pwResult = updatePasswordSchema.safeParse(body);
      if (!pwResult.success) {
        const issues = pwResult.error.issues.map((i) => i.message);
        return NextResponse.json({ error: issues[0] || "Invalid password data" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.id },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await verifyPassword(pwResult.data.currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Current password does not match." }, { status: 400 });
      }

      const newHash = await hashPassword(pwResult.data.newPassword);
      await prisma.user.update({
        where: { id: session.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ message: "Password updated successfully." });
    }

    // Updating profile details (name)
    const profileResult = updateProfileSchema.safeParse(body);
    if (!profileResult.success) {
      const issues = profileResult.error.issues.map((i) => i.message);
      return NextResponse.json({ error: issues[0] || "Invalid profile data" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { name: profileResult.data.name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
      },
    });

    // Refresh session cookie with updated user name
    const newToken = await createSessionToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      plan: updatedUser.plan,
    });
    await setSessionCookie(newToken);

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Profile PATCH error:", err.message);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
