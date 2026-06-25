/**
 * Google Sheets Integration Service
 * Syncs leads and consultations to Google Sheets
 */
import { google, type sheets_v4 } from "googleapis";
import type { Lead, Consultation } from "@db/schema";

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets | null {
  if (sheetsClient) return sheetsClient;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.warn("GOOGLE_SERVICE_ACCOUNT_JSON not set, Sheets sync disabled");
    return null;
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error);
    return null;
  }
}

function getSpreadsheetId(): string | null {
  return process.env.GOOGLE_SHEETS_ID || null;
}

/**
 * Ensure the Leads sheet has proper headers
 */
async function ensureLeadHeaders(): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return false;

  try {
    const headers = [
      "Timestamp",
      "Name",
      "Company",
      "Industry",
      "Email",
      "Phone",
      "Project Type",
      "Budget",
      "Deadline",
      "Requirements",
      "Status",
      "Source",
      "AI Summary",
    ];

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Leads!A1:M1",
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Create headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Leads!A1",
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }
    return true;
  } catch (error) {
    console.error("Ensure headers error:", error);
    return false;
  }
}

/**
 * Append a lead to the Google Sheet
 */
export async function syncLeadToSheet(lead: Lead): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return false;

  try {
    await ensureLeadHeaders();

    const row = [
      lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
      lead.name || "",
      lead.company || "",
      lead.industry || "",
      lead.email || "",
      lead.phone || "",
      lead.projectType || "",
      lead.budget || "",
      lead.deadline || "",
      lead.requirements || "",
      lead.status || "new",
      lead.source || "line",
      lead.aiSummary || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Leads!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error("Sync lead to sheet error:", error);
    return false;
  }
}

/**
 * Ensure the Consultations sheet has proper headers
 */
async function ensureConsultationHeaders(): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return false;

  try {
    const headers = [
      "Timestamp",
      "Name",
      "Email",
      "Phone",
      "Preferred Date",
      "Preferred Time",
      "Contact Method",
      "Topic",
      "Notes",
      "Status",
    ];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Consultations!A1:J1",
    });

    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Consultations!A1",
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }
    return true;
  } catch (error) {
    console.error("Ensure consultation headers error:", error);
    return false;
  }
}

/**
 * Append a consultation to the Google Sheet
 */
export async function syncConsultationToSheet(
  consultation: Consultation
): Promise<boolean> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  if (!sheets || !spreadsheetId) return false;

  try {
    await ensureConsultationHeaders();

    const row = [
      consultation.createdAt
        ? new Date(consultation.createdAt).toISOString()
        : new Date().toISOString(),
      consultation.name || "",
      consultation.email || "",
      consultation.phone || "",
      consultation.preferredDate || "",
      consultation.preferredTime || "",
      consultation.contactMethod || "line",
      consultation.topic || "",
      consultation.notes || "",
      consultation.status || "pending",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Consultations!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error("Sync consultation to sheet error:", error);
    return false;
  }
}
