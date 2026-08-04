"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, pages } from "@/lib/db/schema";
import { validateSlug, normalizeSlug } from "@/lib/slugs";
import { isSlugTaken } from "@/lib/queries";
import { checkRateLimit, mutationRateLimit } from "@/lib/rate-limit";

const onboardingSchema = z.object({
  slug: z.string().min(3).max(63),
  title: z.string().min(1).max(255),
});

export type OnboardingState = {
  error?: string;
};

export async function checkSlugAvailability(slug: string) {
  // Requires a session and is rate limited: an open, unlimited endpoint here is
  // an oracle for enumerating every handle on the platform.
  const session = await auth();
  if (!session?.user?.id) {
    return { available: false, reason: "You must be signed in." };
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) {
    return { available: false, reason: "Too many checks. Please slow down." };
  }

  const validation = validateSlug(slug);
  if (!validation.valid) {
    return { available: false, reason: validation.reason };
  }

  const taken = await isSlugTaken(normalizeSlug(slug));
  if (taken) {
    return { available: false, reason: "This username is already taken." };
  }

  return { available: true };
}

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const parsed = onboardingSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { error: "Invalid input. Please check your username and page title." };
  }

  const { title } = parsed.data;
  const slug = normalizeSlug(parsed.data.slug);

  // Validate slug format + reserved words
  const slugValidation = validateSlug(slug);
  if (!slugValidation.valid) {
    return { error: slugValidation.reason };
  }

  // Check uniqueness
  const taken = await isSlugTaken(slug);
  if (taken) {
    return { error: "This username is already taken. Try another." };
  }

  const userId = session.user.id;

  // All three rows or none. A partial write here strands the user with a
  // workspace but no page — the dashboard has no recovery path for that, so it
  // permanently bricks the account and squats the slug via the unique index.
  try {
    await db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspaces)
        .values({ name: title, slug })
        .returning({ id: workspaces.id });

      await tx.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: "owner",
      });

      await tx.insert(pages).values({
        workspaceId: workspace.id,
        slug,
        title,
        templateId: "clean-slate",
        theme: {},
      });
    });
  } catch (error) {
    // Someone claimed the slug between the availability check and the insert.
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate key") || message.includes("unique")) {
      return { error: "This username is already taken. Try another." };
    }
    console.error("[onboarding] Failed to create workspace:", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}
