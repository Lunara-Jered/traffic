import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@streamflix/database";
import { getStripe } from "@/lib/stripe";

function planFrom(value: string | undefined) {
  return value === "PREMIUM" ? "PREMIUM" : value === "STANDARD" ? "STANDARD" : "FREE";
}

function statusFrom(value: Stripe.Subscription.Status) {
  if (value === "active") return "ACTIVE" as const;
  if (value === "trialing") return "TRIALING" as const;
  if (value === "past_due" || value === "unpaid") return "PAST_DUE" as const;
  if (value === "canceled") return "CANCELED" as const;
  return "INCOMPLETE" as const;
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) throw new Error("Stripe subscription is missing userId metadata");
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const periodEnds = subscription.items.data.map((item) => item.current_period_end);
  const currentPeriodEnd = periodEnds.length ? new Date(Math.min(...periodEnds) * 1000) : null;
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: planFrom(subscription.metadata.plan),
      status: statusFrom(subscription.status),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd,
    },
    update: {
      plan: planFrom(subscription.metadata.plan),
      status: statusFrom(subscription.status),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd,
    },
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.warn("Invalid Stripe webhook signature", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;
      const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (userId && stripeSubscriptionId) await updateSubscription(await getStripe().subscriptions.retrieve(stripeSubscriptionId));
      if (userId && session.payment_status === "paid" && session.amount_total !== null && session.currency) {
        await prisma.payment.upsert({
          where: { providerReference: session.id },
          create: { userId, providerReference: session.id, amountCents: session.amount_total, currency: session.currency, status: "PAID" },
          update: { status: "PAID" },
        });
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await updateSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", { eventId: event.id, error });
    return NextResponse.json({ error: "Traitement du webhook impossible." }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}