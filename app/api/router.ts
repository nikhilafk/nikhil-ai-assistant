import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { chatRouter } from "./routes/chat";
import { leadRouter } from "./routes/leads";
import { consultationRouter } from "./routes/consultations";
import { analyticsRouter } from "./routes/analytics";
import { knowledgeBaseRouter } from "./routes/knowledge-base";
import { adminRouter } from "./routes/admin";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  chat: chatRouter,
  lead: leadRouter,
  consultation: consultationRouter,
  analytics: analyticsRouter,
  knowledgeBase: knowledgeBaseRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
