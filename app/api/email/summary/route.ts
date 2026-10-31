import { NextRequest, NextResponse } from "next/server";
import { sendEmailDigestViaGmail, EmailCleanupSummary } from "@/lib/integrations/gmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const summary: EmailCleanupSummary = {
      totalAnalyzed: body.totalAnalyzed || 0,
      unnecessaryMarkedRead: body.unnecessaryMarkedRead || 0,
      importantStarred: body.importantStarred || 0,
      actionRequiredItems: body.actionRequiredItems || [],
      completedAt: new Date().toISOString(),
      deliveryStatus: "delivered_via_gmail",
    };

    const deliveryResult = await sendEmailDigestViaGmail(summary);

    return NextResponse.json({
      success: true,
      delivered: deliveryResult.delivered,
      deliveryMethod: deliveryResult.deliveryMethod,
      summary,
    });
  } catch (error) {
    console.error("Email summary dispatch error:", error);
    return NextResponse.json({ error: "Failed to dispatch email summary" }, { status: 500 });
  }
}

