import { NextRequest, NextResponse } from "next/server";
import { 
  fetchExpenseRecords, 
  appendExpenseToSheet, 
  updateExpenseInSheet, 
  deleteExpenseFromSheet,
  ExpenseRecord 
} from "@/lib/integrations/sheets";
import { generateStructuredAI } from "@/lib/ai/client";

interface ChatActionDecision {
  action: "QUERY" | "ADD" | "UPDATE" | "DELETE";
  answer: string;
  addPayload?: {
    description: string;
    category: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    date?: string;
  };
  updatePayload?: {
    transactionId: string;
    updates: Partial<Omit<ExpenseRecord, "transactionId">>;
  };
  deletePayload?: {
    transactionId: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPrompt: string = (body.message || "").trim();
    const history = body.history || [];

    if (!userPrompt) {
      return NextResponse.json({ error: "Message prompt is required" }, { status: 400 });
    }

    // 1. Fetch current live expenses from Google Sheet
    const records = await fetchExpenseRecords();
    const totalSpent = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // 2. Prepare Ledger Summary for AI Context
    const simplifiedLedger = records.slice(0, 30).map(r => ({
      id: r.transactionId,
      date: r.date,
      desc: r.description,
      cat: r.category,
      amount: r.amount,
      cur: r.currency,
      method: r.paymentMethod,
    }));

    const systemPrompt = `You are ChoreCraft's intelligent Financial AI Assistant with direct read/write access to the user's Google Sheet ("Expenses!A:H").
You can answer questions about existing transactions, analyze spending trends, add new expenses, update existing expenses, or delete transactions.

CURRENT GOOGLE SHEET LEDGER (${records.length} transactions, Total ₹${totalSpent}):
${JSON.stringify(simplifiedLedger, null, 2)}

Your task is to analyze the user's request and return a JSON decision:
- If user wants to know totals, categories, biggest expense, count, or general advice: action = "QUERY".
- If user asks to add/record/log an expense: action = "ADD", specify description, category, amount, currency (default "INR"), paymentMethod (default "UPI" or "Card"), and date (default today).
- If user asks to update/change/modify an existing transaction (by ID like TXN-XXXXX or clear match): action = "UPDATE", specify transactionId and fields to change.
- If user asks to delete/remove a transaction: action = "DELETE", specify transactionId.
- Provide a polite, helpful, markdown-formatted "answer" explaining the outcome or answering the query.`;

    const schemaHint = `{
  "action": "QUERY" | "ADD" | "UPDATE" | "DELETE",
  "answer": "Clear markdown answer summarizing findings or confirming sheet modification",
  "addPayload": { "description": "string", "category": "Food & Dining" | "Transportation" | "Utilities" | "Shopping" | "Entertainment" | "General", "amount": 100, "currency": "INR", "paymentMethod": "UPI", "date": "YYYY-MM-DD" },
  "updatePayload": { "transactionId": "TXN-XXXXX", "updates": { "amount": 200, "description": "New Name" } },
  "deletePayload": { "transactionId": "TXN-XXXXX" }
}`;

    // 3. Fallback Heuristic Generator if AI API Key is not yet configured
    const fallbackGenerator = (): ChatActionDecision => {
      const lower = userPrompt.toLowerCase();

      // Check for Delete
      const deleteMatch = lower.match(/(?:delete|remove|clear)\s+(?:transaction\s+)?(txn-[a-zA-Z0-9_-]+)/i);
      if (deleteMatch) {
        const targetId = deleteMatch[1].toUpperCase();
        return {
          action: "DELETE",
          answer: `I will remove transaction **${targetId}** from your Google Sheet.`,
          deletePayload: { transactionId: targetId },
        };
      }

      // Check for Update
      const updateMatch = lower.match(/(?:change|update|set|modify)\s+(?:transaction\s+)?(txn-[a-zA-Z0-9_-]+)\s+(?:amount\s+to\s+|to\s+)?(?:[₹$€£]\s*)?(\d+(?:\.\d+)?)/i);
      if (updateMatch) {
        const targetId = updateMatch[1].toUpperCase();
        const newAmt = parseFloat(updateMatch[2]);
        return {
          action: "UPDATE",
          answer: `I will update transaction **${targetId}** in your Google Sheet to **₹${newAmt}**.`,
          updatePayload: {
            transactionId: targetId,
            updates: { amount: newAmt },
          },
        };
      }

      // Check for Add
      const addMatch = lower.match(/(?:add|log|record|spent|paid)\s+(?:[₹$€£]\s*)?(\d+(?:\.\d+)?)\s+(?:on|for)\s+([a-zA-Z0-9\s]+)/i) ||
                       lower.match(/(?:add|log|record)\s+([a-zA-Z0-9\s]+)\s+(?:[₹$€£]\s*)?(\d+(?:\.\d+)?)/i);
      if (addMatch) {
        const isAmtFirst = !isNaN(parseFloat(addMatch[1]));
        const amount = isAmtFirst ? parseFloat(addMatch[1]) : parseFloat(addMatch[2]);
        const descRaw = (isAmtFirst ? addMatch[2] : addMatch[1]).trim();
        
        let category = "General";
        if (/coffee|lunch|dinner|food|swiggy|zomato|pizza|restaurant/i.test(descRaw)) category = "Food & Dining";
        else if (/uber|ola|cab|fuel|petrol|metro|flight/i.test(descRaw)) category = "Transportation";
        else if (/bill|wifi|electricity|water|recharge/i.test(descRaw)) category = "Utilities";
        else if (/amazon|flipkart|clothes|shoes|store/i.test(descRaw)) category = "Shopping";

        return {
          action: "ADD",
          answer: `Logged **₹${amount}** for **${descRaw}** (${category}) directly into your Google Sheet.`,
          addPayload: {
            description: descRaw,
            category,
            amount,
            currency: "INR",
            paymentMethod: /upi|gpay|phonepe/i.test(lower) ? "UPI" : /card|credit/i.test(lower) ? "Credit Card" : "Online",
            date: new Date().toISOString().split("T")[0],
          },
        };
      }

      // Analytics & Query
      if (lower.includes("biggest") || lower.includes("highest") || lower.includes("max")) {
        const sorted = [...records].sort((a, b) => b.amount - a.amount);
        const top = sorted[0];
        if (top) {
          return {
            action: "QUERY",
            answer: `Your highest recorded expense in the Google Sheet is **${top.description}** for **₹${top.amount}** (${top.category}) on ${top.date} [${top.transactionId}].`,
          };
        }
      }

      if (lower.includes("category") || lower.includes("breakdown") || lower.includes("food") || lower.includes("travel")) {
        const categories: Record<string, number> = {};
        for (const r of records) {
          categories[r.category] = (categories[r.category] || 0) + (Number(r.amount) || 0);
        }
        const breakdownLines = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => `• **${cat}**: ₹${amt.toLocaleString()}`)
          .join("\n");

        return {
          action: "QUERY",
          answer: `Here is your spending breakdown across Google Sheet categories:\n\n${breakdownLines}\n\n**Total**: ₹${totalSpent.toLocaleString()}`,
        };
      }

      // Default Overview Summary
      return {
        action: "QUERY",
        answer: `You currently have **${records.length} transactions** recorded in your Google Sheet totalling **₹${totalSpent.toLocaleString()}**.\n\nYou can ask me to:\n- Analyze specific categories (e.g. *"How much on food?"*)\n- Find highest expenses (e.g. *"What is my top expense?"*)\n- Add new expenses (e.g. *"Add ₹350 for lunch on GPay"*)\n- Update or delete records (e.g. *"Change TXN-12345 amount to ₹500"* or *"Delete TXN-12345"*).`,
      };
    };

