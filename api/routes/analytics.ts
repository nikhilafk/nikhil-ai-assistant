/**
 * Analytics Router — tRPC routes for dashboard analytics
 */
import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDashboardStats, getRecentActivity, getLeadStats } from "../services/analytics-service";

export const analyticsRouter = createRouter({
  // Dashboard KPIs
  dashboard: adminQuery
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      }).optional()
    )
    .query(async ({ input }) => {
      const period = input?.period ?? "30d";
      return getDashboardStats(period);
    }),

  // Recent activity feed
  recentActivity: adminQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      return getRecentActivity(input?.limit ?? 20);
    }),

  // Lead statistics for charts
  leadStats: adminQuery
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
      }).optional()
    )
    .query(async ({ input }) => {
      return getLeadStats(input?.period ?? "30d");
    }),
});
