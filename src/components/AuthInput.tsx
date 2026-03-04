"use client";

import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

export default function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  icon: Icon,
  error,
  placeholder,
  autoComplete,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground/80">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-11 pl-11 pr-4 rounded-xl bg-surface border text-sm text-foreground placeholder:text-muted/50 outline-none transition-colors ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/[0.06] focus:border-accent/50"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}
