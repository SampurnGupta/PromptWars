import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-cobalt-light/70 border-b border-cobalt/20 px-4 py-2 text-xs text-cobalt flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cobalt flex-shrink-0" />
          <span>
            <strong className="font-semibold">Demo-First Environment:</strong> Real-world tasks execute safely through pre-configured backend Google Services (Gmail &amp; Sheets). No personal sign-in required.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-cobalt/80 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Google Cloud Run Ready</span>
        </div>
      </div>
    </div>
  );
}

