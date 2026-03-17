"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Pause,
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
  if (hour < 6) return "GOOD NIGHT";
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  if (hour < 21) return "GOOD EVENING";
  return "GOOD NIGHT";
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
  const { mixes, loading, playMix, currentMix, isPlaying, togglePlayPause } =
    usePlayer();
  const [babyName, setBabyName] = useState<string>("Your baby");

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

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">
      {/* ── Section 1: Greeting ──────────────────────────────── */}
      <section className="h-12 flex flex-col justify-center">
        <p
          className="uppercase tracking-widest text-muted font-medium"
          style={{ fontSize: "10px" }}
        >
          {getGreeting()}
        </p>
        <h1 className="text-xl font-semibold text-white leading-tight">
          {babyName}&apos;s Bedtime
        </h1>
      </section>

      {/* ── Section 2: Tonight's Mix (hero card) ─────────────── */}
      {tonightMix && (
        <TonightHero
          mix={tonightMix}
          onPlay={playMix}
          onToggle={togglePlayPause}
          currentMix={currentMix}
          isPlaying={isPlaying}
        />
      )}

      {/* ── Section 3: More Mixes (horizontal scroll) ────────── */}
      {otherMixes.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-white mb-3">More Mixes</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {otherMixes.map((mix) => {
              const Icon = ICON_MAP[mix.icon_name] || Volume2;
              return (
                <button
                  key={mix.id}
                  onClick={() => playMix(mix)}
                  className="flex-shrink-0 rounded-xl overflow-hidden border border-white/[0.06] active:scale-[0.97] transition-transform duration-150 relative"
                  style={{ width: 120, height: 120 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${mix.color_from}, ${mix.color_to})`,
                    }}
                  />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2 p-3">
                    <Icon
                      size={28}
                      className="text-white"
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-medium text-white text-center leading-tight">
                      {mix.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 4: spacer before nav ─────────────────────── */}
      <div className="h-20" />
    </div>
  );
}

// ── Tonight's Mix Hero Card ──────────────────────────────────

function TonightHero({
  mix,
  onPlay,
  onToggle,
  currentMix,
  isPlaying,
}: {
  mix: MixWithUrls;
  onPlay: (mix: MixWithUrls) => Promise<void>;
  onToggle: () => Promise<void>;
  currentMix: MixWithUrls | null;
  isPlaying: boolean;
}) {
  const Icon = ICON_MAP[mix.icon_name] || Volume2;
  const isThisPlaying = currentMix?.id === mix.id && isPlaying;
  const isThisLoaded = currentMix?.id === mix.id;

  function handlePlayPause() {
    if (isThisLoaded) {
      onToggle();
    } else {
      onPlay(mix);
    }
  }

  return (
    <section
      className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg shadow-black/20"
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Gradient background */}
      <div
        className="artwork-gradient absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${mix.color_from}, ${mix.color_to}, ${mix.color_from})`,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span
            className="text-accent-glow font-semibold uppercase tracking-widest"
            style={{ fontSize: "10px" }}
          >
            Tonight&apos;s Mix
          </span>
        </div>

        {/* Icon with glow */}
        <div className="relative mb-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{
              background: `radial-gradient(circle, ${mix.color_from}, transparent)`,
              transform: "scale(2.5)",
            }}
          />
          <Icon
            size={64}
            className="text-white relative z-10"
            strokeWidth={1.5}
          />
        </div>

        {/* Mix name */}
        <h2 className="text-lg font-bold text-white text-center leading-tight">
          {mix.name}
        </h2>

        {/* Description */}
        <p className="text-sm text-white/70 text-center mt-1.5">
          {mix.description}
        </p>

        {/* Equalizer bars */}
        {isThisPlaying && (
          <div className="flex items-end gap-[3px] h-5 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="eq-bar" />
            ))}
          </div>
        )}

        {/* Play button */}
        <button
          onClick={handlePlayPause}
          className={`mt-6 w-16 h-16 rounded-full bg-accent flex items-center justify-center active:scale-95 transition-transform duration-150 ${
            isThisPlaying ? "play-btn-glow is-playing" : "play-btn-glow"
          }`}
          aria-label={isThisPlaying ? "Pause" : "Play"}
        >
          {isThisPlaying ? (
            <Pause size={26} className="text-white" fill="white" />
          ) : (
            <Play size={26} className="text-white ml-1" fill="white" />
          )}
        </button>
      </div>
    </section>
  );
}
