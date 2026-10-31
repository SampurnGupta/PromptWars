import { NextResponse } from "next/server";
import { fetchUnreadPrimaryEmails } from "@/lib/integrations/gmail";

export async function GET() {
  try {
    const emails = await fetchUnreadPrimaryEmails();
    return NextResponse.json({
      success: true,
      emails,
      totalUnread: emails.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch emails error:", error);
    return NextResponse.json({ error: "Failed to fetch unread primary emails" }, { status: 500 });
  }
}

