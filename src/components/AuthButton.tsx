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
      className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-accent-glow text-white text-sm font-semibold transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
