import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { env } from "@/lib/env";
import { logError } from "@/lib/monitor";
import { getPrisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sc = await getPrisma().stripeCustomer.findUnique({ where: { userId } });
    if (!sc) {
      return NextResponse.json({ error: "No billing customer found." }, { status: 400 });
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sc.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/account/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    logError("billing_portal_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to create portal session." }, { status: 500 });
  }
}
