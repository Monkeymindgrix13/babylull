"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  Wind,
  Music,
  TreePine,
  Heart,
  CloudRain,
  Waves,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Icon map ─────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Wind,
  Music,
  TreePine,
  Heart,
  CloudRain,
  Waves,
  Volume2,
  Sparkles,
};

// ── Layer labels ─────────────────────────────────────────────

const LAYER_ORDER = ["melody", "background", "rhythm", "ambience"] as const;
const LAYER_LABELS: Record<string, string> = {
  melody: "Melody",
  background: "Background",
  rhythm: "Rhythm",
  ambience: "Ambience",
};

// ── Types ────────────────────────────────────────────────────

interface Sound {
  id: string;
  name: string;
  layer_type: string;
  file_url: string;
  icon_name: string;
}

// ── Component ────────────────────────────────────────────────

export default function PlayerPage() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const activeIdRef = useRef<string | null>(null);

  // Fetch sounds from Supabase
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("sounds")
        .select("*")
        .order("layer_type")
        .order("name");

      if (data) setSounds(data);
      setLoading(false);
    }
    load();
  }, []);

  // Sync volume changes
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  function stopCurrent() {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    gainRef.current = null;
  }

  async function playSound(sound: Sound) {
    // Toggle off if already playing
    if (activeIdRef.current === sound.id) {
      stopCurrent();
      activeIdRef.current = null;
      setActiveId(null);
      return;
    }

    // Ensure AudioContext exists
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    // Resume if suspended (autoplay policy)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Stop whatever is playing
    stopCurrent();

    // Fetch + decode (with cache)
    let buffer = bufferCache.current.get(sound.id);
    if (!buffer) {
      const res = await fetch(sound.file_url);
      const arrayBuf = await res.arrayBuffer();
      buffer = await ctx.decodeAudioData(arrayBuf);
      bufferCache.current.set(sound.id, buffer);
    }

    // Create nodes
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain).connect(ctx.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
    activeIdRef.current = sound.id;
    setActiveId(sound.id);

    source.onended = () => {
      if (activeIdRef.current === sound.id) {
        activeIdRef.current = null;
        setActiveId(null);
      }
    };
  }

  // Group sounds by layer
  const grouped = LAYER_ORDER.map((layer) => ({
    layer,
    label: LAYER_LABELS[layer],
    items: sounds.filter((s) => s.layer_type === layer),
  })).filter((g) => g.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Sounds</h1>
        <p className="text-sm text-muted mt-1">
          Tap a sound to play. Tap again to stop.
        </p>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-3 bg-surface rounded-xl p-4 border border-white/[0.06]">
        <Volume2 size={18} className="text-muted flex-shrink-0" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-accent cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <span className="text-xs text-muted w-8 text-right tabular-nums">
          {Math.round(volume * 100)}
        </span>
      </div>

      {/* Sound layers */}
      {grouped.map(({ layer, label, items }) => (
        <section key={layer}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            {label}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {items.map((sound) => {
              const Icon = ICON_MAP[sound.icon_name] || Volume2;
              const isPlaying = activeId === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => playSound(sound)}
                  className={`relative rounded-xl p-4 flex flex-col items-center gap-2.5 transition-all duration-200 ${
                    isPlaying
                      ? "border border-accent bg-accent/10"
                      : "bg-surface border border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-full transition-colors duration-200 ${
                      isPlaying ? "bg-accent/20" : "bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={
                        isPlaying ? "text-accent-glow" : "text-muted"
                      }
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isPlaying ? "text-white" : "text-muted"
                    }`}
                  >
                    {sound.name}
                  </span>
                  {/* Play/Pause indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    {isPlaying ? (
                      <Pause size={14} className="text-accent-glow" />
                    ) : (
                      <Play size={14} className="text-muted/50" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
