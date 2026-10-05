import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamflix/database";
import { clearSessionCookies, createSessionResponse, hasTrustedOrigin } from "@/lib/auth";
import { hashRefreshToken } from "@/lib/token-hash.js";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const token = request.cookies.get("sf_refresh")?.value;
  if (!token) return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashRefreshToken(token) }, include: { user: { select: { id: true, email: true, role: true } } } });
  if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
    return clearSessionCookies(NextResponse.json({ error: "Session expirée." }, { status: 401 }));
  }
  const rotation = await prisma.refreshToken.updateMany({ where: { id: stored.id, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
  if (rotation.count !== 1) return clearSessionCookies(NextResponse.json({ error: "Session déjà renouvelée." }, { status: 401 }));
  return createSessionResponse(stored.user);
}