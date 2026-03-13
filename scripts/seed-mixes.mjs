/**
 * Seed the Supabase `mixes` table with 6 curated preset mixes.
 * Fetches actual sound IDs from the `sounds` table first.
 *
 * Usage: node scripts/seed-mixes.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
const envFile = readFileSync(envPath, "utf-8");

function getEnv(key) {
  const match = envFile.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

// ── Fetch existing sounds ──────────────────────────────────

const soundsRes = await fetch(`${SUPABASE_URL}/rest/v1/sounds?select=id,name`, {
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
});

if (!soundsRes.ok) {
  console.error("Failed to fetch sounds:", soundsRes.status, await soundsRes.text());
  process.exit(1);
}

const sounds = await soundsRes.json();
const byName = {};
for (const s of sounds) {
  byName[s.name] = s.id;
}

console.log(`Found ${sounds.length} sounds:`);
for (const s of sounds) {
  console.log(`  ${s.name} → ${s.id}`);
}

// Helper to build layers
function layers(...items) {
  return items.map(([name, volume]) => {
    const id = byName[name];
    if (!id) throw new Error(`Sound not found: "${name}"`);
    return { sound_id: id, volume };
  });
}

// ── Define 6 mixes ─────────────────────────────────────────

const MIXES = [
  {
    name: "Midnight Garden",
    description: "Rain + Music Box + Crickets",
    layers: layers(["Rain", 0.7], ["Music Box", 0.5], ["Crickets", 0.4]),
    icon_name: "CloudRain",
    color_from: "#4f46e5", // indigo
    color_to: "#9333ea",   // purple
  },
  {
    name: "Ocean Lullaby",
    description: "Ocean Waves + Lullaby Tone + Heartbeat",
    layers: layers(["Ocean Waves", 0.7], ["Lullaby Tone", 0.5], ["Heartbeat", 0.3]),
    icon_name: "Waves",
    color_from: "#2563eb", // blue
    color_to: "#06b6d4",   // cyan
  },
  {
    name: "Rainy Heartbeat",
    description: "Rain + Heartbeat + Wind",
    layers: layers(["Rain", 0.6], ["Heartbeat", 0.5], ["Wind", 0.4]),
    icon_name: "Heart",
    color_from: "#9333ea", // purple
    color_to: "#ec4899",   // pink
  },
  {
    name: "Forest Night",
    description: "Crickets + Wind + Music Box",
    layers: layers(["Crickets", 0.6], ["Wind", 0.5], ["Music Box", 0.4]),
    icon_name: "TreePine",
    color_from: "#059669", // emerald
    color_to: "#14b8a6",   // teal
  },
  {
    name: "Deep Sleep",
    description: "White Noise + Heartbeat",
    layers: layers(["White Noise", 0.7], ["Heartbeat", 0.4]),
    icon_name: "Cloud",
    color_from: "#475569", // slate
    color_to: "#4f46e5",   // indigo
  },
  {
    name: "Starlight Calm",
    description: "Lullaby Tone + Ocean Waves + Wind",
    layers: layers(["Lullaby Tone", 0.6], ["Ocean Waves", 0.5], ["Wind", 0.3]),
    icon_name: "Sparkles",
    color_from: "#7c3aed", // violet
    color_to: "#9333ea",   // purple
  },
];

// ── Insert mixes ───────────────────────────────────────────

const res = await fetch(`${SUPABASE_URL}/rest/v1/mixes`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=representation",
  },
  body: JSON.stringify(MIXES),
});

if (!res.ok) {
  const err = await res.text();
  console.error("Seed failed:", res.status, err);
  process.exit(1);
}

const rows = await res.json();
console.log(`\nSeeded ${rows.length} mixes:`);
for (const r of rows) {
  console.log(`  ${r.name} — ${r.id}`);
}
