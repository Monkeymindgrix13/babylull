"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { audioManager } from "@/lib/audio-manager";

// ── Types ────────────────────────────────────────────────────

interface MixLayer {
  sound_id: string;
  volume: number;
}

export interface Mix {
  id: string;
  name: string;
  description: string;
  layers: MixLayer[];
  icon_name: string;
  color_from: string;
  color_to: string;
}

export interface MixWithUrls extends Mix {
  layersWithUrls: { sound_id: string; url: string; volume: number }[];
}

interface PlayerContextValue {
  mixes: MixWithUrls[];
  loading: boolean;
  currentMix: MixWithUrls | null;
  currentIndex: number;
  isPlaying: boolean;
  masterVolume: number;
  timerMinutes: number | null;
  timerRemaining: number | null;
  expanded: boolean;
  playMix: (mix: MixWithUrls) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skip: (dir: 1 | -1) => Promise<void>;
  setMasterVolume: (v: number) => void;
  setTimer: (min: number | null) => void;
  expand: () => void;
  collapse: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

// ── Timer presets ────────────────────────────────────────────

export const TIMER_OPTIONS = [15, 30, 45, 60, 90] as const;

// ── Provider ─────────────────────────────────────────────────

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [mixes, setMixes] = useState<MixWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.7);
  const [expanded, setExpanded] = useState(false);

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

  // ── Play a specific mix ────────────────────────────────────

  const playMix = useCallback(
    async (mix: MixWithUrls) => {
      const idx = mixes.findIndex((m) => m.id === mix.id);
      if (idx >= 0) setCurrentIndex(idx);

      await audioManager.unlock();
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
    [mixes, masterVolume]
  );

  // ── Toggle play/pause ──────────────────────────────────────

  const togglePlayPause = useCallback(async () => {
    if (!currentMix) return;

    await audioManager.unlock();

    if (isPlaying) {
      audioManager.stopAll();
      setIsPlaying(false);
    } else {
      audioManager.setMasterVolume(masterVolume);
      await audioManager.playMix(currentMix.layersWithUrls);
      setIsPlaying(true);

      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentMix.name,
          artist: "BabyLull",
          album: currentMix.description,
        });
      }
    }
  }, [currentMix, isPlaying, masterVolume]);

  // ── Skip ───────────────────────────────────────────────────

  const skip = useCallback(
    async (dir: 1 | -1) => {
      if (mixes.length === 0) return;
      const nextIndex = (currentIndex + dir + mixes.length) % mixes.length;
      setCurrentIndex(nextIndex);

      if (isPlaying) {
        audioManager.setMasterVolume(masterVolume);
        await audioManager.playMix(mixes[nextIndex].layersWithUrls);

        if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: mixes[nextIndex].name,
            artist: "BabyLull",
            album: mixes[nextIndex].description,
          });
        }
      }
    },
    [mixes, currentIndex, isPlaying, masterVolume]
  );

  // ── Volume ─────────────────────────────────────────────────

  const handleSetMasterVolume = useCallback((v: number) => {
    setMasterVolumeState(v);
    audioManager.setMasterVolume(v);
  }, []);

  // ── Sleep timer ────────────────────────────────────────────

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    fadeStartedRef.current = false;
  }

  const handleSetTimer = useCallback(
    (minutes: number | null) => {
      clearTimer();

      if (minutes === null || minutes === timerMinutes) {
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
    },
    [timerMinutes]
  );

  // ── Media Session ──────────────────────────────────────────

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;

    navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
    navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
    navigator.mediaSession.setActionHandler("previoustrack", () => skip(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => skip(1));
  }, [togglePlayPause, skip]);

  // ── Expand / collapse ──────────────────────────────────────

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  // ── Context value ──────────────────────────────────────────

  const value: PlayerContextValue = {
    mixes,
    loading,
    currentMix,
    currentIndex,
    isPlaying,
    masterVolume,
    timerMinutes,
    timerRemaining,
    expanded,
    playMix,
    togglePlayPause,
    skip,
    setMasterVolume: handleSetMasterVolume,
    setTimer: handleSetTimer,
    expand,
    collapse,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}
