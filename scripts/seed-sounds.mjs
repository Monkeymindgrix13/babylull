/**
 * Seed the Supabase `sounds` table with placeholder sound records.
 * Reads SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 * Usage: node scripts/seed-sounds.mjs
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

const SOUNDS = [
  { name: "Lullaby Tone", layer_type: "melody", file_url: "/sounds/lullaby-tone.wav", icon_name: "Music" },
  { name: "Music Box", layer_type: "melody", file_url: "/sounds/music-box.wav", icon_name: "Sparkles" },
  { name: "Rain", layer_type: "background", file_url: "/sounds/rain.wav", icon_name: "CloudRain" },
  { name: "Ocean Waves", layer_type: "background", file_url: "/sounds/ocean-waves.wav", icon_name: "Waves" },
  { name: "Heartbeat", layer_type: "rhythm", file_url: "/sounds/heartbeat.wav", icon_name: "Heart" },
  { name: "Wind", layer_type: "ambience", file_url: "/sounds/wind.wav", icon_name: "Wind" },
  { name: "Crickets", layer_type: "ambience", file_url: "/sounds/crickets.wav", icon_name: "TreePine" },
  { name: "White Noise", layer_type: "background", file_url: "/sounds/white-noise.wav", icon_name: "Volume2" },
];

const res = await fetch(`${SUPABASE_URL}/rest/v1/sounds`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=representation",
  },
  body: JSON.stringify(SOUNDS),
});

if (!res.ok) {
  const err = await res.text();
  console.error("Seed failed:", res.status, err);
  process.exit(1);
}

const rows = await res.json();
console.log(`Seeded ${rows.length} sounds:`);
for (const r of rows) {
  console.log(`  ${r.name} (${r.layer_type}) — ${r.id}`);
}
