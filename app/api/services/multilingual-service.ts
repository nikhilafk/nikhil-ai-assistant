/**
 * Multilingual Service
 * Handles language detection and response localization
 */

// Simple language detection without external deps
const zhPatterns = /[\u4e00-\u9fff\u3400-\u4dbf]/;
const enPatterns = /^[a-zA-Z\s.,!?()'"-]+$/;

/**
 * Detect language from message text
 * Returns 'en', 'zh', or 'unknown'
 */
export function detectLanguage(message: string): "en" | "zh" | "unknown" {
  if (!message || message.trim().length === 0) return "unknown";

  const trimmed = message.trim();

  // Check for Chinese characters
  const chineseChars = (trimmed.match(zhPatterns) || []).length;
  const totalChars = trimmed.replace(/\s/g, "").length;

  if (chineseChars > 0) {
    // If more than 30% Chinese characters, classify as Chinese
    if (chineseChars / totalChars > 0.3) {
      return "zh";
    }
  }

  // Check if primarily English
  if (enPatterns.test(trimmed) && chineseChars === 0) {
    return "en";
  }

  // Default to English for mixed or unclear
  return "en";
}

/**
 * Check if user is switching languages
 */
export function detectLanguageSwitch(message: string): "en" | "zh" | null {
  const lower = message.toLowerCase().trim();

  const englishTriggers = [
    "english",
    "switch to english",
    "in english",
    "use english",
    "speak english",
  ];
  const chineseTriggers = [
    "中文",
    "繁體中文",
    "切換中文",
    "用中文",
    "說中文",
    "正體中文",
  ];

  if (englishTriggers.some((t) => lower.includes(t))) return "en";
  if (chineseTriggers.some((t) => lower.includes(t))) return "zh";

  return null;
}

/**
 * Get localized response based on language
 */
export function getLocalizedResponse(
  en: string,
  zh: string,
  language: string
): string {
  if (language === "zh" || language === "zh-TW" || language === "zh-Hant") {
    return zh;
  }
  return en;
}

/**
 * Welcome message in user's language
 */
export function getWelcomeMessage(language: string): string {
  if (language === "zh" || language === "zh-TW") {
    return `你好 👋\n\n歡迎使用 Nikhil AI 助理。\n\n我可以幫助您：\n\n👤 關於 Nikhil\n💻 技能與服務\n🤖 AI 自動化\n🌐 網頁開發\n🔒 網路安全\n📋 專案需求收集\n📅 諮詢預約\n📞 聯絡資訊\n\n請選擇主題或提出問題。`;
  }

  return `Hello 👋\n\nWelcome to Nikhil AI Assistant.\n\nI can help with:\n\n👤 About Nikhil\n💻 Skills & Services\n🤖 AI Automation\n🌐 Web Development\n🔒 Cybersecurity\n📋 Project Requirements\n📅 Consultation Requests\n📞 Contact Information\n\nChoose a topic or ask a question.`;
}

/**
 * Rich menu labels by language
 */
export function getRichMenuLabels(language: string) {
  const isZh = language === "zh" || language === "zh-TW";

  return {
    about: isZh ? "關於我" : "About Me",
    skills: isZh ? "技能" : "Skills",
    services: isZh ? "服務" : "Services",
    projects: isZh ? "專案" : "Projects",
    contact: isZh ? "聯絡" : "Contact",
    book: isZh ? "預約諮詢" : "Book Consultation",
  };
}

/**
 * Lead collection prompts in user's language
 */
export function getLeadPrompts(language: string) {
  const isZh = language === "zh" || language === "zh-TW";

  return {
    askName: isZh ? "太好了！為了更好地了解您的需求，請問您的姓名是？" : "Great! To better understand your needs, could you tell me your name?",
    askCompany: isZh ? "請問您的公司名稱是？（如果沒有可以直接說沒有）" : "What's your company name? (You can say 'none' if you don't have one)",
    askIndustry: isZh ? "請問您所在的行業是？" : "What industry are you in?",
    askEmail: isZh ? "請問您的電子郵件地址是？" : "What's your best email address?",
    askPhone: isZh ? "請問您的電話號碼是？（選填）" : "What's your phone number? (optional)",
    askProjectType: isZh
      ? "請問您的專案類型是？（例如：網站開發、自動化、聊天機器人、AI整合、諮詢）"
      : "What type of project do you need? (e.g., website, automation, chatbot, AI integration, consulting)",
    askBudget: isZh ? "您的預算範圍大約是多少？" : "What's your approximate budget range?",
    askDeadline: isZh ? "您期望的完成時間是？" : "What's your expected timeline?",
    askRequirements: isZh ? "請描述您的專案需求：（越詳細越好）" : "Please describe your project requirements in detail:",
    thankYou: isZh
      ? "非常感謝！我已經收到您的專案需求，Nikhil 會盡快與您聯繫。"
      : "Thank you very much! I've received your project details. Nikhil will contact you soon.",
  };
}

/**
 * Booking prompts in user's language
 */
export function getBookingPrompts(language: string) {
  const isZh = language === "zh" || language === "zh-TW";

  return {
    askName: isZh ? "為了安排諮詢，請問您的姓名是？" : "To schedule a consultation, may I have your name?",
    askEmail: isZh ? "請問您的電子郵件地址是？" : "What's your email address?",
    askPhone: isZh ? "請問您的電話號碼是？" : "What's your phone number?",
    askDate: isZh ? "您希望預約哪一天？（請使用 YYYY-MM-DD 格式）" : "What date would you prefer? (Please use YYYY-MM-DD format)",
    askTime: isZh ? "您希望預約什麼時間？" : "What time would you prefer?",
    askTopic: isZh ? "請問諮詢的主題是？" : "What would you like to discuss?",
    askContactMethod: isZh
      ? "您希望透過什麼方式聯繫？（LINE / 電子郵件 / 電話）"
      : "How would you prefer to be contacted? (LINE / Email / Phone)",
    confirm: isZh
      ? "您的諮詢預約已提交！Nikhil 會盡快確認。"
      : "Your consultation request has been submitted! Nikhil will confirm shortly.",
  };
}
