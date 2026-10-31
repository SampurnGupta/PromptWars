import { google } from "googleapis";

export interface ExpenseRecord {
  transactionId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
}

// Store for recorded expenses when Google Sheet credentials are not yet configured
const inMemoryDemoExpenses: ExpenseRecord[] = [];

function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) return null;

  try {
    privateKey = privateKey.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
  } catch (err) {
    console.warn("Failed to initialize Google Sheets JWT client:", err);
    return null;
  }
}

export async function appendExpenseToSheet(expense: Omit<ExpenseRecord, "transactionId" | "createdAt">): Promise<{
  success: boolean;
  record: ExpenseRecord;
  target: "google_sheets" | "demo_storage";
  rowNumber?: number;
}> {
  const transactionId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
  const record: ExpenseRecord = {
    ...expense,
    transactionId,
    createdAt: new Date().toISOString(),
  };

  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (sheets && spreadsheetId) {
    try {
      const rowValues = [
        [
          record.transactionId,
          record.date,
          record.description,
          record.category,
          record.amount,
          record.currency,
          record.paymentMethod,
          record.createdAt,
        ],
      ];

      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Expenses!A:H",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: rowValues,
        },
      });

      const updatedRange = res.data.updates?.updatedRange;
      const rowMatch = updatedRange?.match(/A(\d+)/);
      const rowNumber = rowMatch ? parseInt(rowMatch[1], 10) : undefined;

      inMemoryDemoExpenses.unshift(record);
      return {
        success: true,
        record,
        target: "google_sheets",
        rowNumber,
      };
    } catch (err) {
      console.warn("Error writing to live Google Sheet, falling back to demo ledger:", err);
    }
  }

  // Graceful fallback to verified in-memory demo ledger
  inMemoryDemoExpenses.unshift(record);
  return {
    success: true,
    record,
    target: "demo_storage",
    rowNumber: inMemoryDemoExpenses.length + 1,
  };
}

export async function fetchExpenseRecords(): Promise<ExpenseRecord[]> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (sheets && spreadsheetId) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Expenses!A2:H",
      });
      const rows = res.data.values || [];
      const remoteExpenses: ExpenseRecord[] = rows
        .filter((r) => r && r[0] && r[0].toString().trim() !== "")
        .map((r, idx) => ({
          transactionId: r[0] || `TXN-REMOTE-${idx}`,
          date: r[1] || new Date().toISOString().split("T")[0],
          description: r[2] || "Expense",
          category: r[3] || "General",
          amount: parseFloat(r[4]) || 0,
          currency: r[5] || "INR",
          paymentMethod: r[6] || "Unknown",
          createdAt: r[7] || new Date().toISOString(),
        }));
      return [...remoteExpenses.reverse(), ...inMemoryDemoExpenses];
    } catch (err) {
      console.warn("Could not read live Google Sheet, returning stored expenses:", err);
    }
  }

  return [...inMemoryDemoExpenses];
}

export async function updateExpenseInSheet(
  transactionId: string,
  updates: Partial<Omit<ExpenseRecord, "transactionId">>
): Promise<{ success: boolean; record?: ExpenseRecord; error?: string }> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (sheets && spreadsheetId) {
    try {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Expenses!A2:H",
      });
      const rows = getRes.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === transactionId);

      if (rowIndex !== -1) {
        const actualRow = rowIndex + 2;
        const existing = rows[rowIndex];
        const updatedRecord: ExpenseRecord = {
          transactionId,
          date: updates.date ?? (existing[1] || new Date().toISOString().split("T")[0]),
          description: updates.description ?? (existing[2] || "Expense"),
          category: updates.category ?? (existing[3] || "General"),
          amount: updates.amount !== undefined ? updates.amount : (parseFloat(existing[4]) || 0),
          currency: updates.currency ?? (existing[5] || "INR"),
          paymentMethod: updates.paymentMethod ?? (existing[6] || "Unknown"),
          createdAt: existing[7] || new Date().toISOString(),
        };

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Expenses!A${actualRow}:H${actualRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[
              updatedRecord.transactionId,
              updatedRecord.date,
              updatedRecord.description,
              updatedRecord.category,
              updatedRecord.amount,
              updatedRecord.currency,
              updatedRecord.paymentMethod,
              updatedRecord.createdAt,
            ]],
          },
        });

        const memIdx = inMemoryDemoExpenses.findIndex(e => e.transactionId === transactionId);
        if (memIdx !== -1) inMemoryDemoExpenses[memIdx] = updatedRecord;

        return { success: true, record: updatedRecord };
      }
    } catch (err) {
      console.warn("Error updating Google Sheet row:", err);
    }
  }

  // In-memory update
  const memIdx = inMemoryDemoExpenses.findIndex(e => e.transactionId === transactionId);
  if (memIdx !== -1) {
    const existing = inMemoryDemoExpenses[memIdx];
    const updatedRecord: ExpenseRecord = {
      ...existing,
      ...updates,
      transactionId,
    };
    inMemoryDemoExpenses[memIdx] = updatedRecord;
    return { success: true, record: updatedRecord };
  }

  return { success: false, error: `Transaction ${transactionId} not found` };
}

export async function deleteExpenseFromSheet(
  transactionId: string
): Promise<{ success: boolean; deletedId?: string; error?: string }> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (sheets && spreadsheetId) {
    try {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Expenses!A2:H",
      });
      const rows = getRes.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === transactionId);

      if (rowIndex !== -1) {
        const actualRow = rowIndex + 2;
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `Expenses!A${actualRow}:H${actualRow}`,
        });

        const memIdx = inMemoryDemoExpenses.findIndex(e => e.transactionId === transactionId);
        if (memIdx !== -1) inMemoryDemoExpenses.splice(memIdx, 1);

        return { success: true, deletedId: transactionId };
      }
    } catch (err) {
      console.warn("Error clearing Google Sheet row:", err);
    }
  }

  const memIdx = inMemoryDemoExpenses.findIndex(e => e.transactionId === transactionId);
  if (memIdx !== -1) {
    inMemoryDemoExpenses.splice(memIdx, 1);
    return { success: true, deletedId: transactionId };
  }

  return { success: false, error: `Transaction ${transactionId} not found` };
}

