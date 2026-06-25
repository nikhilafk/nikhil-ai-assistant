/**
 * LINE Messaging API Service
 * Handles sending messages, rich menus, and user profile fetching
 */
import { messagingApi, MiddlewareConfig, middleware } from "@line/bot-sdk";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

// LINE client for sending messages
export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

// Webhook middleware for signature validation
export const lineMiddleware = middleware({
  channelAccessToken,
  channelSecret,
} as MiddlewareConfig);

/**
 * Send a text message to a LINE user
 */
export async function sendTextMessage(lineUserId: string, text: string) {
  try {
    await lineClient.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text }],
    });
    return { success: true };
  } catch (error) {
    console.error("LINE push message error:", error);
    return { success: false, error };
  }
}

/**
 * Reply to a specific message (using reply token)
 */
export async function replyMessage(replyToken: string, text: string) {
  try {
    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: "text", text }],
    });
    return { success: true };
  } catch (error) {
    console.error("LINE reply error:", error);
    return { success: false, error };
  }
}

/**
 * Send a message with quick reply buttons
 */
export async function sendQuickReply(
  lineUserId: string,
  text: string,
  items: { label: string; text: string }[]
) {
  try {
    await lineClient.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text,
          quickReply: {
            items: items.map((item) => ({
              type: "action",
              action: {
                type: "message",
                label: item.label,
                text: item.text,
              },
            })),
          },
        },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error("LINE quick reply error:", error);
    return { success: false, error };
  }
}

/**
 * Send a template message with buttons
 */
export async function sendButtonTemplate(
  lineUserId: string,
  altText: string,
  title: string,
  text: string,
  actions: { label: string; text: string }[]
) {
  try {
    await lineClient.pushMessage({
      to: lineUserId,
      messages: [
        {
          type: "template",
          altText,
          template: {
            type: "buttons",
            title,
            text,
            actions: actions.map((a) => ({
              type: "message",
              label: a.label,
              text: a.text,
            })),
          },
        },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error("LINE button template error:", error);
    return { success: false, error };
  }
}

/**
 * Get LINE user profile
 */
export async function getUserProfile(lineUserId: string) {
  try {
    const profile = await lineClient.getProfile(lineUserId);
    return { success: true, profile };
  } catch (error) {
    console.error("LINE get profile error:", error);
    return { success: false, error };
  }
}

/**
 * Validate webhook signature
 */
export function validateSignature(body: string, signature: string): boolean {
  try {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", channelSecret)
      .update(body)
      .digest("base64");
    return hash === signature;
  } catch {
    return false;
  }
}
