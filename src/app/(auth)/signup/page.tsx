"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateSignup, hasErrors, type ValidationErrors } from "@/lib/validation";
import { mapAuthError, type AuthFieldErrors } from "@/lib/auth-errors";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors & AuthFieldErrors>({});
  const [loading, setLoading] = useState(false);

  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateSignup(email, password, confirmPassword);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setErrors(mapAuthError(error));
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="auth-card bg-surface p-6">
      <h1 className="text-xl font-semibold text-white mb-1">Start your journey</h1>
      <p className="text-sm text-muted mb-6">Your baby&apos;s better sleep begins here</p>

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
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        <AuthInput
          id="confirm-password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            clearError("confirmPassword");
          }}
          icon={ShieldCheck}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <AuthButton loading={loading}>Start your journey</AuthButton>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-glow hover:text-white transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
