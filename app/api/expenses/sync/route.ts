import { NextRequest, NextResponse } from "next/server";
import { appendExpenseToSheet, fetchExpenseRecords } from "@/lib/integrations/sheets";

export async function GET() {
  try {
    const records = await fetchExpenseRecords();
    const totalAmount = records.reduce((sum, item) => sum + item.amount, 0);

    const categoryMap: Record<string, number> = {};
    for (const r of records) {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
    }

    return NextResponse.json({
      success: true,
      records,
      analytics: {
        totalAmount,
        transactionCount: records.length,
        categories: categoryMap,
      },
    });
  } catch (error) {
    console.error("Expense fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch expense records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, category, description, date, paymentMethod } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 });
    }

    const result = await appendExpenseToSheet({
      amount: Number(amount),
      currency: currency || "INR",
      category: category || "General",
      description,
      date: date || new Date().toISOString().split("T")[0],
      paymentMethod: paymentMethod || "UPI",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Expense sync error:", error);
    return NextResponse.json({ error: "Failed to sync expense record" }, { status: 500 });
  }
}

