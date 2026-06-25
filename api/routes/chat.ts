/**
 * Chat Router — tRPC routes for chat management
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { conversations, lineUsers } from "@db/schema";
import { desc, eq, sql, count } from "drizzle-orm";

export const chatRouter = createRouter({
  // List conversations with optional filters
  list: adminQuery
    .input(
      z.object({
        lineUserId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      let query = db
        .select({
          id: conversations.id,
          lineUserId: conversations.lineUserId,
          messageType: conversations.messageType,
          direction: conversations.direction,
          content: conversations.content,
          aiProcessed: conversations.aiProcessed,
          language: conversations.language,
          tokensUsed: conversations.tokensUsed,
          createdAt: conversations.createdAt,
          displayName: lineUsers.displayName,
          lineUserExternalId: lineUsers.lineUserId,
        })
        .from(conversations)
        .leftJoin(lineUsers, sql`${conversations.lineUserId} = ${lineUsers.id}`)
        .orderBy(desc(conversations.createdAt))
        .limit(limit)
        .offset(offset);

      const results = await query;

      const [totalResult] = await db
        .select({ count: count() })
        .from(conversations);

      return {
        conversations: results,
        total: totalResult?.count ?? 0,
      };
    }),

  // Get conversations for a specific LINE user
  byUser: adminQuery
    .input(z.object({ lineUserId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(conversations)
        .where(eq(conversations.lineUserId, input.lineUserId))
        .orderBy(desc(conversations.createdAt))
        .limit(100);

      return results;
    }),

  // Get chat sessions (grouped by user)
  sessions: adminQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      const results = await db
        .select({
          lineUserId: lineUsers.id,
          externalId: lineUsers.lineUserId,
          displayName: lineUsers.displayName,
          language: lineUsers.language,
          firstSeen: lineUsers.firstSeen,
          lastSeen: lineUsers.lastSeen,
          messageCount: count(conversations.id),
        })
        .from(lineUsers)
        .leftJoin(conversations, sql`${conversations.lineUserId} = ${lineUsers.id}`)
        .groupBy(lineUsers.id)
        .orderBy(desc(lineUsers.lastSeen))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(lineUsers);

      return {
        sessions: results,
        total: totalResult?.count ?? 0,
      };
    }),
});
