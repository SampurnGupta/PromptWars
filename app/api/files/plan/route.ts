import { NextRequest, NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";

export interface FileMetadataInput {
  name: string;
  path: string;
  size?: number;
  lastModified?: number;
  type?: string;
}

export interface FileActionPlan {
  originalPath: string;
  targetPath: string;
  operation: "move" | "rename" | "group" | "flag_duplicate" | "keep";
  category: string;
  reason: string;
}

interface AIPlanOutput {
  rationale: string;
  actions: FileActionPlan[];
  detectedDuplicates: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: FileMetadataInput[] = body.files || [];
    const prompt: string = body.prompt || "Organize my files neatly by category and file type";

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Files array is required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert file organizer. Given a list of filenames/paths and the user's natural language intent, create a structured action plan.
Supported operations: "move", "rename", "group", "flag_duplicate", "keep".
Rules:
1. NEVER suggest deleting files.
2. Group related documents, code, images, audio, spreadsheets, or project files into clean folders.
3. If duplicates or near-duplicate versions exist (e.g. "report.pdf" and "report (1).pdf"), flag them.
4. Keep file extensions intact.`;

    const schemaHint = `{
      "rationale": "High-level explanation of reorganization strategy",
      "actions": [
        {
          "originalPath": string,
          "targetPath": string,
          "operation": "move" | "rename" | "group" | "flag_duplicate" | "keep",
          "category": string,
          "reason": string
        }
      ],
      "detectedDuplicates": string[]
    }`;

    const fallback = (): AIPlanOutput => {
      const actions: FileActionPlan[] = [];
      const dupes: string[] = [];

      for (const f of files) {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        let folder = "Documents";
        let cat = "General Documents";

        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
          folder = "Images";
          cat = "Visual Media";
        } else if (["pdf", "docx", "doc", "txt", "rtf"].includes(ext)) {
          folder = "Documents";
          cat = "Reading & Papers";
        } else if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
          folder = "Archives";
          cat = "Compressed Packages";
        } else if (["ts", "js", "py", "json", "html", "css"].includes(ext)) {
          folder = "SourceCode";
          cat = "Developer Code";
        } else if (["xlsx", "xls", "csv"].includes(ext)) {
          folder = "Spreadsheets";
          cat = "Financial & Data";
        }

        const isDuplicateCopy = /\(\d+\)|\bcopy\b/i.test(f.name);
        if (isDuplicateCopy) {
          dupes.push(f.name);
        }

        actions.push({
          originalPath: f.name,
          targetPath: `${folder}/${f.name}`,
          operation: isDuplicateCopy ? "flag_duplicate" : "group",
          category: cat,
          reason: `Grouped into ${folder} according to file extension and user intent.`,
        });
      }

      return {
        rationale: `Organized ${files.length} files systematically into typed folders.`,
        actions,
        detectedDuplicates: dupes,
      };
    };

    const aiResult = await generateStructuredAI<AIPlanOutput>(
      systemPrompt,
      `User Intent: "${prompt}"\nFiles List:\n${JSON.stringify(files.map(f => f.name))}`,
      schemaHint,
      fallback
    );

    return NextResponse.json({
      success: true,
      plan: aiResult.data,
      totalFiles: files.length,
      meta: {
        provider: aiResult.provider,
        latencyMs: aiResult.latencyMs,
      },
    });
  } catch (error) {
    console.error("File planning error:", error);
    return NextResponse.json({ error: "Failed to generate file reorganization plan" }, { status: 500 });
  }
}

