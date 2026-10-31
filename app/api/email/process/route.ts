import { NextRequest, NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { fetchUnreadPrimaryEmails, applyEmailModifications, EmailMessage } from "@/lib/integrations/gmail";

interface EmailClassificationOutput {
  classifications: Array<{
    id: string;
    classification: "important" | "unnecessary" | "neutral";
    actionRequired?: string;
    deadline?: string;
    reason: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmailIds: string[] | undefined = body.emailIds;

    let emails = await fetchUnreadPrimaryEmails();
    if (targetEmailIds && targetEmailIds.length > 0) {
      emails = emails.filter(e => targetEmailIds.includes(e.id));
    }

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unread primary emails to process",
        starredCount: 0,
        markedReadCount: 0,
        classifiedEmails: [],
      });
    }

    const systemPrompt = `You are an executive email intelligence agent. Classify each email into:
1. "important": Action-required messages, critical deadlines, contracts, invoices/bills, academic/career opportunities, urgent personal communications.
2. "unnecessary": Marketing promotions, retail newsletters, flash sales, low-priority digests.
3. "neutral": General informational updates.
For "important" emails, extract concise action required and explicit deadlines if present.`;

    const schemaHint = `{
      "classifications": [
        {
          "id": string,
          "classification": "important" | "unnecessary" | "neutral",
          "actionRequired": string (optional),
          "deadline": string (optional),
          "reason": string
        }
      ]
    }`;

    const emailSummariesForAI = emails.map(e => ({
      id: e.id,
      sender: e.sender,
      subject: e.subject,
      snippet: e.snippet,
    }));

    const fallback = (): EmailClassificationOutput => ({
      classifications: emails.map(e => {
        const text = `${e.subject} ${e.snippet}`.toLowerCase();
        const isUrgent = /urgent|deadline|action required|review|contract|submit|due/i.test(text);
        const isPromo = /sale|discount|off|newsletter|promo|deal|market/i.test(text);

        if (isUrgent) {
          const deadlineMatch = text.match(/(?:by|before|due)\s+([a-z0-9\s,]+)/i);
          return {
            id: e.id,
            classification: "important",
            actionRequired: `Review: ${e.subject}`,
            deadline: deadlineMatch ? deadlineMatch[1].slice(0, 20) : undefined,
            reason: "Detected high-priority keywords & time sensitivity",
          };
        } else if (isPromo) {
          return {
            id: e.id,
            classification: "unnecessary",
            reason: "Marketing promotional material",
          };
        }
        return {
          id: e.id,
          classification: "neutral",
          reason: "Standard correspondence",
        };
      }),
    });

    const aiRes = await generateStructuredAI<EmailClassificationOutput>(
      systemPrompt,
      JSON.stringify(emailSummariesForAI),
      schemaHint,
      fallback
    );

    const starredIds: string[] = [];
    const markReadIds: string[] = [];

    const classifiedEmails: EmailMessage[] = emails.map(e => {
      const cls = aiRes.data.classifications.find(c => c.id === e.id);
      const isImp = cls?.classification === "important";
      const isUnn = cls?.classification === "unnecessary";

      if (isImp) starredIds.push(e.id);
      if (isUnn) markReadIds.push(e.id);

      return {
        ...e,
        classification: cls?.classification || "neutral",
        actionRequired: cls?.actionRequired,
        deadline: cls?.deadline,
        reason: cls?.reason || "",
        isStarred: isImp,
        isRead: isUnn,
      };
    });

    // Execute actual modifications on Gmail / demo store
    await applyEmailModifications(starredIds, markReadIds);

    return NextResponse.json({
      success: true,
      totalAnalyzed: emails.length,
      starredCount: starredIds.length,
      markedReadCount: markReadIds.length,
      classifiedEmails,
      meta: {
        provider: aiRes.provider,
        latencyMs: aiRes.latencyMs,
      },
    });
  } catch (error) {
    console.error("Email processing error:", error);
    return NextResponse.json({ error: "Failed to process emails" }, { status: 500 });
  }
}

