import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  json,
  int,
  bigint,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── OAuth Users (admin dashboard) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── LINE Users ───
export const lineUsers = mysqlTable("line_users", {
  id: serial("id").primaryKey(),
  lineUserId: varchar("line_user_id", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  language: varchar("language", { length: 10 }).default("en"),
  firstSeen: timestamp("first_seen").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  metadata: json("metadata"),
});

export type LineUser = typeof lineUsers.$inferSelect;
export type InsertLineUser = typeof lineUsers.$inferInsert;

// ─── Conversations ───
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  lineUserId: bigint("line_user_id", { mode: "number", unsigned: true }).notNull(),
  messageType: mysqlEnum("message_type", ["text", "image", "template", "richmenu", "postback"]).default("text").notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  content: text("content").notNull(),
  aiProcessed: boolean("ai_processed").default(false),
  language: varchar("language", { length: 10 }).default("en"),
  tokensUsed: int("tokens_used").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ─── Leads ───
export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  lineUserId: bigint("line_user_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  projectType: mysqlEnum("project_type", [
    "website",
    "automation",
    "chatbot",
    "ai_integration",
    "consulting",
    "other",
  ]).default("other"),
  budget: varchar("budget", { length: 50 }),
  deadline: varchar("deadline", { length: 50 }),
  requirements: text("requirements"),
  status: mysqlEnum("status", ["new", "qualified", "contacted", "converted", "lost"]).default("new"),
  source: varchar("source", { length: 50 }).default("line"),
  aiSummary: text("ai_summary"),
  syncedToSheets: boolean("synced_to_sheets").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Consultations ───
export const consultations = mysqlTable("consultations", {
  id: serial("id").primaryKey(),
  lineUserId: bigint("line_user_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  preferredDate: date("preferred_date"),
  preferredTime: varchar("preferred_time", { length: 50 }),
  contactMethod: mysqlEnum("contact_method", ["line", "email", "phone"]).default("line"),
  topic: varchar("topic", { length: 255 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

// ─── Knowledge Base ───
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: serial("id").primaryKey(),
  category: mysqlEnum("category", ["about", "skills", "services", "faq", "projects"]).notNull(),
  questionEn: varchar("question_en", { length: 500 }),
  questionZh: varchar("question_zh", { length: 500 }),
  answerEn: text("answer_en").notNull(),
  answerZh: text("answer_zh").notNull(),
  keywords: json("keywords"),
  embedding: json("embedding"),
  isActive: boolean("is_active").default(true),
  priority: int("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type KnowledgeItem = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeItem = typeof knowledgeBase.$inferInsert;

// ─── Analytics Events ───
export const analyticsEvents = mysqlTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: mysqlEnum("event_type", [
    "message",
    "lead",
    "consultation",
    "menu_click",
    "language_switch",
    "error",
  ]).notNull(),
  lineUserId: bigint("line_user_id", { mode: "number", unsigned: true }),
  sessionId: varchar("session_id", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ─── Quick Replies ───
export const quickReplies = mysqlTable("quick_replies", {
  id: serial("id").primaryKey(),
  triggerPhrase: varchar("trigger_phrase", { length: 255 }).notNull(),
  responseEn: text("response_en").notNull(),
  responseZh: text("response_zh").notNull(),
  actionType: mysqlEnum("action_type", ["reply", "url", "postback"]).default("reply"),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  priority: int("priority").default(0),
});

export type QuickReply = typeof quickReplies.$inferSelect;
export type InsertQuickReply = typeof quickReplies.$inferInsert;
