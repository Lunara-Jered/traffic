import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamflix/database";
import { hashRefreshToken } from "@/lib/token-hash.js";

const ACCESS_COOKIE = "sf_access";
const REFRESH_COOKIE = "sf_refresh";
const encoder = new TextEncoder();
const refreshLifetimeMs = 30 * 24 * 60 * 60 * 1000;

function accessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_ACCESS_SECRET must contain at least 32 characters");
  return encoder.encode(secret);
}

export async function authenticate(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, accessSecret(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return { id: payload.sub, role: payload.role === "ADMIN" || payload.role === "MODERATOR" ? payload.role : "USER" };
  } catch {
    return null;
  }
}

export function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.APP_URL;
  if (!origin || !appUrl) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}

export async function createSessionResponse(user: { id: string; email: string; role: string }, status = 200) {
  const accessToken = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer("streamflix")
    .setExpirationTime("15m")
    .sign(accessSecret());

  const refreshToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + refreshLifetimeMs);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashRefreshToken(refreshToken), expiresAt } });

  const response = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, accessToken, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 15 * 60 });
  response.cookies.set(REFRESH_COOKIE, refreshToken, { httpOnly: true, secure, sameSite: "lax", path: "/api/auth", maxAge: refreshLifetimeMs / 1000 });
  return response;
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth", maxAge: 0 });
  return response;
}