import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { logError, logInfo } from "@/lib/monitor";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function resolveUserId(subscription: Stripe.Subscription) {
  const fromMetadata = subscription.metadata?.userId;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await prisma.stripeCustomer.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return customer?.userId ?? null;
}

async function upsertSubscriptionFromEvent(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) return;

  const currentPeriodEndUnix = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const trialEndUnix = (subscription as unknown as { trial_end?: number }).trial_end;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null,
      trialEnd: trialEndUnix ? new Date(trialEndUnix * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null,
      trialEnd: trialEndUnix ? new Date(trialEndUnix * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature." }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(raw, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const exists = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (exists) {
    return NextResponse.json({ received: true });
  }
  await prisma.stripeEvent.create({
    data: { id: event.id, type: event.type, created: event.created },
  });

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await upsertSubscriptionFromEvent(event.data.object as Stripe.Subscription);
      logInfo("billing_webhook_subscription_synced", { eventType: event.type });
    }
  } catch (error) {
    logError("billing_webhook_processing_failed", { error: String(error), eventType: event.type });
  }

  return NextResponse.json({ received: true });
}
