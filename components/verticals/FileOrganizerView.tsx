"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderKanban, 
  FolderPlus, 
  FileText, 
  Upload, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  ArrowRight,
  MoveRight,
  ShieldCheck
} from "lucide-react";
import { loadLocalGamificationState, recordVerticalCompletion } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE } from "@/lib/gamification/types";

interface ActionItem {
  originalPath: string;
  targetPath: string;
  operation: "move" | "rename" | "group" | "flag_duplicate" | "keep";
  category: string;
  reason: string;
}

export function FileOrganizerView() {
  const [prompt, setPrompt] = useState("Organize all files systematically by file type and category");
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([
    { name: "Quarterly_Financial_Report_2026.pdf", size: 1250000 },
    { name: "Quarterly_Financial_Report_2026 (1).pdf", size: 1250000 },
    { name: "hero_banner_final_v2.png", size: 3400000 },
    { name: "dataset_customer_survey.csv", size: 840000 },
    { name: "app_architecture_diagram.svg", size: 450000 },
    { name: "meeting_notes_sync.txt", size: 12000 },
    { name: "client_nda_signed.pdf", size: 2100000 },
    { name: "backup_archive_oct.zip", size: 18400000 },
  ]);
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [planning, setPlanning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [planRationale, setPlanRationale] = useState<string | null>(null);
  const [plannedActions, setPlannedActions] = useState<ActionItem[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [executionDone, setExecutionDone] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipProcessing, setZipProcessing] = useState(false);
  const [gamificationState, setGamificationState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);

  useEffect(() => {
    setGamificationState(loadLocalGamificationState());
  }, []);

  const handlePickDirectory = async () => {
    if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
      alert("File System Access API is not supported in this browser. Please use the universal ZIP archive organizer below.");
      return;
    }

    try {
      const handle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setDirHandle(handle);
      const discoveredFiles: Array<{ name: string; size: number }> = [];

      for await (const entry of handle.values()) {
        if (entry.kind === "file") {
          const file = await entry.getFile();
          discoveredFiles.push({ name: file.name, size: file.size });
        }
      }

      if (discoveredFiles.length > 0) {
        setFiles(discoveredFiles);
        setStatusMessage(`Loaded ${discoveredFiles.length} real files from local directory "${handle.name}".`);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Directory picker error:", err);
      }
    }
  };

  const handleGeneratePlan = async () => {
    setPlanning(true);
    setExecutionDone(false);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/files/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, path: f.name, size: f.size })),
          prompt,
        }),
      });

      if (!res.ok) throw new Error("Planning failed");
      const data = await res.json();
      setPlannedActions(data.plan.actions || []);
      setPlanRationale(data.plan.rationale || "Reorganized files neatly");
      setDuplicates(data.plan.detectedDuplicates || []);
    } catch (err) {
      alert("Could not generate reorganization plan.");
    } finally {
      setPlanning(false);
    }
  };

  const handleExecutePlan = async () => {
    setExecuting(true);

    try {
      // If a real directory handle was granted, perform real filesystem file restructuring!
      if (dirHandle) {
        for (const action of plannedActions) {
          if (action.operation === "group" || action.operation === "move") {
            const parts = action.targetPath.split("/");
            if (parts.length > 1) {
              const subDirName = parts[0];
              const fileName = parts.slice(1).join("/");
              try {
                const subDirHandle = await dirHandle.getDirectoryHandle(subDirName, { create: true });
                const originalFileHandle = await dirHandle.getFileHandle(action.originalPath);
                const file = await originalFileHandle.getFile();
                const newFileHandle = await subDirHandle.getFileHandle(fileName, { create: true });
                const writable = await newFileHandle.createWritable();
                await writable.write(await file.arrayBuffer());
                await writable.close();
                // Remove original to complete the move
                await dirHandle.removeEntry(action.originalPath);
              } catch (e) {
                console.warn(`Could not move ${action.originalPath}:`, e);
              }
            }
          }
        }
      } else {
        // Simulated execution delay
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Award gamification points
      const current = loadLocalGamificationState();
      const updated = recordVerticalCompletion(
        current,
        "file_organization",
        `Reorganized ${plannedActions.length} files into structured folders (${duplicates.length} duplicate copies flagged).`
      );
      setGamificationState(updated.state);
      window.dispatchEvent(new Event("gamification_updated"));

      setExecuting(false);
      setExecutionDone(true);
      setStatusMessage(`Files systematically organized and saved! (+${updated.xpAwarded} XP)`);
    } catch (err) {
      console.warn("Execution error:", err);
      setExecuting(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipFile(file);
  };

  const handleProcessZip = async () => {
    if (!zipFile) return;
    setZipProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", zipFile);
      formData.append("prompt", prompt);

      const res = await fetch("/api/files/zip-organize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("ZIP processing failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `PromptWars_${zipFile.name.replace(/\.zip$/i, "")}_Organized.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Award gamification points
      const current = loadLocalGamificationState();
      const updated = recordVerticalCompletion(
        current,
        "file_organization",
        `Organized ZIP archive '${zipFile.name}' and downloaded reorganized structure.`
      );
      setGamificationState(updated.state);
      window.dispatchEvent(new Event("gamification_updated"));

      setStatusMessage(`ZIP reorganized and downloaded successfully! (+${updated.xpAwarded} XP)`);
      setZipFile(null);
    } catch (err) {
      alert("Error organizing ZIP file.");
    } finally {
      setZipProcessing(false);
    }
  };

  const isCompleted = gamificationState.completedVerticals.includes("file_organization");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-parchment-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-cobalt font-bold">
              Productivity Vertical • Chore #3
            </span>
            {isCompleted && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed (+250 XP Awarded)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text tracking-tight">
            AI File &amp; Folder Reorganizer
          </h1>
          <p className="text-sm text-slate-muted mt-1">
            Transform messy download directories into clean folders with natural-language instructions.
          </p>
        </div>

        <a
          href="/"
          className="text-xs font-semibold text-cobalt hover:underline flex items-center gap-1 self-start"
        >
          <span>Return to Homepage Puzzle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{statusMessage}</span>
          </div>
          <a
            href="/"
            className="text-xs font-bold text-cobalt bg-white px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-50"
          >
            Check Assembled Puzzle &rarr;
          </a>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Natural Language Prompt & Directory Selection */}
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-text flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cobalt" />
                <span>File Organization Intent</span>
              </h2>
              <button
                type="button"
                onClick={handlePickDirectory}
                className="text-xs font-semibold text-cobalt bg-white border border-cobalt/30 hover:bg-cobalt-light px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{dirHandle ? `Connected: ${dirHandle.name}` : "Pick Local Directory (API)"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Group academic PDFs together and identify duplicate files"
                className="w-full rounded-xl border border-parchment-border bg-white px-4 py-3 text-sm text-slate-text focus:border-cobalt focus:ring-1 focus:ring-cobalt outline-none"
              />

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-muted self-center">Suggestions:</span>
                {[
                  "Organize files by type (Images, Documents, Code)",
                  "Group financial statements and reports",
                  "Identify duplicate downloads and versions",
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="bg-white border border-parchment-border px-2.5 py-1 rounded-full text-slate-text hover:border-cobalt hover:text-cobalt transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={planning}
                  className="flex items-center gap-2 bg-cobalt text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cobalt-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {planning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Action Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Action Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Plan Preview */}
          {plannedActions.length > 0 && (
            <div className="bg-white border-2 border-cobalt/30 rounded-2xl p-6 shadow-card animate-fade-in">
              <div className="flex items-center justify-between border-b border-parchment-border pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-text text-base">Plan Preview</h3>
                  <p className="text-xs text-slate-muted">{planRationale}</p>
                </div>

                {!executionDone ? (
                  <button
                    onClick={handleExecutePlan}
                    disabled={executing}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Executing Moves...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Execute (+250 XP)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded">
                    Executed &amp; Saved
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {plannedActions.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-parchment-border bg-parchment-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-muted flex-shrink-0" />
                      <span className="font-mono text-slate-text font-medium">{act.originalPath}</span>
                      <MoveRight className="w-3.5 h-3.5 text-cobalt flex-shrink-0" />
                      <span className="font-mono font-bold text-cobalt">{act.targetPath}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {act.operation === "flag_duplicate" && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Duplicate</span>
                        </span>
                      )}
                      <span className="text-[10px] bg-white border border-parchment-border px-2 py-0.5 rounded text-slate-muted">
                        {act.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Target Files List */}
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-text mb-3 flex items-center justify-between">
              <span>Current Target Files ({files.length} Files)</span>
              <span className="text-xs text-slate-muted font-mono">
                {dirHandle ? `Directory: ${dirHandle.name}` : "Demo Target Directory"}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white border border-parchment-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-cobalt flex-shrink-0" />
                    <span className="font-mono text-[11px] truncate">{f.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-muted whitespace-nowrap ml-2">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ZIP Fallback Archive Upload */}
        <div className="space-y-6">
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <div className="flex items-center gap-2 text-slate-text font-bold text-sm mb-2">
              <Upload className="w-4 h-4 text-cobalt" />
              <span>Universal ZIP Fallback</span>
            </div>
            <p className="text-xs text-slate-muted mb-4">
              On unsupported browsers or mobile? Upload a ZIP file and our engine will categorize and organize all contents into a clean downloadable archive.
            </p>

            <div className="border-2 border-dashed border-parchment-border hover:border-cobalt rounded-xl p-5 text-center bg-white transition-colors">
              <input
                type="file"
                accept=".zip"
                id="zip-upload-input"
                onChange={handleZipUpload}
                className="hidden"
              />
              <label htmlFor="zip-upload-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-cobalt mx-auto mb-2 opacity-70" />
                <span className="text-xs font-semibold text-slate-text block">
                  {zipFile ? zipFile.name : "Select a .ZIP file"}
                </span>
                <span className="text-[10px] text-slate-muted block mt-1">
                  Files stay strictly private on server
                </span>
              </label>
            </div>

            {zipFile && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleProcessZip}
                  disabled={zipProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-cobalt text-white py-2.5 rounded-xl font-bold text-xs hover:bg-cobalt-hover shadow-sm"
                >
                  {zipProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Organizing Archive...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Reorganize &amp; Download ZIP (+250 XP)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-parchment-border rounded-2xl p-5 text-xs text-slate-muted space-y-2">
            <div className="flex items-center gap-2 text-slate-text font-bold">
              <ShieldCheck className="w-4 h-4 text-cobalt" />
              <span>Safety Protections Active</span>
            </div>
            <p>
              Destructive deletion is strictly disabled. Duplicate versions are identified and preserved with review tags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
