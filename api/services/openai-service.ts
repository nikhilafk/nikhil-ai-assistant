/**
 * OpenAI Service
 * Handles completions, embeddings, and conversation management
 */
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = new OpenAI({ apiKey });

/**
 * System prompt template for Nikhil AI Assistant
 */
function buildSystemPrompt(language: string, context: string): string {
  const langInstruction =
    language === "zh" || language === "zh-TW" || language === "zh-Hant"
      ? "You MUST respond in Traditional Chinese (繁體中文)."
      : "You MUST respond in English.";

  return `You are Nikhil AI Assistant, a professional and friendly digital assistant representing Nikhil. You help people learn about Nikhil's skills, services, and collect project requirements for potential collaborations.

Personality: Professional, friendly, helpful, confident, clear but not overly formal. Use emojis sparingly.

${langInstruction}

Current date: ${new Date().toISOString().split("T")[0]}

When you detect someone wants to hire or work with Nikhil (e.g., saying "I need a website", "I want automation", "Can you help me"), guide them through providing their project details naturally. Ask for their name, company, email, project type, budget, and requirements one by one in a conversational way.

When someone wants to book a consultation, collect their name, email, phone, preferred date, preferred time, and topic.

Knowledge base context:
${context || "No specific context available."}

Important: Keep responses concise (under 200 words). Be helpful and direct.`;
}

/**
 * Generate AI completion with context
 */
export async function generateCompletion(
  message: string,
  options: {
    language?: string;
    context?: string;
    conversationHistory?: { role: "user" | "assistant"; content: string }[];
  } = {}
) {
  const { language = "en", context = "", conversationHistory = [] } = options;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildSystemPrompt(language, context),
    },
    ...conversationHistory.slice(-5), // Keep last 5 messages for context
    { role: "user", content: message },
  ];

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
    const tokensUsed = response.usage?.total_tokens || 0;

    return { reply, tokensUsed, success: true };
  } catch (error) {
    console.error("OpenAI completion error:", error);
    return {
      reply: language === "zh"
        ? "抱歉，我現在無法處理您的訊息。請稍後再試。"
        : "Sorry, I'm having trouble processing your message right now. Please try again later.",
      tokensUsed: 0,
      success: false,
      error,
    };
  }
}

/**
 * Generate embedding for RAG
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error("OpenAI embedding error:", error);
    return [];
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Detect if the message indicates lead generation intent
 */
export async function detectLeadIntent(message: string): Promise<boolean> {
  const lower = message.toLowerCase();
  const leadKeywords = [
    "need a website",
    "want a website",
    "build a website",
    "create a website",
    "need automation",
    "want automation",
    "automate",
    "need a chatbot",
    "want a chatbot",
    "create a chatbot",
    "hire you",
    "work with you",
    "your services",
    "project",
    "budget",
    "quote",
    "pricing",
    "how much",
    "start a project",
  ];

  // Fast keyword check first
  if (leadKeywords.some((kw) => lower.includes(kw))) return true;

  // AI-based classification for ambiguous cases
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Classify if the user message indicates interest in hiring or starting a project. Reply ONLY "yes" or "no".',
        },
        { role: "user", content: message },
      ],
      temperature: 0,
      max_tokens: 5,
    });
    const answer = response.choices[0]?.message?.content?.toLowerCase().trim();
    return answer === "yes";
  } catch {
    return false;
  }
}

/**
 * Detect if message indicates consultation booking intent
 */
export function detectBookingIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const bookingKeywords = [
    "book",
    "schedule",
    "consultation",
    "meeting",
    "appointment",
    "call",
    "talk",
    "discuss",
    "預約",
    "諮詢",
    "會議",
    "討論",
  ];
  return bookingKeywords.some((kw) => lower.includes(kw));
}

/**
 * Extract lead information from conversation using function calling
 */
export async function extractLeadInfo(conversation: string): Promise<{
  name?: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  deadline?: string;
  requirements?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `Extract lead information from the conversation. Return a JSON object with these fields if found: name, company, industry, email, phone, projectType, budget, deadline, requirements. Use null for missing fields.`,
        },
        { role: "user", content: conversation },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Extract lead info error:", error);
    return {};
  }
}

/**
 * Extract consultation booking info from conversation
 */
export async function extractBookingInfo(conversation: string): Promise<{
  name?: string;
  email?: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  contactMethod?: string;
  topic?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `Extract consultation booking information from the conversation. Return a JSON object with these fields if found: name, email, phone, preferredDate (YYYY-MM-DD), preferredTime, contactMethod (line/email/phone), topic. Use null for missing fields.`,
        },
        { role: "user", content: conversation },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Extract booking info error:", error);
    return {};
  }
}
