/**
 * Procedural Web Audio API Sound Engine for Diwali Celebration
 * Zero external audio file dependencies - 100% reliable, instant, and crisp!
 * Battery and background tab optimized.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(() => {});
          }
        } else {
          if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.musicGain = this.ctx.createGain();
          this.sfxGain = this.ctx.createGain();

          this.musicGain.gain.value = 0.35;
          this.sfxGain.gain.value = 0.65;

          this.musicGain.connect(this.masterGain);
          this.sfxGain.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        } catch (e) {
          // AudioContext unsupported fallback
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
      } catch (e) {}
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound effect: Firework launch whoosh/whistle
   */
  public playLaunchSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(750 + Math.random() * 200, t + 0.55);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(1800, t + 0.45);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.6);
    } catch (e) {}
  }

  /**
   * Sound effect: Firework explosion (deep sub bass boom + crisp body)
   */
  public playExplosionSound(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;

      // 1. Sub Bass Impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110 * pitchMultiplier, t);
      subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);

      subGain.gain.setValueAtTime(0.42, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t);
      subOsc.stop(t + 0.7);

      // 2. White Noise Blast body
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1100 * pitchMultiplier, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(150, t + 0.45);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + 0.52);

      // 3. Crackling sparkle tails
      if (Math.random() > 0.45) {
        setTimeout(() => {
          this.playCrackleSound();
        }, 160 + Math.random() * 100);
      }
    } catch (e) {}
  }

  /**
   * Sound effect: Crackling golden embers
   */
  public playCrackleSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const count = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < count; i++) {
        const delay = Math.random() * 0.25;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800 + Math.random() * 2000, t + delay);

        gain.gain.setValueAtTime(0.06, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.045);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + delay);
        osc.stop(t + delay + 0.05);
      }
    } catch (e) {}
  }

  /**
   * Sound effect: Auspicious Temple Bell / Diya Chime
   */
  public playDiyaChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running') return;

    try {
      const t = this.ctx.currentTime;
      const baseFreq = 587.33; // D5
      const harmonics = [1, 2.76, 5.4, 8.93];
      const weights = [0.35, 0.18, 0.09, 0.04];

      harmonics.forEach((h, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * h, t);

        const decay = 1.3 / (idx + 1);
        gain.gain.setValueAtTime(weights[idx], t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + decay);
      });
    } catch (e) {}
  }

  /**
   * Procedural Festive Ambient Raga (BGM)
   */
  public startAmbientFestiveMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;

    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    const droneFreqs = [130.81, 196.00, 261.63];

    try {
      droneFreqs.forEach(freq => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(360, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.035, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
      });

      let step = 0;
      const melodyScale = [0, 2, 4, 3, 5, 4, 7, 5, 8, 7, 4, 2, 0];

      this.musicInterval = setInterval(() => {
        if (!this.isMusicPlaying || !this.ctx || !this.musicGain || this.isMuted || document.hidden) return;

        const t = this.ctx.currentTime;
        const noteIndex = melodyScale[step % melodyScale.length];
        const freq = notes[noteIndex % notes.length];
        step++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.07, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 1.2);
      }, 1150);
    } catch (e) {}
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
