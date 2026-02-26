"use client";

import { Home, Music, User } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "mixes", label: "Mixes", icon: Music },
  { id: "profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  const [active, setActive] = useState<string>("home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-t border-white/5">
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex flex-col items-center gap-1 py-1 px-4 transition-all duration-200"
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-accent/15" : ""
              }`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-accent-glow" : "text-muted"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-glow" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? "text-accent-glow" : "text-muted"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
