"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Receipt, 
  FolderKanban, 
  Code2, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { ScatteredPuzzle } from "@/components/puzzle/ScatteredPuzzle";
import { ManualPuzzleModal } from "@/components/puzzle/ManualPuzzleModal";
import { loadLocalGamificationState, startNewCycle } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE, VERTICALS_CONFIG } from "@/lib/gamification/types";
import { getRandomInternetArtwork } from "@/lib/gamification/artwork";

export default function HomePage() {
  const [state, setState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);
  const [manualPuzzleOpen, setManualPuzzleOpen] = useState(false);
  const [artwork, setArtwork] = useState<{ id: string; title: string; url: string; photographer: string }>({
    id: "mountain_lake",
    title: "Alpine Lake Reflection",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    photographer: "Bailey Zindel",
  });

  useEffect(() => {
    setState(loadLocalGamificationState());
    // Use a fresh random internet image on every page load
    setArtwork(getRandomInternetArtwork());

    const handleUpdate = () => {
      setState(loadLocalGamificationState());
    };

    window.addEventListener("gamification_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Auto-refresh checker for 12:00 AM IST midnight rollover
    const midnightChecker = setInterval(() => {
      const refreshed = loadLocalGamificationState();
      setState((prev) => {
        if (refreshed.cycleId !== prev.cycleId || refreshed.xp !== prev.xp) {
          return refreshed;
        }
        return prev;
      });
    }, 20000);

    return () => {
      window.removeEventListener("gamification_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(midnightChecker);
    };
  }, []);

  const progressPercentage = Math.round((state.completedVerticals.length / 4) * 100);
  const isAllComplete = state.completedVerticals.length === 4;

  const quickVerticals = [
    {
      id: "email_management",
      title: "Clean Inbox",
      desc: "Star priorities & archive promo noise",
      route: "/email",
      icon: Mail,
      isDone: state.completedVerticals.includes("email_management"),
    },
    {
      id: "expense_tracking",
      title: "Log Expenses",
      desc: "Speak or type receipts to Google Sheets",
      route: "/expenses",
      icon: Receipt,
      isDone: state.completedVerticals.includes("expense_tracking"),
    },
    {
      id: "file_organization",
      title: "Organize Files",
      desc: "Group downloads & flag duplicates",
      route: "/files",
      icon: FolderKanban,
      isDone: state.completedVerticals.includes("file_organization"),
    },
    {
      id: "lint_fixing",
      title: "Repair Code",
      desc: "Auto-fix lint errors with verified diffs",
      route: "/lint",
      icon: Code2,
      isDone: state.completedVerticals.includes("lint_fixing"),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="border-b border-parchment-border bg-gradient-to-b from-parchment-surface to-parchment py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-text tracking-tight max-w-3xl mx-auto leading-tight">
            Automate the Chores. Complete the Puzzle.
          </h1>

          <p className="text-sm sm:text-base text-slate-muted max-w-2xl mx-auto font-normal">
            Real background execution powered by AI. Clear unread emails, log expenses to Google Sheets, restructure messy downloads, and repair codebase lint warnings.
          </p>

          {/* Productivity Cycle Progress Metric */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
              <span className="text-slate-text">Productivity Progress</span>
              <span className="text-cobalt">{progressPercentage}% Complete ({state.xp} / 1000 XP)</span>
            </div>
            <div className="w-full h-3 bg-parchment-border rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-cobalt rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stage 1: Scattered Puzzle Canvas */}
      <section className="px-4 py-8">
        <ScatteredPuzzle
          state={state}
          artworkUrl={artwork.url}
          artworkTitle={artwork.title}
          photographer={artwork.photographer}
          onRandomizeArtwork={() => setArtwork(getRandomInternetArtwork())}
          onOpenManualPuzzle={() => setManualPuzzleOpen(true)}
        />
      </section>

      {/* Four Quick Vertical Shortcuts */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-muted font-bold mb-4">
          Four Productivity Verticals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickVerticals.map((vert) => {
            const Icon = vert.icon;
            return (
              <a
                key={vert.id}
                href={vert.route}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                  vert.isDone
                    ? "bg-white border-emerald-400 shadow-sm"
                    : "bg-white border-parchment-border hover:border-cobalt hover:shadow-subtle"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        vert.isDone ? "bg-emerald-50 text-emerald-600" : "bg-cobalt-light text-cobalt"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {vert.isDone ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Done</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-muted">+250 XP</span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-text group-hover:text-cobalt transition-colors">
                    {vert.title}
                  </h4>
                  <p className="text-[11px] text-slate-muted mt-0.5 line-clamp-2">{vert.desc}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-parchment-border flex items-center justify-between text-[11px] font-semibold text-cobalt group-hover:translate-x-0.5 transition-transform">
                  <span>Open Vertical</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Cycle Activity History */}
      {state.logs.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-parchment-card border border-parchment-border rounded-2xl p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-text mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cobalt" />
              <span>Execution log</span>
            </h3>

            <div className="space-y-2.5">
              {state.logs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-parchment-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium text-slate-text">{log.summary}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-muted whitespace-nowrap ml-4">
                    {new Date(log.completedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stage 2 Manual Puzzle Modal */}
      <ManualPuzzleModal
        isOpen={manualPuzzleOpen}
        onClose={() => setManualPuzzleOpen(false)}
        state={state}
        artworkUrl={artwork.url}
        onCycleUpdate={(newState) => setState(newState)}
      />
    </div>
  );
}

