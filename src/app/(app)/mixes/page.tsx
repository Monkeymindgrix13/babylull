"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
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

const ICON_MAP: Record<string, LucideIcon> = {
  CloudRain,
  Waves,
  Heart,
  TreePine,
  Cloud,
  Sparkles,
  Volume2,
};

interface Mix {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color_from: string;
  color_to: string;
}

export default function MixesPage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("mixes")
        .select("id, name, description, icon_name, color_from, color_to")
        .order("created_at");

      if (data) setMixes(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Header */}
      <section className="mb-5">
        <h1 className="text-xl font-semibold text-white">Mixes</h1>
        <p className="text-xs text-muted mt-1">
          {mixes.length} curated sound {mixes.length === 1 ? "mix" : "mixes"}
        </p>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {mixes.map((mix) => {
          const Icon = ICON_MAP[mix.icon_name] || Volume2;
          return (
            <button
              key={mix.id}
              onClick={() => router.push(`/player?mix=${mix.id}`)}
              className="group relative flex flex-col items-center text-left rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg shadow-black/20 active:scale-[0.97] transition-transform duration-150"
              style={{ aspectRatio: "3 / 4" }}
            >
              {/* Gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${mix.color_from}, ${mix.color_to})`,
                }}
              />

              {/* Bottom fade for text legibility */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 60%)",
                }}
              />

              {/* Icon */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <Icon
                  size={40}
                  className="text-white/80"
                  strokeWidth={1.5}
                />
              </div>

              {/* Text + play button */}
              <div className="relative z-10 w-full px-3.5 pb-3.5 flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-white leading-tight truncate">
                    {mix.name}
                  </h2>
                  <p className="text-[10px] text-white/60 mt-0.5 leading-snug line-clamp-2">
                    {mix.description}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
                  <Play
                    size={14}
                    className="text-white ml-0.5"
                    fill="white"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
