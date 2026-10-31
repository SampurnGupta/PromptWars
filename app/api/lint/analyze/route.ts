import { NextRequest, NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { CodeFile, LintIssue } from "@/lib/types/lint";

export type { CodeFile, LintIssue };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: CodeFile[] = body.files || [];

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Code files are required" }, { status: 400 });
    }

    const issues: LintIssue[] = [];

    // 1. Static pattern rule analysis across common lint errors
    for (const f of files) {
      const lines = f.content.split("\n");
      const ext = f.path.split(".").pop()?.toLowerCase();

      lines.forEach((line, index) => {
        const lineNum = index + 1;

        // Rule 1: console.log left in production
        if (/console\.(log|debug|info)\(/.test(line)) {
          issues.push({
            filePath: f.path,
            line: lineNum,
            ruleId: "no-console",
            message: "Unexpected console statement in production code.",
            severity: "warning",
          });
        }

        // Rule 2: 'var' usage instead of let/const
        if (/\bvar\s+[a-zA-Z0-9_$]+/.test(line)) {
          issues.push({
            filePath: f.path,
            line: lineNum,
            ruleId: "no-var",
            message: "Unexpected 'var', use 'let' or 'const' instead.",
            severity: "error",
          });
        }

        // Rule 3: Loose equality '==' or '!='
        if (/[^!=]==[^=]/.test(line) && !/===\s*true/.test(line)) {
          issues.push({
            filePath: f.path,
            line: lineNum,
            ruleId: "eqeqeq",
            message: "Expected '===' and instead saw '=='.",
            severity: "error",
          });
        }

        // Rule 4: Unused trailing whitespace
        if (/\s+$/.test(line)) {
          issues.push({
            filePath: f.path,
            line: lineNum,
            ruleId: "no-trailing-spaces",
            message: "Trailing spaces not allowed.",
            severity: "warning",
          });
        }

        // Rule 5: 'any' type in TypeScript
        if (ext === "ts" || ext === "tsx") {
          if (/:\s*any\b/.test(line)) {
            issues.push({
              filePath: f.path,
              line: lineNum,
              ruleId: "@typescript-eslint/no-explicit-any",
              message: "Unexpected 'any'. Specify a more specific type.",
              severity: "warning",
            });
          }
        }

        // Rule 6: Python specific checks
        if (ext === "py") {
          if (/^from\s+[a-zA-Z0-9_.]+\s+import\s+\*/.test(line.trim())) {
            issues.push({
              filePath: f.path,
              line: lineNum,
              ruleId: "python-no-wildcard-import",
              message: "Avoid wildcard imports 'from module import *'.",
              severity: "warning",
            });
          }
          if (/==\s*(None|True|False)\b/.test(line)) {
            issues.push({
              filePath: f.path,
              line: lineNum,
              ruleId: "python-comparison-to-singleton",
              message: "Comparison to None/True/False should be 'is' or 'is not'.",
              severity: "warning",
            });
          }
          if (/^\s*print\(/.test(line)) {
            issues.push({
              filePath: f.path,
              line: lineNum,
              ruleId: "python-no-print",
              message: "Unexpected print statement in production code.",
              severity: "warning",
            });
          }
        }

        // Rule 7: JSON trailing commas
        if (ext === "json") {
          if (/,\s*([}\]])/.test(line)) {
            issues.push({
              filePath: f.path,
              line: lineNum,
              ruleId: "json-no-trailing-comma",
              message: "Trailing commas are invalid in standard JSON.",
              severity: "error",
            });
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      totalIssues: issues.length,
      issues,
      filesScanned: files.length,
    });
  } catch (error) {
    console.error("Lint analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze code for lint issues" }, { status: 500 });
  }
}

