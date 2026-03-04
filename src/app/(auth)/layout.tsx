"use client";

import { Moon } from "lucide-react";
import Starfield from "@/components/Starfield";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Starfield />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 -m-3 rounded-full bg-[radial-gradient(circle,rgba(124,91,245,0.3)_0%,transparent_70%)]" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center relative">
              <Moon size={28} className="text-white" fill="white" strokeWidth={0} />
            </div>
          </div>
          <span className="text-2xl font-semibold tracking-tight">
            Baby<span className="text-accent-glow">Lull</span>
            <span className="text-muted text-base font-normal">.ai</span>
          </span>
          <p className="text-sm text-muted mt-1.5">Better sleep starts tonight</p>
        </div>
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
