import React from "react";
import { Sparkles, Terminal, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-parchment-border bg-parchment-card/60 mt-16 py-8 text-xs text-slate-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-text">PromptWars</span>
          <span>• Gamified AI Productivity Engine</span>
          <span className="text-[10px] bg-parchment-border px-1.5 py-0.5 rounded text-slate-charcoal">v1.0</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cobalt" />
            <span>Google Cloud Run Deployed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real Actions Verified</span>
          </div>
        </div>

        <div>
          <span>Cobalt &amp; Parchment Theme Inspired by Nualt</span>
        </div>
      </div>
    </footer>
  );
}

