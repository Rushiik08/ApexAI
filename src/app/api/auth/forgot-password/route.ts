import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rl = checkRateLimit(`forgot-pw:${ip}`, 5, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, reset instructions have been sent.",
      });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    // Save token hash to database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

    // Log the link in development console for instant developer/tester verification
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n======================================================`);
      console.log(`[PASSWORD RESET LINK for ${user.email}]:`);
      console.log(resetUrl);
      console.log(`======================================================\n`);
    }

    // Return message and also token in development for direct verification
    return NextResponse.json({
      message: "If an account exists with that email, reset instructions have been sent.",
      devToken: process.env.NODE_ENV !== "production" ? rawToken : undefined,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Forgot password error:", err.message);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
