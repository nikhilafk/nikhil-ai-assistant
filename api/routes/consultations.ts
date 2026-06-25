/**
 * Consultations Router — tRPC routes for booking management
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { consultations, lineUsers } from "@db/schema";
import { desc, eq, sql, count, and } from "drizzle-orm";

export const consultationRouter = createRouter({
  // List consultations with filters
  list: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
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
        conditions = eq(consultations.status, input.status as any);
      }

      const results = await db
        .select({
          id: consultations.id,
          lineUserId: consultations.lineUserId,
          name: consultations.name,
          email: consultations.email,
          phone: consultations.phone,
          preferredDate: consultations.preferredDate,
          preferredTime: consultations.preferredTime,
          contactMethod: consultations.contactMethod,
          topic: consultations.topic,
          notes: consultations.notes,
          status: consultations.status,
          createdAt: consultations.createdAt,
          updatedAt: consultations.updatedAt,
          displayName: lineUsers.displayName,
        })
        .from(consultations)
        .leftJoin(lineUsers, sql`${consultations.lineUserId} = ${lineUsers.id}`)
        .where(conditions)
        .orderBy(desc(consultations.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(consultations)
        .where(conditions);

      return {
        consultations: results,
        total: totalResult?.count ?? 0,
      };
    }),

  // Get single consultation
  get: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [consultation] = await db
        .select()
        .from(consultations)
        .where(eq(consultations.id, input.id))
        .limit(1);
      return consultation ?? null;
    }),

  // Update consultation
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db
        .update(consultations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(consultations.id, id));

      const [updated] = await db
        .select()
        .from(consultations)
        .where(eq(consultations.id, id))
        .limit(1);

      return updated;
    }),

  // Delete consultation
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(consultations).where(eq(consultations.id, input.id));
      return { success: true };
    }),

  // Get statistics
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [totalResult] = await db.select({ count: count() }).from(consultations);

    const byStatus = await db
      .select({ status: consultations.status, count: count() })
      .from(consultations)
      .groupBy(consultations.status);

    return {
      total: totalResult?.count ?? 0,
      byStatus,
    };
  }),
});
