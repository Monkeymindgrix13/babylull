"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Wind,
  Music,
  TreePine,
  Heart,
  CloudRain,
  Waves,
  Sparkles,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { audioManager } from "@/lib/audio-manager";

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

// ── Layer config ─────────────────────────────────────────────

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

interface ActiveEntry {
  sound: Sound;
  volume: number;
}

// ── Volume slider ────────────────────────────────────────────

function VolumeSlider({
  value,
  onChange,
  small,
}: {
  value: number;
  onChange: (v: number) => void;
  small?: boolean;
}) {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`flex-1 rounded-full appearance-none bg-white/10 accent-accent cursor-pointer ${
        small ? "h-1" : "h-1.5"
      }`}
      style={{
        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%, rgba(255,255,255,0.1) 100%)`,
      }}
    />
  );
}

// ── Component ────────────────────────────────────────────────

export default function PlayerPage() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [active, setActive] = useState<Record<string, ActiveEntry>>({});

  // Fetch sounds
  useEffect(() => {
    supabase
      .from("sounds")
      .select("*")
      .order("layer_type")
      .order("name")
      .then(({ data }) => {
        if (data) setSounds(data);
        setLoading(false);
      });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => audioManager.stopAll();
  }, []);

  function handleMasterVolume(vol: number) {
    setMasterVolume(vol);
    audioManager.setMasterVolume(vol);
  }

  function handleSoundVolume(id: string, vol: number) {
    audioManager.setVolume(id, vol);
    setActive((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume: vol },
    }));
  }

  async function handleToggle(sound: Sound) {
    // If already playing, stop it
    if (audioManager.isPlaying(sound.id)) {
      audioManager.stop(sound.id);
      setActive((prev) => {
        const next = { ...prev };
        delete next[sound.id];
        return next;
      });
      return;
    }

    // Stop any other sound in the same layer
    Object.entries(active).forEach(([id, entry]) => {
      if (entry.sound.layer_type === sound.layer_type) {
        audioManager.stop(id);
      }
    });

    // Play the new sound
    await audioManager.play(sound.id, sound.file_url);

    // Update UI: remove old layer sounds, add new one
    setActive((prev) => {
      const next: Record<string, ActiveEntry> = {};
      for (const [id, entry] of Object.entries(prev)) {
        if (entry.sound.layer_type !== sound.layer_type) {
          next[id] = entry;
        }
      }
      next[sound.id] = { sound, volume: 0.7 };
      return next;
    });
  }

  function handleStop(id: string) {
    audioManager.stop(id);
    setActive((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleStopAll() {
    audioManager.stopAll();
    setActive({});
  }

  // Group by layer
  const grouped = LAYER_ORDER.map((layer) => ({
    layer,
    label: LAYER_LABELS[layer],
    items: sounds.filter((s) => s.layer_type === layer),
  })).filter((g) => g.items.length > 0);

  const activeList = Object.entries(active);
  const hasActive = activeList.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Sounds</h1>
        <p className="text-sm text-muted mt-1">
          Layer up to 4 sounds — one per category.
        </p>
      </div>

      {/* Master volume + Stop All */}
      <div className="bg-surface rounded-xl p-4 border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-3">
          {masterVolume > 0 ? (
            <Volume2 size={18} className="text-muted flex-shrink-0" />
          ) : (
            <VolumeX size={18} className="text-muted flex-shrink-0" />
          )}
          <VolumeSlider value={masterVolume} onChange={handleMasterVolume} />
          <span className="text-xs text-muted w-8 text-right tabular-nums">
            {Math.round(masterVolume * 100)}
          </span>
        </div>
        {hasActive && (
          <button
            onClick={handleStopAll}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-muted hover:text-white hover:border-white/[0.12] transition-colors"
          >
            <Square size={14} />
            Stop All
          </button>
        )}
      </div>

      {/* Now Playing */}
      {hasActive && (
        <section>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            Now Playing
          </h2>
          <div className="space-y-2">
            {activeList.map(([id, { sound, volume: vol }]) => {
              const Icon = ICON_MAP[sound.icon_name] || Volume2;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3 border border-accent/20"
                >
                  <div className="p-1.5 rounded-full bg-accent/20 flex-shrink-0">
                    <Icon size={16} className="text-accent-glow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {sound.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <VolumeSlider
                        value={vol}
                        onChange={(v) => handleSoundVolume(id, v)}
                        small
                      />
                      <span className="text-[10px] text-muted w-6 text-right tabular-nums">
                        {Math.round(vol * 100)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStop(id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0"
                  >
                    <X size={16} className="text-muted hover:text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sound layers */}
      {grouped.map(({ layer, label, items }) => (
        <section key={layer}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            {label}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {items.map((sound) => {
              const Icon = ICON_MAP[sound.icon_name] || Volume2;
              const isPlaying = sound.id in active;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleToggle(sound)}
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
                      className={isPlaying ? "text-accent-glow" : "text-muted"}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isPlaying ? "text-white" : "text-muted"
                    }`}
                  >
                    {sound.name}
                  </span>
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
