"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function InitialProductLoader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only display on the first time the platform is loaded
    const alreadyShown = 
      sessionStorage.getItem("chorecraft_initial_loader_shown") ||
      localStorage.getItem("chorecraft_initial_loader_shown");

    if (alreadyShown) {
      return;
    }

    setVisible(true);

    // Smooth progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Fade out after 2.2 seconds
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2200);

    // Completely unmount after fade completes
    const unmountTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("chorecraft_initial_loader_shown", "true");
      localStorage.setItem("chorecraft_initial_loader_shown", "true");
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("chorecraft_initial_loader_shown", "true");
      localStorage.setItem("chorecraft_initial_loader_shown", "true");
    }, 400);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-parchment/95 backdrop-blur-md transition-opacity duration-600 ease-in-out cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center p-8 max-w-sm w-full mx-auto text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Animated Product Loader GIF */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-white/70 border border-parchment-border rounded-3xl p-4 shadow-floating overflow-hidden">
          <img
            src="/product_loader.gif"
            alt="Loading ChoreCraft..."
            className="w-full h-full object-contain"
          />
        </div>

        {/* Branding & Status */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-text tracking-tight">
            ChoreCraft
          </h2>
          <p className="text-xs text-slate-muted font-medium">
            Initializing Gamified AI Productivity Engine...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs space-y-1">
          <div className="w-full h-1.5 bg-parchment-border rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-cobalt rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-muted px-0.5">
            <span>Loading workspace</span>
            <span>{progress}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-[11px] font-mono text-slate-muted hover:text-cobalt transition-colors underline pt-2"
        >
          Click anywhere to skip &rarr;
        </button>
      </div>
    </div>
  );
}

