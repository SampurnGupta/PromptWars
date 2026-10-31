"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Volume2,
  VolumeX,
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Menu, 
  X,
  Mail,
  Receipt,
  FolderKanban,
  Code2
} from "lucide-react";
import { loadLocalGamificationState, startNewCycle } from "@/lib/gamification/engine";
import { ProductivityCycleState, INITIAL_CYCLE_STATE } from "@/lib/gamification/types";
import { isAudioMuted, toggleAudioMute } from "@/lib/sound";

export function Navbar() {
  const pathname = usePathname();
  const [state, setState] = useState<ProductivityCycleState>(INITIAL_CYCLE_STATE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setState(loadLocalGamificationState());
    setMuted(isAudioMuted());

    const handleUpdate = () => {
      setState(loadLocalGamificationState());
    };
    window.addEventListener("gamification_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("gamification_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [pathname]);

  const handleResetCycle = () => {
    if (confirm("Start a fresh productivity cycle? Your XP and assembled pieces for this cycle will reset.")) {
      const fresh = startNewCycle(state);
      setState(fresh);
      window.dispatchEvent(new Event("gamification_updated"));
    }
  };

  const navLinks = [
    { href: "/email", label: "Email Cleanup", id: "email_management", icon: Mail },
    { href: "/expenses", label: "Expenses", id: "expense_tracking", icon: Receipt },
    { href: "/files", label: "File Reorganizer", id: "file_organization", icon: FolderKanban },
    { href: "/lint", label: "Lint Repair", id: "lint_fixing", icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur-md border-b border-parchment-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/favicon.png"
            alt="ChoreCraft"
            width={36}
            height={36}
            priority
            className="w-9 h-9 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="font-bold text-slate-text tracking-tight flex items-center gap-1.5">
              <span>ChoreCraft</span>
            </div>
            <div className="text-[11px] text-slate-muted hidden sm:block">
              Gamified Productivity Platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const isCompleted = state.completedVerticals.includes(item.id as any);
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-cobalt text-white shadow-sm"
                    : "text-slate-text hover:bg-parchment-border/40 hover:text-cobalt"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isCompleted && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Pill: XP & Cycle Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-parchment-surface border border-parchment-border px-3 py-1.5 rounded-full shadow-subtle">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-xs font-semibold text-slate-text">
              {state.xp} <span className="text-slate-muted">/ {state.maxCycleXp} XP</span>
            </span>
            <div className="w-16 h-2 bg-parchment-border rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-cobalt transition-all duration-500"
                style={{ width: `${(state.xp / state.maxCycleXp) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              const next = toggleAudioMute();
              setMuted(next);
            }}
            title={muted ? "Unmute Audio" : "Mute Audio"}
            className="p-1.5 rounded-md text-slate-muted hover:text-cobalt hover:bg-parchment-border/50 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetCycle}
            title="Start New Cycle"
            className="p-1.5 rounded-md text-slate-muted hover:text-cobalt hover:bg-parchment-border/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-slate-text hover:bg-parchment-border/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-parchment border-b border-parchment-border px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const isCompleted = state.completedVerticals.includes(item.id as any);
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-cobalt text-white" : "text-slate-text hover:bg-parchment-border/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

