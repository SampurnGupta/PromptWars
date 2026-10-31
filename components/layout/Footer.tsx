import React from "react";
import { Sparkles, Terminal, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-parchment-border bg-parchment-card/60 mt-16 py-8 text-xs text-slate-muted"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-text">ChoreCraft</span>
          <span>• Gamified Productivity Platform</span>
          <span className="text-[10px] bg-parchment-border px-1.5 py-0.5 rounded text-slate-charcoal">v1.0</span>
        </div>
        <div className="text-slate-muted">
          <span>&copy; {new Date().getFullYear()} ChoreCraft. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

