import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { env } from "@/lib/env";
import { logError, logInfo } from "@/lib/monitor";
import { getStripe } from "@/lib/stripe";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await getPrisma().user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const existing = await getPrisma().stripeCustomer.findUnique({ where: { userId } });
    let stripeCustomerId = existing?.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await getPrisma().stripeCustomer.create({
        data: { userId, stripeCustomerId },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: env.STRIPE_PRICE_ID_MONTHLY_100JPY, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId },
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/account/billing?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancel`,
    });

    logInfo("billing_checkout_created", { userId });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    logError("billing_checkout_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
