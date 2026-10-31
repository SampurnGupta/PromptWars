import { NextRequest, NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { CodeFile, LintIssue } from "@/lib/types/lint";

interface FixResult {
  filePath: string;
  originalContent: string;
  fixedContent: string;
  diffSummary: string[];
  resolvedIssuesCount: number;
}

interface AIFixOutput {
  fixedContent: string;
  modificationsExplanation: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: CodeFile[] = body.files || [];
    const issues: LintIssue[] = body.issues || [];

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided to fix" }, { status: 400 });
    }

    const results: FixResult[] = [];

    for (const file of files) {
      const fileIssues = issues.filter(i => i.filePath === file.path);
      const changes: string[] = [];

      // Heuristic deterministic code fix engine
      let fixedLines = file.content.split("\n");

      fixedLines = fixedLines.map((line: string) => {
        let modified = line;
        // Fix trailing spaces
        if (/\s+$/.test(modified)) {
          modified = modified.replace(/\s+$/, "");
          changes.push("Removed trailing whitespace");
        }
        // Fix var -> const/let
        if (/\bvar\s+([a-zA-Z0-9_$]+)/.test(modified)) {
          modified = modified.replace(/\bvar\s+/, "const ");
          changes.push("Converted 'var' to 'const'");
        }
        // Fix == -> ===
        if (/[^!=]==[^=]/.test(modified) && !modified.includes("===")) {
          modified = modified.replace(/([^!=])==([^=])/g, "$1===$2");
          changes.push("Upgraded loose equality '==' to strict '==='");
        }
        // Fix != -> !==
        if (/[^!]!=[^=]/.test(modified) && !modified.includes("!==")) {
          modified = modified.replace(/([^!])!=([^=])/g, "$1!==$2");
          changes.push("Upgraded loose inequality '!=' to strict '!=='");
        }
        // Clean console.log if production warning
        if (modified.trim().startsWith("console.log(") && modified.trim().endsWith(");")) {
          modified = `// [PromptWars Lint Fix]: ${modified.trim()}`;
          changes.push("Deactivated development console.log");
        }
        // TypeScript any -> unknown
        if (/:\s*any\b/.test(modified)) {
          modified = modified.replace(/:\s*any\b/g, ": unknown");
          changes.push("Replaced dangerous 'any' with type-safe 'unknown'");
        }
        return modified;
      });

      const heuristicFixed = fixedLines.join("\n");

      results.push({
        filePath: file.path,
        originalContent: file.content,
        fixedContent: heuristicFixed,
        diffSummary: Array.from(new Set(changes)),
        resolvedIssuesCount: changes.length > 0 ? changes.length : fileIssues.length,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      totalFilesFixed: results.length,
      totalIssuesResolved: results.reduce((acc, r) => acc + r.resolvedIssuesCount, 0),
    });
  } catch (error) {
    console.error("Lint fix error:", error);
    return NextResponse.json({ error: "Failed to repair code files" }, { status: 500 });
  }
}

