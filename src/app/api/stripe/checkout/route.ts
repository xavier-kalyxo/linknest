import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/queries";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { interval } = (await request.json()) as {
    interval: "monthly" | "yearly";
  };
  const priceId =
    interval === "yearly" ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly;

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
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
