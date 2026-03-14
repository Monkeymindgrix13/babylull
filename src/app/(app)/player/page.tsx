"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Heart,
  TreePine,
  Cloud,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { audioManager } from "@/lib/audio-manager";

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

// ── Types ────────────────────────────────────────────────────

interface MixLayer {
  sound_id: string;
  volume: number;
}

interface Mix {
  id: string;
  name: string;
  description: string;
  layers: MixLayer[];
  icon_name: string;
  color_from: string;
  color_to: string;
}

interface MixWithUrls extends Mix {
  layersWithUrls: { sound_id: string; url: string; volume: number }[];
}

// ── Timer presets ────────────────────────────────────────────

const TIMER_OPTIONS = [15, 30, 45, 60, 90] as const;

// ── Equalizer bars ───────────────────────────────────────────

function EqBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`eq-bar ${playing ? "" : "paused"}`} />
      ))}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────

export default function PlayerPage() {
  const [mixes, setMixes] = useState<MixWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [cardKey, setCardKey] = useState(0);
  const [rippleKey, setRippleKey] = useState<number | null>(null);
  const [bouncingPill, setBouncingPill] = useState<number | null>(null);

  // Sleep timer
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeStartedRef = useRef(false);

  const currentMix = mixes[currentIndex] ?? null;

  // ── Fetch mixes + sound URLs ─────────────────────────────

  useEffect(() => {
    async function load() {
      const [mixesRes, soundsRes] = await Promise.all([
        supabase.from("mixes").select("*").order("created_at"),
        supabase.from("sounds").select("id, file_url"),
      ]);

      if (!mixesRes.data || !soundsRes.data) {
        setLoading(false);
        return;
      }

      const soundUrlMap: Record<string, string> = {};
      for (const s of soundsRes.data) {
        soundUrlMap[s.id] = s.file_url;
      }

      const withUrls: MixWithUrls[] = mixesRes.data.map((m) => ({
        ...m,
        layers: m.layers as MixLayer[],
        layersWithUrls: (m.layers as MixLayer[]).map((l) => ({
          sound_id: l.sound_id,
          url: soundUrlMap[l.sound_id] ?? "",
          volume: l.volume,
        })),
      }));

      setMixes(withUrls);
      setLoading(false);
    }

    load();
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────

  useEffect(() => {
    return () => {
      audioManager.stopAll();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Play current mix ─────────────────────────────────────

  const playCurrentMix = useCallback(
    async (mix: MixWithUrls) => {
      audioManager.setMasterVolume(masterVolume);
      await audioManager.playMix(mix.layersWithUrls);
      setIsPlaying(true);

      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: mix.name,
          artist: "BabyLull",
          album: mix.description,
        });
      }
    },
    [masterVolume]
  );

  // ── Playback controls ────────────────────────────────────

  async function handlePlayPause() {
    if (!currentMix) return;

    // Trigger ripple
    setRippleKey(Date.now());

    // Unlock AudioContext synchronously within the user gesture
    await audioManager.unlock();

    if (isPlaying) {
      audioManager.stopAll();
      setIsPlaying(false);
    } else {
      await playCurrentMix(currentMix);
    }
  }

  async function handleSkip(direction: 1 | -1) {
    if (mixes.length === 0) return;
    const nextIndex = (currentIndex + direction + mixes.length) % mixes.length;
    setCurrentIndex(nextIndex);
    setCardKey((k) => k + 1);

    if (isPlaying) {
      await playCurrentMix(mixes[nextIndex]);
    }
  }

  // ── Volume ───────────────────────────────────────────────

  function handleMasterVolume(vol: number) {
    setMasterVolume(vol);
    audioManager.setMasterVolume(vol);
  }

  // ── Sleep timer ──────────────────────────────────────────

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    fadeStartedRef.current = false;
  }

  function handleTimer(minutes: number | null) {
    clearTimer();

    if (minutes === null || minutes === timerMinutes) {
      setTimerMinutes(null);
      setTimerRemaining(null);
      setBouncingPill(null);
      return;
    }

    setTimerMinutes(minutes);
    setTimerRemaining(minutes * 60);
    fadeStartedRef.current = false;

    // Trigger bounce animation
    setBouncingPill(minutes);
    setTimeout(() => setBouncingPill(null), 300);

    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearTimer();
          audioManager.stopAll();
          setIsPlaying(false);
          setTimerMinutes(null);
          return null;
        }

        const next = prev - 1;

        if (next <= 60 && !fadeStartedRef.current) {
          fadeStartedRef.current = true;
          audioManager.fadeOut(next * 1000);
        }

        return next;
      });
    }, 1000);
  }

  // ── Media Session action handlers ──────────────────────────

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => handlePlayPause());
    navigator.mediaSession.setActionHandler("pause", () => handlePlayPause());
    navigator.mediaSession.setActionHandler("previoustrack", () => handleSkip(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => handleSkip(1));
  });

  // ── Format timer display ─────────────────────────────────

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── Loading state ────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  if (mixes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted">No mixes found.</p>
      </div>
    );
  }

  const Icon = ICON_MAP[currentMix.icon_name] || Volume2;
  const volumePct = masterVolume * 100;

  return (
    <div className="flex flex-col items-center px-5 py-8 max-w-md mx-auto min-h-[calc(100vh-8rem)]">

      {/* ── Artwork card ───────────────────────────────────── */}
      <div
        key={cardKey}
        className="artwork-gradient card-transition relative w-full aspect-[4/4.2] max-w-[320px] rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentMix.color_from}, ${currentMix.color_to}, ${currentMix.color_from})`,
          backgroundSize: "200% 200%",
        }}
      >
        {/* Bottom inner shadow for text legibility */}
        <div className="absolute inset-0 rounded-3xl" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%)",
        }} />

        <Icon size={64} className="text-white/90 relative z-10" strokeWidth={1.5} />

        <div className="text-center px-6 relative z-10 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-white">{currentMix.name}</h1>
          <p className="text-sm text-white/70">{currentMix.description}</p>
          {isPlaying && <EqBars playing={isPlaying} />}
        </div>
      </div>

      {/* ── Playback controls ────────────────────────────── */}
      <div className="flex items-center justify-center gap-10 mt-10">
        <button
          onClick={() => handleSkip(-1)}
          className="p-4 rounded-full hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
          aria-label="Previous mix"
        >
          <SkipBack size={26} className="text-white/90" fill="rgba(255,255,255,0.9)" />
        </button>

        <button
          onClick={handlePlayPause}
          className={`play-btn-glow ${isPlaying ? "is-playing" : ""} relative w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-transform duration-150`}
          style={{ background: "var(--accent)" }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {rippleKey !== null && (
            <span key={rippleKey} className="play-btn-ripple" />
          )}
          {isPlaying ? (
            <Pause size={30} className="text-white relative z-10" fill="white" />
          ) : (
            <Play size={30} className="text-white relative z-10 ml-1" fill="white" />
          )}
        </button>

        <button
          onClick={() => handleSkip(1)}
          className="p-4 rounded-full hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
          aria-label="Next mix"
        >
          <SkipForward size={26} className="text-white/90" fill="rgba(255,255,255,0.9)" />
        </button>
      </div>

      {/* ── Master volume ────────────────────────────────── */}
      <div className="w-full flex items-center gap-3 mt-10 px-1">
        <button
          onClick={() => handleMasterVolume(masterVolume > 0 ? 0 : 0.7)}
          className="p-1 flex-shrink-0"
          aria-label={masterVolume > 0 ? "Mute" : "Unmute"}
        >
          {masterVolume > 0 ? (
            <Volume2 size={18} className="text-white/60" />
          ) : (
            <VolumeX size={18} className="text-white/60" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
          className="volume-track flex-1"
          style={{
            background: `linear-gradient(to right, var(--accent-glow) 0%, var(--accent) ${volumePct}%, rgba(255,255,255,0.08) ${volumePct}%, rgba(255,255,255,0.08) 100%)`,
          }}
        />
        <Volume2 size={18} className="text-white/60 flex-shrink-0" />
      </div>

      {/* ── Sleep timer ──────────────────────────────────── */}
      <div className="w-full mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Sleep Timer
          </span>
          {timerRemaining !== null && (
            <span className="countdown-pulse text-sm font-semibold text-accent-glow tabular-nums">
              {formatTime(timerRemaining)}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {TIMER_OPTIONS.map((min) => {
            const isActive = timerMinutes === min;
            const isBouncing = bouncingPill === min;
            return (
              <button
                key={min}
                onClick={() => handleTimer(min)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isBouncing ? "pill-bounce" : ""
                } ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "bg-surface-light text-white/80 hover:bg-white/[0.12]"
                }`}
              >
                {min}m
              </button>
            );
          })}
          <button
            onClick={() => handleTimer(null)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              timerMinutes === null
                ? "bg-white/[0.15] text-white"
                : "bg-surface-light text-white/80 hover:bg-white/[0.12]"
            }`}
          >
            Off
          </button>
        </div>
      </div>

      {/* ── Mix indicator dots ───────────────────────────── */}
      <div className="flex gap-3 mt-auto pt-8">
        {mixes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              setCardKey((k) => k + 1);
              if (isPlaying) playCurrentMix(mixes[i]);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-2.5 h-2.5 bg-accent-glow shadow-sm shadow-accent/40"
                : "w-2 h-2 bg-white/20 hover:bg-white/40"
            }`}
            style={{ minWidth: i === currentIndex ? 10 : 8, minHeight: i === currentIndex ? 10 : 8 }}
            aria-label={`Go to mix ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
