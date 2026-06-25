import { relations } from "drizzle-orm";
import { users, lineUsers, conversations, leads, consultations, knowledgeBase, analyticsEvents } from "./schema";

export const lineUsersRelations = relations(lineUsers, ({ many }) => ({
  conversations: many(conversations),
  leads: many(leads),
  consultations: many(consultations),
  analyticsEvents: many(analyticsEvents),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  lineUser: one(lineUsers, {
    fields: [conversations.lineUserId],
    references: [lineUsers.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  lineUser: one(lineUsers, {
    fields: [leads.lineUserId],
    references: [lineUsers.id],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  lineUser: one(lineUsers, {
    fields: [consultations.lineUserId],
    references: [lineUsers.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  lineUser: one(lineUsers, {
    fields: [analyticsEvents.lineUserId],
    references: [lineUsers.id],
  }),
}));
