import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamflix/database";
import { clearSessionCookies, hasTrustedOrigin } from "@/lib/auth";
import { hashRefreshToken } from "@/lib/token-hash.js";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const token = request.cookies.get("sf_refresh")?.value;
  if (token) await prisma.refreshToken.updateMany({ where: { tokenHash: hashRefreshToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  return clearSessionCookies(NextResponse.json({ ok: true }));
}