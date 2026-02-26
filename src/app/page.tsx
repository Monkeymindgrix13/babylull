"use client";

import { Heart, Sparkles, Moon, Star } from "lucide-react";

const steps = [
  {
    num: "1",
    icon: Heart,
    title: "Tell us about your little one",
    desc: "Name, age, and what you\u2019ve tried. Takes 30 seconds!",
  },
  {
    num: "2",
    icon: Sparkles,
    title: "AI mixes the perfect sounds",
    desc: "4 science-backed layers. 576,000+ combos. Zero guesswork.",
  },
  {
    num: "3",
    icon: Moon,
    title: "Baby sleeps. AI gets smarter.",
    desc: "Rate each session. Tomorrow\u2019s mix is even better. Magic? Almost.",
  },
];

const layers = [
  {
    emoji: "\u{1F3B5}",
    name: "Melody",
    desc: "The lullaby your baby didn\u2019t know they needed",
    color: "bg-purple-500",
    width: "85%",
  },
  {
    emoji: "\u{1F327}\u{FE0F}",
    name: "Background",
    desc: "Rain, ocean, or womb sounds \u2014 their cozy cocoon",
    color: "bg-blue-500",
    width: "72%",
  },
  {
    emoji: "\u{1F493}",
    name: "Heartbeat",
    desc: "60 BPM. Like sleeping on mama\u2019s chest",
    color: "bg-pink-500",
    width: "58%",
  },
  {
    emoji: "\u{1F343}",
    name: "Ambience",
    desc: "The finishing touch. Wind chimes, crickets, pure calm",
    color: "bg-emerald-500",
    width: "78%",
  },
];

const reviews = [
  {
    quote: "My son was out in 8 minutes. I cried happy tears.",
    name: "Sarah",
    detail: "mom of 4-month-old",
    stars: 5,
  },
  {
    quote: "We tried EVERYTHING. This app actually learns.",
    name: "Mike",
    detail: "dad of twins",
    stars: 5,
  },
  {
    quote: "The AI recommended rain + piano. Game changer.",
    name: "Lisa",
    detail: "mom of 7-month-old",
    stars: 5,
  },
];

export default function Home() {
  return (
    <div>
      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <section className="flex flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-24">
        {/* Pill badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#12132a] border border-[#1e1f3a] text-sm text-[#a0a0b8] mb-10">
          <span className="mr-1.5">{"\u{1F9D2}"}</span> Your baby&apos;s new
          favorite app
        </div>

        {/* Headlines */}
        <h1 className="text-[48px] md:text-[64px] font-bold leading-[1.05] tracking-tight text-white mb-3">
          Shh... the AI is mixing
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/70 mb-6">
          Your Baby&apos;s Perfect Sleep Sound
        </h2>
        <p className="text-[#a0a0b8] text-base sm:text-lg max-w-md leading-relaxed mb-10">
          Smart sounds that learn what{" "}
          <span className="text-white font-medium">YOUR</span> baby loves.
          Better sleep starts tonight.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full sm:w-auto">
          <button className="px-8 py-4 bg-[#7c5bf5] text-white font-semibold rounded-full text-base hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            Start Free Trial {"\u{1F680}"}
          </button>
          <a
            href="#how-it-works"
            className="px-8 py-4 border border-[#1e1f3a] text-white font-semibold rounded-full text-base text-center hover:scale-[1.02] hover:border-[#7c5bf5]/50 transition-all duration-200"
          >
            How does it work?
          </a>
        </div>

        <p className="text-[#a0a0b8]/60 text-sm">
          7 days free &middot; No credit card &middot; Cancel anytime{" "}
          {"\u{1F49C}"}
        </p>
      </section>

      {/* ================================================================ */}
      {/* STATS BAR                                                        */}
      {/* ================================================================ */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto rounded-2xl bg-[#12132a] border border-[#1e1f3a] py-6 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 text-center">
            <div className="sm:border-r sm:border-[#1e1f3a]">
              <p className="text-white font-semibold">
                <span className="mr-1.5">{"\u{1F634}"}</span>50,000+
              </p>
              <p className="text-[#a0a0b8] text-sm mt-0.5">bedtimes powered</p>
            </div>
            <div className="sm:border-r sm:border-[#1e1f3a]">
              <p className="text-white font-semibold">
                <span className="mr-1.5">{"\u2B50"}</span>4.9
              </p>
              <p className="text-[#a0a0b8] text-sm mt-0.5">
                from happy parents
              </p>
            </div>
            <div>
              <p className="text-white font-semibold">
                <span className="mr-1.5">{"\u{1F9D2}"}</span>10,000+
              </p>
              <p className="text-[#a0a0b8] text-sm mt-0.5">
                AI training sessions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* HOW IT WORKS                                                     */}
      {/* ================================================================ */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Easy as 1, 2, zzz... {"\u{1F634}"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl bg-[#12132a] border border-[#1e1f3a] p-6 text-center hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#7c5bf5]/10 border border-[#7c5bf5]/15 mb-4">
                  <step.icon size={20} className="text-[#7c5bf5]" />
                </div>
                <div className="text-xs font-bold text-[#7c5bf5]/50 tracking-widest mb-2">
                  STEP {step.num}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#a0a0b8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* THE 4 LAYERS                                                     */}
      {/* ================================================================ */}
      <section className="px-6 py-24">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Not just white noise. Smart noise. {"\u{1F9EC}"}
            </h2>
          </div>
          <p className="text-[#a0a0b8] text-center text-sm mb-14">
            4 science-backed layers working together
          </p>

          <div className="space-y-4">
            {layers.map((layer) => (
              <div
                key={layer.name}
                className="rounded-2xl bg-[#12132a] border border-[#1e1f3a] p-5 hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl leading-none mt-0.5">
                    {layer.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {layer.name}
                    </h3>
                    <p className="text-xs text-[#a0a0b8] leading-relaxed">
                      {layer.desc}
                    </p>
                  </div>
                </div>
                {/* Colored bar */}
                <div className="mt-4 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${layer.color}/40`}
                    style={{ width: layer.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TESTIMONIALS                                                     */}
      {/* ================================================================ */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Parents are sleeping too {"\u{1F634}"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl bg-[#12132a] border border-[#1e1f3a] p-5 hover:scale-[1.02] transition-transform duration-200"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star
                      key={j}
                      size={13}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p className="text-xs text-[#a0a0b8]">
                  <span className="text-white font-medium">{r.name}</span>
                  {" \u2014 "}
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOTTOM CTA                                                       */}
      {/* ================================================================ */}
      <section className="px-6 py-24 pb-32">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Your baby&apos;s perfect mix is waiting {"\u{1F319}"}
          </h2>
          <button className="mt-6 px-8 py-4 bg-[#7c5bf5] text-white font-semibold rounded-full text-base hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            Start Free Trial {"\u{1F680}"}
          </button>
          <p className="mt-6 text-[#a0a0b8]/60 text-sm">
            Join 2,000+ parents who actually sleep now
          </p>
        </div>
      </section>
    </div>
  );
}
