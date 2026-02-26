"use client";

import { Moon, Sparkles, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8.5rem)] px-6 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full bg-purple-500/[0.05] blur-[80px] pointer-events-none" />

      {/* Decorative stars */}
      <div className="absolute top-16 left-8 w-1 h-1 rounded-full bg-white/60 animate-twinkle" />
      <div className="absolute top-32 right-12 w-1.5 h-1.5 rounded-full bg-accent-glow/50 animate-twinkle [animation-delay:1s]" />
      <div className="absolute top-48 left-16 w-1 h-1 rounded-full bg-purple-300/40 animate-twinkle [animation-delay:2s]" />
      <div className="absolute bottom-40 right-8 w-1 h-1 rounded-full bg-white/40 animate-twinkle [animation-delay:0.5s]" />
      <div className="absolute bottom-60 left-10 w-1.5 h-1.5 rounded-full bg-accent/40 animate-twinkle [animation-delay:3s]" />

      {/* Moon orb */}
      <div className="relative mb-10 animate-float">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent/30 via-purple-500/20 to-transparent flex items-center justify-center border border-white/[0.08]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/40 to-purple-600/30 flex items-center justify-center border border-white/[0.06]">
            <Moon size={36} className="text-accent-glow" strokeWidth={1.5} />
          </div>
        </div>
        {/* Sparkle decorations around the orb */}
        <Sparkles size={14} className="absolute -top-1 -right-1 text-accent-glow/70 animate-twinkle" />
        <Sparkles size={10} className="absolute -bottom-2 -left-2 text-purple-300/50 animate-twinkle [animation-delay:1.5s]" />
      </div>

      {/* Main copy */}
      <div className="text-center max-w-sm">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
          Your Baby&apos;s Perfect{" "}
          <span className="bg-gradient-to-r from-accent-glow to-purple-400 bg-clip-text text-transparent">
            Sleep Sound
          </span>
        </h1>
        <p className="text-muted text-base sm:text-lg leading-relaxed mb-10">
          AI that learns what puts{" "}
          <span className="text-foreground/80 font-medium">YOUR</span> baby to sleep
        </p>
      </div>

      {/* CTA Button */}
      <button className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent to-purple-500 text-white font-semibold text-base animate-pulse-glow transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
        Get Started
        <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      {/* Trust signal */}
      <p className="mt-8 text-muted/60 text-xs tracking-wide">
        Trusted by 10,000+ parents
      </p>
    </div>
  );
}
