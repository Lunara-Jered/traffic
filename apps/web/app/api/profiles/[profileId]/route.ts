import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasTrustedOrigin } from "@/lib/auth";
import { prisma } from "@streamflix/database";

export async function DELETE(request: NextRequest, context: { params: Promise<{ profileId: string }> }) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Connectez-vous à votre compte." }, { status: 401 });
  const { profileId } = await context.params;
  const profile = await prisma.profile.findFirst({ where: { id: profileId, userId: user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  const count = await prisma.profile.count({ where: { userId: user.id } });
  if (count <= 1) return NextResponse.json({ error: "Un compte doit conserver au moins un profil." }, { status: 409 });
  await prisma.profile.delete({ where: { id: profile.id } });
  return NextResponse.json({ ok: true });
}