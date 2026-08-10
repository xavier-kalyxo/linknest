import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { publicPageTag } from "@/lib/cache-tags";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  subscriptions,
  workspaces,
  pages,
  stripeProcessedEvents,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

/**
 * Raised when an event can never succeed no matter how often it is retried —
 * e.g. it references a workspace that has since been deleted. These are
 * acknowledged (200) and reported, rather than retried into an endpoint
 * suspension.
 */
class UnprocessableEventError extends Error {}

/**
 * Subscription statuses that keep Pro entitlements.
 *
 * `past_due` is deliberately included: Stripe's Smart Retries run for up to
 * ~3 weeks, and revoking every paid feature the moment one charge is declined
 * punishes a customer who is still paying and still being retried. Stripe emits
 * `customer.subscription.deleted` when it finally gives up, which is where the
 * real downgrade happens.
 */
const ENTITLED_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

function isEntitled(status: Stripe.Subscription.Status): boolean {
  return ENTITLED_STATUSES.has(status);
}

/**
 * Public pages are cached indefinitely (`revalidate = false`), so a plan change
 * would otherwise not reach them — a cancelled account's badge-free page stayed
 * badge-free until the owner happened to edit it again.
 */
async function revalidateWorkspacePages(workspaceId: string) {
  try {
    const workspacePages = await db
      .select({ slug: pages.slug })
      .from(pages)
      .where(eq(pages.workspaceId, workspaceId));

    for (const page of workspacePages) {
      revalidateTag(publicPageTag(page.slug), "max");
    }
  } catch (error) {
    console.error("[stripe] Failed to revalidate pages:", error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ─── Deduplication ────────────────────────────────────────────────────
  // Claim the event atomically. A SELECT-then-INSERT let two concurrent
  // redeliveries both pass the check and both run the handler.
  const claimed = await db
    .insert(stripeProcessedEvents)
    .values({ eventId: event.id })
    .onConflictDoNothing()
    .returning({ eventId: stripeProcessedEvents.eventId });

  if (claimed.length === 0) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  // ─── Process event ────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      case "invoice.payment_failed":
        // Entitlements are driven by subscription status; this is logged so a
        // dunning notification can be attached without another webhook change.
        console.warn(
          "[stripe] invoice.payment_failed",
          (event.data.object as Stripe.Invoice).customer,
        );
        break;
    }
  } catch (err) {
    // A permanently unprocessable event must NOT be retried. Returning 500
    // here for every failure meant an event referencing, say, a workspace that
    // no longer exists retried until Stripe disabled the endpoint outright —
    // taking real upgrades down with it. Test-mode cleanup is expected during
    // development, so keep it out of Sentry's high-priority exception stream.
    // The same condition in live mode can mean a customer paid without being
    // upgraded, and must still page us even though Stripe receives a 200.
    if (err instanceof UnprocessableEventError) {
      if (event.livemode) {
        console.error("Stripe webhook error:", err);
        Sentry.captureException(err, {
          tags: { webhook: event.type, disposition: "acknowledged" },
          extra: { eventId: event.id },
        });
      } else {
        console.warn("[stripe] Skipped unprocessable test event:", err.message);
      }

      return NextResponse.json({ received: true, skipped: err.message });
    }

    // Transient: release the claim so Stripe's retry can reprocess this event.
    // Leaving it marked would dedupe the retry away and lose the update.
    console.error("Stripe webhook error:", err);
    Sentry.captureException(err, {
      tags: { webhook: event.type, disposition: "retry" },
      extra: { eventId: event.id },
    });

    await db
      .delete(stripeProcessedEvents)
      .where(eq(stripeProcessedEvents.eventId, event.id))
      .catch(() => {});
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

  if (!workspaceId || !session.subscription) {
    // Nothing to attach this payment to, and no retry will change that. Report
    // it loudly — a customer may have been charged without being upgraded.
    throw new UnprocessableEventError(
      `checkout.session.completed ${session.id} has no workspaceId metadata or subscription`,
    );
  }

  // Confirm the workspace still exists. Without this the insert below fails on
  // a foreign key, which looked like a transient error and retried forever.
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    throw new UnprocessableEventError(
      `checkout.session.completed ${session.id} references workspace ${workspaceId}, which no longer exists`,
    );
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  const item = stripeSubscription.items.data[0];
  const entitled = isEntitled(stripeSubscription.status);
  const eventCreated = new Date(event.created * 1000);

  await db.transaction(async (tx) => {
    await tx
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
        lastStripeEventCreated: eventCreated,
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
          lastStripeEventCreated: eventCreated,
          updatedAt: new Date(),
        },
      });

    // Only grant Pro once the subscription is actually payable. Delayed-
    // notification payment methods complete the session while still unpaid.
    await tx
      .update(workspaces)
      .set({ plan: entitled ? "pro" : "free", updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId));
  });

  await revalidateWorkspacePages(workspaceId);
}

// ─── customer.subscription.created / updated ──────────────────────────────

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const eventCreated = new Date(event.created * 1000);

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

  const entitled = isEntitled(sub.status);
  const subItem = sub.items.data[0];

  await db.transaction(async (tx) => {
    await tx
      .update(subscriptions)
      .set({
        status: sub.status,
        stripePriceId: subItem.price.id,
        currentPeriodStart: new Date(subItem.current_period_start * 1000),
        currentPeriodEnd: new Date(subItem.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        lastStripeEventCreated: eventCreated,
        // Stamped in the same statement rather than a second UPDATE, so the
        // grace-period clock can never disagree with the plan.
        downgradedAt: entitled ? null : (existingSub.downgradedAt ?? new Date()),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSub.id));

    await tx
      .update(workspaces)
      .set({
        plan: entitled ? "pro" : "free",
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, existingSub.workspaceId));
  });

  await revalidateWorkspacePages(existingSub.workspaceId);
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

  await db.transaction(async (tx) => {
    await tx
      .update(subscriptions)
      .set({
        status: "canceled",
        downgradedAt: existingSub.downgradedAt ?? new Date(),
        lastStripeEventCreated: new Date(event.created * 1000),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existingSub.id));

    await tx
      .update(workspaces)
      .set({ plan: "free", updatedAt: new Date() })
      .where(eq(workspaces.id, existingSub.workspaceId));
  });

  await revalidateWorkspacePages(existingSub.workspaceId);
}
