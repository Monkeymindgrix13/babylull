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

// ── Component ────────────────────────────────────────────────

export default function PlayerPage() {
  const [mixes, setMixes] = useState<MixWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);

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
      // Restore master volume before playing
      audioManager.setMasterVolume(masterVolume);
      await audioManager.playMix(mix.layersWithUrls);
      setIsPlaying(true);

      // Update media session for lock screen controls
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
      // Toggle off
      setTimerMinutes(null);
      setTimerRemaining(null);
      return;
    }

    setTimerMinutes(minutes);
    setTimerRemaining(minutes * 60);
    fadeStartedRef.current = false;

    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Timer done — stop everything
          clearTimer();
          audioManager.stopAll();
          setIsPlaying(false);
          setTimerMinutes(null);
          return null;
        }

        const next = prev - 1;

        // Start fade at 60s remaining (or total duration if < 60s)
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

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-md mx-auto min-h-[calc(100vh-8rem)]">
      {/* ── Artwork ──────────────────────────────────────── */}
      <div
        className="w-full aspect-square max-w-[320px] rounded-3xl flex flex-col items-center justify-center gap-4 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${currentMix.color_from}, ${currentMix.color_to})`,
        }}
      >
        <Icon size={72} className="text-white/90" strokeWidth={1.5} />
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold text-white">{currentMix.name}</h1>
          <p className="text-sm text-white/70 mt-1">{currentMix.description}</p>
        </div>
      </div>

      {/* ── Playback controls ────────────────────────────── */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={() => handleSkip(-1)}
          className="p-3 rounded-full hover:bg-white/[0.06] transition-colors"
          aria-label="Previous mix"
        >
          <SkipBack size={24} className="text-white" fill="white" />
        </button>

        <button
          onClick={handlePlayPause}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={28} className="text-black" fill="black" />
          ) : (
            <Play size={28} className="text-black ml-1" fill="black" />
          )}
        </button>

        <button
          onClick={() => handleSkip(1)}
          className="p-3 rounded-full hover:bg-white/[0.06] transition-colors"
          aria-label="Next mix"
        >
          <SkipForward size={24} className="text-white" fill="white" />
        </button>
      </div>

      {/* ── Master volume ────────────────────────────────── */}
      <div className="w-full flex items-center gap-3 mt-8 px-2">
        {masterVolume > 0 ? (
          <VolumeX
            size={18}
            className="text-muted flex-shrink-0 cursor-pointer"
            onClick={() => handleMasterVolume(0)}
          />
        ) : (
          <VolumeX size={18} className="text-muted flex-shrink-0" />
        )}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-accent cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${masterVolume * 100}%, rgba(255,255,255,0.1) ${masterVolume * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <Volume2 size={18} className="text-muted flex-shrink-0" />
      </div>

      {/* ── Sleep timer ──────────────────────────────────── */}
      <div className="w-full mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            Sleep Timer
          </span>
          {timerRemaining !== null && (
            <span className="text-sm font-medium text-accent-glow tabular-nums">
              {formatTime(timerRemaining)}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {TIMER_OPTIONS.map((min) => (
            <button
              key={min}
              onClick={() => handleTimer(min)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                timerMinutes === min
                  ? "bg-accent text-white"
                  : "bg-white/[0.06] text-muted hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {min}m
            </button>
          ))}
          <button
            onClick={() => handleTimer(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              timerMinutes === null
                ? "bg-white/[0.12] text-white"
                : "bg-white/[0.06] text-muted hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            Off
          </button>
        </div>
      </div>

      {/* ── Mix indicator dots ───────────────────────────── */}
      <div className="flex gap-2 mt-auto pt-6">
        {mixes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              if (isPlaying) playCurrentMix(mixes[i]);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === currentIndex
                ? "bg-accent-glow scale-125"
                : "bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to mix ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
