import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@streamflix/database";
import { createSessionResponse, hasTrustedOrigin } from "@/lib/auth";
import { isRateLimited, requestAddress } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  if (await isRateLimited(`register:${requestAddress(request)}`, 5)) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });

  let body: { email?: unknown; password?: unknown; profileName?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const profileName = typeof body.profileName === "string" ? body.profileName.trim().slice(0, 40) : "Moi";
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "Saisissez une adresse valide et un mot de passe de 12 à 128 caractères." }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
        profiles: { create: { name: profileName || "Moi" } },
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
      },
      select: { id: true, email: true, role: true },
    });
    return await createSessionResponse(user, 201);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte utilise déjà cette adresse." }, { status: 409 });
    }
    console.error("Account registration failed", error);
    return NextResponse.json({ error: "Impossible de créer le compte pour le moment." }, { status: 500 });
  }
}