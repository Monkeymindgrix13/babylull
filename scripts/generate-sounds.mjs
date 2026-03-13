/**
 * Generate placeholder WAV sound files for BabyLull.ai
 * Pure JS — no dependencies. Writes raw PCM into WAV containers.
 *
 * Usage: node scripts/generate-sounds.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "sounds");
mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 44100;
const DURATION = 5; // seconds — short loops
const NUM_SAMPLES = SAMPLE_RATE * DURATION;

// ── WAV encoder ──────────────────────────────────────────────

function encodeWav(samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const val = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    buffer.writeInt16LE(Math.round(val), 44 + i * 2);
  }

  return buffer;
}

// ── Crossfade helper for seamless loops ──────────────────────

function crossfade(samples, fadeLen = Math.floor(SAMPLE_RATE * 0.05)) {
  for (let i = 0; i < fadeLen; i++) {
    const t = i / fadeLen;
    samples[i] *= t;
    samples[samples.length - 1 - i] *= t;
  }
  return samples;
}

// ── Sound generators ─────────────────────────────────────────

function lullabyTone() {
  // Gentle sine wave melody with slow pitch variation
  const samples = new Float64Array(NUM_SAMPLES);
  const notes = [261.63, 293.66, 329.63, 293.66]; // C4 D4 E4 D4
  const noteLen = NUM_SAMPLES / notes.length;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const noteIdx = Math.floor(i / noteLen);
    const freq = notes[noteIdx];
    const t = i / SAMPLE_RATE;
    const envelope = Math.sin((Math.PI * (i % noteLen)) / noteLen);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
  }
  return crossfade(samples);
}

function musicBox() {
  // Higher-pitched plucked tones
  const samples = new Float64Array(NUM_SAMPLES);
  const notes = [523.25, 659.25, 783.99, 659.25, 523.25, 392.0, 523.25, 659.25];
  const noteLen = NUM_SAMPLES / notes.length;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const noteIdx = Math.floor(i / noteLen);
    const freq = notes[noteIdx];
    const t = i / SAMPLE_RATE;
    const posInNote = (i % noteLen) / noteLen;
    const decay = Math.exp(-posInNote * 6);
    samples[i] =
      (Math.sin(2 * Math.PI * freq * t) * 0.5 +
        Math.sin(2 * Math.PI * freq * 3 * t) * 0.15) *
      decay *
      0.35;
  }
  return crossfade(samples);
}

function rain() {
  // Filtered white noise — bandpass to sound like rain
  const samples = new Float64Array(NUM_SAMPLES);
  let prev = 0;
  let prev2 = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    // Simple low-pass for softer rain
    const filtered = white * 0.15 + prev * 0.55 + prev2 * 0.3;
    prev2 = prev;
    prev = filtered;
    // Add occasional "droplet" patter
    const droplet = Math.random() > 0.997 ? (Math.random() * 0.3) : 0;
    samples[i] = (filtered + droplet) * 0.5;
  }
  return crossfade(samples);
}

function oceanWaves() {
  // Amplitude-modulated noise with slow sweep
  const samples = new Float64Array(NUM_SAMPLES);
  let prev = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const white = Math.random() * 2 - 1;
    const filtered = white * 0.3 + prev * 0.7;
    prev = filtered;
    // Slow wave envelope (~0.2 Hz)
    const wave = (Math.sin(2 * Math.PI * 0.2 * t) + 1) * 0.5;
    samples[i] = filtered * wave * 0.5;
  }
  return crossfade(samples);
}

function heartbeat() {
  // Double-pulse heartbeat at ~65 BPM
  // Uses higher harmonics (100-300 Hz) so it's audible on phone speakers
  const samples = new Float64Array(NUM_SAMPLES);
  const bpm = 65;
  const beatInterval = (60 / bpm) * SAMPLE_RATE;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const posInBeat = i % beatInterval;
    const t = posInBeat / SAMPLE_RATE;

    // Lub — primary thump with harmonics audible on small speakers
    const lubEnv = Math.exp(-t * 15);
    const lub =
      lubEnv *
      (Math.sin(2 * Math.PI * 60 * t) * 0.4 +
        Math.sin(2 * Math.PI * 120 * t) * 0.3 +
        Math.sin(2 * Math.PI * 180 * t) * 0.2 +
        Math.sin(2 * Math.PI * 240 * t) * 0.1);

    // Dub — secondary thump, slightly delayed
    const dubDelay = t - 0.15;
    let dub = 0;
    if (dubDelay > 0) {
      const dubEnv = Math.exp(-dubDelay * 18);
      dub =
        dubEnv *
        (Math.sin(2 * Math.PI * 80 * dubDelay) * 0.3 +
          Math.sin(2 * Math.PI * 160 * dubDelay) * 0.25 +
          Math.sin(2 * Math.PI * 240 * dubDelay) * 0.15 +
          Math.sin(2 * Math.PI * 300 * dubDelay) * 0.08) *
        0.7;
    }

    samples[i] = (lub + dub) * 0.55;
  }
  return crossfade(samples);
}

function wind() {
  // Slowly-modulated filtered noise
  const samples = new Float64Array(NUM_SAMPLES);
  let prev = 0;
  let prev2 = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const white = Math.random() * 2 - 1;
    // Heavy low-pass for wind
    const filtered = white * 0.05 + prev * 0.7 + prev2 * 0.25;
    prev2 = prev;
    prev = filtered;
    // Slow modulation
    const mod = (Math.sin(2 * Math.PI * 0.15 * t) + 1) * 0.3 + 0.4;
    samples[i] = filtered * mod * 0.5;
  }
  return crossfade(samples);
}

function crickets() {
  // Rapid high-frequency chirp bursts
  const samples = new Float64Array(NUM_SAMPLES);
  const chirpRate = 4; // chirps per second
  const chirpDuration = 0.08;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const chirpPhase = (t * chirpRate) % 1;

    if (chirpPhase < chirpDuration * chirpRate) {
      const localT = chirpPhase / chirpRate;
      const env = Math.sin((Math.PI * localT) / chirpDuration);
      // Two slightly detuned high frequencies for realism
      samples[i] =
        (Math.sin(2 * Math.PI * 4200 * t) * 0.5 +
          Math.sin(2 * Math.PI * 4800 * t) * 0.3) *
        env *
        0.2;
    }

    // Add a second cricket offset
    const chirpPhase2 = ((t + 0.37) * (chirpRate * 0.7)) % 1;
    if (chirpPhase2 < chirpDuration * chirpRate * 0.7) {
      const localT2 = chirpPhase2 / (chirpRate * 0.7);
      const env2 = Math.sin((Math.PI * localT2) / chirpDuration);
      samples[i] +=
        Math.sin(2 * Math.PI * 3800 * t) * env2 * 0.12;
    }
  }
  return crossfade(samples);
}

function whiteNoise() {
  const samples = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = (Math.random() * 2 - 1) * 0.3;
  }
  return crossfade(samples);
}

// ── Generate all files ───────────────────────────────────────

const SOUNDS = [
  { name: "lullaby-tone", fn: lullabyTone },
  { name: "music-box", fn: musicBox },
  { name: "rain", fn: rain },
  { name: "ocean-waves", fn: oceanWaves },
  { name: "heartbeat", fn: heartbeat },
  { name: "wind", fn: wind },
  { name: "crickets", fn: crickets },
  { name: "white-noise", fn: whiteNoise },
];

for (const { name, fn } of SOUNDS) {
  const samples = fn();
  const wav = encodeWav(samples);
  const path = join(OUT_DIR, `${name}.wav`);
  writeFileSync(path, wav);
  console.log(`  ${name}.wav  (${(wav.length / 1024).toFixed(1)} KB)`);
}

console.log(`\nDone — ${SOUNDS.length} files written to public/sounds/`);
