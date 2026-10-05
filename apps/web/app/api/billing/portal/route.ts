import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasTrustedOrigin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@streamflix/database";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour gérer votre abonnement." }, { status: 401 });
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } });
  if (!subscription?.stripeCustomerId || !process.env.APP_URL) return NextResponse.json({ error: "Aucun abonnement Stripe à gérer." }, { status: 404 });
  try {
    const session = await getStripe().billingPortal.sessions.create({ customer: subscription.stripeCustomerId, return_url: `${process.env.APP_URL}/compte` });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal creation failed", error);
    return NextResponse.json({ error: "Impossible d’ouvrir le portail de facturation." }, { status: 502 });
  }
}