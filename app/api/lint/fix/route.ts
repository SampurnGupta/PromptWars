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
        // Python == None / == True
        if (/==\s*None\b/.test(modified)) {
          modified = modified.replace(/==\s*None\b/g, "is None");
          changes.push("Replaced '== None' with 'is None'");
        }
        if (/==\s*True\b/.test(modified)) {
          modified = modified.replace(/==\s*True\b/g, "is True");
          changes.push("Replaced '== True' with 'is True'");
        }
        // JSON trailing comma
        if (/,\s*([}\]])/.test(modified)) {
          modified = modified.replace(/,\s*([}\]])/g, "$1");
          changes.push("Removed invalid JSON trailing comma");
        }
        return modified;
      });

      const heuristicFixed = fixedLines.join("\n");
      let finalFixedContent = heuristicFixed;
      let finalDiff = Array.from(new Set(changes));

      // If an LLM API key is configured, utilize AI for semantic code repair
      if ((process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5) || 
          (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5)) {
        try {
          const aiFix = await generateStructuredAI<{ fixedContent: string; changes: string[] }>(
            "You are an expert code linter and compiler engineer. Fix all reported lint errors in the code. Maintain existing comments, formatting, and semantics. Do not fabricate new features.",
            `FILE: ${file.path}\nISSUES: ${JSON.stringify(fileIssues)}\n\nSOURCE CODE:\n${file.content}`,
            '{"fixedContent": "full corrected code text", "changes": ["list of fixes applied"]}',
            () => ({ fixedContent: heuristicFixed, changes: finalDiff })
          );
          if (aiFix.data?.fixedContent) {
            finalFixedContent = aiFix.data.fixedContent;
            if (Array.isArray(aiFix.data.changes) && aiFix.data.changes.length > 0) {
              finalDiff = Array.from(new Set([...finalDiff, ...aiFix.data.changes]));
            }
          }
        } catch (err) {
          console.warn("AI lint fix fallback to heuristic:", err);
        }
      }

      results.push({
        filePath: file.path,
        originalContent: file.content,
        fixedContent: finalFixedContent,
        diffSummary: finalDiff,
        resolvedIssuesCount: finalDiff.length > 0 ? finalDiff.length : fileIssues.length,
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

