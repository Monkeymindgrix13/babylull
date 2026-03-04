"use client";

import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}

export default function AuthButton({
  children,
  loading = false,
  type = "submit",
  onClick,
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-accent-glow text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,91,245,0.3)] hover:shadow-[0_0_30px_rgba(150,120,255,0.5)] hover:scale-[1.02]"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
