/**
 * Lead Service
 * Handles lead qualification logic and conversation state management
 */
import { getDb } from "../queries/connection";
import { leads, conversations, lineUsers } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

// In-memory conversation state (use Redis in production)
const conversationStates = new Map<
  string,
  {
    state: "idle" | "collecting_lead" | "collecting_booking" | "menu";
    leadData: Partial<InferSelectModel<typeof leads>>;
    bookingData: Record<string, string>;
    step: number;
    lastActivity: number;
  }
>();

const LEAD_STEPS = [
  "name",
  "company",
  "industry",
  "email",
  "phone",
  "projectType",
  "budget",
  "deadline",
  "requirements",
] as const;

const BOOKING_STEPS = [
  "name",
  "email",
  "phone",
  "preferredDate",
  "preferredTime",
  "contactMethod",
  "topic",
] as const;

/**
 * Get or create conversation state for a user
 */
export function getConversationState(lineUserId: string) {
  const state = conversationStates.get(lineUserId);
  if (state && Date.now() - state.lastActivity > 30 * 60 * 1000) {
    // 30 min timeout
    conversationStates.delete(lineUserId);
    return createNewState(lineUserId);
  }
  return state || createNewState(lineUserId);
}

function createNewState(lineUserId: string) {
  const state = {
    state: "idle" as const,
    leadData: {} as Partial<InferSelectModel<typeof leads>>,
    bookingData: {} as Record<string, string>,
    step: 0,
    lastActivity: Date.now(),
  };
  conversationStates.set(lineUserId, state);
  return state;
}

/**
 * Update conversation state
 */
export function updateState(
  lineUserId: string,
  updates: Partial<ReturnType<typeof getConversationState>>
) {
  const current = getConversationState(lineUserId);
  const updated = { ...current, ...updates, lastActivity: Date.now() };
  conversationStates.set(lineUserId, updated);
  return updated;
}

/**
 * Reset conversation state
 */
export function resetState(lineUserId: string) {
  conversationStates.delete(lineUserId);
}

/**
 * Check if currently collecting lead info
 */
export function isCollectingLead(lineUserId: string): boolean {
  const state = getConversationState(lineUserId);
  return state.state === "collecting_lead";
}

/**
 * Check if currently collecting booking info
 */
export function isCollectingBooking(lineUserId: string): boolean {
  const state = getConversationState(lineUserId);
  return state.state === "collecting_booking";
}

/**
 * Process lead collection step
 */
export async function processLeadStep(
  lineUserId: string,
  message: string,
  language: string
): Promise<{
  isComplete: boolean;
  nextPrompt?: string;
  summary?: string;
}> {
  const state = getConversationState(lineUserId);
  const db = getDb();

  // Get line user record id
  const [lineUser] = await db
    .select()
    .from(lineUsers)
    .where(eq(lineUsers.lineUserId, lineUserId));

  const lineUserDbId = lineUser?.id;

  // Store the answer for current step
  const currentField = LEAD_STEPS[state.step];
  if (currentField) {
    state.leadData[currentField] = message;
  }

  state.step++;
  updateState(lineUserId, state);

  // Check if all steps complete
  if (state.step >= LEAD_STEPS.length) {
    // Save lead to database
    const leadData = {
      lineUserId: lineUserDbId,
      name: state.leadData.name || "Unknown",
      company: state.leadData.company || null,
      industry: state.leadData.industry || null,
      email: state.leadData.email || null,
      phone: state.leadData.phone || null,
      projectType: (state.leadData.projectType as any) || "other",
      budget: state.leadData.budget || null,
      deadline: state.leadData.deadline || null,
      requirements: state.leadData.requirements || null,
      status: "new" as const,
      source: "line",
    };

    const [savedLead] = await db.insert(leads).values(leadData);

    // Generate summary
    const summary = generateLeadSummary(state.leadData, language);

    // Reset state
    resetState(lineUserId);

    return { isComplete: true, summary };
  }

  // Return next prompt
  const nextField = LEAD_STEPS[state.step];
  const nextPrompt = getLeadPromptForField(nextField, language);

  return { isComplete: false, nextPrompt };
}

/**
 * Process booking collection step
 */
export async function processBookingStep(
  lineUserId: string,
  message: string,
  language: string
): Promise<{
  isComplete: boolean;
  nextPrompt?: string;
  confirmMessage?: string;
}> {
  const state = getConversationState(lineUserId);
  const db = getDb();

  // Get line user record id
  const [lineUser] = await db
    .select()
    .from(lineUsers)
    .where(eq(lineUsers.lineUserId, lineUserId));

  const lineUserDbId = lineUser?.id;

  // Store answer
  const currentField = BOOKING_STEPS[state.step];
  if (currentField) {
    state.bookingData[currentField] = message;
  }

  state.step++;
  updateState(lineUserId, state);

  // Check if complete
  if (state.step >= BOOKING_STEPS.length) {
    const bookingData = {
      lineUserId: lineUserDbId,
      name: state.bookingData.name || "Unknown",
      email: state.bookingData.email || null,
      phone: state.bookingData.phone || null,
      preferredDate: state.bookingData.preferredDate
        ? new Date(state.bookingData.preferredDate)
        : null,
      preferredTime: state.bookingData.preferredTime || null,
      contactMethod: (state.bookingData.contactMethod as any) || "line",
      topic: state.bookingData.topic || null,
      status: "pending" as const,
    };

    await db.insert(consultations).values(bookingData);

    resetState(lineUserId);

    const confirmMessage =
      language === "zh"
        ? `您的諮詢預約已提交！\n\n日期：${bookingData.preferredDate?.toLocaleDateString() || "待定"}\n時間：${bookingData.preferredTime || "待定"}\n主題：${bookingData.topic || "未指定"}\n\nNikhil 會盡快確認。`
        : `Your consultation request has been submitted!\n\nDate: ${bookingData.preferredDate?.toLocaleDateString() || "TBD"}\nTime: ${bookingData.preferredTime || "TBD"}\nTopic: ${bookingData.topic || "Not specified"}\n\nNikhil will confirm shortly.`;

    return { isComplete: true, confirmMessage };
  }

  const nextField = BOOKING_STEPS[state.step];
  const nextPrompt = getBookingPromptForField(nextField, language);

  return { isComplete: false, nextPrompt };
}

