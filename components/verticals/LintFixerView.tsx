"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { 
  Code2, 
  Github, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Download, 
  AlertCircle, 
  FileCode,
  ArrowRight,
  GitCompare,
  Terminal,
  Plus
} from "lucide-react";
import { loadLocalGamificationState, recordVerticalCompletion } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE } from "@/lib/gamification/types";
import { playChoreSnapSound } from "@/lib/sound";

interface CodeFile {
  path: string;
  content: string;
}

interface LintIssue {
  filePath: string;
  line: number;
  ruleId: string;
  message: string;
  severity: "error" | "warning";
}

interface FixResult {
  filePath: string;
  originalContent: string;
  fixedContent: string;
  diffSummary: string[];
  resolvedIssuesCount: number;
}

export function LintFixerView() {
  const [activeTab, setActiveTab] = useState<"github" | "manual" | "scratchpad">("github");
  const [scratchCode, setScratchCode] = useState(`var total = 0;\nfunction calculateDiscount(price) {\n  if (price == 0) {\n    console.log("Zero price detected");   \n    return 0;\n  }\n  var discount = price * 0.15;\n  return price - discount;\n}\n`);
  const [scratchFilename, setScratchFilename] = useState("scratchpad.js");
  const [repoUrl, setRepoUrl] = useState("https://github.com/facebook/react");
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [issues, setIssues] = useState<LintIssue[]>([]);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [gamificationState, setGamificationState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);

  const handleLoadSampleCode = () => {
    setFiles([
      {
        path: "src/paymentProcessor.js",
        content: `var transactionFee = 2.50;\nfunction processOrder(price, user) {\n  if (price == 0) {\n    console.log("Order is free");   \n    return 0;\n  }\n  var total = price + transactionFee;\n  return total;\n}\n`,
      },
      {
        path: "src/authService.ts",
        content: `export function verifySession(session: any) {\n  var isValid = session.active;\n  if (isValid != null) {\n    console.log("Session validated"); \n  }\n  return isValid;\n}\n`,
      },
    ]);
    setStatusMessage("Loaded 2 sample code files for lint testing.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFiles: CodeFile[] = [];
    let readCount = 0;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        newFiles.push({
          path: f.name,
          content: text,
        });
        readCount++;
        if (readCount === uploadedFiles.length) {
          setFiles((prev) => [...newFiles, ...prev]);
          setStatusMessage(`Uploaded ${newFiles.length} local files for lint inspection.`);
          setActiveTab("manual");
        }
      };
      reader.readAsText(f);
    }
  };

  const handleFetchGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setAnalyzing(true);
    setIssues([]);
    setFixResults([]);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/lint/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      if (!res.ok) throw new Error("GitHub fetch failed");
      const data = await res.json();
      setFiles(data.files || []);
      setStatusMessage(`Ingested ${data.files.length} code files from ${data.repoName}. Ready for lint scan.`);
    } catch (err) {
      alert("Failed to fetch public repository files.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScanLint = async () => {
    setAnalyzing(true);
    setFixResults([]);
    try {
      const res = await fetch("/api/lint/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setIssues(data.issues || []);
      setStatusMessage(`Detected ${data.issues.length} lint/style issues across ${data.filesScanned} files.`);
    } catch (err) {
      alert("Error scanning files for lint issues.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyFixes = async () => {
    setFixing(true);
    try {
      const res = await fetch("/api/lint/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, issues }),
      });

      if (!res.ok) throw new Error("Fix failed");
      const data = await res.json();
      setFixResults(data.results || []);

      // Award gamification points
      const current = loadLocalGamificationState();
      const updated = recordVerticalCompletion(
        current,
        "lint_fixing",
        `Resolved ${data.totalIssuesResolved} code issues across ${data.totalFilesFixed} files.`
      );
      setGamificationState(updated.state);
      playChoreSnapSound();
      window.dispatchEvent(new Event("gamification_updated"));

      setStatusMessage(`All lint issues automatically repaired! (+${updated.xpAwarded} XP)`);
    } catch (err) {
      alert("Error applying automated fixes.");
    } finally {
      setFixing(false);
    }
  };

  const handleDownloadFixedZip = async () => {
    if (fixResults.length === 0) return;
    const zip = new JSZip();

    for (const r of fixResults) {
      zip.file(r.filePath, r.fixedContent);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PromptWars_Lint_Fixed_Files.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const isCompleted = gamificationState.completedVerticals.includes("lint_fixing");

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-parchment-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-cobalt font-bold">
              Productivity Vertical • Chore #4
            </span>
            {isCompleted && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed (+250 XP Awarded)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text tracking-tight">
            AI-Powered Lint &amp; Code Repair
          </h1>
          <p className="text-sm text-slate-muted mt-1">
            End tedious syntax fixing. Ingest GitHub repositories or upload local files to auto-repair lint warnings with clean diffs.
          </p>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-cobalt hover:underline flex items-center gap-1 self-start"
        >
          <span>Return to Homepage Puzzle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{statusMessage}</span>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-cobalt bg-white px-3 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-50"
          >
            Check Assembled Artwork &rarr;
          </Link>
        </div>
      )}

      {/* Tabs & Upload Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "github"
                ? "bg-cobalt text-white shadow-sm"
                : "bg-white border border-parchment-border text-slate-text hover:bg-parchment-surface"
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Public GitHub Repo</span>
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "manual"
                ? "bg-cobalt text-white shadow-sm"
                : "bg-white border border-parchment-border text-slate-text hover:bg-parchment-surface"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Active Code Files ({files.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("scratchpad")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scratchpad"
                ? "bg-cobalt text-white shadow-sm"
                : "bg-white border border-parchment-border text-slate-text hover:bg-parchment-surface"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Live Scratchpad</span>
          </button>
        </div>

        <div>
          <input
            type="file"
            multiple
            accept=".js,.jsx,.ts,.tsx,.py,.json"
            id="local-code-upload"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="local-code-upload"
            className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-parchment-border hover:border-cobalt hover:bg-cobalt-light/30 px-3 py-2 rounded-xl text-xs font-semibold text-cobalt transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Local Code Files</span>
          </label>
        </div>
      </div>

      {/* Scratchpad Code Input */}
      {activeTab === "scratchpad" && (
        <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-text">Virtual File:</span>
              <select
                value={scratchFilename}
                onChange={(e) => setScratchFilename(e.target.value)}
                className="bg-white border border-parchment-border text-xs font-mono rounded-lg px-2.5 py-1 text-slate-text outline-none focus:border-cobalt"
              >
                <option value="scratchpad.js">scratchpad.js (JavaScript)</option>
                <option value="scratchpad.ts">scratchpad.ts (TypeScript)</option>
                <option value="processor.py">processor.py (Python)</option>
                <option value="config.json">config.json (JSON)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                const existingIdx = files.findIndex(f => f.path === scratchFilename);
                if (existingIdx >= 0) {
                  const updated = [...files];
                  updated[existingIdx].content = scratchCode;
                  setFiles(updated);
                } else {
                  setFiles(prev => [{ path: scratchFilename, content: scratchCode }, ...prev]);
                }
                setStatusMessage(`Loaded "${scratchFilename}" into target files for scanning.`);
              }}
              className="text-xs font-semibold text-cobalt bg-white border border-cobalt/30 hover:bg-cobalt-light px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sync to Target Files</span>
            </button>
          </div>
          <textarea
            value={scratchCode}
            onChange={(e) => setScratchCode(e.target.value)}
            rows={7}
            className="w-full rounded-xl border border-parchment-border bg-slate-900 text-emerald-400 font-mono text-xs p-4 focus:border-cobalt outline-none resize-y"
          />
        </div>
      )}
      {activeTab === "github" && (
        <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle mb-6">
          <form onSubmit={handleFetchGithub} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full rounded-xl border border-parchment-border bg-white px-4 py-3 text-sm text-slate-text font-mono focus:border-cobalt focus:ring-1 focus:ring-cobalt outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="flex items-center justify-center gap-2 bg-cobalt text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-cobalt-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              <span>Ingest Repository</span>
            </button>
          </form>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="bg-white border border-parchment-border rounded-2xl p-4 shadow-subtle mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-bold text-slate-text">{files.length} Target Files</span>
          <span className="text-slate-muted">•</span>
          <span className="text-amber-600 font-bold">{issues.length} Issues Detected</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanLint}
            disabled={analyzing || files.length === 0}
            className="flex items-center gap-1.5 bg-parchment-surface border border-parchment-border hover:bg-parchment text-slate-text text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
          >
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5 text-cobalt" />}
            <span>Run Lint Scan</span>
          </button>

          <button
            onClick={handleApplyFixes}
            disabled={fixing || files.length === 0}
            className="flex items-center gap-2 bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm"
          >
            {fixing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying AI Fixes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Repair All Issues (+250 XP)</span>
              </>
            )}
          </button>

          {fixResults.length > 0 && (
            <button
              onClick={handleDownloadFixedZip}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Fixed ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Issues Detected Breakdown */}
      {issues.length > 0 && fixResults.length === 0 && (
        <div className="mb-6 bg-parchment-card border border-amber-300 rounded-2xl p-5 shadow-subtle animate-fade-in">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Detected Lint Violations ({issues.length})</span>
          </div>

          <div className="space-y-2">
            {issues.map((iss, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-parchment-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    {iss.ruleId}
                  </span>
                  <span className="text-slate-text">{iss.message}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-muted">
                  {iss.filePath} : line {iss.line}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Before / After Diff Viewer */}
      {fixResults.length > 0 ? (
        <div className="space-y-6 animate-fade-in">
          {fixResults.map((result, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-card"
            >
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-900">
                  <FileCode className="w-4 h-4 text-emerald-700" />
                  <span>{result.filePath}</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.diffSummary.map((diff, dIdx) => (
                    <span
                      key={dIdx}
                      className="bg-white text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    >
                      ✓ {diff}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-parchment-border text-xs font-mono">
                {/* Original Code */}
                <div className="p-4 bg-red-50/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-2">
                    Original (With Lint Violations)
                  </span>
                  <pre className="text-slate-text overflow-x-auto whitespace-pre p-2 bg-white rounded border border-red-200">
                    {result.originalContent}
                  </pre>
                </div>

                {/* Fixed Code */}
                <div className="p-4 bg-emerald-50/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">
                    Fixed Code (Clean &amp; Strict)
                  </span>
                  <pre className="text-slate-text overflow-x-auto whitespace-pre p-2 bg-white rounded border border-emerald-300">
                    {result.fixedContent}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white border border-dashed border-parchment-border rounded-2xl p-8 text-center shadow-subtle">
          <FileCode className="w-8 h-8 text-cobalt/60 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-text">No Code Files Loaded</h4>
          <p className="text-[11px] text-slate-muted mt-1 max-w-sm mx-auto">
            Ingest a public GitHub repository, upload local files from your machine, or type code in the Live Scratchpad.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleLoadSampleCode}
              className="text-xs text-cobalt hover:underline font-semibold"
            >
              Load Sample Code
            </button>
          </div>
        </div>
      ) : (
        /* Target Files Preview */
        <div className="space-y-4">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-white border border-parchment-border rounded-xl p-4 shadow-subtle"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-parchment-border">
                <span className="font-mono text-xs font-bold text-slate-text flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cobalt" />
                  <span>{file.path}</span>
                </span>
                <span className="text-[10px] text-slate-muted font-mono">{file.content.length} chars</span>
              </div>
              <pre className="text-xs font-mono text-slate-muted bg-parchment-surface p-3 rounded-lg overflow-x-auto whitespace-pre border border-parchment-border">
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
