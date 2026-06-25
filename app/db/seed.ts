import { getDb } from "../api/queries/connection";
import { knowledgeBase, quickReplies } from "./schema";

async function seed() {
  const db = getDb();

  // Seed Knowledge Base
  const kbData = [
    // ─── ABOUT ───
    {
      category: "about" as const,
      questionEn: "Who is Nikhil?",
      questionZh: "Nikhil 是誰？",
      answerEn:
        "Nikhil is a technology enthusiast passionate about AI Automation, Web Development, and Cybersecurity. He builds AI-powered systems, automation solutions, and business technology products. He's currently focused on creating chatbots, workflow automation, and LINE integrations.",
      answerZh:
        "Nikhil 是一位熱愛 AI 自動化、網頁開發和網路安全的科技愛好者。他致力於構建 AI 驅動的系統、自動化解決方案和商業技術產品。他目前專注於創建聊天機器人、工作流程自動化和 LINE 整合。",
      keywords: ["who", "nikhil", "about", "introduce", "簡介", "是誰"],
      priority: 10,
    },
    {
      category: "about" as const,
      questionEn: "What are Nikhil's goals?",
      questionZh: "Nikhil 的目標是什麼？",
      answerEn:
        "Nikhil's goals are: 1) Build useful AI systems that solve real business problems, 2) Create automation solutions that save time and reduce costs, 3) Develop business technology products that help companies grow and operate more efficiently.",
      answerZh:
        "Nikhil 的目標是：1）構建能解決實際商業問題的有用 AI 系統，2）創建節省時間和降低成本的自動化解決方案，3）開發幫助企業成長和更高效運營的商業技術產品。",
      keywords: ["goals", "objective", "aim", "目標", "目的"],
      priority: 8,
    },
    {
      category: "about" as const,
      questionEn: "What is Nikhil learning?",
      questionZh: "Nikhil 正在學習什麼？",
      answerEn:
        "Nikhil is currently learning: AI Chatbots, Workflow Automation, LINE Integrations, Web Applications, and Business Solutions. He's always exploring new technologies to expand his capabilities.",
      answerZh:
        "Nikhil 目前正在學習：AI 聊天機器人、工作流程自動化、LINE 整合、網頁應用程式和商業解決方案。他總是在探索新技術以擴展自己的能力。",
      keywords: ["learning", "study", "學習", "正在學"],
      priority: 7,
    },
    // ─── SKILLS ───
    {
      category: "skills" as const,
      questionEn: "What skills does Nikhil have?",
      questionZh: "Nikhil 有哪些技能？",
      answerEn:
        "Nikhil has skills in three main areas:\n\n**Web Development**: HTML, CSS, JavaScript, Frontend Development, Backend Concepts, Website Creation\n\n**Cybersecurity**: Security Awareness, Authentication Concepts, Risk Assessment, Security Best Practices\n\n**AI Automation**: Chatbots, AI Assistants, Workflow Automation, Business Process Automation, Customer Support Automation",
      answerZh:
        "Nikhil 的技能涵蓋三個主要領域：\n\n**網頁開發**：HTML、CSS、JavaScript、前端開發、後端概念、網站創建\n\n**網路安全**：安全意識、認證概念、風險評估、安全最佳實踐\n\n**AI 自動化**：聊天機器人、AI 助理、工作流程自動化、商業流程自動化、客戶支援自動化",
      keywords: ["skills", "can do", "capable", "技能", "能力"],
      priority: 10,
    },
    {
      category: "skills" as const,
      questionEn: "Can Nikhil build websites?",
      questionZh: "Nikhil 會做網站嗎？",
      answerEn:
        "Yes! Nikhil can build websites using HTML, CSS, and JavaScript. He handles frontend development and understands backend concepts. He can create responsive, modern websites for businesses, portfolios, e-commerce, and more.",
      answerZh:
        "會的！Nikhil 可以使用 HTML、CSS 和 JavaScript 構建網站。他負責前端開發，並了解後端概念。他可以為企業、作品集、電子商務等創建響應式、現代化的網站。",
      keywords: ["website", "build", "create", "網站", "做網站"],
      priority: 9,
    },
    {
      category: "skills" as const,
      questionEn: "Can Nikhil create chatbots?",
      questionZh: "Nikhil 會做聊天機器人嗎？",
      answerEn:
        "Absolutely! Nikhil specializes in building AI-powered chatbots using the LINE Messaging API and OpenAI. He can create chatbots for customer service, lead collection, appointment booking, FAQ answering, and business automation.",
      answerZh:
        "當然！Nikhil 專門使用 LINE Messaging API 和 OpenAI 構建 AI 驅動的聊天機器人。他可以創建用於客戶服務、潛在客戶收集、預約預訂、FAQ 解答和商業自動化的聊天機器人。",
      keywords: ["chatbot", "bot", "聊天機器人"],
      priority: 9,
    },
    // ─── SERVICES ───
    {
      category: "services" as const,
      questionEn: "What services does Nikhil offer?",
      questionZh: "Nikhil 提供什麼服務？",
      answerEn:
        "Nikhil offers these services:\n\n1. **Website Development** - Modern, responsive websites\n2. **AI Chatbot Creation** - LINE-integrated smart chatbots\n3. **Workflow Automation** - Business process automation using AI\n4. **AI Integration** - Adding AI capabilities to existing systems\n5. **Business Consulting** - Technology strategy and implementation\n6. **LINE Official Account Setup** - Complete LINE business integration",
      answerZh:
        "Nikhil 提供以下服務：\n\n1. **網站開發** - 現代化、響應式網站\n2. **AI 聊天機器人創建** - LINE 整合的智能聊天機器人\n3. **工作流程自動化** - 使用 AI 進行商業流程自動化\n4. **AI 整合** - 為現有系統添加 AI 功能\n5. **商業諮詢** - 技術策略和實施\n6. **LINE 官方帳號設定** - 完整的 LINE 商業整合",
      keywords: ["services", "offer", "provide", "服務", "提供"],
      priority: 10,
    },
    {
      category: "services" as const,
      questionEn: "What is AI automation?",
      questionZh: "什麼是 AI 自動化？",
      answerEn:
        "AI automation combines artificial intelligence with automated workflows to handle tasks that normally require human intervention. Examples include: AI chatbots that answer customer questions 24/7, automated lead qualification, smart email responses, document processing, and business process automation that learns and improves over time.",
      answerZh:
        "AI 自動化將人工智能與自動化工作流程結合，處理通常需要人工干預的任務。例如：24/7 回答客戶問題的 AI 聊天機器人、自動潛在客戶資格審查、智能電子郵件回覆、文件處理，以及隨時間學習和改進的商業流程自動化。",
      keywords: ["automation", "ai automation", "自動化", "什麼是"],
      priority: 8,
    },
    // ─── FAQ ───
    {
      category: "faq" as const,
      questionEn: "How can I contact Nikhil?",
      questionZh: "如何聯繫 Nikhil？",
      answerEn:
        "You can contact Nikhil through this chat! Just let me know what you need, and I can help collect your project requirements or schedule a consultation. Alternatively, you can ask me to forward a message.",
      answerZh:
        "您可以透過這個聊天聯繫 Nikhil！只要告訴我您的需求，我就可以幫助收集您的專案需求或安排諮詢。或者，您可以請我轉達訊息。",
      keywords: ["contact", "reach", "email", "聯繫", "聯絡", "聯絡方式"],
      priority: 10,
    },
    {
      category: "faq" as const,
      questionEn: "How do I book a consultation?",
      questionZh: "如何預約諮詢？",
      answerEn:
        "To book a consultation, just tell me you'd like to schedule a meeting with Nikhil. I'll collect your preferred date, time, and topic. You can also click 'Book Consultation' from the rich menu below!",
      answerZh:
        "要預約諮詢，只要告訴我您想安排與 Nikhil 的會面。我會收集您偏好的日期、時間和主題。您也可以從下方的選單點擊「預約諮詢」！",
      keywords: ["book", "consultation", "schedule", "預約", "諮詢", "預定"],
      priority: 9,
    },
    {
      category: "faq" as const,
      questionEn: "Does Nikhil work with international clients?",
      questionZh: "Nikhil 接國際客戶嗎？",
      answerEn:
        "Yes! Nikhil works with clients globally. This chatbot supports both English and Traditional Chinese, and Nikhil is comfortable working with international projects remotely.",
      answerZh:
        "是的！Nikhil 與全球客戶合作。這個聊天機器人支援英文和繁體中文，Nikhil 可以舒適地遠端處理國際專案。",
      keywords: ["international", "global", "remote", "國際", "國外"],
      priority: 7,
    },
    // ─── PROJECTS ───
    {
      category: "projects" as const,
      questionEn: "What projects has Nikhil built?",
      questionZh: "Nikhil 做過什麼專案？",
      answerEn:
        "Nikhil has built:\n\n1. **Nikhil AI Assistant** (this chatbot!) - A multilingual AI chatbot with lead collection, consultation booking, and knowledge base powered by OpenAI\n2. **LINE Business Integrations** - Automated customer service and sales workflows\n3. **Web Applications** - Modern responsive websites with backend integrations\n4. **Automation Workflows** - Business process automation using AI and no-code tools",
      answerZh:
        "Nikhil 已經構建了：\n\n1. **Nikhil AI Assistant**（就是這個聊天機器人！）- 一個多語言 AI 聊天機器人，具有潛在客戶收集、諮詢預訂和由 OpenAI 驅動的知識庫\n2. **LINE 商業整合** - 自動化客戶服務和銷售工作流程\n3. **網頁應用程式** - 具有後端整合的現代化響應式網站\n4. **自動化工作流程** - 使用 AI 和無程式碼工具的商業流程自動化",
      keywords: ["projects", "portfolio", "work", "專案", "作品"],
      priority: 8,
    },
  ];

  for (const item of kbData) {
    await db.insert(knowledgeBase).values(item);
  }

  // Seed Quick Replies
  const qrData = [
    {
      triggerPhrase: "hello",
      responseEn:
        "Hello! I'm Nikhil AI Assistant. I can help with: 👤 About Nikhil, 💻 Skills, 🤖 AI Automation, 🌐 Web Development, 🔒 Cybersecurity, 📋 Project Requirements, 📅 Consultation Requests, 📞 Contact Information. Choose a topic or ask a question!",
      responseZh:
        "你好！我是 Nikhil AI 助理。我可以幫助您了解：👤 關於 Nikhil、💻 技能、🤖 AI 自動化、🌐 網頁開發、🔒 網路安全、📋 專案需求、📅 諮詢預約、📞 聯絡資訊。選擇一個主題或提出問題！",
      category: "greeting",
      priority: 10,
    },
    {
      triggerPhrase: "hi",
      responseEn:
        "Hi there! I'm Nikhil AI Assistant. I can help with: 👤 About Nikhil, 💻 Skills, 🤖 AI Automation, 🌐 Web Development, 🔒 Cybersecurity, 📋 Project Requirements, 📅 Consultation Requests, 📞 Contact Information. Choose a topic or ask a question!",
      responseZh:
        "你好！我是 Nikhil AI 助理。我可以幫助您了解：👤 關於 Nikhil、💻 技能、🤖 AI 自動化、🌐 網頁開發、🔒 網路安全、📋 專案需求、📅 諮詢預約、📞 聯絡資訊。選擇一個主題或提出問題！",
      category: "greeting",
      priority: 10,
    },
    {
      triggerPhrase: "help",
      responseEn:
        "I'm here to help! I can:\n- Tell you about Nikhil and his skills\n- Explain AI automation services\n- Collect your project requirements\n- Schedule a consultation\n- Answer FAQs\n\nWhat would you like to know?",
      responseZh:
        "我來幫您！我可以：\n- 介紹 Nikhil 和他的技能\n- 解釋 AI 自動化服務\n- 收集您的專案需求\n- 安排諮詢\n- 回答常見問題\n\n您想了解什麼？",
      category: "help",
      priority: 9,
    },
    {
      triggerPhrase: "menu",
      responseEn: "Here's what I can help with:\n\n1. About Nikhil\n2. Skills & Services\n3. AI Automation\n4. Web Development\n5. Cybersecurity\n6. Submit Project Requirements\n7. Book a Consultation\n8. Contact Info\n\nJust type a number or ask me anything!",
      responseZh: "以下是我可以提供協助的內容：\n\n1. 關於 Nikhil\n2. 技能與服務\n3. AI 自動化\n4. 網頁開發\n5. 網路安全\n6. 提交專案需求\n7. 預約諮詢\n8. 聯絡資訊\n\n輸入數字或直接問我任何問題！",
      category: "navigation",
      priority: 8,
    },
  ];

  for (const qr of qrData) {
    await db.insert(quickReplies).values(qr);
  }

  console.log("✅ Seed complete: Knowledge Base + Quick Replies");
}

seed().catch(console.error);
