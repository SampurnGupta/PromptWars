import { NextResponse } from "next/server";

export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5);
  const hasGoogleSheets = Boolean(process.env.GOOGLE_SHEET_ID);
  const isDemo = process.env.DEMO_MODE !== "false";

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "PromptWars Gamified AI Productivity Platform",
    environment: process.env.NODE_ENV || "development",
    integrations: {
      ai: {
        provider: process.env.AI_PROVIDER || "gemini",
        geminiConfigured: hasGemini,
        groqConfigured: hasGroq,
      },
      google: {
        sheetsConfigured: hasGoogleSheets,
        demoModeActive: isDemo,
      },
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
}

