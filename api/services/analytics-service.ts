/**
 * Analytics Service
 * Tracks and aggregates metrics for the dashboard
 */
import { getDb } from "../queries/connection";
import {
  lineUsers,
  conversations,
  leads,
  consultations,
  analyticsEvents,
} from "@db/schema";
import { eq, count, sql, desc, gte, and } from "drizzle-orm";

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: "message" | "lead" | "consultation" | "menu_click" | "language_switch" | "error",
  metadata: Record<string, any> = {},
  lineUserId?: number
) {
  try {
    const db = getDb();
    await db.insert(analyticsEvents).values({
      eventType,
      lineUserId,
      sessionId: metadata.sessionId || null,
      metadata,
    });
  } catch (error) {
    console.error("Track event error:", error);
  }
}

/**
 * Get dashboard KPIs
 */
export async function getDashboardStats(period: "7d" | "30d" | "90d" = "30d") {
  const db = getDb();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total LINE users
  const [usersResult] = await db
    .select({ count: count() })
    .from(lineUsers);

  // New users in period
  const [newUsersResult] = await db
    .select({ count: count() })
    .from(lineUsers)
    .where(gte(lineUsers.firstSeen, since));

  // Total messages in period
  const [messagesResult] = await db
    .select({ count: count() })
    .from(conversations)
    .where(gte(conversations.createdAt, since));

  // Total leads
  const [leadsResult] = await db
    .select({ count: count() })
    .from(leads)
    .where(gte(leads.createdAt, since));

  // Total consultations
  const [consultationsResult] = await db
    .select({ count: count() })
    .from(consultations)
    .where(gte(consultations.createdAt, since));

  // Lead status breakdown
  const leadStatusBreakdown = await db
    .select({
      status: leads.status,
      count: count(),
    })
    .from(leads)
    .where(gte(leads.createdAt, since))
    .groupBy(leads.status);

  // Consultation status breakdown
  const consultationStatusBreakdown = await db
    .select({
      status: consultations.status,
      count: count(),
    })
    .from(consultations)
    .where(gte(consultations.createdAt, since))
    .groupBy(consultations.status);

  // Language distribution
  const languageDist = await db
    .select({
      language: lineUsers.language,
      count: count(),
    })
    .from(lineUsers)
    .groupBy(lineUsers.language);

  // Messages per day (last 7 days)
  const messagesPerDay = await db
    .select({
      date: sql<string>`DATE(${conversations.createdAt})`,
      count: count(),
    })
    .from(conversations)
    .where(gte(conversations.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
    .groupBy(sql`DATE(${conversations.createdAt})`)
    .orderBy(sql`DATE(${conversations.createdAt})`);

  // Conversion rate: conversations that became leads
  const totalConversations = await db
    .select({ count: count() })
    .from(conversations)
    .where(and(
      gte(conversations.createdAt, since),
      eq(conversations.direction, "inbound")
    ));

  const totalLeadsAllTime = await db.select({ count: count() }).from(leads);

  const conversionRate =
    totalConversations[0]?.count && totalConversations[0].count > 0
      ? ((totalLeadsAllTime[0]?.count || 0) / totalConversations[0].count * 100).toFixed(1)
      : "0";

  return {
    totalUsers: usersResult?.count || 0,
    newUsers: newUsersResult?.count || 0,
    totalMessages: messagesResult?.count || 0,
    totalLeads: leadsResult?.count || 0,
    totalConsultations: consultationsResult?.count || 0,
    conversionRate,
    leadStatusBreakdown,
    consultationStatusBreakdown,
    languageDistribution: languageDist,
    messagesPerDay,
    period,
  };
}

/**
 * Get recent activity for dashboard feed
 */
export async function getRecentActivity(limit: number = 20) {
  const db = getDb();

  const recentConversations = await db
    .select({
      id: conversations.id,
      type: sql<string>`'message'`,
      content: conversations.content,
      direction: conversations.direction,
      createdAt: conversations.createdAt,
      lineUserId: lineUsers.lineUserId,
      displayName: lineUsers.displayName,
    })
    .from(conversations)
    .leftJoin(lineUsers, sql`${conversations.lineUserId} = ${lineUsers.id}`)
    .orderBy(desc(conversations.createdAt))
    .limit(limit);

  const recentLeads = await db
    .select({
      id: leads.id,
      type: sql<string>`'lead'`,
      name: leads.name,
      projectType: leads.projectType,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(10);

  const recentConsultations = await db
    .select({
      id: consultations.id,
      type: sql<string>`'consultation'`,
      name: consultations.name,
      topic: consultations.topic,
      status: consultations.status,
      preferredDate: consultations.preferredDate,
      createdAt: consultations.createdAt,
    })
    .from(consultations)
    .orderBy(desc(consultations.createdAt))
    .limit(10);

  return {
    conversations: recentConversations,
    leads: recentLeads,
    consultations: recentConsultations,
  };
}

/**
 * Get lead statistics for charts
 */
export async function getLeadStats(period: "7d" | "30d" | "90d" = "30d") {
  const db = getDb();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  // Leads per day
  const leadsPerDay = await db
    .select({
      date: sql<string>`DATE(${leads.createdAt})`,
      count: count(),
    })
    .from(leads)
    .where(gte(leads.createdAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
    .groupBy(sql`DATE(${leads.createdAt})`)
    .orderBy(sql`DATE(${leads.createdAt})`);

  // Leads by project type
  const leadsByType = await db
    .select({
      projectType: leads.projectType,
      count: count(),
    })
    .from(leads)
    .groupBy(leads.projectType);

  // Leads by source
  const leadsBySource = await db
    .select({
      source: leads.source,
      count: count(),
    })
    .from(leads)
    .groupBy(leads.source);

  return { leadsPerDay, leadsByType, leadsBySource };
}
