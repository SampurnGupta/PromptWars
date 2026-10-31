import { NextRequest, NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";

interface ExtractedExpense {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "Text or transcription is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert expense parser. Convert natural language statements about expenses into structured financial records.
Extract the numerical amount, currency (default to INR if symbols like ₹ or context suggests Indian Rupee, or USD/EUR appropriately), category (e.g., Food & Dining, Utilities, Software, Travel, Groceries, Shopping, Health), concise description, ISO date (YYYY-MM-DD, infer relative terms like 'yesterday', 'today' from current date), and payment method if specified (UPI, Credit Card, Cash, Debit Card, Net Banking).`;

    const schemaHint = `{
      "amount": number,
      "currency": "INR" | "USD" | string,
      "category": string,
      "description": string,
      "date": "YYYY-MM-DD",
      "paymentMethod": string
    }`;

    // Deterministic fallback regex extraction if AI is unavailable
    const fallback = (): ExtractedExpense => {
      // Find amounts like ₹1,200 or 250 or 500
      const amtMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*([0-9,]+(?:\.[0-9]+)?)/i);
      const rawAmt = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, "")) : 100;
      const isYesterday = /yesterday/i.test(text);
      const targetDate = new Date();
      if (isYesterday) targetDate.setDate(targetDate.getDate() - 1);

      let cat = "General";
      if (/lunch|dinner|breakfast|food|coffee|tea|restaurant|swiggy|zomato/i.test(text)) cat = "Food & Dining";
      else if (/electricity|water|wifi|bill|utility|rent/i.test(text)) cat = "Utilities";
      else if (/grocery|vegetables|milk|supermarket|blinkit|zepto/i.test(text)) cat = "Groceries";
      else if (/cab|uber|ola|metro|flight|train|petrol|fuel/i.test(text)) cat = "Transportation";

      let payment = "Cash";
      if (/upi|gpay|phonepe|paytm/i.test(text)) payment = "UPI";
      else if (/card|credit|debit/i.test(text)) payment = "Card";

      return {
        amount: isNaN(rawAmt) ? 250 : rawAmt,
        currency: /₹|inr|rs/i.test(text) ? "INR" : "INR",
        category: cat,
        description: text.slice(0, 80),
        date: targetDate.toISOString().split("T")[0],
        paymentMethod: payment,
      };
    };

    const aiResult = await generateStructuredAI<ExtractedExpense>(
      systemPrompt,
      text,
      schemaHint,
      fallback
    );

    return NextResponse.json({
      success: true,
      extracted: aiResult.data,
      meta: {
        provider: aiResult.provider,
        latencyMs: aiResult.latencyMs,
      },
    });
  } catch (error) {
    console.error("Expense extraction error:", error);
    return NextResponse.json({ error: "Failed to extract expense details" }, { status: 500 });
  }
}

