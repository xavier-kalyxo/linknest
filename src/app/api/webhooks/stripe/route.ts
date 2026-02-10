import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  subscriptions,
  workspaces,
  stripeProcessedEvents,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ─── Deduplication: reject already-processed events ───────────────────
  const [existing] = await db
    .select()
    .from(stripeProcessedEvents)
    .where(eq(stripeProcessedEvents.eventId, event.id))
    .limit(1);

  if (existing) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  // ─── Process event ────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
    }

    // Mark event as processed
    await db.insert(stripeProcessedEvents).values({
      eventId: event.id,
    });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

// ─── checkout.session.completed ───────────────────────────────────────────

async function handleCheckoutComplete(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const workspaceId = session.metadata?.workspaceId;
  if (!workspaceId || !session.subscription) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  const item = stripeSubscription.items.data[0];

  // Single-transaction: insert/update subscription + set workspace plan + clear downgraded_at
  await db
    .insert(subscriptions)
    .values({
      workspaceId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: item.price.id,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      downgradedAt: null, // Clear on re-upgrade
      lastStripeEventCreated: new Date(event.created * 1000),
    })
    .onConflictDoUpdate({
      target: subscriptions.workspaceId,
      set: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: item.price.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(item.current_period_start * 1000),
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        downgradedAt: null,
        lastStripeEventCreated: new Date(event.created * 1000),
        updatedAt: new Date(),
      },
    });

  await db
    .update(workspaces)
    .set({ plan: "pro", updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));
}

// ─── customer.subscription.updated ────────────────────────────────────────

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const eventCreated = new Date(event.created * 1000);

  // Find the subscription row
  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (!existingSub) return;

  // Ordering guard: reject stale/out-of-order events
  if (
    existingSub.lastStripeEventCreated &&
    existingSub.lastStripeEventCreated >= eventCreated
  ) {
    return; // Stale event, skip
  }

  const isActive = sub.status === "active" || sub.status === "trialing";
  const subItem = sub.items.data[0];

  await db
    .update(subscriptions)
    .set({
      status: sub.status,
      stripePriceId: subItem.price.id,
      currentPeriodStart: new Date(subItem.current_period_start * 1000),
      currentPeriodEnd: new Date(subItem.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      lastStripeEventCreated: eventCreated,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existingSub.id));

  // Update workspace plan
  await db
    .update(workspaces)
    .set({
      plan: isActive ? "pro" : "free",
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, existingSub.workspaceId));

  // If downgrading to free, set downgradedAt
  if (!isActive) {
    await db
      .update(subscriptions)
      .set({ downgradedAt: new Date() })
      .where(eq(subscriptions.id, existingSub.id));
  }
}

// ─── customer.subscription.deleted ────────────────────────────────────────

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;

  const [existingSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (!existingSub) return;

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      downgradedAt: new Date(),
      lastStripeEventCreated: new Date(event.created * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existingSub.id));

  await db
    .update(workspaces)
    .set({ plan: "free", updatedAt: new Date() })
    .where(eq(workspaces.id, existingSub.workspaceId));
}
