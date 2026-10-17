import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail, getValidatedAppUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rl = await checkRateLimit(`forgot-pw:${ip}`, 5, 60000);
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

    // Always respond with success if user does not exist to prevent user enumeration attacks
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

    const appUrl = getValidatedAppUrl();
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    // Send password reset email via Resend
    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
      });
    } catch (emailError: unknown) {
      // Invalidate the token if email sending failed so a ghost token doesn't persist
      await prisma.passwordResetToken.deleteMany({
        where: { tokenHash },
      });

      const err = emailError as Error;
      console.error("Password reset email dispatch failure:", err.message);

      return NextResponse.json(
        { error: "Failed to send password reset email. Please try again later." },
        { status: 500 }
      );
    }

    // Return generic message without exposing reset tokens or URLs
    return NextResponse.json({
      message: "If an account exists with that email, reset instructions have been sent.",
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
