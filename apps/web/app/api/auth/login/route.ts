import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@streamflix/database";
import { createSessionResponse, hasTrustedOrigin } from "@/lib/auth";
import { isRateLimited, requestAddress } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  if (await isRateLimited(`login:${requestAddress(request)}`, 8)) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });

  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true, passwordHash: true } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "Adresse ou mot de passe incorrect." }, { status: 401 });
  return createSessionResponse({ id: user.id, email: user.email, role: user.role });
}