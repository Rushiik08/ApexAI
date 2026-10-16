import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Logout error:", err.message);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
