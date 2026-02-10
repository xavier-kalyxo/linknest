import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import Link from "next/link";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) redirect("/onboarding");

  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showCanceled = params.canceled === "true";

  // Get subscription info
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspace.id))
    .limit(1);

  // Build Stripe Customer Portal URL if they have a customer ID
  let portalUrl: string | null = null;
  if (workspace.stripeCustomerId) {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: workspace.stripeCustomerId,
        return_url: `${process.env.AUTH_URL}/dashboard/billing`,
      });
      portalUrl = portalSession.url;
    } catch {
      // Portal not configured yet in Stripe — that's fine
    }
  }

  const isActive = sub?.status === "active" || sub?.status === "trialing";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              &larr; Dashboard
            </Link>
            <h1 className="text-lg font-bold">Billing</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Success / Cancel banners */}
        {showSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            Your subscription is active! You now have access to all Pro
            features.
          </div>
        )}
        {showCanceled && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Checkout was canceled. No charges were made.
          </div>
        )}

        {/* Current plan */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {workspace.plan === "pro" ? "Pro Plan" : "Free Plan"}
              </h2>
              {isActive && sub && (
                <p className="mt-1 text-sm text-gray-500">
                  {sub.cancelAtPeriodEnd
                    ? `Cancels on ${sub.currentPeriodEnd.toLocaleDateString()}`
                    : `Renews on ${sub.currentPeriodEnd.toLocaleDateString()}`}
                </p>
              )}
              {!isActive && (
                <p className="mt-1 text-sm text-gray-500">
                  Upgrade to unlock premium templates, custom colors, more pages,
                  and advanced analytics.
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                workspace.plan === "pro"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {workspace.plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            {workspace.plan !== "pro" && (
              <Link
                href="/pricing"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Upgrade to Pro
              </Link>
            )}
            {portalUrl && (
              <a
                href={portalUrl}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Manage Subscription
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
