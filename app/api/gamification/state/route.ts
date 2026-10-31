import { NextRequest, NextResponse } from "next/server";
import { INITIAL_CYCLE_STATE, ProductivityCycleState, VERTICALS_CONFIG, VerticalId } from "@/lib/gamification/types";

let serverState: ProductivityCycleState = { ...INITIAL_CYCLE_STATE };

export async function GET() {
  return NextResponse.json({
    state: serverState,
    verticals: VERTICALS_CONFIG,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verticalId, summary } = body;

    if (!verticalId || !(verticalId in VERTICALS_CONFIG)) {
      return NextResponse.json({ error: "Invalid vertical ID" }, { status: 400 });
    }

    const typedVertical = verticalId as VerticalId;
    if (!serverState.completedVerticals.includes(typedVertical)) {
      serverState.completedVerticals.push(typedVertical);
      serverState.xp = Math.min(serverState.xp + VERTICALS_CONFIG[typedVertical].xpReward, serverState.maxCycleXp);
      serverState.logs.unshift({
        verticalId: typedVertical,
        completedAt: new Date().toISOString(),
        summary: summary || `Completed ${VERTICALS_CONFIG[typedVertical].title}`,
      });
      if (serverState.completedVerticals.length === 4) {
        serverState.puzzleUnlocked = true;
      }
    }

    return NextResponse.json({
      success: true,
      state: serverState,
    });
  } catch (error) {
    console.error("Gamification sync error:", error);
    return NextResponse.json({ error: "Failed to update gamification state" }, { status: 500 });
  }
}

