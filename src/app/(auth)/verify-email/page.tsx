"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verifyCode = useCallback(
    async (code: string) => {
      if (verifying || !email) return;

      setVerifying(true);
      setError("");

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      setVerifying(false);

      if (verifyError) {
        setError(verifyError.message);
        setDigits(Array(CODE_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        return;
      }

      router.push("/onboarding");
    },
    [verifying, email, router]
  );

  function handleChange(index: number, value: string) {
    if (verifying) return;

    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      if (pasted.length > 0) {
        const next = [...digits];
        for (let i = 0; i < CODE_LENGTH; i++) {
          next[i] = pasted[i] ?? "";
        }
        setDigits(next);
        const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
        inputsRef.current[focusIndex]?.focus();
        if (pasted.length === CODE_LENGTH) {
          verifyCode(pasted);
        }
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const code = next.join("");
    if (code.length === CODE_LENGTH && next.every((d) => d !== "")) {
      verifyCode(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    }
  }

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || sending || !email) return;

    setSending(true);
    setError("");
    setSent(false);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
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
        We sent a 6-digit code to{" "}
        <span className="text-white font-medium">{email || "your email"}</span>.
        {" "}Enter it below to get started.
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
          <p className="text-sm text-emerald-300">New code sent.</p>
        </div>
      )}

      <div className="flex justify-center gap-2.5 mb-6">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={verifying}
            className="w-11 h-13 rounded-lg bg-surface-light border border-white/10 text-center text-xl font-semibold text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors disabled:opacity-60"
          />
        ))}
      </div>

      {verifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted mb-5">
          <Loader2 size={16} className="animate-spin" />
          Verifying...
        </div>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || sending || !email}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-accent to-accent-glow text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,91,245,0.3)] hover:shadow-[0_0_30px_rgba(150,120,255,0.5)] hover:scale-[1.02] mb-5"
      >
        {sending && <Loader2 size={18} className="animate-spin" />}
        {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
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
