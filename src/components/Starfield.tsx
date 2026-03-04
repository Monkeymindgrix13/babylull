"use client";

import { useMemo } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const r = seededRandom;
      const isBright = r(i + 100) > 0.85;
      const size = isBright ? 3 : r(i + 100) > 0.5 ? 2 : 1;
      const isPurple = r(i + 150) > 0.7;
      return {
        id: i,
        left: `${r(i) * 100}%`,
        top: `${r(i + 50) * 100}%`,
        size,
        isBright,
        isPurple,
        twinkleDuration: `${2 + r(i + 200) * 3}s`,
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
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.isPurple ? "#c4b5fd" : "#ffffff",
            boxShadow: star.isBright
              ? `0 0 ${star.size * 3}px ${star.size}px rgba(196, 181, 253, 0.6)`
              : `0 0 ${star.size * 2}px ${star.size}px rgba(255, 255, 255, 0.3)`,
            animation: `twinkle ${star.twinkleDuration} ${star.twinkleDelay} infinite, float ${star.floatDuration} ${star.floatDelay} infinite`,
            opacity: 0.2,
          }}
        />
      ))}
    </div>
  );
}