    // 4. Generate decision with AI or deterministic fallback
    const aiResult = await generateStructuredAI<ChatActionDecision>(
      systemPrompt,
      userPrompt,
      schemaHint,
      fallbackGenerator
    );

    const decision = aiResult.data;
    let actionExecuted: { type: string; details?: unknown } | null = null;

    // 5. Execute Sheet Modifications if requested by decision
    if (decision.action === "ADD" && decision.addPayload) {
      const appendRes = await appendExpenseToSheet({
        description: decision.addPayload.description || "Expense",
        category: decision.addPayload.category || "General",
        amount: Number(decision.addPayload.amount) || 0,
        currency: decision.addPayload.currency || "INR",
        paymentMethod: decision.addPayload.paymentMethod || "UPI",
        date: decision.addPayload.date || new Date().toISOString().split("T")[0],
      });
      actionExecuted = { type: "ADD", details: appendRes.record };
    } else if (decision.action === "UPDATE" && decision.updatePayload) {
      const updateRes = await updateExpenseInSheet(
        decision.updatePayload.transactionId,
        decision.updatePayload.updates
      );
      if (updateRes.success) {
        actionExecuted = { type: "UPDATE", details: updateRes.record };
      } else {
        decision.answer += `\n\n*(Note: Could not locate transaction ID ${decision.updatePayload.transactionId} in the Sheet)*`;
      }
    } else if (decision.action === "DELETE" && decision.deletePayload) {
      const deleteRes = await deleteExpenseFromSheet(decision.deletePayload.transactionId);
      if (deleteRes.success) {
        actionExecuted = { type: "DELETE", details: deleteRes.deletedId };
      } else {
        decision.answer += `\n\n*(Note: Could not locate transaction ID ${decision.deletePayload.transactionId} in the Sheet)*`;
      }
    }

    // 6. Fetch fresh ledger after execution
    const updatedRecords = await fetchExpenseRecords();

    return NextResponse.json({
      success: true,
      answer: decision.answer,
      actionTaken: actionExecuted,
      updatedRecords,
      provider: aiResult.provider,
      model: aiResult.model,
    });
  } catch (error) {
    console.error("Expense chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat query" }, { status: 500 });
  }
}

