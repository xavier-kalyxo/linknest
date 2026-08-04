"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import { checkRateLimit, authRateLimit, emailRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationToken } from "@/lib/tokens";

// ─── Validation Schemas ─────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type AuthState = {
  error?: string;
  success?: string;
};

// ─── Register with Email + Password ─────────────────────────────────────────

export async function registerWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit by email
  const rl = await checkRateLimit(authRateLimit, `register:${normalizedEmail}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  const [existingUser] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  // Hash password (cost factor 12). Computed before branching so that the
  // response time does not reveal whether the address is already registered.
  const hashedPassword = await bcrypt.hash(password, 12);

  if (existingUser?.emailVerified) {
    // Deliberately the same generic response as the success path: returning
    // "this email already exists" here turns signup into an account oracle.
    return {
      success:
        "Check your email to finish setting up your account. If you already have one, sign in instead.",
    };
  }

  if (existingUser) {
    // The row exists but was never verified, so nobody has proven ownership of
    // this mailbox yet. Let the latest attempt replace the pending credentials
    // — otherwise whoever submitted the form first permanently locks the real
    // owner out of password signup. generateVerificationToken() invalidates the
    // earlier token, so only this attempt can be completed.
    await db
      .update(users)
      .set({ name, password: hashedPassword })
      .where(eq(users.id, existingUser.id));
  } else {
    // Create user (emailVerified is null — must verify before login)
    await db.insert(users).values({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      emailVerified: null,
    });
  }

  // Generate and send verification email
  const emailRl = await checkRateLimit(emailRateLimit, `email:${normalizedEmail}`);
  if (!emailRl.success) {
    return { success: "Check your email to verify your account." };
  }

  try {
    const token = await generateVerificationToken(normalizedEmail);
    await sendVerificationEmail({ to: normalizedEmail, token: token.token });
  } catch (error) {
    // The user row is already committed. Without this catch the action throws,
    // the account exists but is unverifiable, and re-registering is the only
    // recovery — so surface a retryable error instead of crashing.
    console.error("[register] Failed to send verification email:", error);
    return {
      error:
        "We couldn't send your verification email. Please try again in a moment.",
    };
  }

  return { success: "Check your email to verify your account." };
}

// ─── Login with Email + Password ────────────────────────────────────────────

export async function loginWithPassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const rl = await checkRateLimit(authRateLimit, `login:${parsed.data.email}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success — re-throw to let Next.js handle it
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: "Invalid email or password." };
  }

  return {}; // unreachable due to redirect
}

// ─── Send Magic Link ────────────────────────────────────────────────────────

export async function sendMagicLink(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  const rl = await checkRateLimit(emailRateLimit, `magic:${normalizedEmail}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    await signIn("email", {
      email: normalizedEmail,
      redirect: false,
    });
  } catch (error) {
    // signIn may throw NEXT_REDIRECT — re-throw
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // Log the actual error for debugging (visible in server logs)
    console.error("[magic-link] Failed to send:", error);
    return { error: "Unable to send sign-in email. Please try again later." };
  }

  return { success: "Check your email for a sign-in link." };
}
