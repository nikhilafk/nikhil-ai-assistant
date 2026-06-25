/**
 * LINE Webhook Handler
 * Processes incoming messages from LINE and orchestrates AI responses
 */
import { Hono } from "hono";
import type { MessageEvent, WebhookEvent, WebhookRequestBody } from "@line/bot-sdk";
import { getDb } from "../queries/connection";
import { conversations, lineUsers, leads, consultations } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  sendTextMessage,
  replyMessage,
  validateSignature,
  getUserProfile,
} from "../services/line-service";
import {
  generateCompletion,
  detectLeadIntent,
  detectBookingIntent,
} from "../services/openai-service";
import { ragPipeline } from "../services/rag-service";
import {
  detectLanguage,
  detectLanguageSwitch,
  getWelcomeMessage,
} from "../services/multilingual-service";
import {
  getConversationState,
  updateState,
  isCollectingLead,
  isCollectingBooking,
  processLeadStep,
  processBookingStep,
  startLeadCollection,
  startBookingCollection,
} from "../services/lead-service";
import { syncLeadToSheet, syncConsultationToSheet } from "../services/sheets-service";
import { trackEvent } from "../services/analytics-service";

const lineRouter = new Hono();

// ─── Webhook endpoint ───
lineRouter.post("/", async (c) => {
  try {
    // Validate signature
    const body = await c.req.text();
    const signature = c.req.header("x-line-signature") || "";

    if (!validateSignature(body, signature)) {
      console.warn("Invalid LINE signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const payload: WebhookRequestBody = JSON.parse(body);

    // Process each event
    for (const event of payload.events) {
      await handleEvent(event);
    }

    return c.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Internal error" }, 500);
  }
});

// ─── Event handler ───
async function handleEvent(event: WebhookEvent) {
  // Only handle message events for now
  if (event.type !== "message" && event.type !== "postback") return;

  const lineUserId = event.source.userId;
  if (!lineUserId) return;

  const db = getDb();

  // Upsert LINE user
  let [user] = await db
    .select()
    .from(lineUsers)
    .where(eq(lineUsers.lineUserId, lineUserId))
    .limit(1);

  if (!user) {
    // Try to get profile
    const profileResult = await getUserProfile(lineUserId);
    const displayName = profileResult.success
      ? profileResult.profile?.displayName
      : null;

    const [inserted] = await db.insert(lineUsers).values({
      lineUserId,
      displayName: displayName || "Unknown",
      language: "en",
    });

    const [newUser] = await db
      .select()
      .from(lineUsers)
      .where(eq(lineUsers.id, inserted.insertId))
      .limit(1);
    user = newUser;
  } else {
    // Update last seen
    await db
      .update(lineUsers)
      .set({ lastSeen: new Date() })
      .where(eq(lineUsers.id, user.id));
  }

  // Track message event
  trackEvent("message", { lineUserId: user.id }, user.id);

  // Handle postback (rich menu clicks)
  if (event.type === "postback") {
    await handlePostback(lineUserId, event.postback.data, user.language || "en");
    return;
  }

  // Only handle text messages
  if (event.type !== "message" || event.message.type !== "text") {
    await sendTextMessage(
      lineUserId,
      user.language === "zh"
        ? "抱歉，我目前只能處理文字訊息。請用文字與我交流！"
        : "Sorry, I can only process text messages right now. Please send me a text!"
    );
    return;
  }

  const messageText = event.message.text;
  const replyToken = event.replyToken;

  // Detect language
  const langSwitch = detectLanguageSwitch(messageText);
  let language = user.language || "en";

  if (langSwitch) {
    language = langSwitch;
    await db
      .update(lineUsers)
      .set({ language })
      .where(eq(lineUsers.id, user.id));
    trackEvent("language_switch", { from: user.language, to: language }, user.id);
  } else {
    const detected = detectLanguage(messageText);
    if (detected !== "unknown" && detected !== language) {
      language = detected;
      await db
        .update(lineUsers)
        .set({ language })
        .where(eq(lineUsers.id, user.id));
    }
  }

  // Store inbound message
  await db.insert(conversations).values({
    lineUserId: user.id,
    messageType: "text",
    direction: "inbound",
    content: messageText,
    language,
  });

  // ─── Process message ───
  const response = await processMessage(messageText, lineUserId, user.id, language);

  // Store outbound message
  if (response) {
    await db.insert(conversations).values({
      lineUserId: user.id,
      messageType: "text",
      direction: "outbound",
      content: response.substring(0, 4000),
      aiProcessed: true,
      language,
    });

    // Send response (use reply for immediate response, push for async)
    if (replyToken) {
      await replyMessage(replyToken, response);
    } else {
      await sendTextMessage(lineUserId, response);
    }
  }
}

// ─── Postback handler (Rich Menu) ───
async function handlePostback(
  lineUserId: string,
  data: string,
  language: string
) {
  trackEvent("menu_click", { action: data });

  switch (data) {
    case "menu_about":
      await sendTextMessage(
        lineUserId,
        language === "zh"
          ? `👤 關於 Nikhil\n\nNikhil 是一位熱愛 AI 自動化、網頁開發和網路安全的科技愛好者。\n\n他致力於構建 AI 驅動的系統、自動化解決方案和商業技術產品。\n\n目標：\n• 構建有用的 AI 系統\n• 創建自動化解決方案\n• 開發商業技術產品`
          : `👤 About Nikhil\n\nNikhil is a technology enthusiast passionate about AI Automation, Web Development, and Cybersecurity.\n\nHe builds AI-powered systems, automation solutions, and business technology products.\n\nGoals:\n• Build useful AI systems\n• Create automation solutions\n• Develop business technology products`
      );
      break;

    case "menu_skills":
      await sendTextMessage(
        lineUserId,
        language === "zh"
          ? `💻 Nikhil 的技能\n\n**網頁開發**：\n• HTML, CSS, JavaScript\n• 前端開發\n• 後端概念\n• 網站創建\n\n**網路安全**：\n• 安全意識\n• 認證概念\n• 風險評估\n• 安全最佳實踐\n\n**AI 自動化**：\n• 聊天機器人\n• AI 助理\n• 工作流程自動化\n• 商業流程自動化`
          : `💻 Nikhil's Skills\n\n**Web Development**:\n• HTML, CSS, JavaScript\n• Frontend Development\n• Backend Concepts\n• Website Creation\n\n**Cybersecurity**:\n• Security Awareness\n• Authentication Concepts\n• Risk Assessment\n• Security Best Practices\n\n**AI Automation**:\n• Chatbots\n• AI Assistants\n• Workflow Automation\n• Business Process Automation`
      );
      break;

    case "menu_services":
      await sendTextMessage(
        lineUserId,
        language === "zh"
          ? `🛠️ 服務項目\n\n1. **網站開發** - 現代化響應式網站\n2. **AI 聊天機器人** - LINE 整合智能機器人\n3. **工作流程自動化** - 商業流程自動化\n4. **AI 整合** - 為現有系統添加 AI 功能\n5. **商業諮詢** - 技術策略與實施\n6. **LINE 官方帳號設定** - 完整 LINE 商業整合\n\n有興趣嗎？請告訴我您的需求！`
          : `🛠️ Services\n\n1. **Website Development** - Modern responsive websites\n2. **AI Chatbots** - LINE-integrated smart bots\n3. **Workflow Automation** - Business process automation\n4. **AI Integration** - Add AI to existing systems\n5. **Business Consulting** - Technology strategy\n6. **LINE Official Account Setup** - Full LINE integration\n\nInterested? Tell me about your needs!`
      );
      break;

    case "menu_projects":
      await sendTextMessage(
        lineUserId,
        language === "zh"
          ? `📁 專案作品\n\n1. **Nikhil AI Assistant** - 多語言 AI 聊天機器人\n2. **LINE 商業整合** - 自動化客戶服務\n3. **網頁應用程式** - 現代化響應式網站\n4. **自動化工作流程** - AI 商業流程自動化\n\n想查看更多作品或開始您的專案？`
          : `📁 Projects\n\n1. **Nikhil AI Assistant** - Multilingual AI chatbot\n2. **LINE Business Integrations** - Automated customer service\n3. **Web Applications** - Modern responsive websites\n4. **Automation Workflows** - AI business process automation\n\nWant to see more or start your project?`
      );
      break;

    case "menu_contact":
      await sendTextMessage(
        lineUserId,
        language === "zh"
          ? `📞 聯絡資訊\n\n您可以透過此聊天與 Nikhil 聯繫！\n\n如需協助：\n• 了解服務\n• 提交專案需求\n• 預約諮詢\n• 一般問題\n\n請隨時告訴我您的需求！`
          : `📞 Contact Information\n\nYou can reach Nikhil through this chat!\n\nFor assistance with:\n• Learning about services\n• Submitting project requirements\n• Booking a consultation\n• General questions\n\nFeel free to tell me what you need!`
      );
      break;

    case "menu_book":
      const bookingStart = startBookingCollection(lineUserId, language);
      await sendTextMessage(lineUserId, bookingStart);
      break;

    default:
      await sendTextMessage(
        lineUserId,
        language === "zh" ? "收到！有什麼我可以幫您的嗎？" : "Got it! How can I help you?"
      );
  }
}

// ─── Main message processing ───
async function processMessage(
  message: string,
  lineUserId: string,
  userDbId: number,
  language: string
): Promise<string> {
  const lower = message.toLowerCase().trim();

  // 1. Check for greetings
  if (
    ["hello", "hi", "hey", "你好", "嗨", "哈囉", "您好"].includes(lower)
  ) {
    return getWelcomeMessage(language);
  }

  // 2. Check if in lead collection flow
  if (isCollectingLead(lineUserId)) {
    const result = await processLeadStep(lineUserId, message, language);
    if (result.isComplete && result.summary) {
      // Sync to Google Sheets (async, don't wait)
      const db = getDb();
      const [latestLead] = await db
        .select()
        .from(leads)
        .orderBy(desc(leads.createdAt))
        .limit(1);
      if (latestLead) {
        syncLeadToSheet(latestLead).catch(console.error);
      }
      return result.summary;
    }
    return result.nextPrompt || "Thank you!";
  }

  // 3. Check if in booking collection flow
  if (isCollectingBooking(lineUserId)) {
    const result = await processBookingStep(lineUserId, message, language);
    if (result.isComplete && result.confirmMessage) {
      // Sync to Google Sheets
      const db = getDb();
      const [latestBooking] = await db
        .select()
        .from(consultations)
        .orderBy(desc(consultations.createdAt))
        .limit(1);
      if (latestBooking) {
        syncConsultationToSheet(latestBooking).catch(console.error);
      }
      return result.confirmMessage;
    }
    return result.nextPrompt || "Thank you!";
  }

  // 4. Check for lead intent
  const hasLeadIntent = await detectLeadIntent(message);
  if (hasLeadIntent) {
    const leadStart = startLeadCollection(lineUserId, language);
    // Store first response as name if it's a simple phrase
    if (message.length < 50) {
      updateState(lineUserId, {
        leadData: { name: message },
        step: 1,
      });
      const isZh = language === "zh" || language === "zh-TW";
      return (
        leadStart +
        "\n\n" +
        (isZh
          ? `謝謝！請問您的公司名稱是？（沒有的話可以說沒有）`
          : `Thanks! What's your company name? (Say 'none' if you don't have one)`)
      );
    }
    return leadStart;
  }

  // 5. Check for booking intent
  const hasBookingIntent = detectBookingIntent(message);
  if (hasBookingIntent) {
    return startBookingCollection(lineUserId, language);
  }

  // 6. Run RAG pipeline
  const ragResult = await ragPipeline(message, language);
  if (ragResult.hasMatch && ragResult.response) {
    // Direct response from quick reply
    return ragResult.response;
  }

  // 7. Generate AI response with context
  const context = ragResult.context || "";

  // Get recent conversation history
  const db = getDb();
  const recentMessages = await db
    .select()
    .from(conversations)
    .where(eq(conversations.lineUserId, userDbId))
    .orderBy(desc(conversations.createdAt))
    .limit(6);

  const history = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.direction === "inbound" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

  const aiResult = await generateCompletion(message, {
    language,
    context,
    conversationHistory: history,
  });

  return aiResult.reply;
}

export default lineRouter;
