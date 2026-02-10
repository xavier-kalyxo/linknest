import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  const verified = await verifyToken(email, token);
  if (!verified) {
    return NextResponse.redirect(new URL("/login?error=expired-token", req.url));
  }

  // Mark the user's email as verified
  await db
    .update(users)
    .set({ emailVerified: new Date(), updatedAt: new Date() })
    .where(eq(users.email, email));

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
