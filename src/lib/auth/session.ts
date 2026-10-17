import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const SESSION_COOKIE_NAME = "saas_auth_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
}

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "AUTH_SECRET environment variable is missing or too short. It must be at least 32 characters long."
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = getAuthSecret();
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  const secret = getAuthSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: (payload.role as string) || "user",
      plan: (payload.plan as string) || "free",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
