"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateLogin, validateEmail, hasErrors, type ValidationErrors } from "@/lib/validation";
import { mapAuthError, type AuthFieldErrors } from "@/lib/auth-errors";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors & AuthFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateLogin(email, password);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrors(mapAuthError(error));
      return;
    }

    router.push("/");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(resetEmail);
    if (emailError) {
      setResetError(emailError);
      return;
    }

    setResetLoading(true);
    setResetError("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setResetLoading(false);

    if (error) {
      setResetError(error.message);
      return;
    }

    setResetSent(true);
  }

  if (showForgot) {
    return (
      <div className="auth-card bg-surface p-6">
        <button
          onClick={() => {
            setShowForgot(false);
            setResetSent(false);
            setResetError("");
          }}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-5"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <h1 className="text-xl font-semibold text-white mb-1">Reset password</h1>
        <p className="text-sm text-muted mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {resetSent ? (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <CheckCircle size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-300">
              Check your email for a password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <AuthInput
              id="reset-email"
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(v) => {
                setResetEmail(v);
                setResetError("");
              }}
              icon={Mail}
              error={resetError}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <AuthButton loading={resetLoading}>Send reset link</AuthButton>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="auth-card bg-surface p-6">
      <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
      <p className="text-sm text-muted mb-6">We missed you</p>

      {errors.general && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 mb-5">
          <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError("email");
          }}
          icon={Mail}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearError("password");
          }}
          icon={Lock}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setShowForgot(true);
              setResetEmail(email);
            }}
            className="text-xs text-accent-glow hover:text-white transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <AuthButton loading={loading}>Sign in</AuthButton>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent-glow hover:text-white transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
