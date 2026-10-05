import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authenticate, hasTrustedOrigin } from "@/lib/auth";
import { prisma } from "@streamflix/database";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Connectez-vous à votre compte." }, { status: 401 });
  let body: { name?: unknown; isKids?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 40) return NextResponse.json({ error: "Le nom doit contenir de 1 à 40 caractères." }, { status: 400 });

  try {
    const profile = await prisma.$transaction(async (transaction) => {
      const count = await transaction.profile.count({ where: { userId: user.id } });
      if (count >= 5) return null;
      return transaction.profile.create({ data: { userId: user.id, name, isKids: body.isKids === true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (!profile) return NextResponse.json({ error: "Un compte peut avoir jusqu’à 5 profils." }, { status: 409 });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Profile creation failed", error);
    return NextResponse.json({ error: "Impossible de créer ce profil." }, { status: 500 });
  }
}