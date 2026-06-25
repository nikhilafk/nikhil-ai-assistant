/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles knowledge base retrieval and semantic search
 */
import { getDb } from "../queries/connection";
import { knowledgeBase, quickReplies } from "@db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./openai-service";

/**
 * Check for exact quick reply matches
 */
export async function checkQuickReply(message: string): Promise<{
  found: boolean;
  response?: string;
}> {
  const db = getDb();
  const lower = message.toLowerCase().trim();

  // Get all active quick replies
  const replies = await db
    .select()
    .from(quickReplies)
    .where(eq(quickReplies.isActive, true))
    .orderBy(desc(quickReplies.priority));

  // Exact or partial match on trigger phrase
  for (const qr of replies) {
    const trigger = qr.triggerPhrase.toLowerCase();
    if (lower === trigger || lower.startsWith(trigger + " ")) {
      // Detect language - simple heuristic
      const hasChinese = /[\u4e00-\u9fff]/.test(message);
      return {
        found: true,
        response: hasChinese ? qr.responseZh : qr.responseEn,
      };
    }
  }

  return { found: false };
}

/**
 * Search knowledge base with keyword matching
 */
export async function searchKnowledgeBase(
  query: string,
  language: string = "en",
  category?: string
): Promise<string> {
  const db = getDb();
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let conditions = eq(knowledgeBase.isActive, true);

  // Build keyword conditions
  const keywordConditions = keywords.map((kw) =>
    or(
      like(knowledgeBase.questionEn, `%${kw}%`),
      like(knowledgeBase.answerEn, `%${kw}%`),
      like(knowledgeBase.questionZh, `%${kw}%`),
      like(knowledgeBase.answerZh, `%${kw}%`)
    )
  );

  if (category) {
    conditions = and(conditions, eq(knowledgeBase.category, category as any));
  }

  const results = await db
    .select()
    .from(knowledgeBase)
    .where(conditions)
    .orderBy(desc(knowledgeBase.priority))
    .limit(5);

  // Filter results that match keywords
  const filtered = results.filter((item) => {
    const text = `${item.questionEn} ${item.answerEn} ${item.questionZh} ${item.answerZh}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });

  if (filtered.length === 0) return "";

  // Format context for AI
  const isChinese =
    language === "zh" || language === "zh-TW" || language === "zh-Hant";

  return filtered
    .map((item) => {
      const q = isChinese ? item.questionZh : item.questionEn;
      const a = isChinese ? item.answerZh : item.answerEn;
      return `Q: ${q}\nA: ${a}`;
    })
    .join("\n\n");
}

/**
 * Semantic search using embeddings (advanced RAG)
 */
export async function semanticSearch(
  query: string,
  language: string = "en"
): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (queryEmbedding.length === 0) return "";

    const db = getDb();
    const items = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.isActive, true))
      .orderBy(desc(knowledgeBase.priority));

    // Calculate similarity scores
    const scored = items
      .map((item) => {
        const itemEmbedding = (item.embedding as number[]) || [];
        if (itemEmbedding.length === 0) return { item, score: 0 };
        const score = cosineSimilarity(queryEmbedding, itemEmbedding);
        return { item, score };
      })
      .filter((s) => s.score > 0.6) // Threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (scored.length === 0) return "";

    const isChinese =
      language === "zh" || language === "zh-TW" || language === "zh-Hant";

    return scored
      .map(({ item }) => {
        const q = isChinese ? item.questionZh : item.questionEn;
        const a = isChinese ? item.answerZh : item.answerEn;
        return `Q: ${q}\nA: ${a}`;
      })
      .join("\n\n");
  } catch (error) {
    console.error("Semantic search error:", error);
    return "";
  }
}

/**
 * Main RAG pipeline: Try quick replies → keyword search → semantic search
 */
export async function ragPipeline(
  message: string,
  language: string = "en"
): Promise<{
  hasMatch: boolean;
  response?: string;
  context?: string;
}> {
  // 1. Check quick replies (exact match)
  const quickReply = await checkQuickReply(message);
  if (quickReply.found && quickReply.response) {
    return { hasMatch: true, response: quickReply.response };
  }

  // 2. Keyword-based search
  const keywordContext = await searchKnowledgeBase(message, language);
  if (keywordContext) {
    return { hasMatch: true, context: keywordContext };
  }

  // 3. Semantic search (fallback)
  const semanticContext = await semanticSearch(message, language);
  if (semanticContext) {
    return { hasMatch: true, context: semanticContext };
  }

  return { hasMatch: false };
}

/**
 * Get knowledge base entry by category
 */
export async function getByCategory(category: string) {
  const db = getDb();
  return db
    .select()
    .from(knowledgeBase)
    .where(and(eq(knowledgeBase.category, category as any), eq(knowledgeBase.isActive, true)))
    .orderBy(desc(knowledgeBase.priority));
}
