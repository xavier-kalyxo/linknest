/**
 * Seed script for development data.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Requires DATABASE_URL to be set in .env.local
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  users,
  workspaces,
  workspaceMembers,
  pages,
  blocks,
} from "./schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Create a .env.local file.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // ─── Create test user ──────────────────────────────────────────────────
  const [user] = await db
    .insert(users)
    .values({
      email: "test@linknest.com",
      name: "Test User",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=TU",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (!user) {
    console.log("Test user already exists, skipping seed.");
    return;
  }

  console.log(`  Created user: ${user.email}`);

  // ─── Create workspace ─────────────────────────────────────────────────
  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "Test User",
      slug: "testuser",
    })
    .returning();

  console.log(`  Created workspace: @${workspace.slug}`);

  // ─── Link user to workspace ───────────────────────────────────────────
  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role: "owner",
  });

  // ─── Create page ──────────────────────────────────────────────────────
  const [page] = await db
    .insert(pages)
    .values({
      workspaceId: workspace.id,
      slug: "testuser",
      title: "Test User",
      bio: "Welcome to my LinkNest page! Here are my links.",
      templateId: "clean-slate",
      theme: {},
      isPublished: true,
      publishedAt: new Date(),
    })
    .returning();

  console.log(`  Created page: @${page.slug}`);

  // ─── Create sample blocks ─────────────────────────────────────────────
  const sampleBlocks = [
    {
      pageId: page.id,
      type: "header",
      position: 0,
      label: "My Links",
      isVisible: true,
    },
    {
      pageId: page.id,
      type: "link",
      position: 1,
      label: "My Portfolio",
      url: "https://example.com",
      isVisible: true,
    },
    {
      pageId: page.id,
      type: "link",
      position: 2,
      label: "Twitter / X",
      url: "https://x.com/testuser",
      isVisible: true,
    },
    {
      pageId: page.id,
      type: "link",
      position: 3,
      label: "YouTube Channel",
      url: "https://youtube.com/@testuser",
      isVisible: true,
    },
    {
      pageId: page.id,
      type: "divider",
      position: 4,
      isVisible: true,
    },
    {
      pageId: page.id,
      type: "text",
      position: 5,
      label: "Thanks for visiting!",
      content: { text: "Feel free to reach out on any of my socials above." },
      isVisible: true,
    },
  ];

  await db.insert(blocks).values(sampleBlocks);
  console.log(`  Created ${sampleBlocks.length} blocks`);

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
