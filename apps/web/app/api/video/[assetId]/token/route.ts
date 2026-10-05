import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@streamflix/database";

const planRank = { FREE: 0, STANDARD: 1, PREMIUM: 2 } as const;

export async function POST(request: NextRequest, context: { params: Promise<{ assetId: string }> }) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const { assetId } = await context.params;
  const [asset, subscription] = await Promise.all([
    prisma.videoAsset.findUnique({ where: { id: assetId } }),
    prisma.subscription.findUnique({ where: { userId: user.id }, select: { plan: true, status: true } }),
  ]);
  if (!asset || asset.status !== "READY") return NextResponse.json({ error: "Contenu indisponible." }, { status: 404 });
  if (!subscription || !["ACTIVE", "TRIALING"].includes(subscription.status) || planRank[subscription.plan] < planRank[asset.minimumPlan]) {
    return NextResponse.json({ error: "Votre abonnement ne permet pas de lire ce contenu." }, { status: 403 });
  }

  const secret = process.env.CDN_SIGNING_SECRET;
  const baseUrl = process.env.CDN_BASE_URL;
  if (!secret || secret.length < 32 || !baseUrl) return NextResponse.json({ error: "La diffusion sécurisée n’est pas configurée." }, { status: 503 });
  try {
    const token = await new SignJWT({ assetId: asset.id, key: asset.storageKey })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setAudience("streamflix-cdn")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(new TextEncoder().encode(secret));
    const url = new URL(asset.storageKey.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);
    url.searchParams.set("token", token);
    return NextResponse.json({ url: url.toString(), expiresIn: 300 });
  } catch (error) {
    console.error("Video token generation failed", error);
    return NextResponse.json({ error: "Impossible de préparer cette lecture." }, { status: 500 });
  }
}