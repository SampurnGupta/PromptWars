export type VerticalId = 
  | "email_management"
  | "expense_tracking"
  | "file_organization"
  | "lint_fixing";

export interface VerticalMetadata {
  id: VerticalId;
  title: string;
  shortName: string;
  description: string;
  route: string;
  xpReward: number;
  quadrant: 1 | 2 | 3 | 4; // Quadrant in Stage 1 puzzle
  iconName: string;
}

export const VERTICALS_CONFIG: Record<VerticalId, VerticalMetadata> = {
  email_management: {
    id: "email_management",
    title: "Email Cleanup & Intelligence",
    shortName: "Email Cleanup",
    description: "Scan unread primary emails, star priorities & deadlined items, mark promotional clutter read.",
    route: "/email",
    xpReward: 250,
    quadrant: 1,
    iconName: "Mail",
  },
  expense_tracking: {
    id: "expense_tracking",
    title: "Natural Language Expense Tracker",
    shortName: "Expense Tracker",
    description: "Type or speak casual expenses to log structured data directly into Google Sheets.",
    route: "/expenses",
    xpReward: 250,
    quadrant: 2,
    iconName: "Receipt",
  },
  file_organization: {
    id: "file_organization",
    title: "AI File & Folder Reorganizer",
    shortName: "File Reorganizer",
    description: "Declare how you want messy folders structured; executes via File System Access API or ZIP.",
    route: "/files",
    xpReward: 250,
    quadrant: 3,
    iconName: "FolderKanban",
  },
  lint_fixing: {
    id: "lint_fixing",
    title: "AI-Powered Lint & Code Repair",
    shortName: "Lint Repair",
    description: "Upload code files or provide a public GitHub URL to automatically detect and repair lint errors.",
    route: "/lint",
    xpReward: 250,
    quadrant: 4,
    iconName: "Code2",
  },
};

export interface TaskCompletionLog {
  verticalId: VerticalId;
  completedAt: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface ProductivityCycleState {
  cycleId: string;
  cycleNumber: number;
  xp: number;
  maxCycleXp: number;
  completedVerticals: VerticalId[];
  logs: TaskCompletionLog[];
  puzzleUnlocked: boolean;
  manualPuzzleSolved: boolean;
  manualPuzzleMoves: number;
  manualPuzzleTimeSeconds: number;
  activeArtworkId: string;
  lastActiveDateIST: string;
}

export function getCurrentISTDateString(): string {
  try {
    // Standard IANA timezone representation for Indian Standard Time (UTC+5:30)
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  } catch {
    // Fallback: UTC + 5.5 hours
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime.toISOString().split("T")[0];
  }
}

export const INITIAL_CYCLE_STATE: ProductivityCycleState = {
  cycleId: "cycle-1",
  cycleNumber: 1,
  xp: 0,
  maxCycleXp: 1000,
  completedVerticals: [],
  logs: [],
  puzzleUnlocked: false,
  manualPuzzleSolved: false,
  manualPuzzleMoves: 0,
  manualPuzzleTimeSeconds: 0,
  activeArtworkId: "alpine_sanctuary",
  lastActiveDateIST: getCurrentISTDateString(),
};

