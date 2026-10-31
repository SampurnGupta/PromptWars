"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { 
  X, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Sparkles, 
  Eye, 
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { ProductivityCycleState } from "@/lib/gamification/types";
import { recordManualPuzzleSolved, startNewCycle } from "@/lib/gamification/engine";
import { playTileSlideSound, playVictoryFanfare } from "@/lib/sound";

interface ManualPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProductivityCycleState;
  onCycleUpdate: (newState: ProductivityCycleState) => void;
  artworkUrl?: string;
}

// 3x3 puzzle representation (9 tiles: 1-8, with 0 as blank)
const SOLVED_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Map tile number (1-8) to artwork background coordinates
const TILE_POSITIONS: Record<number, string> = {
  1: "0% 0%",
  2: "50% 0%",
  3: "100% 0%",
  4: "0% 50%",
  5: "50% 50%",
  6: "100% 50%",
  7: "0% 100%",
  8: "50% 100%",
};

export function ManualPuzzleModal({
  isOpen,
  onClose,
  state,
  onCycleUpdate,
  artworkUrl,
}: ManualPuzzleModalProps) {
  // Tile state (solvable configuration needing a few moves)
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 0, 5, 7, 8, 6]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const activeArtworkUrl = artworkUrl || (state.activeArtworkId === "golden_hour_fjord"
    ? "/puzzles/golden_hour_fjord.svg"
    : "/puzzles/alpine_sanctuary.svg");

  const initPuzzle = () => {
    // Solvable configuration
    setTiles([1, 2, 3, 4, 0, 5, 7, 8, 6]);
    setMoves(0);
    setSeconds(0);
    setIsActive(true);
    setIsSolved(false);
  };

  useEffect(() => {
    if (isOpen) {
      initPuzzle();
    } else {
      setIsActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isSolved) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isSolved]);

  const checkVictory = (currentTiles: number[]) => {
    const won = currentTiles.every((val, index) => val === SOLVED_GRID[index]);
    if (won) {
      setIsSolved(true);
      setIsActive(false);
      playVictoryFanfare();
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.warn("Confetti error:", e);
      }
      const updated = recordManualPuzzleSolved(state, moves + 1, seconds);
      onCycleUpdate(updated);
    }
  };

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    const blankIndex = tiles.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const blankRow = Math.floor(blankIndex / 3);
    const blankCol = blankIndex % 3;

    const isAdjacent =
      (row === blankRow && Math.abs(col - blankCol) === 1) ||
      (col === blankCol && Math.abs(row - blankRow) === 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[blankIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      setMoves((prev) => prev + 1);
      playTileSlideSound();
      checkVictory(newTiles);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-puzzle-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-parchment-card border border-parchment-border rounded-2xl w-full max-w-lg shadow-floating overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-parchment-border flex items-center justify-between bg-parchment-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 id="manual-puzzle-title" className="text-base font-bold text-slate-text">
                Stage 2 • Master Puzzle Reward
              </h2>
              <p className="text-[11px] text-slate-muted">Slide image tiles to reconstruct the scenic master artwork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close puzzle dialog"
            className="p-1 rounded-md text-slate-muted hover:text-slate-text hover:bg-parchment-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-parchment border-b border-parchment-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-text font-semibold">
              Moves: <span className="text-cobalt font-bold">{moves}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-text font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-muted" />
              <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReference(!showReference)}
              className="flex items-center gap-1 text-[11px] text-cobalt hover:underline font-semibold"
            >
              {showReference ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showReference ? "Hide Reference" : "View Reference"}</span>
            </button>
            <button
              onClick={initPuzzle}
              title="Restart Shuffle"
              aria-label="Restart puzzle shuffle"
              className="p-1 rounded text-slate-muted hover:text-cobalt hover:bg-parchment-border/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Puzzle Board */}
        <div className="p-6 flex flex-col items-center justify-center">
          {showReference ? (
            <div className="w-80 h-80 rounded-xl overflow-hidden border-2 border-cobalt shadow-card relative animate-fade-in">
              <Image
                src={activeArtworkUrl}
                alt="Goal Reference"
                width={320}
                height={320}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] text-center py-1 rounded font-mono">
                Target Assembly Goal
              </div>
            </div>
          ) : (
            <div className="w-80 h-80 bg-slate-900 rounded-xl p-2 grid grid-cols-3 grid-rows-3 gap-1.5 border-2 border-parchment-border shadow-inner">
              {tiles.map((tileNumber, index) => {
                const isBlank = tileNumber === 0;
                return (
                  <button
                    key={index}
                    disabled={isBlank || isSolved}
                    onClick={() => handleTileClick(index)}
                    aria-label={isBlank ? "Empty slot" : `Puzzle tile ${tileNumber}`}
                    className={`rounded-lg relative overflow-hidden transition-all duration-150 flex items-center justify-center group ${
                      isBlank
                        ? "bg-slate-950/40 border border-dashed border-slate-700"
                        : "border border-white/20 shadow-md hover:scale-[1.02] active:scale-95"
                    }`}
                    style={
                      !isBlank
                        ? {
                            backgroundImage: `url('${activeArtworkUrl}')`,
                            backgroundSize: "300% 300%",
                            backgroundPosition: TILE_POSITIONS[tileNumber],
                          }
                        : {}
                    }
                  >
                    {!isBlank && (
                      <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded opacity-75 group-hover:opacity-100">
                        {tileNumber}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Victory Card */}
          {isSolved && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 w-full text-center animate-fade-in">
              <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Magnificent! Puzzle Reconstructed!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Solved in {moves} moves and {seconds} seconds. All 4 chores eliminated!
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => {
                    const fresh = startNewCycle(state);
                    onCycleUpdate(fresh);
                    onClose();
                  }}
                  className="bg-cobalt hover:bg-cobalt-hover text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Start New Productivity Cycle
                </button>
                <button
                  onClick={onClose}
                  className="bg-white border border-parchment-border text-slate-text text-xs px-3 py-2 rounded-lg font-medium hover:bg-parchment"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
