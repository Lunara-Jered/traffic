import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@streamflix/database";

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: "Connectez-vous à votre compte." }, { status: 401 });
  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      role: true,
      profiles: { select: { id: true, name: true, isKids: true, language: true }, orderBy: { createdAt: "asc" } },
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true, stripeCustomerId: true } },
    },
  });
  if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  return NextResponse.json({ user: { ...account, subscription: account.subscription ? { ...account.subscription, hasBillingAccount: Boolean(account.subscription.stripeCustomerId), stripeCustomerId: undefined } : null } });
}