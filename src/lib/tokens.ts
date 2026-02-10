import crypto from "crypto";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this email
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, email));

  // Insert new token
  const [created] = await db
    .insert(verificationTokens)
    .values({
      identifier: email,
      token,
      expires,
    })
    .returning();

  return created;
}

export async function verifyToken(email: string, token: string) {
  const [existing] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    )
    .limit(1);

  if (!existing) return null;
  if (existing.expires < new Date()) return null;

  // Delete the token (one-time use)
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    );

  return existing;
}
