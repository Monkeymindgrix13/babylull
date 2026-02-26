"use client";

import { Moon } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
            <Moon size={16} className="text-white" fill="white" strokeWidth={0} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Baby<span className="text-accent-glow">Lull</span>
            <span className="text-muted text-sm font-normal">.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted">AI Active</span>
        </div>
      </div>
    </header>
  );
}
