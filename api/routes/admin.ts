/**
 * Admin Router — tRPC routes for admin dashboard data
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { lineUsers, conversations, leads, consultations, knowledgeBase, analyticsEvents } from "@db/schema";
import { desc, count, sql, gte } from "drizzle-orm";

export const adminRouter = createRouter({
  // Overall stats for dashboard header
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [usersResult] = await db.select({ count: count() }).from(lineUsers);
    const [messagesResult] = await db.select({ count: count() }).from(conversations);
    const [leadsResult] = await db.select({ count: count() }).from(leads);
    const [consultationsResult] = await db.select({ count: count() }).from(consultations);
    const [kbResult] = await db.select({ count: count() }).from(knowledgeBase).where(eq(knowledgeBase.isActive, true));

    return {
      totalUsers: usersResult?.count ?? 0,
      totalMessages: messagesResult?.count ?? 0,
      totalLeads: leadsResult?.count ?? 0,
      totalConsultations: consultationsResult?.count ?? 0,
      activeKbEntries: kbResult?.count ?? 0,
    };
  }),

  // Recent users
  recentUsers: adminQuery
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 10;

      return db
        .select()
        .from(lineUsers)
        .orderBy(desc(lineUsers.lastSeen))
        .limit(limit);
    }),

  // Messages over time (for chart)
  messagesOverTime: adminQuery
    .input(z.object({ days: z.number().default(7) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 7;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      return db
        .select({
          date: sql<string>`DATE(${conversations.createdAt})`,
          inbound: sql<number>`SUM(CASE WHEN ${conversations.direction} = 'inbound' THEN 1 ELSE 0 END)`,
          outbound: sql<number>`SUM(CASE WHEN ${conversations.direction} = 'outbound' THEN 1 ELSE 0 END)`,
        })
        .from(conversations)
        .where(gte(conversations.createdAt, since))
        .groupBy(sql`DATE(${conversations.createdAt})`)
        .orderBy(sql`DATE(${conversations.createdAt})`);
    }),

  // Settings (placeholder for future config)
  settings: adminQuery.query(async () => {
    return {
      lineWebhook: process.env.LINE_CHANNEL_ID ? "Configured" : "Not configured",
      openai: process.env.OPENAI_API_KEY ? "Configured" : "Not configured",
      googleSheets: process.env.GOOGLE_SHEETS_ID ? "Configured" : "Not configured",
      autoSync: true,
      defaultLanguage: "en",
    };
  }),
});
