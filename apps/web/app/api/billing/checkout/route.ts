import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasTrustedOrigin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@streamflix/database";

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Connectez-vous pour choisir un abonnement." }, { status: 401 });
  let plan: unknown;
  try { ({ plan } = await request.json()); } catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 }); }
  if (plan !== "STANDARD" && plan !== "PREMIUM") return NextResponse.json({ error: "Forfait invalide." }, { status: 400 });

  const priceId = plan === "STANDARD" ? process.env.STRIPE_PRICE_STANDARD : process.env.STRIPE_PRICE_PREMIUM;
  const appUrl = process.env.APP_URL;
  if (!priceId || !appUrl || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "La facturation n’est pas configurée." }, { status: 503 });

  try {
    const [account, subscription] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { email: true } }),
      prisma.subscription.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } }),
    ]);
    if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: subscription?.stripeCustomerId ?? undefined,
      customer_email: subscription?.stripeCustomerId ? undefined : account.email,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      success_url: `${appUrl}/compte?paiement=succes`,
      cancel_url: `${appUrl}/compte?paiement=annule`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Impossible de démarrer le paiement." }, { status: 502 });
  }
}