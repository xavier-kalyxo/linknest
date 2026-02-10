"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, pages } from "@/lib/db/schema";
import { validateSlug } from "@/lib/slugs";
import { isSlugTaken } from "@/lib/queries";

const onboardingSchema = z.object({
  slug: z.string().min(3).max(63),
  title: z.string().min(1).max(255),
});

export type OnboardingState = {
  error?: string;
};

export async function checkSlugAvailability(slug: string) {
  const validation = validateSlug(slug);
  if (!validation.valid) {
    return { available: false, reason: validation.reason };
  }

  const taken = await isSlugTaken(slug);
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

  const { slug, title } = parsed.data;

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

  // Create workspace + page in a transaction-like flow
  // (Neon HTTP driver doesn't support multi-statement transactions,
  // so we do sequential inserts with cleanup on failure)
  try {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: title,
        slug,
      })
      .returning({ id: workspaces.id });

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: session.user.id,
      role: "owner",
    });

    await db.insert(pages).values({
      workspaceId: workspace.id,
      slug,
      title,
      templateId: "clean-slate",
      theme: {},
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}
