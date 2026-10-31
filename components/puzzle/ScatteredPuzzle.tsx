"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Receipt, 
  FolderKanban, 
  Code2, 
  Trophy, 
  Sparkles,
  Move,
  Lock,
  Camera,
  RotateCcw
} from "lucide-react";
import { ProductivityCycleState, VerticalId } from "@/lib/gamification/types";

interface ScatteredPuzzleProps {
  state: ProductivityCycleState;
  onOpenManualPuzzle: () => void;
  artworkUrl: string;
  artworkTitle?: string;
  photographer?: string;
  onRandomizeArtwork?: () => void;
}

export function ScatteredPuzzle({ 
  state, 
  onOpenManualPuzzle, 
  artworkUrl,
  artworkTitle,
  photographer,
  onRandomizeArtwork 
}: ScatteredPuzzleProps) {
  const isEmailDone = state.completedVerticals.includes("email_management");
  const isExpenseDone = state.completedVerticals.includes("expense_tracking");
  const isFileDone = state.completedVerticals.includes("file_organization");
  const isLintDone = state.completedVerticals.includes("lint_fixing");

  const completedCount = state.completedVerticals.length;
  const isFullyAssembled = completedCount === 4;

  const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);

  const puzzlePieces = [
    {
      id: "email_management" as VerticalId,
      quadrant: 1,
      title: "Email Cleanup",
      route: "/email",
      icon: Mail,
      isDone: isEmailDone,
      bgPosition: "0% 0%",
      // Scattered floating style when incomplete
      scatterStyles: "-rotate-6 sm:-translate-x-4 sm:-translate-y-2 hover:rotate-0 hover:scale-105",
      description: "Star action items & deadlines, mark promotional spam read.",
    },
    {
      id: "expense_tracking" as VerticalId,
      quadrant: 2,
      title: "Expense Ledger",
      route: "/expenses",
      icon: Receipt,
      isDone: isExpenseDone,
      bgPosition: "100% 0%",
      scatterStyles: "rotate-5 sm:translate-x-4 sm:-translate-y-1 hover:rotate-0 hover:scale-105",
      description: "Voice & text expense entry synced directly to Google Sheets.",
    },
    {
      id: "file_organization" as VerticalId,
      quadrant: 3,
      title: "File Organization",
      route: "/files",
      icon: FolderKanban,
      isDone: isFileDone,
      bgPosition: "0% 100%",
      scatterStyles: "-rotate-3 sm:-translate-x-3 sm:translate-y-3 hover:rotate-0 hover:scale-105",
      description: "Systematic directory restructuring via File System API or ZIP.",
    },
    {
      id: "lint_fixing" as VerticalId,
      quadrant: 4,
      title: "Code Lint Repair",
      route: "/lint",
      icon: Code2,
      isDone: isLintDone,
      bgPosition: "100% 100%",
      scatterStyles: "rotate-4 sm:translate-x-3 sm:translate-y-2 hover:rotate-0 hover:scale-105",
      description: "Automated syntax and style repair for code files & GitHub repos.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-6">
      {/* Progress & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-parchment-border gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-cobalt font-bold">
              Productivity Assembly
            </span>
            <span className="text-xs bg-cobalt-light text-cobalt px-2.5 py-0.5 rounded-full font-semibold">
              {completedCount} of 4 Solved
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-text tracking-tight mt-0.5">
            {isFullyAssembled 
              ? "All 4 Chores Complete — Master Artwork Revealed" 
              : "Scattered Digital Clutter Canvas"}
          </h2>
        </div>

        {isFullyAssembled ? (
          <button
            onClick={onOpenManualPuzzle}
            className="flex items-center gap-2 bg-cobalt text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-cobalt-hover hover:scale-[1.02] transition-all animate-bounce"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Play Manual Puzzle Challenge</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
        ) : (
          <div className="text-xs text-slate-muted font-mono bg-white px-3 py-1.5 rounded-md border border-parchment-border shadow-subtle">
            Execute real chores to assemble the pieces (+250 XP each)
          </div>
        )}
      </div>

      {/* Central Visual Showcase: Assembled Frame */}
      <div className="relative p-6 sm:p-10 bg-parchment-card/90 border border-parchment-border rounded-3xl shadow-card overflow-hidden">
        {/* Subtle architectural background canvas marks */}
        <div className="absolute inset-0 bg-[radial-gradient(#0755B5_0.75px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        {/* Scattered Interactive Pieces Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {puzzlePieces.map((piece) => {
            const Icon = piece.icon;
            const isHovered = hoveredPiece === piece.id;

            return (
              <div
                key={piece.id}
                onMouseEnter={() => setHoveredPiece(piece.id)}
                onMouseLeave={() => setHoveredPiece(null)}
                className={`transition-all duration-300 ease-out transform ${
                  piece.isDone
                    ? "translate-x-0 translate-y-0 rotate-0 shadow-card"
                    : piece.scatterStyles
                }`}
              >
                {piece.isDone ? (
                  // Snapped Assembled Quadrant with Vibrant Internet Artwork
                  <div
                    className="h-64 rounded-2xl border-2 border-emerald-500 bg-slate-900 shadow-floating p-5 flex flex-col justify-between relative overflow-hidden group transition-all"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.85)), url('${artworkUrl}')`,
                      backgroundSize: "200% 200%",
                      backgroundPosition: piece.bgPosition,
                    }}
                  >
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Snapped (+250 XP)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-sm">
                          {piece.title}
                        </h3>
                        <span className="text-[11px] text-emerald-300 font-medium">
                          Quadrant #{piece.quadrant} Verified &amp; Snapped
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-100 line-clamp-2 mt-2 drop-shadow-sm font-normal">
                      {piece.description}
                    </p>

                    <div className="pt-3 border-t border-white/20 flex items-center justify-between text-white">
                      <span className="text-[11px] font-mono text-slate-300">Chore Resolved</span>
                      <Link
                        href={piece.route}
                        className="text-xs text-white hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Scattered Floating Interactive Piece
                  <Link
                    href={piece.route}
                    className="block h-64 rounded-2xl border-2 border-dashed border-cobalt/50 bg-white/95 hover:border-cobalt hover:bg-white shadow-card p-5 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.90), rgba(244, 242, 232, 0.95)), url('${artworkUrl}')`,
                      backgroundSize: "200% 200%",
                      backgroundPosition: piece.bgPosition,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-cobalt-light border border-cobalt/20 flex items-center justify-center text-cobalt group-hover:scale-110 transition-transform shadow-subtle">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-muted bg-white border border-parchment-border px-2 py-0.5 rounded-full flex items-center gap-1 shadow-subtle">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Quadrant #{piece.quadrant}</span>
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-text text-base group-hover:text-cobalt transition-colors">
                        {piece.title}
                      </h3>
                      <p className="text-xs text-slate-muted mt-1.5 line-clamp-2">
                        {piece.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-parchment-border flex items-center justify-between text-xs font-semibold text-cobalt group-hover:translate-x-1 transition-transform">
                      <span className="flex items-center gap-1">
                        <Move className="w-3 h-3 text-slate-400" />
                        <span>Click to execute chore</span>
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas Toolbar: Dynamic Internet Artwork Info & Instant Randomizer */}
        <div className="mt-8 pt-4 border-t border-parchment-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-muted gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-cobalt" />
            <span>
              Dynamic Web Photography:{" "}
              <strong className="text-slate-text">{artworkTitle || "Alpine Sanctuary"}</strong>
              {photographer && (
                <span className="text-[11px] text-slate-muted"> &bull; Photo by {photographer}</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-muted">
              Auto-refreshes daily at 12:00 AM IST
            </span>
            {onRandomizeArtwork && (
              <button
                type="button"
                onClick={onRandomizeArtwork}
                aria-label="Load new random internet artwork"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-parchment-border hover:border-cobalt hover:text-cobalt text-[11px] font-semibold text-slate-text shadow-subtle transition-all active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Random Image</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
