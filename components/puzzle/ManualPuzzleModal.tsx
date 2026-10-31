"use client";

import React, { useState, useEffect } from "react";
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

interface ManualPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ProductivityCycleState;
  onCycleUpdate: (newState: ProductivityCycleState) => void;
}

// 3x3 puzzle representation (9 tiles total, numbered 1 through 8, with 0 as blank)
const SOLVED_GRID = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export function ManualPuzzleModal({
  isOpen,
  onClose,
  state,
  onCycleUpdate,
}: ManualPuzzleModalProps) {
  // Tile state
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 0, 7, 8, 6]); // Solvable shuffle
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showReference, setShowReference] = useState(false);

  // Initialize or shuffle
  const initPuzzle = () => {
    // Solvable configuration requiring a few moves
    const initialConfig = [1, 2, 3, 4, 0, 5, 7, 8, 6];
    setTiles(initialConfig);
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

  // Timer tick
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
      try {
        confetti({
          particleCount: 120,
          spread: 70,
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

    // Check if adjacent (same row and col diff 1, or same col and row diff 1)
    const isAdjacent =
      (row === blankRow && Math.abs(col - blankCol) === 1) ||
      (col === blankCol && Math.abs(row - blankRow) === 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[blankIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);
      setMoves((prev) => prev + 1);
      checkVictory(newTiles);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-parchment-card border border-parchment-border rounded-2xl w-full max-w-lg shadow-floating overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-parchment-border flex items-center justify-between bg-parchment-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cobalt text-white flex items-center justify-center font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-text">Stage 2 • Manual Puzzle Reward</h2>
              <p className="text-[11px] text-slate-muted">You earned this! Slide the tiles to complete the image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-muted hover:text-slate-text hover:bg-parchment-border/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar: Moves, Timer, Reference Toggle */}
        <div className="px-6 py-3 bg-parchment border-b border-parchment-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-text font-semibold">
              Moves: <span className="text-cobalt">{moves}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-text font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-muted" />
              <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReference(!showReference)}
              className="flex items-center gap-1 text-[11px] text-cobalt hover:underline"
            >
              {showReference ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showReference ? "Hide Goal" : "Show Goal"}</span>
            </button>
            <button
              onClick={initPuzzle}
              title="Restart Shuffle"
              className="p-1 rounded text-slate-muted hover:text-cobalt"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Puzzle Board Area */}
        <div className="p-6 flex flex-col items-center justify-center">
          {showReference ? (
            <div className="w-72 h-72 rounded-xl bg-cobalt/10 border-2 border-cobalt grid grid-cols-3 grid-rows-3 gap-1 p-2 mb-4 animate-fade-in">
              {SOLVED_GRID.map((num, i) => (
                <div
                  key={i}
                  className={`rounded flex items-center justify-center font-bold text-sm ${
                    num === 0 ? "bg-transparent" : "bg-cobalt text-white shadow-sm"
                  }`}
                >
                  {num !== 0 && `Tile ${num}`}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-72 h-72 bg-parchment-border/50 rounded-xl p-2 grid grid-cols-3 grid-rows-3 gap-2 border border-parchment-border shadow-inner">
              {tiles.map((tileNumber, index) => {
                const isBlank = tileNumber === 0;
                return (
                  <button
                    key={index}
                    disabled={isBlank || isSolved}
                    onClick={() => handleTileClick(index)}
                    className={`rounded-lg font-bold text-lg transition-all duration-150 flex items-center justify-center ${
                      isBlank
                        ? "bg-transparent border border-dashed border-cobalt/30"
                        : "bg-gradient-to-br from-cobalt to-cobalt-hover text-white shadow-card hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {!isBlank && (
                      <div className="flex flex-col items-center">
                        <span className="text-base">{tileNumber}</span>
                        <span className="text-[9px] uppercase tracking-wider text-cobalt-light font-normal">Piece</span>
                      </div>
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

