"use client";

import {
  Play,
  Pause,
  SkipForward,
  Moon,
  CloudRain,
  Wind,
  Waves,
  Heart,
  Sparkles,
  Clock,
  TrendingUp,
  ChevronRight,
  Volume2,
  Brain,
  Star,
  Flame,
  TreePine,
  Music,
  Baby,
} from "lucide-react";
import { useState } from "react";

const recentMixes = [
  {
    id: 1,
    name: "Rainy Lullaby",
    layers: "Piano + Rain + Heartbeat",
    duration: "42 min",
    rating: 4.8,
    icon: CloudRain,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    id: 2,
    name: "Ocean Dreams",
    layers: "Waves + Wind + Music Box",
    duration: "38 min",
    rating: 4.9,
    icon: Waves,
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
  },
  {
    id: 3,
    name: "Forest Night",
    layers: "Crickets + Stream + Hum",
    duration: "55 min",
    rating: 4.6,
    icon: TreePine,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

const categories = [
  { name: "White Noise", icon: Wind, count: 24, color: "text-slate-400" },
  { name: "Lullabies", icon: Music, count: 18, color: "text-purple-400" },
  { name: "Nature", icon: TreePine, count: 31, color: "text-emerald-400" },
  { name: "Heartbeats", icon: Heart, count: 12, color: "text-pink-400" },
  { name: "Rain", icon: CloudRain, count: 16, color: "text-blue-400" },
  { name: "Ocean", icon: Waves, count: 14, color: "text-cyan-400" },
];

const weekStats = [
  { day: "Mon", hours: 3.2, max: 5 },
  { day: "Tue", hours: 4.1, max: 5 },
  { day: "Wed", hours: 2.8, max: 5 },
  { day: "Thu", hours: 4.5, max: 5 },
  { day: "Fri", hours: 3.9, max: 5 },
  { day: "Sat", hours: 4.8, max: 5 },
  { day: "Sun", hours: 4.2, max: 5 },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlayingProgress] = useState(0.35);

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

      {/* Greeting */}
      <section>
        <p className="text-muted text-xs font-medium uppercase tracking-wider mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-xl font-semibold text-white leading-tight">
          Emma&apos;s Bedtime
        </h1>
      </section>

      {/* Now Playing Card */}
      <section className="rounded-2xl bg-gradient-to-br from-accent/15 via-surface to-surface border border-white/[0.06] p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-glow">
            Now Playing
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/30 to-purple-900/40 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <Moon size={24} className="text-accent-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">
              Rainy Lullaby Mix
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Piano + Rain + Heartbeat + Wind
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Volume2 size={10} className="text-muted" />
              <div className="flex gap-[2px]">
                {[0.6, 0.8, 0.4, 1, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.4, 0.7].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-accent-glow/60"
                    style={{ height: `${h * 12}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-glow"
              style={{ width: `${nowPlayingProgress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted">14:42</span>
            <span className="text-[10px] text-muted">42:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="text-muted hover:text-white transition-colors">
            <Clock size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-accent hover:bg-accent-glow flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause size={20} className="text-white" fill="white" />
            ) : (
              <Play size={20} className="text-white ml-0.5" fill="white" />
            )}
          </button>
          <button className="text-muted hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
        </div>
      </section>

      {/* AI Insight Card */}
      <section className="rounded-2xl bg-surface border border-white/[0.06] p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain size={16} className="text-accent-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={10} className="text-accent-glow" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-glow">
                AI Insight
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Emma falls asleep 23% faster with rain sounds after 7 PM.
              Tonight&apos;s mix has been optimized with heavier rainfall
              and a slower piano tempo.
            </p>
            <button className="flex items-center gap-1 mt-2.5 text-[11px] font-medium text-accent-glow hover:text-white transition-colors">
              View sleep analysis
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Row */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Moon size={12} className="text-accent-glow" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">7.2</p>
          <p className="text-[10px] text-muted mt-1">avg hours</p>
        </div>
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <TrendingUp size={12} className="text-emerald-400" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">+18%</p>
          <p className="text-[10px] text-muted mt-1">this week</p>
        </div>
        <div className="rounded-xl bg-surface border border-white/[0.06] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <Flame size={12} className="text-orange-400" />
          </div>
          <p className="text-lg font-semibold text-white leading-none">12</p>
          <p className="text-[10px] text-muted mt-1">day streak</p>
        </div>
      </section>

      {/* Weekly Sleep Chart */}
      <section className="rounded-2xl bg-surface border border-white/[0.06] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">This Week</h3>
          <span className="text-[10px] text-muted font-medium">
            Avg 3.9h / night
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {weekStats.map((stat) => (
            <div key={stat.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col justify-end h-14">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-accent/60 to-accent-glow/40"
                  style={{ height: `${(stat.hours / stat.max) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-muted font-medium">{stat.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Mixes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent Mixes</h3>
          <button className="flex items-center gap-0.5 text-[11px] text-muted hover:text-accent-glow transition-colors">
            See all <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {recentMixes.map((mix) => {
            const Icon = mix.icon;
            return (
              <div
                key={mix.id}
                className="flex items-center gap-3 rounded-xl bg-surface border border-white/[0.06] p-3 hover:border-white/[0.1] transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mix.color} border border-white/[0.06] flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={mix.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {mix.name}
                  </h4>
                  <p className="text-[10px] text-muted mt-0.5 truncate">
                    {mix.layers}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Star size={9} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] text-muted font-medium">{mix.rating}</span>
                  </div>
                  <span className="text-[10px] text-muted">{mix.duration}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center flex-shrink-0 transition-colors">
                  <Play size={12} className="text-white ml-0.5" fill="white" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sound Categories */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Browse Sounds</h3>
          <button className="flex items-center gap-0.5 text-[11px] text-muted hover:text-accent-glow transition-colors">
            All categories <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                className="flex flex-col items-center gap-2 rounded-xl bg-surface border border-white/[0.06] p-3.5 hover:border-white/[0.1] transition-colors"
              >
                <Icon size={20} className={cat.color} strokeWidth={1.8} />
                <div className="text-center">
                  <p className="text-[11px] font-medium text-white">{cat.name}</p>
                  <p className="text-[9px] text-muted mt-0.5">{cat.count} sounds</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tonight's Recommendation */}
      <section className="rounded-2xl bg-gradient-to-br from-surface-light to-surface border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Baby size={14} className="text-accent-glow" />
          <span className="text-[11px] font-semibold text-white">
            Tonight&apos;s Recommendation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <CloudRain size={20} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white">Gentle Storm</h4>
            <p className="text-[10px] text-muted mt-0.5">
              Rain + Soft Piano + 58 BPM Heartbeat
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles size={9} className="text-accent-glow" />
              <span className="text-[10px] text-accent-glow font-medium">
                92% match score
              </span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-accent hover:bg-accent-glow flex items-center justify-center flex-shrink-0 transition-colors">
            <Play size={14} className="text-white ml-0.5" fill="white" />
          </button>
        </div>
      </section>

    </div>
  );
}
