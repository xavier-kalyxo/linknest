import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

// DrizzleAdapter's internal queries fail on Vercel with opaque NeonDbError.
// Override critical methods with direct Drizzle queries that work reliably.
const baseAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

const adapter = {
  ...baseAdapter,
  async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  },
  async createVerificationToken(data: {
    identifier: string;
    token: string;
    expires: Date;
  }) {
    const [created] = await db
      .insert(verificationTokens)
      .values(data)
      .returning();
    return created ?? null;
  },
  async useVerificationToken(data: { identifier: string; token: string }) {
    const [existing] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, data.identifier),
          eq(verificationTokens.token, data.token),
        ),
      )
      .limit(1);
    if (!existing) return null;
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, data.identifier),
          eq(verificationTokens.token, data.token),
        ),
      );
    return existing;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    {
      id: "email",
      name: "Email",
      type: "email",
      from: process.env.EMAIL_FROM || "LinkNest <noreply@linknest.click>",
      maxAge: 24 * 60 * 60,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
      options: {},
    },
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Only allow login if email is verified
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    verifyRequest: "/check-email",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
