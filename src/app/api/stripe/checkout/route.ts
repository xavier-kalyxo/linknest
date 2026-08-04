import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/queries";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { workspaces, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit, mutationRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  // Refuse to start a second checkout for a workspace that already has a live
  // subscription. Without this, a repeat POST creates a SECOND subscription on
  // the same customer: both bill, and the webhook's upsert on workspaceId
  // orphans the first — no later event can match it, so the app can never
  // cancel it.
  const [existingSub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspace.id))
    .limit(1);

  if (
    existingSub &&
    ["active", "trialing", "past_due"].includes(existingSub.status)
  ) {
    return NextResponse.json(
      {
        error:
          "You already have an active subscription. Manage it from the billing page.",
      },
      { status: 409 },
    );
  }

  const { interval } = (await request.json()) as {
    interval: "monthly" | "yearly";
  };
  const priceId =
    interval === "yearly" ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly;

  if (!priceId) {
    console.error("[stripe] Missing price ID env var for interval:", interval);
    return NextResponse.json(
      { error: "Billing is not configured. Please contact support." },
      { status: 500 },
    );
  }

  try {
    // Get or create Stripe customer
    let customerId = workspace.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { workspaceId: workspace.id },
      });
      customerId = customer.id;

      await db
        .update(workspaces)
        .set({ stripeCustomerId: customerId })
        .where(eq(workspaces.id, workspace.id));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard/billing?canceled=true`,
      metadata: { workspaceId: workspace.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    // Log the detail, return a generic message: Stripe errors stringify with
    // request IDs, customer IDs and price IDs.
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
