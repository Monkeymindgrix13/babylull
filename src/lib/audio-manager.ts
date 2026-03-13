/**
 * AudioManager — standalone audio engine, completely outside React.
 * Manages AudioContext, source nodes, gain nodes, and buffer cache.
 * React calls methods on the singleton; no refs or closures involved.
 */

interface PlayingSound {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private playing = new Map<string, PlayingSound>();
  private bufferCache = new Map<string, AudioBuffer>();

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async play(id: string, url: string): Promise<void> {
    const ctx = this.ensureContext();

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // If already playing this id, stop it first
    this.stop(id);

    // Fetch + decode (cached)
    let buffer = this.bufferCache.get(id);
    if (!buffer) {
      const res = await fetch(url);
      const arrayBuf = await res.arrayBuffer();
      buffer = await ctx.decodeAudioData(arrayBuf);
      this.bufferCache.set(id, buffer);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.7;

    source.connect(gain).connect(this.masterGain!);
    source.start();

    this.playing.set(id, { source, gain });
  }

  stop(id: string): void {
    const entry = this.playing.get(id);
    if (!entry) return;
    try { entry.source.stop(); } catch {}
    entry.source.disconnect();
    entry.gain.disconnect();
    this.playing.delete(id);
  }

  stopAll(): void {
    this.playing.forEach((entry) => {
      try { entry.source.stop(); } catch {}
      entry.source.disconnect();
      entry.gain.disconnect();
    });
    this.playing.clear();
  }

  setVolume(id: string, value: number): void {
    const entry = this.playing.get(id);
    if (entry) {
      entry.gain.gain.value = value;
    }
  }

  setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = value;
    }
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 0.7;
  }

  async playMix(layers: { sound_id: string; url: string; volume: number }[]): Promise<void> {
    this.stopAll();
    // Restore master gain in case a previous fadeOut zeroed it
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx!.currentTime);
      this.masterGain.gain.value = this.getMasterVolume() || 0.7;
    }
    for (const layer of layers) {
      await this.play(layer.sound_id, layer.url);
      this.setVolume(layer.sound_id, layer.volume);
    }
  }

  fadeOut(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.masterGain || !this.ctx) {
        this.stopAll();
        resolve();
        return;
      }
      const now = this.ctx.currentTime;
      const duration = durationMs / 1000;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + duration);
      setTimeout(() => {
        this.stopAll();
        resolve();
      }, durationMs);
    });
  }

  isPlaying(id: string): boolean {
    return this.playing.has(id);
  }

  getPlayingIds(): string[] {
    return Array.from(this.playing.keys());
  }

  destroy(): void {
    this.stopAll();
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
  }
}

// Singleton — lives for the lifetime of the app
export const audioManager = new AudioManager();
