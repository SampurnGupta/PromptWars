"use client";

import React from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Receipt, 
  FolderKanban, 
  Code2, 
  Trophy,
  Sparkles,
  Lock
} from "lucide-react";
import { ProductivityCycleState, VERTICALS_CONFIG, VerticalId } from "@/lib/gamification/types";

interface ScatteredPuzzleProps {
  state: ProductivityCycleState;
  onOpenManualPuzzle: () => void;
}

export function ScatteredPuzzle({ state, onOpenManualPuzzle }: ScatteredPuzzleProps) {
  const isEmailDone = state.completedVerticals.includes("email_management");
  const isExpenseDone = state.completedVerticals.includes("expense_tracking");
  const isFileDone = state.completedVerticals.includes("file_organization");
  const isLintDone = state.completedVerticals.includes("lint_fixing");

  const completedCount = state.completedVerticals.length;
  const isFullyAssembled = completedCount === 4;

  const activeArtworkUrl = state.activeArtworkId === "golden_hour_fjord" 
    ? "/puzzles/golden_hour_fjord.svg" 
    : "/puzzles/alpine_sanctuary.svg";

  const puzzlePieces = [
    {
      id: "email_management" as VerticalId,
      quadrant: 1,
      title: "Email Cleanup",
      route: "/email",
      icon: Mail,
      isDone: isEmailDone,
      bgPosition: "0% 0%",
      scatterClass: isEmailDone 
        ? "translate-x-0 translate-y-0 rotate-0 shadow-card" 
        : "-translate-x-3 -translate-y-3 -rotate-2 hover:translate-x-0 hover:translate-y-0 hover:rotate-0",
      description: "Primary inbox intelligence: star action items, mark promotional spam as read.",
    },
    {
      id: "expense_tracking" as VerticalId,
      quadrant: 2,
      title: "Expense Ledger",
      route: "/expenses",
      icon: Receipt,
      isDone: isExpenseDone,
      bgPosition: "100% 0%",
      scatterClass: isExpenseDone 
        ? "translate-x-0 translate-y-0 rotate-0 shadow-card" 
        : "translate-x-3 -translate-y-2 rotate-2 hover:translate-x-0 hover:translate-y-0 hover:rotate-0",
      description: "Natural language & voice expense recording synced directly to Google Sheets.",
    },
    {
      id: "file_organization" as VerticalId,
      quadrant: 3,
      title: "File Organization",
      route: "/files",
      icon: FolderKanban,
      isDone: isFileDone,
      bgPosition: "0% 100%",
      scatterClass: isFileDone 
        ? "translate-x-0 translate-y-0 rotate-0 shadow-card" 
        : "-translate-x-2 translate-y-3 rotate-1 hover:translate-x-0 hover:translate-y-0 hover:rotate-0",
      description: "Systematic directory restructuring via browser File System API or universal ZIP fallback.",
    },
    {
      id: "lint_fixing" as VerticalId,
      quadrant: 4,
      title: "Code Lint Repair",
      route: "/lint",
      icon: Code2,
      isDone: isLintDone,
      bgPosition: "100% 100%",
      scatterClass: isLintDone 
        ? "translate-x-0 translate-y-0 rotate-0 shadow-card" 
        : "translate-x-2 translate-y-2 -rotate-1 hover:translate-x-0 hover:translate-y-0 hover:rotate-0",
      description: "Automated syntax and style repair for local code files or public GitHub repos.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Stage 1 Header Progress Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-parchment-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-cobalt font-bold">
              Stage 1 • Productivity Assembly
            </span>
            <span className="text-xs bg-cobalt-light text-cobalt px-2.5 py-0.5 rounded-full font-semibold">
              {completedCount} / 4 Assembled
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-text tracking-tight mt-0.5">
            {isFullyAssembled 
              ? "All 4 Chores Complete! Master Artwork Revealed" 
              : "Digital Clutter Canvas — Assemble by Doing"}
          </h2>
        </div>

        {isFullyAssembled ? (
          <button
            onClick={onOpenManualPuzzle}
            className="flex items-center gap-2 bg-cobalt text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-cobalt-hover hover:scale-[1.02] transition-all animate-bounce"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Unlock Final Manual Puzzle Challenge</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
        ) : (
          <div className="text-xs text-slate-muted font-mono bg-parchment-card px-3 py-1.5 rounded-md border border-parchment-border">
            Each chore snaps one quadrant (+250 XP each)
          </div>
        )}
      </div>

      {/* Main Puzzle Canvas */}
      <div className="relative p-6 sm:p-8 bg-parchment-card/90 border border-parchment-border rounded-2xl shadow-subtle overflow-hidden">
        {/* Subtle grid lines in background */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-15">
          <div className="border-r border-b border-cobalt"></div>
          <div className="border-b border-cobalt"></div>
          <div className="border-r border-cobalt"></div>
          <div></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {puzzlePieces.map((piece) => {
            const Icon = piece.icon;
            return (
              <div
                key={piece.id}
                className={`transition-all duration-500 ease-out transform ${piece.scatterClass}`}
              >
                {piece.isDone ? (
                  // Snapped Assembled Quadrant with Visual Artwork Slice
                  <div 
                    className="h-64 rounded-xl border-2 border-emerald-500 bg-white shadow-card p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.85)), url('${activeArtworkUrl}')`,
                      backgroundSize: "200% 200%",
                      backgroundPosition: piece.bgPosition,
                    }}
                  >
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Snapped (+250 XP)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-sm">
                          {piece.title}
                        </h3>
                        <span className="text-[11px] text-emerald-300 font-medium">
                          Quadrant #{piece.quadrant} Verified &amp; Locked
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-100 line-clamp-2 mt-2 drop-shadow-sm">
                      {piece.description}
                    </p>

                    <div className="pt-3 border-t border-white/20 flex items-center justify-between text-white">
                      <span className="text-[11px] font-mono text-slate-300">Chore Resolved</span>
                      <a
                        href={piece.route}
                        className="text-xs text-white hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  // Scattered Unfinished Piece with Ghosted Artwork Silhouette
                  <a
                    href={piece.route}
                    className="block h-64 rounded-xl border-2 border-dashed border-cobalt/40 bg-parchment-surface/90 hover:border-cobalt hover:bg-white shadow-subtle p-5 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(244, 242, 232, 0.90), rgba(244, 242, 232, 0.95)), url('${activeArtworkUrl}')`,
                      backgroundSize: "200% 200%",
                      backgroundPosition: piece.bgPosition,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-cobalt-light border border-cobalt/20 flex items-center justify-center text-cobalt group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-muted bg-white/80 border border-parchment-border px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Quadrant #{piece.quadrant}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-text text-base group-hover:text-cobalt transition-colors">
                        {piece.title}
                      </h3>
                      <p className="text-xs text-slate-muted mt-1.5 line-clamp-2">
                        {piece.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-parchment-border flex items-center justify-between text-xs font-semibold text-cobalt group-hover:translate-x-1 transition-transform">
                      <span>Click to resolve chore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
