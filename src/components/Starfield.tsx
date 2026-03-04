"use client";

import { useMemo } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const r = seededRandom;
      const size = r(i + 100) > 0.5 ? 2 : 1;
      return {
        id: i,
        left: `${r(i) * 100}%`,
        top: `${r(i + 50) * 100}%`,
        size,
        twinkleDuration: `${3 + r(i + 200) * 4}s`,
        twinkleDelay: `${r(i + 300) * 5}s`,
        floatDuration: `${6 + r(i + 400) * 6}s`,
        floatDelay: `${r(i + 500) * 4}s`,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.twinkleDuration} ${star.twinkleDelay} infinite, float ${star.floatDuration} ${star.floatDelay} infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
