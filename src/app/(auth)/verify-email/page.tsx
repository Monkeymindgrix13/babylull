"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || sending || !email) return;

    setSending(true);
    setError("");
    setSent(false);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setSent(true);
    setCooldown(60);
  }, [cooldown, sending, email]);

  return (
    <div className="auth-card bg-surface p-6 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center">
          <Mail size={26} className="text-accent-glow" />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-white mb-2">Check your inbox</h1>
      <p className="text-sm text-muted leading-relaxed mb-6">
        We sent a confirmation link to{" "}
        <span className="text-white font-medium">{email || "your email"}</span>.
        {" "}Tap the link to get started.
      </p>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 mb-5 text-left">
          <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {sent && !error && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 mb-5 text-left">
          <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-300">Confirmation email resent.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || sending || !email}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-accent-glow text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,91,245,0.3)] hover:shadow-[0_0_30px_rgba(150,120,255,0.5)] hover:scale-[1.02] mb-5"
      >
        {sending && <Loader2 size={18} className="animate-spin" />}
        {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
      </button>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>
    </div>
  );
}
