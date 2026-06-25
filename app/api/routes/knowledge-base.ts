/**
 * Knowledge Base Router — tRPC routes for KB management
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { knowledgeBase } from "@db/schema";
import { desc, eq, count, like, and } from "drizzle-orm";

export const knowledgeBaseRouter = createRouter({
  // List KB entries with filters
  list: adminQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      let conditions = undefined;

      if (input?.category) {
        conditions = eq(knowledgeBase.category, input.category as any);
      }

      if (input?.search) {
        const searchCond = or(
          like(knowledgeBase.questionEn, `%${input.search}%`),
          like(knowledgeBase.answerEn, `%${input.search}%`),
          like(knowledgeBase.questionZh, `%${input.search}%`),
          like(knowledgeBase.answerZh, `%${input.search}%`)
        );
        conditions = conditions ? and(conditions, searchCond) : searchCond;
      }

      const results = await db
        .select()
        .from(knowledgeBase)
        .where(conditions)
        .orderBy(desc(knowledgeBase.priority))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(knowledgeBase)
        .where(conditions);

      return {
        items: results,
        total: totalResult?.count ?? 0,
      };
    }),

  // Get single KB entry
  get: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [item] = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.id, input.id))
        .limit(1);
      return item ?? null;
    }),

  // Create KB entry
  create: adminQuery
    .input(
      z.object({
        category: z.enum(["about", "skills", "services", "faq", "projects"]),
        questionEn: z.string().min(1),
        questionZh: z.string().optional(),
        answerEn: z.string().min(1),
        answerZh: z.string().min(1),
        keywords: z.array(z.string()).optional(),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [item] = await db.insert(knowledgeBase).values({
        ...input,
        keywords: input.keywords ?? [],
        isActive: true,
      });

      const [created] = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.id, item.insertId))
        .limit(1);

      return created;
    }),

  // Update KB entry
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        category: z.enum(["about", "skills", "services", "faq", "projects"]).optional(),
        questionEn: z.string().optional(),
        questionZh: z.string().optional(),
        answerEn: z.string().optional(),
        answerZh: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db
        .update(knowledgeBase)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(knowledgeBase.id, id));

      const [updated] = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.id, id))
        .limit(1);

      return updated;
    }),

  // Delete KB entry
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      return { success: true };
    }),

  // Get categories breakdown
  categories: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        category: knowledgeBase.category,
        count: count(),
      })
      .from(knowledgeBase)
      .where(eq(knowledgeBase.isActive, true))
      .groupBy(knowledgeBase.category);
  }),
});

// Helpers
function or(...conditions: any[]) {
  return sql`(${conditions.join(" OR ")})`;
}
