"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Baby,
  ArrowLeft,
  Loader2,
  Wind,
  Music,
  TreePine,
  Heart,
  CloudRain,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const AGE_RANGES = ["0–3 months", "3–6 months", "6–9 months", "9–12 months"];

const CHALLENGES = [
  "Falls asleep hard",
  "Wakes up often",
  "Short naps",
  "Needs motion",
  "Needs sound",
  "Irregular schedule",
];

const SOUNDS: { label: string; icon: LucideIcon }[] = [
  { label: "White Noise", icon: Wind },
  { label: "Lullabies", icon: Music },
  { label: "Nature", icon: TreePine },
  { label: "Heartbeats", icon: Heart },
  { label: "Rain", icon: CloudRain },
  { label: "Ocean", icon: Waves },
];

function SelectCard({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl p-4 text-sm font-medium cursor-pointer transition-all duration-200 text-left flex flex-col items-center justify-center gap-2 ${
        selected
          ? "border border-accent bg-accent/10 text-white"
          : "bg-surface border border-white/[0.06] text-muted hover:text-white hover:border-white/[0.12]"
      }`}
    >
      {Icon && <Icon size={22} className={selected ? "text-accent-glow" : "text-muted"} />}
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [sounds, setSounds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const displayName = nickname || "Your baby";

  function toggleChallenge(c: string) {
    setChallenges((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function toggleSound(s: string) {
    setSounds((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not signed in. Please log in and try again.");
      setSaving(false);
      return;
    }

    const { data: baby, error: babyErr } = await supabase
      .from("babies")
      .insert({ profile_id: user.id, name: displayName, age_range: ageRange })
      .select("id")
      .single();

    if (babyErr) {
      setError(babyErr.message);
      setSaving(false);
      return;
    }

    const { error: prefErr } = await supabase.from("baby_preferences").insert({
      baby_id: baby.id,
      sleep_challenges: challenges,
      sound_preferences: sounds,
    });

    if (prefErr) {
      setError(prefErr.message);
      setSaving(false);
      return;
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (profileErr) {
      setError(profileErr.message);
      setSaving(false);
      return;
    }

    router.push("/");
  }

  const canContinue =
    (step === 0 && nickname.trim().length > 0) ||
    (step === 1 && ageRange !== "") ||
    step === 2 ||
    step === 3;

  return (
    <div className="auth-card bg-surface p-6">
      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
              i <= step ? "bg-accent" : "bg-white/[0.06]"
            }`}
          />
        ))}
      </div>

      {/* Step 0: Nickname */}
      {step === 0 && (
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            What should we call your little one?
          </h1>
          <p className="text-sm text-muted mb-6">
            A name, a nickname, whatever feels right
          </p>

          <div className="space-y-1.5 mb-4">
            <div className="relative">
              <Baby
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Emma, Bug, Sweetpea..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface border border-white/[0.06] text-sm text-foreground placeholder:text-muted/50 outline-none transition-all duration-200 focus:bg-surface-light focus:border-accent/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNickname("Your baby");
              setStep(1);
            }}
            className="text-xs text-accent-glow hover:text-white transition-colors"
          >
            Skip — we&apos;ll just say &quot;Your baby&quot;
          </button>
        </div>
      )}

      {/* Step 1: Age Range */}
      {step === 1 && (
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            How old is {displayName}?
          </h1>
          <p className="text-sm text-muted mb-6">
            This helps us pick the right sounds
          </p>

          <div className="grid grid-cols-2 gap-3">
            {AGE_RANGES.map((range) => (
              <SelectCard
                key={range}
                label={range}
                selected={ageRange === range}
                onClick={() => setAgeRange(range)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sleep Challenges */}
      {step === 2 && (
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            What&apos;s bedtime like?
          </h1>
          <p className="text-sm text-muted mb-6">Pick as many as you like</p>

          <div className="grid grid-cols-2 gap-3">
            {CHALLENGES.map((c) => (
              <SelectCard
                key={c}
                label={c}
                selected={challenges.includes(c)}
                onClick={() => toggleChallenge(c)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Sound Preferences */}
      {step === 3 && (
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">
            What sounds interest you?
          </h1>
          <p className="text-sm text-muted mb-6">
            You can always explore more later
          </p>

          <div className="grid grid-cols-2 gap-3">
            {SOUNDS.map((s) => (
              <SelectCard
                key={s.label}
                label={s.label}
                icon={s.icon}
                selected={sounds.includes(s.label)}
                onClick={() => toggleSound(s.label)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 mt-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center mt-8 gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              handleSave();
            }
          }}
          disabled={!canContinue || saving}
          className="ml-auto h-11 px-8 rounded-xl bg-gradient-to-r from-accent to-accent-glow text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,91,245,0.3)] hover:shadow-[0_0_30px_rgba(150,120,255,0.5)] hover:scale-[1.02]"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {step === 3 ? "Let's go" : "Continue"}
        </button>
      </div>
    </div>
  );
}
