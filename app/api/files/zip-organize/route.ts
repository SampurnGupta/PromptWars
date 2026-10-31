import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const prompt = (formData.get("prompt") as string) || "Organize files by type";

    if (!file) {
      return NextResponse.json({ error: "No ZIP file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputZip = await JSZip.loadAsync(arrayBuffer);
    const outputZip = new JSZip();

    const originalFiles: string[] = [];
    const fileContents: Record<string, Uint8Array> = {};

    for (const [relativePath, zipEntry] of Object.entries(inputZip.files)) {
      if (zipEntry.dir) continue;
      // Guard against zip path traversal
      if (relativePath.includes("..")) continue;

      const fileName = relativePath.split("/").pop() || relativePath;
      originalFiles.push(fileName);
      const data = await zipEntry.async("uint8array");
      fileContents[fileName] = data;
    }

    // Determine target subdirectories based on extension and intent
    for (const fileName of originalFiles) {
      const ext = fileName.split(".").pop()?.toLowerCase() || "";
      let targetDir = "Misc";

      if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
        targetDir = "Images";
      } else if (["pdf", "docx", "doc", "txt", "md"].includes(ext)) {
        targetDir = "Documents";
      } else if (["ts", "js", "py", "json", "html", "css"].includes(ext)) {
        targetDir = "Code";
      } else if (["csv", "xlsx", "xls"].includes(ext)) {
        targetDir = "Data";
      } else if (["zip", "tar", "gz"].includes(ext)) {
        targetDir = "Archives";
      }

      outputZip.file(`${targetDir}/${fileName}`, fileContents[fileName]);
    }

    // Include an organization manifest file
    const manifest = {
      reorganizedAt: new Date().toISOString(),
      promptApplied: prompt,
      totalFiles: originalFiles.length,
      filesReorganized: originalFiles,
    };
    outputZip.file("_ORGANIZATION_MANIFEST.json", JSON.stringify(manifest, null, 2));

    const generatedZipBuffer = await outputZip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(generatedZipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="PromptWars_Organized.zip"',
        "X-Reorganized-Count": String(originalFiles.length),
      },
    });
  } catch (error) {
    console.error("ZIP reorganization error:", error);
    return NextResponse.json({ error: "Failed to process ZIP archive" }, { status: 500 });
  }
}

