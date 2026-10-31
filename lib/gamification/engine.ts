import {
  ProductivityCycleState,
  INITIAL_CYCLE_STATE,
  VerticalId,
  VERTICALS_CONFIG,
  TaskCompletionLog,
} from "./types";

const STORAGE_KEY = "promptwars_productivity_state_v1";

export function loadLocalGamificationState(): ProductivityCycleState {
  if (typeof window === "undefined") {
    return INITIAL_CYCLE_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CYCLE_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_CYCLE_STATE,
      ...parsed,
    };
  } catch (err) {
    console.warn("Failed to load local gamification state:", err);
    return INITIAL_CYCLE_STATE;
  }
}

export function saveLocalGamificationState(state: ProductivityCycleState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save local gamification state:", err);
  }
}

export function recordVerticalCompletion(
  currentState: ProductivityCycleState,
  verticalId: VerticalId,
  summary: string,
  details?: Record<string, unknown>
): { state: ProductivityCycleState; isNewCompletion: boolean; xpAwarded: number } {
  // Check if already completed in this cycle
  if (currentState.completedVerticals.includes(verticalId)) {
    return {
      state: currentState,
      isNewCompletion: false,
      xpAwarded: 0,
    };
  }

  const verticalConfig = VERTICALS_CONFIG[verticalId];
  const newXpAwarded = verticalConfig.xpReward;
  const newCompleted = [...currentState.completedVerticals, verticalId];
  const newXp = Math.min(currentState.xp + newXpAwarded, currentState.maxCycleXp);
  const puzzleUnlocked = newCompleted.length === 4;

  const newLog: TaskCompletionLog = {
    verticalId,
    completedAt: new Date().toISOString(),
    summary,
    details,
  };

  const updatedState: ProductivityCycleState = {
    ...currentState,
    xp: newXp,
    completedVerticals: newCompleted,
    logs: [newLog, ...currentState.logs],
    puzzleUnlocked,
  };

  saveLocalGamificationState(updatedState);

  return {
    state: updatedState,
    isNewCompletion: true,
    xpAwarded: newXpAwarded,
  };
}

export function recordManualPuzzleSolved(
  currentState: ProductivityCycleState,
  moves: number,
  timeSeconds: number
): ProductivityCycleState {
  const updatedState: ProductivityCycleState = {
    ...currentState,
    manualPuzzleSolved: true,
    manualPuzzleMoves: moves,
    manualPuzzleTimeSeconds: timeSeconds,
  };
  saveLocalGamificationState(updatedState);
  return updatedState;
}

export function startNewCycle(currentState: ProductivityCycleState): ProductivityCycleState {
  const artworks = ["alpine_sanctuary", "golden_hour_fjord", "kyoto_zen_garden", "matterhorn_sunrise"];
  const nextArtwork = artworks[(currentState.cycleNumber) % artworks.length];

  const newState: ProductivityCycleState = {
    cycleId: `cycle-${currentState.cycleNumber + 1}`,
    cycleNumber: currentState.cycleNumber + 1,
    xp: 0,
    maxCycleXp: 1000,
    completedVerticals: [],
    logs: currentState.logs, // preserve historical logs
    puzzleUnlocked: false,
    manualPuzzleSolved: false,
    manualPuzzleMoves: 0,
    manualPuzzleTimeSeconds: 0,
    activeArtworkId: nextArtwork,
  };

  saveLocalGamificationState(newState);
  return newState;
}

