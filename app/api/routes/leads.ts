/**
 * Leads Router — tRPC routes for lead management
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leads, lineUsers } from "@db/schema";
import { desc, eq, sql, count, and, like } from "drizzle-orm";

export const leadRouter = createRouter({
  // List leads with filters
  list: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
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

      if (input?.status) {
        conditions = eq(leads.status, input.status as any);
      }

      if (input?.search) {
        const searchCond = or(
          like(leads.name, `%${input.search}%`),
          like(leads.email, `%${input.search}%`),
          like(leads.company, `%${input.search}%`)
        );
        conditions = conditions ? and(conditions, searchCond) : searchCond;
      }

      const results = await db
        .select({
          id: leads.id,
          lineUserId: leads.lineUserId,
          name: leads.name,
          company: leads.company,
          industry: leads.industry,
          email: leads.email,
          phone: leads.phone,
          projectType: leads.projectType,
          budget: leads.budget,
          deadline: leads.deadline,
          requirements: leads.requirements,
          status: leads.status,
          source: leads.source,
          aiSummary: leads.aiSummary,
          syncedToSheets: leads.syncedToSheets,
          createdAt: leads.createdAt,
          updatedAt: leads.updatedAt,
          displayName: lineUsers.displayName,
        })
        .from(leads)
        .leftJoin(lineUsers, sql`${leads.lineUserId} = ${lineUsers.id}`)
        .where(conditions)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(leads)
        .where(conditions);

      return {
        leads: results,
        total: totalResult?.count ?? 0,
      };
    }),

  // Get single lead
  get: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.id))
        .limit(1);
      return lead ?? null;
    }),

  // Update lead
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "qualified", "contacted", "converted", "lost"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db
        .update(leads)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, id));

      const [updated] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      return updated;
    }),

  // Delete lead
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(leads).where(eq(leads.id, input.id));
      return { success: true };
    }),

  // Get lead statistics
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [totalResult] = await db.select({ count: count() }).from(leads);

    const byStatus = await db
      .select({ status: leads.status, count: count() })
      .from(leads)
      .groupBy(leads.status);

    const byType = await db
      .select({ projectType: leads.projectType, count: count() })
      .from(leads)
      .groupBy(leads.projectType);

    const bySource = await db
      .select({ source: leads.source, count: count() })
      .from(leads)
      .groupBy(leads.source);

    return {
      total: totalResult?.count ?? 0,
      byStatus,
      byType,
      bySource,
    };
  }),
});

// Helper for OR conditions
function or(...conditions: any[]) {
  return sql`(${conditions.join(" OR ")})`;
}