/**
 * Start lead collection flow
 */
export function startLeadCollection(
  lineUserId: string,
  language: string
): string {
  const isZh = language === "zh" || language === "zh-TW";

  updateState(lineUserId, {
    state: "collecting_lead",
    step: 0,
    leadData: {},
  });

  return isZh
    ? "我很樂意幫您！讓我收集一些專案資訊。請問您的姓名是？"
    : "I'd be happy to help! Let me collect some project details. What's your name?";
}

/**
 * Start booking collection flow
 */
export function startBookingCollection(
  lineUserId: string,
  language: string
): string {
  const isZh = language === "zh" || language === "zh-TW";

  updateState(lineUserId, {
    state: "collecting_booking",
    step: 0,
    bookingData: {},
  });

  return isZh
    ? "我來幫您安排諮詢！請問您的姓名是？"
    : "Let me help you schedule a consultation! What's your name?";
}

// ─── Helpers ───

function getLeadPromptForField(
  field: (typeof LEAD_STEPS)[number],
  language: string
): string {
  const isZh = language === "zh" || language === "zh-TW";

  const prompts: Record<string, { en: string; zh: string }> = {
    name: {
      en: "Great! What's your name?",
      zh: "太好了！請問您的姓名是？",
    },
    company: {
      en: "What's your company name? (Say 'none' if you don't have one)",
      zh: "請問您的公司名稱是？（沒有的話可以說沒有）",
    },
    industry: {
      en: "What industry are you in?",
      zh: "請問您所在的行業是？",
    },
    email: {
      en: "What's your best email address?",
      zh: "請問您的電子郵件地址是？",
    },
    phone: {
      en: "What's your phone number? (optional)",
      zh: "請問您的電話號碼是？（選填）",
    },
    projectType: {
      en: "What type of project? (website, automation, chatbot, AI integration, consulting, other)",
      zh: "請問專案類型是？（網站開發、自動化、聊天機器人、AI整合、諮詢、其他）",
    },
    budget: {
      en: "What's your approximate budget range?",
      zh: "您的預算範圍大約是多少？",
    },
    deadline: {
      en: "What's your expected timeline/deadline?",
      zh: "您期望的完成時間是？",
    },
    requirements: {
      en: "Please describe your project requirements in detail:",
      zh: "請詳細描述您的專案需求：",
    },
  };

  const p = prompts[field];
  return isZh ? p.zh : p.en;
}

function getBookingPromptForField(
  field: (typeof BOOKING_STEPS)[number],
  language: string
): string {
  const isZh = language === "zh" || language === "zh-TW";

  const prompts: Record<string, { en: string; zh: string }> = {
    name: {
      en: "What's your name?",
      zh: "請問您的姓名是？",
    },
    email: {
      en: "What's your email address?",
      zh: "請問您的電子郵件地址是？",
    },
    phone: {
      en: "What's your phone number?",
      zh: "請問您的電話號碼是？",
    },
    preferredDate: {
      en: "What date would you prefer? (YYYY-MM-DD format)",
      zh: "您希望預約哪一天？（請用 YYYY-MM-DD 格式）",
    },
    preferredTime: {
      en: "What time would you prefer?",
      zh: "您希望預約什麼時間？",
    },
    contactMethod: {
      en: "How to contact you? (LINE / Email / Phone)",
      zh: "您希望透過什麼方式聯繫？（LINE / 電子郵件 / 電話）",
    },
    topic: {
      en: "What would you like to discuss?",
      zh: "請問諮詢的主題是？",
    },
  };

  const p = prompts[field];
  return isZh ? p.zh : p.en;
}

function generateLeadSummary(
  data: Partial<InferSelectModel<typeof leads>>,
  language: string
): string {
  const isZh = language === "zh" || language === "zh-TW";

  if (isZh) {
    return `感謝您的提交！以下是專案摘要：\n\n👤 客戶：${data.name || "N/A"}\n🏢 公司：${data.company || "N/A"}\n📧 郵箱：${data.email || "N/A"}\n📱 電話：${data.phone || "N/A"}\n📋 類型：${data.projectType || "N/A"}\n💰 預算：${data.budget || "N/A"}\n📅 期限：${data.deadline || "N/A"}\n📝 需求：${data.requirements || "N/A"}\n\nNikhil 會盡快與您聯繫！`;
  }

  return `Thank you for your submission! Here's the project summary:\n\n👤 Client: ${data.name || "N/A"}\n🏢 Company: ${data.company || "N/A"}\n📧 Email: ${data.email || "N/A"}\n📱 Phone: ${data.phone || "N/A"}\n📋 Type: ${data.projectType || "N/A"}\n💰 Budget: ${data.budget || "N/A"}\n📅 Deadline: ${data.deadline || "N/A"}\n📝 Requirements: ${data.requirements || "N/A"}\n\nNikhil will contact you soon!`;
}

// Need to import consultations
import { consultations } from "@db/schema";
