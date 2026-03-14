"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Moon,
  Flame,
  Clock,
  CloudRain,
  Waves,
  Heart,
  TreePine,
  Cloud,
  Sparkles,
  Volume2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePlayer, type MixWithUrls } from "@/components/PlayerProvider";

// ── Icon map ─────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  CloudRain,
  Waves,
  Heart,
  TreePine,
  Cloud,
  Sparkles,
  Volume2,
};

// ── Greeting ─────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

// ── Tonight's mix selector ───────────────────────────────────

function getTonightIndex(total: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % total;
}

// ── Component ────────────────────────────────────────────────

export default function Home() {
  const { mixes, loading, playMix, currentMix, isPlaying } = usePlayer();
  const [babyName, setBabyName] = useState<string>("little one");

  // Fetch baby name
  useEffect(() => {
    async function fetchBabyName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: babies } = await supabase
        .from("babies")
        .select("name")
        .eq("profile_id", user.id)
        .limit(1);

      if (babies && babies.length > 0 && babies[0].name) {
        setBabyName(babies[0].name);
      }
    }
    fetchBabyName();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  const tonightIndex = mixes.length > 0 ? getTonightIndex(mixes.length) : 0;
  const tonightMix = mixes[tonightIndex] ?? null;
  const otherMixes = mixes.filter((_, i) => i !== tonightIndex);

  function handlePlay(mix: MixWithUrls) {
    playMix(mix);
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <section>
        <p className="text-muted text-xs font-medium uppercase tracking-wider mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-xl font-semibold text-white leading-tight">
          {babyName}&apos;s Bedtime
        </h1>
      </section>

      {/* Tonight's Mix — Hero Card */}
      {tonightMix && <TonightHero mix={tonightMix} onPlay={handlePlay} currentMix={currentMix} isPlaying={isPlaying} />}

      {/* More Mixes — Horizontal Scroll */}
      {otherMixes.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white mb-3">More Mixes</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {otherMixes.map((mix) => {
              const Icon = ICON_MAP[mix.icon_name] || Volume2;
              const isActive = currentMix?.id === mix.id && isPlaying;
              return (
                <button
                  key={mix.id}
                  onClick={() => handlePlay(mix)}
                  className="flex-shrink-0 w-32 rounded-2xl overflow-hidden border border-white/[0.06] active:scale-[0.97] transition-transform duration-150 relative"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${mix.color_from}, ${mix.color_to})`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%)",
                    }}
                  />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2 p-3">
                    <Icon
                      size={28}
                      className="text-white/80"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-semibold text-white text-center leading-tight">
                      {mix.name}
                    </span>
                    {isActive && (
                      <div className="flex items-end gap-[2px] h-3">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="eq-bar" style={{ transform: "scale(0.7)" }} />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Flame size={12} className="text-orange-400" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">12</p>
          <p className="text-[10px] text-muted mt-1">day streak</p>
        </div>
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Clock size={12} className="text-accent-glow" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">38</p>
          <p className="text-[10px] text-muted mt-1">avg min</p>
        </div>
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Moon size={12} className="text-purple-400" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">47</p>
          <p className="text-[10px] text-muted mt-1">sessions</p>
        </div>
      </section>
    </div>
  );
}

// ── Tonight's Mix Hero Card ──────────────────────────────────

function TonightHero({
  mix,
  onPlay,
  currentMix,
  isPlaying,
}: {
  mix: MixWithUrls;
  onPlay: (mix: MixWithUrls) => void;
  currentMix: MixWithUrls | null;
  isPlaying: boolean;
}) {
  const Icon = ICON_MAP[mix.icon_name] || Volume2;
  const isActive = currentMix?.id === mix.id && isPlaying;

  return (
    <section
      className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg shadow-black/20"
      style={{ aspectRatio: "16 / 10" }}
    >
      {/* Gradient background */}
      <div
        className="artwork-gradient absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${mix.color_from}, ${mix.color_to}, ${mix.color_from})`,
          backgroundSize: "200% 200%",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <div className="relative z-10 h-full flex items-end p-5">
        <div className="flex items-end justify-between gap-4 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={20} className="text-white/80" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                Tonight&apos;s Mix
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {mix.name}
            </h2>
            <p className="text-xs text-white/60 mt-1">{mix.description}</p>
          </div>

          <button
            onClick={() => onPlay(mix)}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 hover:bg-white/30 active:scale-95 transition-all"
            aria-label={isActive ? "Playing" : "Play tonight's mix"}
          >
            {isActive ? (
              <div className="flex items-end gap-[3px] h-5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="eq-bar" />
                ))}
              </div>
            ) : (
              <Play
                size={22}
                className="text-white ml-1"
                fill="white"
              />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
