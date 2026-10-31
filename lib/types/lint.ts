export interface CodeFile {
  path: string;
  content: string;
}

export interface LintIssue {
  filePath: string;
  line: number;
  column?: number;
  ruleId: string;
  message: string;
  severity: "error" | "warning";
  suggestedFix?: string;
}

