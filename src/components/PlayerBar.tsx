"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronDown,
  CloudRain,
  Waves,
  Heart,
  TreePine,
  Cloud,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { usePlayer, TIMER_OPTIONS } from "./PlayerProvider";

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

// ── Format timer ─────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── PlayerBar ────────────────────────────────────────────────

export default function PlayerBar() {
  const {
    currentMix,
    isPlaying,
    expanded,
    masterVolume,
    timerMinutes,
    timerRemaining,
    mixes,
    currentIndex,
    togglePlayPause,
    skip,
    setMasterVolume,
    setTimer,
    expand,
    collapse,
    playMix,
  } = usePlayer();

  const [rippleKey, setRippleKey] = useState<number | null>(null);
  const [bouncingPill, setBouncingPill] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  // Don't render anything if no mix is loaded
  if (!currentMix) return null;

  const Icon = ICON_MAP[currentMix.icon_name] || Volume2;
  const volumePct = masterVolume * 100;

  function handleCollapse() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      collapse();
    }, 250);
  }

  function handlePlayPause() {
    setRippleKey(Date.now());
    togglePlayPause();
  }

  function handleTimerSelect(min: number | null) {
    if (min !== null) {
      setBouncingPill(min);
      setTimeout(() => setBouncingPill(null), 300);
    }
    setTimer(min);
  }

  // ── Expanded overlay ──────────────────────────────────────

  if (expanded) {
    return (
      <div
        className={`fixed inset-0 z-50 bg-background flex flex-col ${
          closing ? "player-overlay-exit" : "player-overlay-enter"
        }`}
      >
        {/* Collapse button */}
        <div className="flex items-center justify-center pt-[env(safe-area-inset-top)] px-4 py-3">
          <button
            onClick={handleCollapse}
            className="p-2 rounded-full hover:bg-white/[0.08] transition-colors"
            aria-label="Collapse player"
          >
            <ChevronDown size={28} className="text-white/60" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 pb-8 max-w-md mx-auto w-full">
          {/* Artwork card */}
          <div
            className="artwork-gradient relative w-full aspect-[4/4.2] max-w-[320px] rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentMix.color_from}, ${currentMix.color_to}, ${currentMix.color_from})`,
              backgroundSize: "200% 200%",
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%)",
              }}
            />
            <Icon
              size={64}
              className="text-white/90 relative z-10"
              strokeWidth={1.5}
            />
            <div className="text-center px-6 relative z-10 flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                {currentMix.name}
              </h1>
              <p className="text-sm text-white/70">{currentMix.description}</p>
              {isPlaying && <EqBars playing={isPlaying} />}
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-10 mt-10">
            <button
              onClick={() => skip(-1)}
              className="p-4 rounded-full hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
              aria-label="Previous mix"
            >
              <SkipBack
                size={26}
                className="text-white/90"
                fill="rgba(255,255,255,0.9)"
              />
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
                <Pause
                  size={30}
                  className="text-white relative z-10"
                  fill="white"
                />
              ) : (
                <Play
                  size={30}
                  className="text-white relative z-10 ml-1"
                  fill="white"
                />
              )}
            </button>

            <button
              onClick={() => skip(1)}
              className="p-4 rounded-full hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
              aria-label="Next mix"
            >
              <SkipForward
                size={26}
                className="text-white/90"
                fill="rgba(255,255,255,0.9)"
              />
            </button>
          </div>

          {/* Master volume */}
          <div className="w-full flex items-center gap-3 mt-10 px-1">
            <button
              onClick={() => setMasterVolume(masterVolume > 0 ? 0 : 0.7)}
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
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="volume-track flex-1"
              style={{
                background: `linear-gradient(to right, var(--accent-glow) 0%, var(--accent) ${volumePct}%, rgba(255,255,255,0.08) ${volumePct}%, rgba(255,255,255,0.08) 100%)`,
              }}
            />
            <Volume2 size={18} className="text-white/60 flex-shrink-0" />
          </div>

          {/* Sleep timer */}
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
                    onClick={() => handleTimerSelect(min)}
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
                onClick={() => handleTimerSelect(null)}
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

          {/* Mix indicator dots */}
          <div className="flex gap-3 mt-auto pt-8">
            {mixes.map((m, i) => (
              <button
                key={m.id}
                onClick={() => {
                  if (isPlaying) {
                    playMix(mixes[i]);
                  } else {
                    // Just select without playing — playMix sets index
                    playMix(mixes[i]);
                  }
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-2.5 h-2.5 bg-accent-glow shadow-sm shadow-accent/40"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
                style={{
                  minWidth: i === currentIndex ? 10 : 8,
                  minHeight: i === currentIndex ? 10 : 8,
                }}
                aria-label={`Go to mix ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Collapsed bar ─────────────────────────────────────────

  return (
    <div
      className="fixed left-0 right-0 z-40 mx-3 rounded-2xl bg-surface border border-white/[0.06] shadow-lg shadow-black/30 overflow-hidden cursor-pointer"
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 8px)" }}
      onClick={(e) => {
        // Don't expand if tapping the pause button
        if ((e.target as HTMLElement).closest("[data-player-btn]")) return;
        expand();
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Accent stripe */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{
            background: `linear-gradient(to bottom, ${currentMix.color_from}, ${currentMix.color_to})`,
          }}
        />

        {/* Mix info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {currentMix.name}
          </h3>
          <p className="text-[10px] text-muted truncate mt-0.5">
            {currentMix.description}
          </p>
        </div>

        {/* EQ bars when playing */}
        {isPlaying && (
          <div className="flex-shrink-0">
            <EqBars playing={isPlaying} />
          </div>
        )}

        {/* Play/Pause button */}
        <button
          data-player-btn
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={16} className="text-white" fill="white" />
          ) : (
            <Play size={16} className="text-white ml-0.5" fill="white" />
          )}
        </button>
      </div>
    </div>
  );
}
